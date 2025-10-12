// Frontend API service to fetch voyage data from backend
const API_BASE_URL = 'http://localhost:5001/api';

/**
 * Fetch historical trips for a specific IMO number
 * @param {string} imo - The IMO number of the vessel
 * @returns {Promise<Array>} Array of trip objects
 */
export const getHistoricalTrips = async (imo) => {
  try {
    const response = await fetch(`${API_BASE_URL}/vessels/${imo}/trips`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching historical trips:', error);
    throw error;
  }
};

/**
 * Get vessel summary statistics
 * @param {string} imo - The IMO number of the vessel
 * @returns {Promise<Object>} Vessel summary data
 */
export const getVesselSummary = async (imo) => {
  try {
    const response = await fetch(`${API_BASE_URL}/vessels/${imo}/summary`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching vessel summary:', error);
    throw error;
  }
};

/**
 * Health check to verify API is running
 * @returns {Promise<Object>} Health status
 */
export const checkApiHealth = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/health`);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('API health check failed:', error);
    throw error;
  }
};
