import { mockVesselDatabase } from '../utils/mockData';

/**
 * Fetch vessel details by IMO number
 * First tries backend API, falls back to mock database
 */
export const fetchVesselDetails = async (imo) => {
  try {
    // Try backend API first
    const response = await fetch(`http://localhost:3001/api/vessel/${imo}`);
    if (response.ok) {
      const data = await response.json();
      console.log('Fetched from backend API:', data);
      return data;
    } else {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Vessel not found');
    }
  } catch (apiError) {
    console.log('Backend API error:', apiError.message);
    
    // Fallback to mock database
    if (mockVesselDatabase[imo]) {
      console.log('Using mock database');
      return {
        imo: imo,
        ...mockVesselDatabase[imo]
      };
    }
    
    throw new Error(`Unable to fetch vessel. Make sure the backend server is running on http://localhost:3001`);
  }
};

/**
 * Validate IMO number format
 */
export const validateIMO = (imo) => {
  const trimmed = imo.trim();
  return trimmed.length >= 6 && trimmed.length <= 7 && /^\d+$/.test(trimmed);
};
