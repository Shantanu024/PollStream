const express = require('express');
const router = express.Router();
const {
  createPoll,
  getPoll,
  submitVote,
  getResults
} = require('../controllers/pollController');

// Create a new poll
router.post('/polls', createPoll);

// Get poll by ID
router.get('/polls/:id', getPoll);

// Submit a vote
router.post('/polls/:id/vote', submitVote);

// Get poll results
router.get('/polls/:id/results', getResults);

module.exports = router;
