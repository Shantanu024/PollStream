const Poll = require('../models/Poll');
const Vote = require('../models/Vote');
const { getClientIp } = require('../utils/ipHelper');

//Create a new poll
const createPoll = async (req, res) => {
  try {
    const { question, options } = req.body;

    // Validation
    if (!question || !options || !Array.isArray(options)) {
      return res.status(400).json({ 
        error: 'Invalid request. Question and options array required.' 
      });
    }

    if (options.length < 2) {
      return res.status(400).json({ 
        error: 'Poll must have at least 2 options.' 
      });
    }

    if (options.length > 10) {
      return res.status(400).json({ 
        error: 'Poll cannot have more than 10 options.' 
      });
    }

    // Check for empty options
    const hasEmptyOption = options.some(opt => !opt || !opt.trim());
    if (hasEmptyOption) {
      return res.status(400).json({ 
        error: 'All options must have text.' 
      });
    }

    // Create poll with formatted options
    const poll = new Poll({
      question: question.trim(),
      options: options.map(opt => ({
        text: opt.trim(),
        votes: 0
      }))
    });

    await poll.save();

    res.status(201).json({
      success: true,
      pollId: poll._id,
      poll: {
        id: poll._id,
        question: poll.question,
        options: poll.options,
        createdAt: poll.createdAt
      }
    });
  } catch (error) {
    console.error('Create poll error:', error);
    res.status(500).json({ 
      error: 'Failed to create poll. Please try again.' 
    });
  }
};


//Get poll by ID
const getPoll = async (req, res) => {
  try {
    const { id } = req.params;
    const { fingerprint } = req.query;

    const poll = await Poll.findById(id);

    if (!poll) {
      return res.status(404).json({ 
        error: 'Poll not found.' 
      });
    }

    // Check if user has already voted
    let hasVoted = false;
    let userVote = null;

    if (fingerprint) {
      const clientIp = getClientIp(req);
      const existingVote = await Vote.findOne({
        pollId: id,
        $or: [
          { fingerprint },
          { ipAddress: clientIp }
        ]
      });

      if (existingVote) {
        hasVoted = true;
        userVote = existingVote.optionIndex;
      }
    }

    // Calculate total votes
    const totalVotes = poll.options.reduce((sum, opt) => sum + opt.votes, 0);

    res.json({
      success: true,
      poll: {
        id: poll._id,
        question: poll.question,
        options: poll.options.map((opt, index) => ({
          text: opt.text,
          votes: opt.votes,
          percentage: totalVotes > 0 ? ((opt.votes / totalVotes) * 100).toFixed(1) : 0,
          index
        })),
        totalVotes,
        createdAt: poll.createdAt,
        hasVoted,
        userVote
      }
    });
  } catch (error) {
    console.error('Get poll error:', error);
    
    if (error.name === 'CastError') {
      return res.status(404).json({ 
        error: 'Invalid poll ID.' 
      });
    }
    
    res.status(500).json({ 
      error: 'Failed to fetch poll.' 
    });
  }
};

//Submit a vote with anti-abuse checks
const submitVote = async (req, res) => {
  try {
    const { id } = req.params;
    const { optionIndex, fingerprint } = req.body;

    // Validation
    if (optionIndex === undefined || !fingerprint) {
      return res.status(400).json({ 
        error: 'Missing required fields.' 
      });
    }

    const clientIp = getClientIp(req);

    // Check if poll exists
    const poll = await Poll.findById(id);
    if (!poll) {
      return res.status(404).json({ 
        error: 'Poll not found.' 
      });
    }

    // Validate option index
    if (optionIndex < 0 || optionIndex >= poll.options.length) {
      return res.status(400).json({ 
        error: 'Invalid option selected.' 
      });
    }

    // ANTI-ABUSE MECHANISM #1: Browser Fingerprint Check
    const fingerprintVote = await Vote.findOne({
      pollId: id,
      fingerprint
    });

    if (fingerprintVote) {
      return res.status(403).json({ 
        error: 'You have already voted in this poll.',
        hasVoted: true
      });
    }

    // ANTI-ABUSE MECHANISM #2: IP Address + Time-based Rate Limiting
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const ipVote = await Vote.findOne({
      pollId: id,
      ipAddress: clientIp,
      votedAt: { $gte: twentyFourHoursAgo }
    });

    if (ipVote) {
      return res.status(403).json({ 
        error: 'Multiple votes from the same network are not allowed within 24 hours.',
        hasVoted: true
      });
    }

    // Record the vote
    const vote = new Vote({
      pollId: id,
      fingerprint,
      ipAddress: clientIp,
      optionIndex
    });

    await vote.save();

    // Atomically increment vote count
    await Poll.findByIdAndUpdate(
      id,
      { $inc: { [`options.${optionIndex}.votes`]: 1 } },
      { new: true }
    );

    // Fetch updated poll
    const updatedPoll = await Poll.findById(id);
    const totalVotes = updatedPoll.options.reduce((sum, opt) => sum + opt.votes, 0);

    const pollData = {
      id: updatedPoll._id,
      question: updatedPoll.question,
      options: updatedPoll.options.map((opt, index) => ({
        text: opt.text,
        votes: opt.votes,
        percentage: totalVotes > 0 ? ((opt.votes / totalVotes) * 100).toFixed(1) : 0,
        index
      })),
      totalVotes
    };

    res.json({
      success: true,
      message: 'Vote recorded successfully!',
      poll: pollData
    });

    // Return poll data for socket emission
    return pollData;
  } catch (error) {
    console.error('Submit vote error:', error);
    
    if (error.name === 'CastError') {
      return res.status(404).json({ 
        error: 'Invalid poll ID.' 
      });
    }
    
    res.status(500).json({ 
      error: 'Failed to submit vote.' 
    });
  }
};

//Get poll results (alias for getPoll data)
const getResults = async (req, res) => {
  req.query = req.query || {}; // Ensure query exists
  await getPoll(req, res);
};

module.exports = {
  createPoll,
  getPoll,
  submitVote,
  getResults
};
