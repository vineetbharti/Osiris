const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');

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

/**
 * Get port coordinates from world_port_index table
 */
async function getPortCoordinates(portName, client) {
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
      lon: parseFloat(row.lon)
    }));
  } catch (error) {
    console.error('Error fetching sampled route points:', error);
    return [];
  }
}

// API endpoint to get historical trips for a vessel
app.get('/api/vessels/:imo/trips', async (req, res) => {
  const { imo } = req.params;
  const limit = req.query.limit || 10; // Default to 10, allow override via query param
  console.log(`\n📦 Fetching trips for IMO: ${imo} (limit: ${limit})`);
  
  const client = await pool.connect();
  
  try {
    console.log(`   └─ Connected to database`);
    
    // Get all voyages with start and end timestamps - LIMITED TO RECENT VOYAGES
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
        startPortCoords,
        ...middlePoints.slice(1, -1), // Take middle 2 points from the 4 sampled
        endPortCoords
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
    
    console.log(`✅ Returning ${trips.length} trips for IMO: ${imo}\n`);
    res.json(trips);
  } catch (error) {
    console.error(`❌ Error fetching historical trips for IMO ${imo}:`, error.message);
    console.error(`   Stack:`, error.stack);
    res.status(500).json({ error: 'Failed to fetch historical trips' });
  } finally {
    client.release();
  }
});

// API endpoint to get vessel summary
app.get('/api/vessels/:imo/summary', async (req, res) => {
  const { imo } = req.params;
  console.log(`\n📊 Fetching summary for IMO: ${imo}`);
  
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
    
    res.json(result.rows[0] || null);
  } catch (error) {
    console.error(`❌ Error fetching vessel summary for IMO ${imo}:`, error.message);
    console.error(`   Stack:`, error.stack);
    res.status(500).json({ error: 'Failed to fetch vessel summary' });
  } finally {
    client.release();
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  console.log(`💚 Health check requested`);
  res.json({ status: 'ok', message: 'API is running' });
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
  console.log(`  GET /api/vessels/:imo/summary\n`);
});
