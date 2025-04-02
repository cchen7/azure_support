const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const path = require('path');
const http = require('http');
const socketIo = require('socket.io');
const initDatabase = require('./backend/database/init');

// Load environment variables
dotenv.config();

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: process.env.NODE_ENV === 'production' ? false : ['http://localhost:3000'],
    methods: ['GET', 'POST']
  }
});

// Initialize database
initDatabase();

// Middleware
app.use(cors());
app.use(express.json());

// Socket.io connection
io.on('connection', (socket) => {
  console.log('New client connected');
  
  socket.on('subscribe', (subscriptionId) => {
    socket.join(`subscription-${subscriptionId}`);
  });
  
  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});

// Make io accessible to route handlers
app.set('io', io);

// API Routes
app.use('/api/subscriptions', require('./backend/routes/subscriptions'));
app.use('/api/cases', require('./backend/routes/cases'));
app.use('/api/auth', require('./backend/routes/auth'));

// Serve static assets in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static('client/build'));
  
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'client', 'build', 'index.html'));
  });
}

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => console.log(`Server started on port ${PORT}`));
