# Marine Analytics - Vessel Tracking System

A comprehensive vessel tracking and fleet management system built with React and CesiumJS.

## 🚀 Features

- **User Authentication** - Secure login and registration system
- **Vessel Search** - Search vessels by IMO number with VesselFinder.com integration
- **Fleet Management** - Add and manage your vessel fleet
- **Real-time Tracking** - Interactive 3D globe with CesiumJS for vessel tracking
- **Current Journey Widget** - View ongoing voyage information
- **Historical Trips** - Access past voyage records
- **Responsive Design** - Works seamlessly on desktop and mobile

## 📋 Prerequisites

Before you begin, ensure you have the following installed:
- **Node.js** (v14 or higher) - [Download here](https://nodejs.org/)
- **npm** (comes with Node.js)

## 🛠️ Installation

1. **Clone or create the project directory:**
```bash
mkdir marine-analytics
cd marine-analytics
```

2. **Create the folder structure:**
```bash
mkdir -p public src
```

3. **Copy all the project files** into their respective folders:
   - `public/index.html`
   - `src/App.js`
   - `src/index.js`
   - `src/index.css`
   - `package.json`

4. **Install dependencies:**
```bash
npm install
```

This will install:
- React and React-DOM
- react-scripts (Create React App tooling)
- lucide-react (Icon library)

**Note:** CesiumJS is loaded via CDN in `public/index.html`, so NO separate installation is needed for Cesium!

## 🎮 Running the Application

1. **Start the development server:**
```bash
npm start
```

2. **Open your browser:**
   - The app will automatically open at `http://localhost:3000`
   - If not, manually navigate to `http://localhost:3000`

3. **Start using the app:**
   - Register a new company account
   - Login with your credentials
   - Search for vessels using IMO numbers
   - Add vessels to your fleet
   - Click on vessels to view detailed tracking information

## 🔌 Backend API (Optional)

The app is configured to connect to a backend API at `http://localhost:3001/api/vessel/{imo}`.

If you have a backend server running, it will fetch live vessel data. Otherwise, it falls back to mock data.

**Example Backend Endpoint:**
```
GET http://localhost:3001/api/vessel/9739368
```

**Expected Response:**
```json
{
  "imo": "9739368",
  "name": "EVER GIVEN",
  "mmsi": "353136000",
  "type": "Container Ship",
  "flag": "Panama",
  "length": "399.94 m",
  "beam": "58.8 m",
  "grossTonnage": "220,940",
  "image": "https://..."
}
```

## 📦 Production Build

To create a production build:

```bash
npm run build
```

This creates an optimized build in the `build/` folder ready for deployment.

## 🗺️ CesiumJS Integration

CesiumJS is loaded via CDN in `public/index.html`. The app will:
- Show a 3D interactive globe
- Plot vessel positions with markers
- Allow zoom and pan controls
- Support KML file loading for routes

**No installation required** - it's loaded directly from Cesium's CDN!

## 📁 Project Structure

```
marine-analytics/
├── public/
│   └── index.html          # HTML template with CesiumJS CDN
├── src/
│   ├── App.js              # Main application with all components
│   ├── index.js            # React entry point
│   └── index.css           # Global styles
├── package.json            # Dependencies and scripts
└── README.md              # This file
```

## 🎨 Customization

### Adding More Vessels to Mock Database

Edit `App.js` and update the `mockVesselDatabase` object:

```javascript
const mockVesselDatabase = {
  '9739368': { /* ... */ },
  'YOUR_IMO': {
    name: 'YOUR_VESSEL_NAME',
    mmsi: 'MMSI_NUMBER',
    type: 'Vessel Type',
    flag: 'Country',
    length: '100 m',
    beam: '20 m',
    grossTonnage: '50,000',
    image: 'https://...'
  }
};
```

### Connecting to Your Backend

Update the API URL in the `fetchVesselDetails` function in `App.js`:

```javascript
const response = await fetch(`YOUR_API_URL/vessel/${imo}`);
```

## 🐛 Troubleshooting

### CesiumJS Not Loading
- Check browser console for errors
- Ensure you have internet connection (CesiumJS loads from CDN)
- Verify `public/index.html` has the Cesium script tags

### Vessel Search Not Working
- Check if backend server is running on port 3001
- Verify CORS settings on your backend
- App will fallback to mock data if backend is unavailable

### Port 3000 Already in Use
```bash
# Use a different port
PORT=3001 npm start
```

## 📝 License

This project is private and proprietary.

## 🤝 Support

For issues or questions, please contact the development team.

---

**Built with ❤️ using React and CesiumJS**
