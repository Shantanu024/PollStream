# PollStream - Real-Time Polling Application

A full-stack web application that enables users to create polls, share them via links, and view results updating in real-time as votes are cast.

## 🚀 Live Demo

**Frontend:** [Your Vercel URL here]  
**Backend:** [Your Render URL here]

## 📹 Demo Video

[Link to demo video if available]

## ✨ Features

- **Poll Creation**: Create polls with custom questions and 2-10 options
- **Shareable Links**: Each poll gets a unique URL that can be shared with anyone
- **Real-Time Updates**: Results update instantly across all viewers using WebSockets
- **Anti-Abuse Protection**: Multiple mechanisms to prevent vote manipulation
- **Mobile Responsive**: Works seamlessly on desktop, tablet, and mobile devices
- **No Authentication Required**: Simple and accessible - no sign-up needed

## 🛡️ Anti-Abuse Mechanisms

### 1. Browser Fingerprinting
**What it prevents:** Multiple votes from the same device/browser  
**How it works:** 
- Uses FingerprintJS library to generate a unique identifier based on browser characteristics (user agent, screen resolution, canvas fingerprint, etc.)
- Fingerprint is stored and checked before allowing votes
- Each fingerprint can only vote once per poll

**Limitations:**
- Can be bypassed by using different browsers or devices
- Private/incognito mode may generate different fingerprints
- Browser data clearing resets the fingerprint

### 2. IP Address + Time-Based Rate Limiting
**What it prevents:** Vote flooding from the same network/IP address  
**How it works:**
- Captures the client's IP address (handles proxy headers for deployment)
- Stores IP with timestamp in the database
- Blocks duplicate votes from the same IP within a 24-hour window
- Prevents rapid vote manipulation even if fingerprint is changed

**Limitations:**
- Can be bypassed using VPN or proxy services
- Shared networks (schools, offices) may affect legitimate users
- Dynamic IPs may reset after reconnection

### Combined Protection
Both mechanisms work together:
- Fingerprint blocks immediate re-voting from the same browser
- IP blocking prevents switching browsers on the same network
- Makes casual vote manipulation significantly harder

## 🏗️ Tech Stack

### Frontend
- **React 18** - UI library
- **React Router** - Client-side routing
- **Socket.io Client** - Real-time communication
- **Axios** - HTTP requests
- **FingerprintJS** - Browser fingerprinting
- **Tailwind CSS** - Styling
- **Vite** - Build tool

### Backend
- **Node.js** - Runtime
- **Express** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM
- **Socket.io** - WebSocket server
- **Helmet** - Security middleware
- **express-rate-limit** - Rate limiting

## 📁 Project Structure

```
polling-app/
├── backend/
│   ├── models/
│   │   ├── Poll.js          # Poll schema
│   │   └── Vote.js          # Vote tracking schema
│   ├── routes/
│   │   └── pollRoutes.js    # API routes
│   ├── controllers/
│   │   └── pollController.js # Business logic
│   ├── utils/
│   │   └── ipHelper.js      # IP extraction utility
│   ├── server.js            # Main server file
│   ├── package.json
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Header.jsx
│   │   │   ├── Loading.jsx
│   │   │   └── ErrorMessage.jsx
│   │   ├── pages/
│   │   │   ├── Home.jsx     # Poll creation
│   │   │   ├── Poll.jsx     # Voting & results
│   │   │   └── NotFound.jsx
│   │   ├── services/
│   │   │   ├── api.js       # API calls
│   │   │   ├── socket.js    # WebSocket management
│   │   │   └── fingerprint.js # Fingerprinting
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── package.json
│   └── .env.example
└── README.md
```

## 🚦 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- MongoDB (local or Atlas account)
- npm or yarn

### Backend Setup

1. **Navigate to backend directory**
```bash
cd backend
```

2. **Install dependencies**
```bash
npm install
```

3. **Configure environment variables**
```bash
cp .env.example .env
```

Edit `.env` file:
```env
MONGODB_URI=mongodb://localhost:27017/polling-app
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
```

For MongoDB Atlas:
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/polling-app
```

4. **Start the server**
```bash
# Development mode with auto-reload
npm run dev

# Production mode
npm start
```

Server will run on `http://localhost:5000`

### Frontend Setup

1. **Navigate to frontend directory**
```bash
cd frontend
```

2. **Install dependencies**
```bash
npm install
```

3. **Configure environment variables**
```bash
cp .env.example .env
```

Edit `.env` file:
```env
VITE_API_BASE_URL=http://localhost:5000
VITE_SOCKET_URL=http://localhost:5000
```

4. **Start development server**
```bash
npm run dev
```

Frontend will run on `http://localhost:5173`

## 🌐 Deployment

### Backend Deployment (Render)

