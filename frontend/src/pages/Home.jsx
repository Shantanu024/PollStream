import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { pollApi } from '../services/api';

const Home = () => {
  const navigate = useNavigate();
  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState(['', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const [displayedText, setDisplayedText] = useState('');
  const [charIndex, setCharIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  const placeholders = [
    'What\'s your favorite programming language ?',
    'Where should we go for vacation ?',
    'Why did the chicken cross the road ?',
    'Who is the president of Latveria ?',
    'How do you like your coffee ?',
    'What\'s your favorite color ?',
  ];

  useEffect(() => {
    const currentPlaceholder = placeholders[placeholderIndex];
    const speed = 50; // Speed of typing (milliseconds per letter)

    const timer = setTimeout(() => {
      if (!isDeleting) {
        // Typing phase - add letters one by one
        if (charIndex <= currentPlaceholder.length) {
          setDisplayedText(currentPlaceholder.substring(0, charIndex));
          setCharIndex(charIndex + 1);
        } else {
          // Finished typing, wait then start deleting
          setTimeout(() => setIsDeleting(true), 1500);
        }
      } else {
        // Deleting phase - remove letters one by one
        if (charIndex > 0) {
          setDisplayedText(currentPlaceholder.substring(0, charIndex - 1));
          setCharIndex(charIndex - 1);
        } else {
          // Finished deleting, move to next placeholder
          setIsDeleting(false);
          setPlaceholderIndex((prev) => (prev + 1) % placeholders.length);
        }
      }
    }, speed);

    return () => clearTimeout(timer);
  }, [charIndex, isDeleting, placeholderIndex, placeholders]);

  const [showInfo, setShowInfo] = useState(false);

  const handleAddOption = () => {
    if (options.length < 10) {
      setOptions([...options, '']);
    }
  };

  const handleRemoveOption = (index) => {
    if (options.length > 2) {
      setOptions(options.filter((_, i) => i !== index));
    }
  };

  const handleOptionChange = (index, value) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!question.trim()) {
      setError('Please enter a question');
      return;
    }

    const filteredOptions = options.filter(opt => opt.trim() !== '');
    
    if (filteredOptions.length < 2) {
      setError('Please provide at least 2 options');
      return;
    }

    try {
      setLoading(true);
      const response = await pollApi.createPoll(question.trim(), filteredOptions);
      
      if (response.success) {
        // Navigate to the poll page
        navigate(`/poll/${response.pollId}`);
      }
    } catch (err) {
      console.error('Create poll error:', err);
      setError(err.response?.data?.error || 'Failed to create poll. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl relative">
      <div className="bg-white rounded-xl shadow-xl p-8">
        {/* Info Icon Button - Top Right */}
        <div
          className="absolute top-4 left-4"
          onMouseEnter={() => setShowInfo(true)}
          onMouseLeave={() => setShowInfo(false)}
        >
          <button
            className="w-8 h-8 bg-primary-600 text-white rounded-full flex items-center justify-center hover:bg-primary-700 transition-colors"
            title="How it works"
          >
            <svg
              className="w-5 h-5"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                clipRule="evenodd"
              />
            </svg>
          </button>

          {/* Dropdown Info Box */}
          {showInfo && (
            <div className="absolute top-full right-0 mt-2 w-64 bg-primary-50 border border-primary-200 rounded-lg p-4 shadow-lg z-10 animate-fadeIn">
              <h3 className="font-semibold text-black mb-2">How it works:</h3>
              <ul className="text-sm text-black space-y-1">
                <li>• Create your poll with a question and options</li>
                <li>• Share the link with anyone</li>
                <li>• Watch results update in real-time</li>
                <li>• No sign-up required!</li>
              </ul>
            </div>
          )}
        </div>
        {/* Header */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-2">Create a Poll</h2>
          <p className="text-gray-600">provide questions and options</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded">
            <div className="flex items-start">
              <svg className="w-5 h-5 text-red-500 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <p className="ml-3 text-black">{error}</p>
            </div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit}>
          {/* Question Input */}
          <div className="mb-6">
            <label htmlFor="question" className="block text-sm font-semibold text-gray-700 mb-2">
              Your Question
            </label>
            <input
              type="text"
              id="question"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder={displayedText}
              maxLength={200}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
              disabled={loading}
            />
            <p className="mt-1 text-xs text-gray-500">{question.length}/200 characters</p>
          </div>

          {/* Options */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Options (minimum 2, maximum 10)
            </label>
            <div className="space-y-3">
              {options.map((option, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={option}
                    onChange={(e) => handleOptionChange(index, e.target.value)}
                    placeholder={`Option ${index + 1}`}
                    maxLength={100}
                    className="flex-1 px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                    disabled={loading}
                  />
                  {options.length > 2 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveOption(index)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      disabled={loading}
                    >
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  )}
                </div>
              ))}
            </div>

            {/* Add Option Button */}
            {options.length < 10 && (
              <button
                type="button"
                onClick={handleAddOption}
                className="mt-3 px-4 py-2 text-primary-600 border-2 border-primary-300 rounded-lg hover:bg-primary-50 transition-colors flex items-center space-x-2"
                disabled={loading}
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                <span>Add Option</span>
              </button>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-primary-600 to-primary-700 text-white py-3 px-6 rounded-lg font-semibold hover:from-primary-700 hover:to-primary-800 transition-all transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-lg"
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Creating Poll...
              </span>
            ) : (
              'Create Poll'
            )}
          </button>
        </form>

      </div>
    </div>
  );
};

export default Home;
