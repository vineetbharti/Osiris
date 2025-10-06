// vessel-api.js - Backend API to fetch vessel data from VesselFinder
// Based on your Python crawler implementation

const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// Helper function to add random delay (similar to your Python code)
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const randomDelay = (min, max) => {
  return Math.random() * (max - min) + min;
};

// Function to fetch URL with retries and backoff (matching your Python logic)
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
        maxRedirects: 5
      });

      if (response.status === 200) {
        console.log(`[${url}] Success on attempt ${attempt}`);
        return response.data;
      }

    } catch (error) {
      if (error.response) {
        // Server responded with error status
        const status = error.response.status;

        if (status === 429) {
          // Rate limited
          const waitTime = (5 * attempt + randomDelay(1, 5)) * 1000;
          console.log(`[${url}] Rate limited (429). Sleeping ${waitTime / 1000}s...`);
          await sleep(waitTime);
          continue;
        } else if (status === 404) {
          console.log(`[${url}] Not found (404). Skipping.`);
          return null;
        } else {
          console.log(`[${url}] HTTP ${status}, retry ${attempt}/${maxRetries}`);
          await sleep(2000 * attempt);
          continue;
        }
      } else if (error.request) {
        // Request made but no response
        const waitTime = (2 * attempt + randomDelay(0.5, 2.0)) * 1000;
        console.log(`[${url}] Network error: ${error.message}. Retrying in ${waitTime / 1000}s...`);
        await sleep(waitTime);
        continue;
      } else {
        console.log(`[${url}] Error: ${error.message}`);
        await sleep(2000 * attempt);
        continue;
      }
    }
  }

  console.log(`[${url}] Failed after ${maxRetries} retries.`);
  return null;
}

// Function to parse vessel details from HTML
function parseVesselDetails(html, imo) {
  const $ = cheerio.load(html);
  
  // Extract vessel name from h1 or title
  let name = $('h1').first().text().trim();
  if (!name) {
    name = $('title').text().split('|')[0].trim();
  }
  
  // Helper function to extract table data
  const extractDetail = (label) => {
    let value = 'N/A';
    $('table tr').each((i, elem) => {
      const th = $(elem).find('th').text().trim();
      if (th.toLowerCase().includes(label.toLowerCase())) {
        value = $(elem).find('td').text().trim();
        return false; // break the loop
      }
    });
    return value;
  };
  
  // Alternative method: look for dt/dd pairs
  const extractFromDefinitionList = (label) => {
    let value = 'N/A';
    $('dt').each((i, elem) => {
      const dtText = $(elem).text().trim();
      if (dtText.toLowerCase().includes(label.toLowerCase())) {
        value = $(elem).next('dd').text().trim();
        return false;
      }
    });
    return value;
  };
  
  // Try both methods for each field
  const getDetail = (label) => {
    const tableValue = extractDetail(label);
    return tableValue !== 'N/A' ? tableValue : extractFromDefinitionList(label);
  };
  
  // Extract vessel image
  let imageUrl = null;
  const possibleImages = [
    $('img[alt*="vessel"]').first().attr('src'),
    $('img[alt*="ship"]').first().attr('src'),
    $('img[itemprop="image"]').first().attr('src'),
    $('.vessel-image img').first().attr('src'),
    $('#vessel-photo img').first().attr('src')
  ];
  
  for (const img of possibleImages) {
    if (img) {
      imageUrl = img.startsWith('http') ? img : `https://www.vesselfinder.com${img}`;
      break;
    }
  }
  
  // Build vessel data object
  const vesselData = {
    imo: imo,
    name: name || 'Unknown Vessel',
    mmsi: getDetail('MMSI'),
    type: getDetail('Type') || getDetail('Vessel Type'),
    flag: getDetail('Flag'),
    length: getDetail('Length') || getDetail('Length Overall'),
    beam: getDetail('Beam'),
    grossTonnage: getDetail('Gross Tonnage') || getDetail('GT'),
    image: imageUrl
  };
  
  return vesselData;
}

// API endpoint to fetch vessel by IMO
app.get('/api/vessel/:imo', async (req, res) => {
  try {
    const { imo } = req.params;
    
    // Validate IMO format
    if (!/^\d{7}$/.test(imo)) {
      return res.status(400).json({ 
        error: 'Invalid IMO format',
        message: 'IMO number must be 7 digits'
      });
    }
    
    console.log(`Fetching vessel data for IMO: ${imo}`);
    const url = `https://www.vesselfinder.com/vessels/details/${imo}`;
    
    const html = await fetchVesselPage(url);
    
    if (!html) {
      return res.status(404).json({ 
        error: 'Vessel not found',
        message: 'Unable to fetch vessel details. The vessel may not exist or VesselFinder may be unavailable.'
      });
    }
    
    const vesselData = parseVesselDetails(html, imo);
    
    // Check if we got valid data
    if (vesselData.name === 'Unknown Vessel' && vesselData.type === 'N/A') {
      return res.status(404).json({ 
        error: 'Vessel data incomplete',
        message: 'Unable to parse vessel details from the page.'
      });
    }
    
    console.log(`Successfully fetched data for ${vesselData.name}`);
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

// Start server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`🚢 Vessel API server running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/api/health`);
  console.log(`Example: http://localhost:${PORT}/api/vessel/9739368`);
});

module.exports = app;
