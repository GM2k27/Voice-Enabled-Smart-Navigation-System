# VESNS - Voice Enabled Smart Navigation System

VESNS is a comprehensive voice-driven navigation platform that combines voice recognition with interactive map management. It integrates location and magic phrase management to offer seamless, hands-free navigation experiences.

Built using modern web technologies including **Next.js**, **React**, **Express**, **PostgreSQL**, and styled with **Tailwind CSS**, VESNS supports both web and Android clients.

## Features

- 🎤 **Voice Navigation**: Use spoken commands to navigate to saved or custom locations
- 📍 **Location Management**: Full CRUD interface for user-defined locations with geo-coordinates and tags
- ✨ **Magic Phrases**: Custom voice commands mapped to navigation actions for quick access
- 🗺️ **Interactive Maps**: Map interface powered by Leaflet with dynamic markers
- 📱 **Android API Integration**: RESTful endpoints specifically tailored for Android app consumption

## Project Structure

```
VESNS/
├── backend/                 # Express.js backend source code
│   ├── controllers/         # Route controllers handling requests
│   ├── services/            # Business logic layer
│   ├── models/              # Database ORM models
│   ├── routes/              # API route definitions
│   ├── db/                  # Database configs and migrations
│   └── server.js            # Backend Express server entry point
├── src/                     # Next.js frontend source code
│   ├── app/                 # Next.js app router pages
│   │   ├── page.js          # Main voice navigation page
│   │   ├── locations/       # Location management pages and components
│   │   └── phrases/         # Magic phrase management pages and components
│   ├── components/          # Reusable React UI components
│   └── lib/                 # Utility libraries such as API client
└── public/                  # Static assets like images and icons
```
└── public/                  # Static assets like images and icons

## Prerequisites

- Node.js (v18 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn

## Setup Instructions

### 1. Database Setup

Create a PostgreSQL database:

```bash
# Connect to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE vesns;

# Exit psql
\q
```

### 2. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Create .env file (copy from .env.example)
cp .env.example .env

# Edit .env with your database credentials
# DB_HOST=localhost
# DB_PORT=5432
# DB_NAME=vesns
# DB_USER=postgres
# DB_PASSWORD=your_password

# Run migrations to create tables
npm run migrate

# Start the backend server
npm run dev
```

The backend will run on `http://localhost:5000`

### 3. Frontend Setup

```bash
# From project root
cd ..

# Install dependencies
npm install

# Create .env.local file
cp .env.local.example .env.local

# Edit .env.local if needed (default: http://localhost:5000)
# NEXT_PUBLIC_API_URL=http://localhost:5000

# Start the development server
npm run dev
```

The frontend will run on `http://localhost:3000`

## API Endpoints

### Location Endpoints

- `POST /locations` - Create a new location
- `GET /locations` - Get all locations
- `GET /locations/:id` - Get a specific location
- `PUT /locations/:id` - Update a location
- `DELETE /locations/:id` - Delete a location

### Magic Phrase Endpoints

- `POST /phrases` - Create a new magic phrase
- `GET /phrases` - Get all magic phrases
- `DELETE /phrases/:id` - Delete a magic phrase

### Android API Endpoints

- `GET /api/locations` - Get all locations (for Android)
- `GET /api/phrases` - Get all magic phrases (for Android)

All responses follow this structure:
```json
{
  "status": "success" | "error",
  "data": {...},
  "message": "Description message"
}
```

## Usage

### Voice Navigation

1. Navigate to the home page (`/`)
2. Click the microphone button
3. Say one of the following:
   - A magic phrase (e.g., "take me home")
   - A saved location name (e.g., "Office")
   - A navigation command (e.g., "Navigate to London")

The system will:
1. First check for matching magic phrases
2. Then check for saved locations
3. Finally, geocode the location using OpenStreetMap

### Managing Locations

1. Navigate to `/locations`
2. Click "Add Location" to create a new location
3. Fill in the form:
   - Location Name (required, unique)
   - Latitude (-90 to 90)
   - Longitude (-180 to 180)
   - Tags (optional, for categorization)
   - Notes (optional)
4. Use the search bar to filter locations
5. Edit or delete locations using the action buttons

### Managing Magic Phrases

1. Navigate to `/phrases`
2. Click "Add Phrase" to create a new magic phrase
3. Enter:
   - Phrase (exact match for voice command)
   - Target Location (select from saved locations)
4. When the phrase is spoken, it will navigate to the target location

## Database Schema

### locations

- `id` (UUID, Primary Key)
- `location_name` (TEXT, Unique, Not Null)
- `latitude` (DOUBLE PRECISION, Not Null, -90 to 90)
- `longitude` (DOUBLE PRECISION, Not Null, -180 to 180)
- `tags` (TEXT[], Default: '{}')
- `notes` (TEXT)
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

### magic_phrases

- `id` (UUID, Primary Key)
- `phrase` (TEXT, Unique, Not Null)
- `action_type` (TEXT, Not Null, Default: 'navigate')
- `target_location_id` (UUID, Foreign Key → locations.id, ON DELETE CASCADE)
- `created_at` (TIMESTAMP)

## Development

### Backend Development

```bash
cd backend
npm run dev  # Uses nodemon for auto-reload
```

### Frontend Development

```bash
npm run dev  # Next.js development server
```

### Running Migrations

```bash
cd backend
npm run migrate
```

## Production Deployment

1. Set `NODE_ENV=production` in backend `.env`
2. Build the frontend: `npm run build`
3. Start the backend: `npm start` (in backend directory)
4. Start the frontend: `npm start` (in root directory)

## Browser Compatibility

- Works best in Chromium-based browsers (Chrome, Edge)
- Firefox has limited Web Speech API support
- Mobile browsers may have varying support

## Notes

- Geocoding uses OpenStreetMap's Nominatim API (respect rate limits)
- Voice recognition requires browser microphone permissions
- All API endpoints include CORS for cross-origin requests
- Database migrations are idempotent (safe to run multiple times)

## License

MIT
