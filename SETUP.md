# Quick Setup Guide

## Step 1: Database Setup

1. Install PostgreSQL if not already installed
2. Create the database:
   ```bash
   psql -U postgres
   CREATE DATABASE vesns;
   \q
   ```

## Step 2: Backend Setup

```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your PostgreSQL credentials
npm run migrate
npm run dev
```

Backend runs on `http://localhost:5000`

## Step 3: Frontend Setup

```bash
# From project root
npm install
cp .env.local.example .env.local
npm run dev
```

Frontend runs on `http://localhost:3000`

## Testing the Application

1. **Create a Location:**
   - Go to `/locations`
   - Click "Add Location"
   - Fill in: Name, Latitude, Longitude
   - Save

2. **Create a Magic Phrase:**
   - Go to `/phrases`
   - Click "Add Phrase"
   - Enter a phrase (e.g., "take me home")
   - Select a target location
   - Save

3. **Test Voice Navigation:**
   - Go to `/` (home page)
   - Click the microphone button
   - Say your magic phrase or location name
   - The map should navigate to the location

## Troubleshooting

### Backend won't start
- Check PostgreSQL is running
- Verify database credentials in `backend/.env`
- Ensure database `vesns` exists

### Frontend can't connect to backend
- Verify backend is running on port 5000
- Check `NEXT_PUBLIC_API_URL` in `.env.local`
- Check browser console for CORS errors

### Voice recognition not working
- Use Chrome or Edge browser
- Allow microphone permissions
- Check browser console for errors

