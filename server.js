const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const redis = require('redis');

const app = express();
const port = 5001;

// Enable CORS for React app
app.use(cors());
app.use(express.json());

// Request logging middleware
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} ${req.path}`);
  next();
});

// PostgreSQL connection pool
const pool = new Pool({
  host: 'localhost',
  port: 5432,
  database: 'ais',
  user: 'postgres',
  password: 'Shilpa5'
});

// Redis client setup
const redisClient = redis.createClient({
  host: 'localhost',
  port: 6379
});

// Redis connection handling
redisClient.on('error', (err) => console.error('❌ Redis Client Error:', err));
redisClient.on('connect', () => console.log('✅ Redis Connected'));

// Connect to Redis
(async () => {
  try {
    await redisClient.connect();
  } catch (err) {
    console.error('❌ Failed to connect to Redis:', err);
  }
})();

// Cache TTL configuration (in seconds)
const CACHE_TTL = {
  TRIPS: 3600,      // 1 hour
  PORTS: 86400,     // 24 hours
  SUMMARY: 3600     // 1 hour
};

/**
 * Look-through cache wrapper
 */
async function withCache(cacheKey, ttl, fetchFunction) {
  try {
    // Try cache first
    const cached = await redisClient.get(cacheKey);
    if (cached) {
      console.log(`   ✅ Cache HIT: ${cacheKey}`);
      return JSON.parse(cached);
    }
    
    console.log(`   ⚠️  Cache MISS: ${cacheKey}`);
    
    // Fetch from database
    const data = await fetchFunction();
    
    // Store in cache
    await redisClient.setEx(cacheKey, ttl, JSON.stringify(data));
    
    return data;
  } catch (error) {
    console.error(`   ❌ Cache error for ${cacheKey}:`, error.message);
    // Fallback to database on cache error
    return await fetchFunction();
  }
}

/**
 * Get port coordinates from world_port_index table
 */
async function getPortCoordinates(portName, client) {
  const cacheKey = `port:${portName.toLowerCase()}`;
  
  return await withCache(cacheKey, CACHE_TTL.PORTS, async () => {
    try {
      const query = `
        SELECT 
          main_port_name,
          ST_Y(geom) as lat,
          ST_X(geom) as lon
        FROM world_port_index
        WHERE main_port_name ILIKE $1
        LIMIT 1
      `;
      
      const result = await client.query(query, [portName]);
      
      if (result.rows.length > 0) {
        return {
          lat: parseFloat(result.rows[0].lat),
          lon: parseFloat(result.rows[0].lon),
          name: result.rows[0].main_port_name
        };
      }
      
      return null;
    } catch (error) {
      console.error(`Error fetching coordinates for port ${portName}:`, error);
      return null;
    }
  });
}

/**
 * Calculate duration between two dates
 */
function calculateDuration(startDate, endDate) {
  const diffTime = Math.abs(endDate - startDate);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return `${diffDays} days`;
}

/**
 * Get evenly spaced sample points from voyage route
 */
async function getSampledRoutePoints(imo, voyageId, sampleCount, client) {
  try {
    const query = `
      WITH ordered_points AS (
        SELECT 
          ST_Y(geom) as lat,
          ST_X(geom) as lon,
          timestamp,
          ROW_NUMBER() OVER (ORDER BY timestamp) as rn,
          COUNT(*) OVER () as total_count
        FROM ais_data_voyage
        WHERE imo = $1
          AND voyage_id = $2
          AND geom IS NOT NULL
        ORDER BY timestamp
      )
      SELECT 
        lat,
        lon,
        timestamp
      FROM ordered_points
      WHERE rn % GREATEST(1, (total_count / $3)::integer) = 1
         OR rn = total_count
      LIMIT $3
    `;
    
    const result = await client.query(query, [imo, voyageId, sampleCount]);
    
    return result.rows.map(row => ({
      lat: parseFloat(row.lat),
      lon: parseFloat(row.lon),
      timestamp: row.timestamp
    }));
  } catch (error) {
    console.error('Error fetching sampled route points:', error);
    return [];
  }
}

// API endpoint to get historical trips for a vessel
app.get('/api/vessels/:imo/trips', async (req, res) => {
  const { imo } = req.params;
  const limit = req.query.limit || 10;
  console.log(`\n📦 Fetching trips for IMO: ${imo} (limit: ${limit})`);
  
  const cacheKey = `trips:${imo}:${limit}`;
  
  try {
    const trips = await withCache(cacheKey, CACHE_TTL.TRIPS, async () => {
      const client = await pool.connect();
      
      try {
        console.log(`   └─ Connected to database`);
        
        // Get all voyages with start and end timestamps
        const voyageQuery = `
          SELECT 
            voyage_id,
            sub_voyage_id,
            start_port,
            end_port,
            MIN(timestamp) as start_timestamp,
            MAX(timestamp) as end_timestamp
          FROM ais_data_voyage
          WHERE imo = $1
            AND voyage_id IS NOT NULL
            AND start_port IS NOT NULL
            AND end_port IS NOT NULL
            AND start_port != end_port
          GROUP BY voyage_id, sub_voyage_id, start_port, end_port
          ORDER BY start_timestamp DESC
          LIMIT $2
        `;
        
        console.log(`   └─ Querying voyages...`);
        const voyageResult = await client.query(voyageQuery, [imo, limit]);
        console.log(`   └─ Found ${voyageResult.rows.length} voyages`);
        
        // Build trips array
        const trips = [];
        
        for (const voyage of voyageResult.rows) {
          console.log(`   └─ Processing voyage ${voyage.voyage_id}: ${voyage.start_port} → ${voyage.end_port}`);
          
          // Get port coordinates
          const startPortCoords = await getPortCoordinates(voyage.start_port, client);
          const endPortCoords = await getPortCoordinates(voyage.end_port, client);
          
          if (!startPortCoords || !endPortCoords) {
            console.warn(`   ⚠️  Could not find coordinates for ports: ${voyage.start_port} or ${voyage.end_port}`);
            continue;
          }
          
          console.log(`   └─ Got coordinates: ${voyage.start_port} (${startPortCoords.lat}, ${startPortCoords.lon})`);
          
          // Get 4 evenly spaced sample points from the voyage
          const middlePoints = await getSampledRoutePoints(imo, voyage.voyage_id, 20, client);
          console.log(`   └─ Sampled ${middlePoints.length} route points`);
          
          // Build route array: start port + middle points + end port
          const route = [
            { ...startPortCoords, timestamp: voyage.start_timestamp },
            ...middlePoints.slice(1, -1), // Take middle 2 points from the 4 sampled
            { ...endPortCoords, timestamp: voyage.end_timestamp }
          ];
          
          // Format the trip object
          const trip = {
            id: voyage.voyage_id,
            from: voyage.start_port,
            to: voyage.end_port,
            date: voyage.start_timestamp.toISOString().split('T')[0],
            duration: calculateDuration(voyage.start_timestamp, voyage.end_timestamp),
            route: route
          };
          
          trips.push(trip);
        }
        
        return trips;
        
      } finally {
        client.release();
      }
    });
    
    console.log(`✅ Returning ${trips.length} trips for IMO: ${imo}\n`);
    res.json(trips);
    
  } catch (error) {
    console.error(`❌ Error fetching historical trips for IMO ${imo}:`, error.message);
    console.error(`   Stack:`, error.stack);
    res.status(500).json({ error: 'Failed to fetch historical trips' });
  }
});

// API endpoint to get vessel summary
app.get('/api/vessels/:imo/summary', async (req, res) => {
  const { imo } = req.params;
  console.log(`\n📊 Fetching summary for IMO: ${imo}`);
  
  const cacheKey = `summary:${imo}`;
  
  try {
    const summary = await withCache(cacheKey, CACHE_TTL.SUMMARY, async () => {
      const client = await pool.connect();
      
      try {
        console.log(`   └─ Connected to database`);
        
        const query = `
          SELECT 
            imo,
            vessel_name,
            vessel_type,
            ship_type,
            COUNT(DISTINCT voyage_id) as total_voyages,
            COUNT(DISTINCT start_port) as unique_start_ports,
            COUNT(DISTINCT end_port) as unique_end_ports,
            MIN(timestamp) as first_recorded,
            MAX(timestamp) as last_recorded
          FROM ais_data_voyage
          WHERE imo = $1
            AND voyage_id IS NOT NULL
            AND start_port IS NOT NULL
            AND end_port IS NOT NULL
            AND start_port != end_port
          GROUP BY imo, vessel_name, vessel_type, ship_type
        `;
        
        console.log(`   └─ Querying vessel summary...`);
        const result = await client.query(query, [imo]);
        
        if (result.rows[0]) {
          console.log(`✅ Found vessel: ${result.rows[0].vessel_name} (${result.rows[0].total_voyages} voyages)\n`);
        } else {
          console.log(`⚠️  No summary found for IMO: ${imo}\n`);
        }
        
        return result.rows[0] || null;
        
      } finally {
        client.release();
      }
    });
    
    res.json(summary);
    
  } catch (error) {
    console.error(`❌ Error fetching vessel summary for IMO ${imo}:`, error.message);
    console.error(`   Stack:`, error.stack);
    res.status(500).json({ error: 'Failed to fetch vessel summary' });
  }
});

// Cache management endpoints
app.delete('/api/cache/vessels/:imo', async (req, res) => {
  const { imo } = req.params;
  try {
    const keys = await redisClient.keys(`*:${imo}*`);
    if (keys.length > 0) {
      await redisClient.del(keys);
      res.json({ success: true, message: `Cleared ${keys.length} cache entries for vessel ${imo}` });
    } else {
      res.json({ success: true, message: 'No cache entries found' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/cache/all', async (req, res) => {
  try {
    await redisClient.flushAll();
    res.json({ success: true, message: 'All cache cleared' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Health check endpoint
app.get('/api/health', async (req, res) => {
  console.log(`💚 Health check requested`);
  
  try {
    // Check PostgreSQL
    const dbClient = await pool.connect();
    await dbClient.query('SELECT 1');
    dbClient.release();
    
    // Check Redis
    await redisClient.ping();
    
    res.json({ 
      status: 'ok', 
      message: 'API is running',
      database: 'connected',
      cache: 'connected'
    });
  } catch (error) {
    res.status(503).json({ 
      status: 'error', 
      message: error.message 
    });
  }
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🛑 Shutting down gracefully...');
  try {
    await redisClient.quit();
    await pool.end();
    console.log('✅ Connections closed');
  } catch (err) {
    console.error('❌ Error during shutdown:', err);
  }
  process.exit(0);
});

app.listen(port, () => {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`🚀 Backend API Server Started`);
  console.log(`${'='.repeat(60)}`);
  console.log(`📍 URL: http://localhost:${port}`);
  console.log(`🗄️  Database: ${pool.options.database}@${pool.options.host}:${pool.options.port}`);
  console.log(`👤 User: ${pool.options.user}`);
  console.log(`${'='.repeat(60)}\n`);
  console.log(`Available endpoints:`);
  console.log(`  GET /api/health`);
  console.log(`  GET /api/vessels/:imo/trips`);
  console.log(`  GET /api/vessels/:imo/summary`);
  console.log(`  DELETE /api/cache/vessels/:imo`);
  console.log(`  DELETE /api/cache/all\n`);
});
