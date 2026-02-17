import FingerprintJS from '@fingerprintjs/fingerprintjs';

let fingerprint = null;

/**
 * Initialize and get browser fingerprint
 * This creates a unique identifier for the browser/device
 */
export const getFingerprint = async () => {
  if (fingerprint) {
    return fingerprint;
  }

  try {
    // Load the agent
    const fp = await FingerprintJS.load();
    
    // Get the visitor identifier
    const result = await fp.get();
    
    fingerprint = result.visitorId;
    
    // Store in localStorage as backup
    localStorage.setItem('poll_fingerprint', fingerprint);
    
    return fingerprint;
  } catch (error) {
    console.error('Fingerprint generation error:', error);
    
    // Fallback to localStorage if available
    const stored = localStorage.getItem('poll_fingerprint');
    if (stored) {
      fingerprint = stored;
      return fingerprint;
    }
    
    // Last resort: generate random ID
    fingerprint = 'fallback_' + Math.random().toString(36).substring(2) + Date.now().toString(36);
    localStorage.setItem('poll_fingerprint', fingerprint);
    return fingerprint;
  }
};

/**
 * Clear stored fingerprint (for testing purposes)
 */
export const clearFingerprint = () => {
  fingerprint = null;
  localStorage.removeItem('poll_fingerprint');
};