1. **Create Render account** at [render.com](https://render.com)

2. **Create new Web Service**
   - Connect your GitHub repository
   - Select the backend directory
   - Build command: `npm install`
   - Start command: `npm start`

3. **Add environment variables:**
   - `MONGODB_URI` - Your MongoDB Atlas connection string
   - `PORT` - 5000 (or leave blank for default)
   - `NODE_ENV` - production
   - `FRONTEND_URL` - Your frontend URL (e.g., https://your-app.vercel.app)

4. **Deploy** and note your backend URL

### Frontend Deployment (Vercel)

1. **Create Vercel account** at [vercel.com](https://vercel.com)

2. **Import your project**
   - Connect GitHub repository
   - Framework Preset: Vite
   - Root Directory: `frontend`

3. **Add environment variables:**
   - `VITE_API_BASE_URL` - Your backend URL (e.g., https://your-backend.onrender.com)
   - `VITE_SOCKET_URL` - Same as backend URL

4. **Deploy** and your app is live!

### MongoDB Atlas Setup

1. Create free account at [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. Create a new cluster
3. Database Access: Create a database user
4. Network Access: Add `0.0.0.0/0` (allow from anywhere)
5. Get connection string and update environment variables

## 🧪 Edge Cases Handled

1. **Invalid Poll IDs**
   - Returns 404 error with user-friendly message
   - Validates MongoDB ObjectId format

2. **User Already Voted**
   - Displays results instead of voting options
   - Shows user's previous choice
   - Prevents duplicate vote submissions

3. **Socket Disconnection**
   - Automatic reconnection with exponential backoff
   - Fetches latest data on reconnection
   - Continues showing cached data during brief disconnections

4. **Concurrent Votes**
   - Uses MongoDB atomic operations (`$inc`)
   - Prevents race conditions in vote counting
   - Ensures accurate tallies under high load

5. **Empty or Invalid Options**
   - Frontend validation before submission
   - Backend validation as safety net
   - Clear error messages to users

6. **Very Long Text**
   - Question: 200 character limit
   - Options: 100 character limit
   - Enforced on both frontend and backend

7. **XSS Prevention**
   - Input sanitization
   - Text content displayed safely
   - No HTML rendering in user input

8. **Network Errors**
   - Retry logic for failed requests
   - User-friendly error messages
   - Graceful degradation

9. **Browser Compatibility**
   - Fallback for browsers without WebSocket support
   - LocalStorage fallback for fingerprinting
   - Polyfills included in build

10. **Mobile Responsiveness**
    - Fully responsive design
    - Touch-friendly interfaces
    - Optimized for small screens

## 🔧 API Endpoints

### Create Poll
```http
POST /api/polls
Content-Type: application/json

{
  "question": "What's your favorite programming language?",
  "options": ["JavaScript", "Python", "Go", "Rust"]
}

Response: {
  "success": true,
  "pollId": "507f1f77bcf86cd799439011",
  "poll": { ... }
}
```

### Get Poll
```http
GET /api/polls/:id?fingerprint=abc123

Response: {
  "success": true,
  "poll": {
    "id": "507f1f77bcf86cd799439011",
    "question": "What's your favorite programming language?",
    "options": [...],
    "totalVotes": 42,
    "hasVoted": false
  }
}
```

### Submit Vote
```http
POST /api/polls/:id/vote
Content-Type: application/json

{
  "optionIndex": 0,
  "fingerprint": "abc123def456"
}

Response: {
  "success": true,
  "message": "Vote recorded successfully!",
  "poll": { ... }
}
```

### Get Results
```http
GET /api/polls/:id/results

Response: {
  "success": true,
  "results": {
    "options": [...],
    "totalVotes": 42
  }
}
```

## 🔌 WebSocket Events

### Client → Server
- `joinPoll` - Join a poll room for real-time updates
- `leavePoll` - Leave a poll room

### Server → Client
- `voteUpdate` - Broadcast updated poll results to all viewers

## ⚠️ Known Limitations

1. **Authentication**
   - No user accounts or authentication system
   - Anyone with the link can access the poll
   - No poll ownership or editing capabilities

2. **Anti-Abuse Circumvention**
   - Determined users can bypass with VPNs and browser switching
   - Not suitable for high-stakes voting
   - Consider adding CAPTCHA for critical use cases

3. **Poll Management**
   - No way to delete or edit polls after creation
   - Polls persist indefinitely
   - No poll expiration mechanism

4. **Scalability**
   - Single MongoDB instance
   - No caching layer (Redis)
   - WebSocket connections scale with server resources

5. **Data Privacy**
   - IP addresses stored in database
   - Browser fingerprints logged
   - No GDPR compliance features

6. **Vote Type**
   - Only single-choice voting supported
   - No multiple-choice or ranked-choice options
   - No "other" option with text input

## 🚀 Future Improvements

- [ ] User authentication and poll ownership
- [ ] Poll editing and deletion
- [ ] Multiple choice voting
- [ ] Poll expiration dates
- [ ] Results analytics (vote times, geographic data)
- [ ] CAPTCHA integration
- [ ] Export results (CSV, PDF)
- [ ] Poll templates
- [ ] Custom themes/branding
- [ ] Comment sections
- [ ] Social media sharing previews
- [ ] Email notifications
- [ ] Rate limiting per user account
- [ ] Admin dashboard
- [ ] Redis caching for popular polls

## 🐛 Troubleshooting

### Backend won't start
- Ensure MongoDB is running
- Check `MONGODB_URI` in `.env`
- Verify port 5000 is available

### Frontend can't connect to backend
- Check `VITE_API_BASE_URL` in `.env`
- Ensure backend is running
- Verify CORS settings in `server.js`

### Real-time updates not working
- Check browser console for WebSocket errors
- Verify `VITE_SOCKET_URL` matches backend
- Ensure Socket.io is properly initialized

### Votes not being recorded
- Check browser console for errors
- Verify fingerprint is being generated
- Check backend logs for validation errors

## 📄 License

MIT License - feel free to use this project for learning or production

## 👨‍💻 Author

[Your Name]

## 🙏 Acknowledgments

- FingerprintJS for browser fingerprinting
- Socket.io for real-time communication
- MongoDB Atlas for database hosting
- Render and Vercel for deployment platforms
