# Quick Start Guide

Get the PollStream app running locally in 5 minutes!

## Prerequisites

Install these first:
- [Node.js](https://nodejs.org/) (v18 or higher)
- [MongoDB](https://www.mongodb.com/try/download/community) (or use [MongoDB Atlas](https://www.mongodb.com/cloud/atlas))

## Setup Steps

### 1. Clone or Download Project
```bash
cd polling-app
```

### 2. Backend Setup (Terminal 1)

```bash
# Navigate to backend
cd backend

# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Start MongoDB (if running locally)
# mongod --dbpath /path/to/your/data/directory

# Start backend server
npm run dev
```

Backend will run on `http://localhost:5000`

### 3. Frontend Setup (Terminal 2)

```bash
# Navigate to frontend (from project root)
cd frontend

# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Start frontend server
npm run dev
```

Frontend will run on `http://localhost:5173`

### 4. Test the App

1. Open browser to `http://localhost:5173`
2. Create a poll
3. Open the poll link in a new incognito window
4. Vote and watch real-time updates! 🎉

## Default Configuration

The `.env.example` files are already configured for local development:

**Backend** (`.env`):
```env
MONGODB_URI=mongodb://localhost:27017/polling-app
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
```

**Frontend** (`.env`):
```env
VITE_API_BASE_URL=http://localhost:5000
VITE_SOCKET_URL=http://localhost:5000
```

## Using MongoDB Atlas (Recommended)

If you don't want to install MongoDB locally:

1. Create free account at [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. Create a cluster (M0 Free tier)
3. Get connection string
4. Update `backend/.env`:
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/polling-app
```

## Troubleshooting

### Port already in use
```bash
# Kill process on port 5000
lsof -ti:5000 | xargs kill -9

# Or change PORT in backend/.env
PORT=5001
```

### MongoDB connection failed
```bash
# Check MongoDB is running
mongod --version

# Or use MongoDB Atlas instead
```

### Frontend can't reach backend
- Ensure backend is running on port 5000
- Check `VITE_API_BASE_URL` in frontend/.env
- Verify no CORS errors in browser console

## Next Steps

- Read [README.md](README.md) for full documentation
- See [DEPLOYMENT.md](DEPLOYMENT.md) for deployment instructions
- Check the code structure and start customizing!

## Quick Commands Reference

```bash
# Backend
cd backend
npm install          # Install dependencies
npm run dev          # Development with auto-reload
npm start            # Production mode

# Frontend  
cd frontend
npm install          # Install dependencies
npm run dev          # Development server
npm run build        # Build for production
npm run preview      # Preview production build

# Both (from root)
# You'll need two terminal windows
```

Enjoy building with PollStream! 🚀
