require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const { createServer } = require('http');
const { Server } = require('socket.io');
const rateLimit = require('express-rate-limit');

const pollRoutes = require('./routes/pollRoutes');

const app = express();
const httpServer = createServer(app);

// CORS configuration - allow all Vercel preview deployments
const getCorsOrigin = () => {
  const isProduction = process.env.NODE_ENV === 'production';
  if (isProduction) {
    return (origin, callback) => {
      const allowedPatterns = [
        /^https:\/\/.*\.vercel\.app$/,
        /^http:\/\/localhost(:\d+)?$/
      ];
      
      const isAllowed = allowedPatterns.some(pattern => pattern.test(origin));
      if (isAllowed || !origin) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    };
  }
  return 'http://localhost:5173';
};

// Socket.io setup with CORS
const io = new Server(httpServer, {
  cors: getCorsOrigin()
});

// Middleware
app.use(helmet());
app.use(cors({
  origin: getCorsOrigin(),
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', limiter);

// MongoDB Connection
const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/polling-app';
    await mongoose.connect(mongoURI);
    console.log('✅ MongoDB connected successfully');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

connectDB();

// Routes
app.use('/api', pollRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({ 
    message: 'Real-Time Polling App API',
    version: '1.0.0',
    endpoints: {
      createPoll: 'POST /api/polls',
      getPoll: 'GET /api/polls/:id',
      vote: 'POST /api/polls/:id/vote',
      results: 'GET /api/polls/:id/results'
    }
  });
});

// Socket.io - Real-time functionality
const pollRooms = new Map(); // Track active poll rooms

io.on('connection', (socket) => {
  // Join a specific poll room
  socket.on('joinPoll', (pollId) => {
    socket.join(pollId);
    
    // Track room
    if (!pollRooms.has(pollId)) {
      pollRooms.set(pollId, new Set());
    }
    pollRooms.get(pollId).add(socket.id);
  });

  // Leave poll room
  socket.on('leavePoll', (pollId) => {
    socket.leave(pollId);
    
    if (pollRooms.has(pollId)) {
      pollRooms.get(pollId).delete(socket.id);
      if (pollRooms.get(pollId).size === 0) {
        pollRooms.delete(pollId);
      }
    }
  });

  // Handle disconnect
  socket.on('disconnect', () => {
    // Clean up from all rooms
    pollRooms.forEach((sockets, pollId) => {
      if (sockets.has(socket.id)) {
        sockets.delete(socket.id);
        if (sockets.size === 0) {
          pollRooms.delete(pollId);
        }
      }
    });
  });
});

// Make io accessible to routes for emitting vote updates
app.set('io', io);

// Middleware to emit vote updates
app.use((req, res, next) => {
  const originalJson = res.json;
  
  res.json = function(data) {
    // If this is a successful vote submission, emit to all clients in the poll room
    if (req.path.includes('/vote') && req.method === 'POST' && data.success && data.poll) {
      const pollId = req.params.id;
      io.to(pollId).emit('voteUpdate', data.poll);
    }
    
    return originalJson.call(this, data);
  };
  
  next();
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ 
    error: 'Endpoint not found' 
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ 
    error: 'Internal server error' 
  });
});

// Start server
const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📡 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🌐 Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:5173'}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, closing server...');
  httpServer.close(() => {
    mongoose.connection.close(false, () => {
      console.log('Server closed');
      process.exit(0);
    });
  });
});
