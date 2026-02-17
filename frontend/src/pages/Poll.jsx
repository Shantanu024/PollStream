import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { pollApi } from '../services/api';
import { getFingerprint } from '../services/fingerprint';
import { joinPollRoom, leavePollRoom, onVoteUpdate, offVoteUpdate } from '../services/socket';
import Loading from '../components/Loading';
import ErrorMessage from '../components/ErrorMessage';

const Poll = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [poll, setPoll] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [voting, setVoting] = useState(false);
  const [hasVoted, setHasVoted] = useState(false);
  const [selectedOption, setSelectedOption] = useState(null);
  const [fingerprint, setFingerprint] = useState(null);
  const [showShareModal, setShowShareModal] = useState(false);
  const [copied, setCopied] = useState(false);

  // Fetch poll data
  const fetchPoll = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      
      const fp = await getFingerprint();
      setFingerprint(fp);
      
      const response = await pollApi.getPoll(id, fp);
      
      if (response.success) {
        setPoll(response.poll);
        setHasVoted(response.poll.hasVoted);
        if (response.poll.hasVoted) {
          setSelectedOption(response.poll.userVote);
        }
      }
    } catch (err) {
      console.error('Fetch poll error:', err);
      if (err.response?.status === 404) {
        setError('Poll not found. It may have been deleted or the link is incorrect.');
      } else {
        setError('Failed to load poll. Please check your connection and try again.');
      }
    } finally {
      setLoading(false);
    }
  }, [id]);

  // Handle vote update from socket
  const handleVoteUpdate = useCallback((updatedPoll) => {
    setPoll(prevPoll => ({
      ...prevPoll,
      options: updatedPoll.options,
      totalVotes: updatedPoll.totalVotes
    }));
  }, []);

  // Initialize poll and socket connection
  useEffect(() => {
    fetchPoll();
    
    // Join socket room
    joinPollRoom(id);
    
    // Listen for vote updates
    onVoteUpdate(handleVoteUpdate);
    
    // Cleanup
    return () => {
      leavePollRoom(id);
      offVoteUpdate(handleVoteUpdate);
    };
  }, [id, fetchPoll, handleVoteUpdate]);

  // Handle vote submission
  const handleVote = async (optionIndex) => {
    if (hasVoted || voting) return;

    try {
      setVoting(true);
      setError('');
      
      const response = await pollApi.submitVote(id, optionIndex, fingerprint);
      
      if (response.success) {
        setHasVoted(true);
        setSelectedOption(optionIndex);
        setPoll(response.poll);
        
        // Show success message briefly
        setTimeout(() => {
          setShowShareModal(true);
        }, 500);
      }
    } catch (err) {
      console.error('Vote error:', err);
      if (err.response?.status === 403) {
        setError(err.response.data.error);
        setHasVoted(true);
      } else {
        setError('Failed to submit vote. Please try again.');
      }
    } finally {
      setVoting(false);
    }
  };

  // Copy share link
  const handleCopyLink = () => {
    const shareUrl = window.location.href;
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Render loading state
  if (loading) {
    return <Loading message="Loading poll..." />;
  }

  // Render error state
  if (error && !poll) {
    return (
      <ErrorMessage 
        message={error}
        onRetry={() => {
          navigate('/');
        }}
      />
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      {/* Poll Card */}
      <div className="bg-white rounded-xl shadow-xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary-600 to-primary-700 px-6 py-6">
          <h2 className="text-2xl font-bold text-white mb-2">{poll?.question}</h2>
          <div className="flex items-center space-x-4 text-primary-100">
            <span className="flex items-center">
              <svg className="w-5 h-5 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
              </svg>
              {poll?.totalVotes || 0} votes
            </span>
            <span className="flex items-center">
              <svg className="w-5 h-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              {hasVoted ? 'You voted' : 'Not voted'}
            </span>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mx-6 mt-6 bg-red-50 border-l-4 border-red-500 p-4 rounded">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {/* Options */}
        <div className="p-6">
          <div className="space-y-3">
            {poll?.options.map((option, index) => {
              const isSelected = selectedOption === index;
              const percentage = parseFloat(option.percentage) || 0;
              
              return (
                <div key={index} className="relative">
                  {/* Vote Button / Result Display */}
                  <button
                    onClick={() => handleVote(index)}
                    disabled={hasVoted || voting}
                    className={`w-full text-left px-5 py-4 rounded-lg border-2 transition-all duration-300 ${
                      hasVoted
                        ? 'cursor-default'
                        : 'cursor-pointer hover:border-primary-500 hover:shadow-md'
                    } ${
                      isSelected
                        ? 'border-primary-600 bg-primary-50'
                        : 'border-gray-300 bg-white'
                    }`}
                  >
                    <div className="relative z-10 flex items-center justify-between">
                      <div className="flex items-center space-x-3 flex-1">
                        {hasVoted ? (
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                            isSelected ? 'bg-primary-600' : 'bg-gray-300'
                          }`}>
                            {isSelected && (
                              <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            )}
                          </div>
                        ) : (
                          <div className="w-6 h-6 rounded-full border-2 border-gray-400"></div>
                        )}
                        <span className={`font-medium ${
                          isSelected ? 'text-primary-900' : 'text-gray-800'
                        }`}>
                          {option.text}
                        </span>
                      </div>
                      
                      {hasVoted && (
                        <div className="flex items-center space-x-3">
                          <span className="text-sm font-semibold text-gray-700">
                            {option.votes} votes
                          </span>
                          <span className="text-lg font-bold text-primary-600">
                            {percentage}%
                          </span>
                        </div>
                      )}
                    </div>
                    
                    {/* Progress Bar */}
                    {hasVoted && (
                      <div className="absolute inset-0 overflow-hidden rounded-lg">
                        <div
                          className={`h-full transition-all duration-500 ${
                            isSelected
                              ? 'bg-primary-200'
                              : 'bg-gray-100'
                          }`}
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                    )}
                  </button>
                </div>
              );
            })}
          </div>

          {/* Voting Instructions */}
          {!hasVoted && (
            <p className="mt-4 text-center text-gray-600 text-sm">
              Select an option to cast your vote
            </p>
          )}
        </div>

        {/* Share Section */}
        <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600">
              Share this poll with others
            </p>
            <button
              onClick={handleCopyLink}
              className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors flex items-center space-x-2"
            >
              {copied ? (
                <>
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  <span>Copy Link</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Create Another Poll Button */}
      <div className="mt-6 text-center">
        <button
          onClick={() => navigate('/')}
          className="text-primary-600 hover:text-primary-700 font-medium flex items-center justify-center mx-auto space-x-2"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          <span>Create Another Poll</span>
        </button>
      </div>

      {/* Share Modal */}
      {showShareModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
                <svg className="h-6 w-6 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Vote Recorded!</h3>
              <p className="text-gray-600 mb-6">Share this poll to get more responses</p>
              
              <button
                onClick={handleCopyLink}
                className="w-full px-4 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors mb-3"
              >
                {copied ? 'Link Copied!' : 'Copy Share Link'}
              </button>
              
              <button
                onClick={() => setShowShareModal(false)}
                className="w-full px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Poll;
