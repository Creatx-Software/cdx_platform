const requireAdmin = (req, res, next) => {
  // This middleware should be used AFTER authenticate middleware
  if (req.userRole !== 'ADMIN') {
    return res.status(403).json({
      success: false,
      error: 'Access denied. Admin privileges required.'
    });
  }
  
  next();
};

module.exports = requireAdmin;