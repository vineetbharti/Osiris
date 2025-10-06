// vessel-api.js - Backend API to fetch vessel data from VesselFinder
// Based on your Python crawler implementation

const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));
const randomDelay = (min, max) => Math.random() * (max - min) + min;

async function fetchVesselPage(url, maxRetries = 5) {
  const headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
    'Accept-Language': 'en-US,en;q=0.5',
    'Accept-Encoding': 'gzip, deflate, br',
    'Connection': 'keep-alive',
    'Upgrade-Insecure-Requests': '1'
  };

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const response = await axios.get(url, {
        headers: headers,
        timeout: 15000,
        maxRedirects: 5,
        validateStatus: (status) => status < 500
      });

      if (response.status === 200) {
        console.log(`[${url}] Success on attempt ${attempt}`);
        return response.data;
      } else if (response.status === 429) {
        const waitTime = (5 * attempt + randomDelay(1, 5)) * 1000;
        console.log(`[${url}] Rate limited (429). Sleeping ${waitTime / 1000}s...`);
        await sleep(waitTime);
        continue;
      } else if (response.status === 404) {
        console.log(`[${url}] Not found (404).`);
        return null;
      } else {
        console.log(`[${url}] HTTP ${response.status}, retry ${attempt}/${maxRetries}`);
        await sleep(2000 * attempt);
        continue;
      }
    } catch (error) {
      if (error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT') {
        const waitTime = (2 * attempt + randomDelay(0.5, 2.0)) * 1000;
        console.log(`[${url}] Timeout. Retrying in ${waitTime / 1000}s...`);
        await sleep(waitTime);
        continue;
      } else if (error.response) {
        const status = error.response.status;
        if (status === 429) {
          const waitTime = (5 * attempt + randomDelay(1, 5)) * 1000;
          console.log(`[${url}] Rate limited. Sleeping ${waitTime / 1000}s...`);
          await sleep(waitTime);
          continue;
        } else if (status === 404) {
          console.log(`[${url}] Not found (404).`);
          return null;
        }
      }
      
      const waitTime = (2 * attempt + randomDelay(0.5, 2.0)) * 1000;
      console.log(`[${url}] Error: ${error.message}. Retrying in ${waitTime / 1000}s...`);
      await sleep(waitTime);
    }
  }

  console.log(`[${url}] Failed after ${maxRetries} retries.`);
  return null;
}

