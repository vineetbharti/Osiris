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
        return response.data;
      } else if (response.status === 429) {
        const waitTime = (5 * attempt + randomDelay(1, 5)) * 1000;
        await sleep(waitTime);
      } else if (response.status === 404) {
        return null;
      } else {
        await sleep(2000 * attempt);
      }
    } catch (error) {
      const waitTime = (2 * attempt + randomDelay(0.5, 2.0)) * 1000;
      await sleep(waitTime);
    }
  }
  return null;
}

// New function to fetch actual image URL from ship-photos page
async function fetchShipPhotoUrl(shipPhotosPageUrl) {
  try {
    console.log(`Fetching ship photo from: ${shipPhotosPageUrl}`);
    const html = await fetchVesselPage(shipPhotosPageUrl);
    
    if (!html) return null;
    
    const $ = cheerio.load(html);
    
    // Look for the actual image URL in the ship-photos page
    const possibleSelectors = [
      'img.ship-photo',
      'img[src*="ship-photo"]',
      'img[src*="static.vesselfinder"]',
      '.photo-container img',
      '#ship-photo img',
      'img[itemprop="image"]'
    ];
    
    for (const selector of possibleSelectors) {
      const imgSrc = $(selector).first().attr('src');
      if (imgSrc && !imgSrc.includes('logo') && !imgSrc.includes('placeholder')) {
        const fullUrl = imgSrc.startsWith('http') ? imgSrc : `https://www.vesselfinder.com${imgSrc}`;
        console.log(`Found image URL: ${fullUrl}`);
        return fullUrl;
      }
    }
    
    // Fallback: look for any img tag with large dimensions
    const allImages = $('img');
    for (let i = 0; i < allImages.length; i++) {
      const imgSrc = $(allImages[i]).attr('src');
      if (imgSrc && imgSrc.includes('static.vesselfinder') && !imgSrc.includes('logo')) {
        const fullUrl = imgSrc.startsWith('http') ? imgSrc : `https://www.vesselfinder.com${imgSrc}`;
        console.log(`Found fallback image URL: ${fullUrl}`);
        return fullUrl;
      }
    }
    
    console.log('No image found on ship-photos page');
    return null;
  } catch (error) {
    console.error('Error fetching ship photo:', error.message);
    return null;
  }
}

function parseVesselDetails(html, imo) {
  const $ = cheerio.load(html);
  
  let name = $('h1').first().text().trim();
  if (!name) {
    const titleText = $('title').text();
    name = titleText.split('|')[0].split('-')[0].trim();
  }
  
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
    shipPhotosUrl: null,
    allData: {}
  };
  
  const shipSections = $('section.ship-section');
  
  shipSections.each((sectionIdx, section) => {
    $(section).find('table.tpt1, table.tpt2').each((tableIdx, table) => {
      $(table).find('tr').each((rowIdx, row) => {
        const cells = $(row).find('td');
        if (cells.length === 2) {
          const key = $(cells[0]).text().trim();
          const value = $(cells[1]).text().trim() || 'N/A';
          
          vesselData.allData[key] = value;
          
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
  
  // Find ship-photos link
  const shipPhotosLink = $('a[href*="/ship-photos/"]').first().attr('href');
  if (shipPhotosLink) {
    vesselData.shipPhotosUrl = shipPhotosLink.startsWith('http') 
      ? shipPhotosLink 
      : `https://www.vesselfinder.com${shipPhotosLink}`;
  }
  
  console.log(`Parsed: ${vesselData.name}, Ship Photos URL: ${vesselData.shipPhotosUrl}`);
  
  return vesselData;
}

app.get('/api/vessel/:imo', async (req, res) => {
  try {
    const { imo } = req.params;
    
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
    
    // Fetch actual image URL if ship-photos page found
    if (vesselData.shipPhotosUrl) {
      const imageUrl = await fetchShipPhotoUrl(vesselData.shipPhotosUrl);
      if (imageUrl) {
        vesselData.image = imageUrl;
      }
    }
    
    console.log(`✓ Successfully fetched data for ${vesselData.name}`);
    console.log(`  Image URL: ${vesselData.image || 'Not found'}\n`);
    
    res.json(vesselData);
    
  } catch (error) {
    console.error('Error:', error.message);
    res.status(500).json({ 
      error: 'Server error',
      message: 'An error occurred while fetching vessel details.'
    });
  }
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Vessel API is running' });
});

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

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`\nVessel API server running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/api/health`);
  console.log(`Example: http://localhost:${PORT}/api/vessel/9987196\n`);
});

module.exports = app;
