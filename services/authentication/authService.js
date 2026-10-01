const jwt = require('jsonwebtoken');

/**
 * Generate access token
 */
module.exports.generateAccessToken = (payload) => {
  return jwt.sign(
    payload,
    process.env.JWT_SECRET,
    {
      expiresIn: '1d'
    }
  );
};


/**
 * Validate access token
 */
module.exports.validateAccessToken = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({
        success: false,
        message: 'Access token is required'
      });
    }

    const token = authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Invalid access token'
      });
    }

    const decodedToken = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    req.user = decodedToken;

    next();
  } catch (error) {
    console.log(
      '*************** Error while validating access token ***************',
      error
    );

    return res.status(401).json({
      success: false,
      message: 'Invalid or expired access token'
    });
  }
};


/**
 * Validate admin access
 */
module.exports.validateAdminAccess = (req, res, next) => {
  try {
    if (!req.user || req.user.role !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        message: 'Admin access required'
      });
    }

    next();
  } catch (error) {
    console.log(
      '*************** Error while validating admin access ***************',
      error
    );

    return res.status(403).json({
      success: false,
      message: 'Access denied'
    });
  }
};