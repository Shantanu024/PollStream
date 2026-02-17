/**
 * Extract client IP address from request
 * Handles proxy headers for deployment environments
 */
const getClientIp = (req) => {
  // Check various headers that might contain the real IP
  const forwarded = req.headers['x-forwarded-for'];
  if (forwarded) {
    // x-forwarded-for can contain multiple IPs, take the first one
    return forwarded.split(',')[0].trim();
  }
  
  const realIp = req.headers['x-real-ip'];
  if (realIp) {
    return realIp;
  }
  
  // Fallback to socket IP
  return req.socket.remoteAddress || req.connection.remoteAddress;
};

module.exports = { getClientIp };
