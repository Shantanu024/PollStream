# PollStream - Real-Time Polling Application

Pollstream is a full-stack web application that enables users to create polls, share them via links, and view results updating in real-time as votes are cast.

## Live Link

Frontend :- https://poll-stream-flame.vercel.app/
Backend :-  https://pollstream-jyah.onrender.com

## Features

- **Poll Creation**
- **Shareable Links**
- **Real-Time Updates**
- **Anti-Abuse Protection**
- **Mobile Responsive**
- **No Authentication Required**

## Anti-Abuse Mechanisms

### 1. Browser Fingerprinting

- FingerprintJS library is used to generate a unique identifier based on browser characteristics (user agent, screen resolution, canvas fingerprint, etc.)
- Fingerprint is stored and checked before allowing votes
- Each fingerprint can only vote once per poll
- This results in prevention of Multiple votes from the same device/browser

**Limitations:**
- Can be bypassed by using different browsers or devices
- Private/incognito mode may generate different fingerprints
- Browser data clearing resets the fingerprint

### 2. IP Address + Time-Based Rate Limiting

- First, the client's IP address is captured (handles proxy headers for deployment)
- It is then stored with timestamp in the database
- Blocks duplicate votes from the same IP are blocked within a 24-hour window
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

## Tech Stack

I have used MERN stack with Socket.io for this project mainly because of two reasons :- 
(i) I already had experience with this framework
(ii) It was possible to develop the project with this framework

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

### Deployment
- As for deployment I deployed the Backend on Railway and Frontend on Vercel
- Reason :- Socket.IO needs a long-running, stateful server, whereas Vercel is designed for stateless, short-lived serverless functions.
(* this was suggested by AI btw)

## Project Structure

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

## Edge Cases Handled

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
   - Uses MongoDB atomic operations
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
   - Text content displayed safely
   - No HTML rendering in user input

8. **Network Errors**
   - Retry logic for failed requests
   - User-friendly error messages

9. **Browser Compatibility**
   - Fallback for browsers without WebSocket support
   - LocalStorage fallback for fingerprinting

10. **Mobile Responsiveness**
    - Fully responsive design
    - Touch-friendly interfaces
    - Optimized for small screens

## API Endpoints

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

## Limitations & Scope for Improvement

### Current Limitations

1. **Authentication**
   - No user accounts or authentication system
   - Anyone with the link can access the poll
   - No poll ownership or editing capabilities

2. **Anti-Abuse Circumvention**
   - Determined users can bypass defenses with VPNs and browser switching
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

6. **Vote Type**
   - Only single-choice voting supported
   - No multiple-choice or ranked-choice options
   - No "other" option with text input

### Future Improvements

- **User authentication and poll ownership** - Allow users to manage their polls
- **Poll editing and deletion** - Edit questions/options and remove polls
- **Multiple choice voting** - Support multiple selections per user
- **Poll expiration dates** - Auto-close polls after set duration
- **Results analytics** - Vote times, geographic data, demographic insights`
- **Export results** - Download results as CSV and PDF
- **Social media sharing previews** - Rich preview cards for better sharing
- **Email notifications** - Notify users of poll results
- **Custom themes/branding** - Personalize poll appearance
- **Poll templates** - Pre-made poll structures for common use cases
- **Comment sections** - Allow discussion on polls
- **Advanced rate limiting** - Per-user account rate limiting
- **Admin dashboard** - Manage and monitor polls
- **Redis caching** - Cache popular polls for better performance
- **CAPTCHA integration** - Enhanced bot prevention for critical polls