// Parse vessel details matching your Python implementation
function parseVesselDetails(html, imo) {
  const $ = cheerio.load(html);
  
  // Extract vessel name from h1 or title
  let name = $('h1').first().text().trim();
  if (!name) {
    const titleText = $('title').text();
    name = titleText.split('|')[0].split('-')[0].trim();
  }
  
  // Initialize vessel data object
  const vesselData = {
    imo: imo,
    name: name || 'Unknown Vessel',
    mmsi: 'N/A',
    type: 'N/A',
    flag: 'N/A',
    length: 'N/A',
    beam: 'N/A',
    grossTonnage: 'N/A',
    image: null,
    allData: {}
  };
  
  // Find all ship-section elements (matching your Python code)
  const shipSections = $('section.ship-section');
  
  console.log(`Found ${shipSections.length} ship sections`);
  
  // Loop through each ship-section
  shipSections.each((sectionIdx, section) => {
    // Find tables with class tpt1 or tpt2
    $(section).find('table.tpt1, table.tpt2').each((tableIdx, table) => {
      // Extract all rows
      $(table).find('tr').each((rowIdx, row) => {
        const cells = $(row).find('td');
        if (cells.length === 2) {
          const key = $(cells[0]).text().trim();
          const value = $(cells[1]).text().trim() || 'N/A';
          
          // Store in allData
          vesselData.allData[key] = value;
          
          // Map to specific fields (case-insensitive matching)
          const keyLower = key.toLowerCase();
          
          if (keyLower.includes('mmsi')) {
            vesselData.mmsi = value;
          } else if (keyLower.includes('type') && vesselData.type === 'N/A') {
            vesselData.type = value;
          } else if (keyLower.includes('flag')) {
            vesselData.flag = value;
          } else if (keyLower.includes('length overall') || keyLower === 'length') {
            vesselData.length = value;
          } else if (keyLower.includes('beam')) {
            vesselData.beam = value;
          } else if (keyLower.includes('gross tonnage') || keyLower.includes('gt')) {
            vesselData.grossTonnage = value;
          }
        }
      });
    });
  });
  
  // Extract vessel image - multiple approaches
  let imageUrl = null;
  
  // Method 1: Look for img with ship/vessel in alt or class
  const imgSelectors = [
    'img[src*="static.vesselfinder"]',
    'img[src*="ship-photo"]',
    'img[alt*="vessel"]',
    'img[alt*="ship"]',
    'img[itemprop="image"]',
    '.vessel-image img',
    '#vessel-photo img',
    '.ship-photo img',
    'img[class*="vessel"]',
    'img[class*="ship"]'
  ];
  
  for (const selector of imgSelectors) {
    const imgSrc = $(selector).first().attr('src');
    if (imgSrc) {
      imageUrl = imgSrc.startsWith('http') ? imgSrc : `https://www.vesselfinder.com${imgSrc}`;
      break;
    }
  }
  
  // Method 2: Look for data-src attribute (lazy loading)
  if (!imageUrl) {
    const dataSrc = $('img[data-src*="static.vesselfinder"]').first().attr('data-src');
    if (dataSrc) {
      imageUrl = dataSrc.startsWith('http') ? dataSrc : `https://www.vesselfinder.com${dataSrc}`;
    }
  }
  
  vesselData.image = imageUrl;
  
  console.log(`Parsed vessel: ${vesselData.name}`);
  console.log(`  MMSI: ${vesselData.mmsi}`);
  console.log(`  Type: ${vesselData.type}`);
  console.log(`  Length: ${vesselData.length}`);
  console.log(`  Image: ${imageUrl ? 'Found' : 'Not found'}`);
  console.log(`  Total fields extracted: ${Object.keys(vesselData.allData).length}`);
  
  return vesselData;
}

// API endpoint to fetch vessel by IMO
app.get('/api/vessel/:imo', async (req, res) => {
  try {
    const { imo } = req.params;
    
    // Validate IMO format (6 or 7 digits)
    if (!/^\d{6,7}$/.test(imo)) {
      return res.status(400).json({ 
        error: 'Invalid IMO format',
        message: 'IMO number must be 6 or 7 digits'
      });
    }
    
    console.log(`\nFetching vessel data for IMO: ${imo}`);
    const url = `https://www.vesselfinder.com/vessels/details/${imo}`;
    
    const html = await fetchVesselPage(url);
    
    if (!html) {
      return res.status(404).json({ 
        error: 'Vessel not found',
        message: 'Unable to fetch vessel details.'
      });
    }
    
    const vesselData = parseVesselDetails(html, imo);
    
    if (vesselData.name === 'Unknown Vessel') {
      return res.status(404).json({ 
        error: 'Vessel data incomplete',
        message: 'Unable to parse vessel details from the page.'
      });
    }
    
    console.log(`✓ Successfully fetched data for ${vesselData.name}\n`);
    res.json(vesselData);
    
  } catch (error) {
    console.error('Error in /api/vessel/:imo:', error.message);
    res.status(500).json({ 
      error: 'Server error',
      message: 'An error occurred while fetching vessel details.'
    });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Vessel API is running' });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({ 
    message: 'Marine Analytics Vessel API',
    endpoints: {
      health: '/api/health',
      vessel: '/api/vessel/:imo'
    },
    example: '/api/vessel/1002756'
  });
});

// Start server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`\n🚢 Vessel API server running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/api/health`);
  console.log(`Example: http://localhost:${PORT}/api/vessel/1002756\n`);
});

module.exports = app;