module.exports = (err, req, res, next) => {

  err.statusCode = err.statusCode || 500;
  err.message = err.message || 'Internal Server Error';
  
  console.error('Error Handler:', {
    statusCode: err.statusCode,
    message: err.message,
    path: req.path,
    method: req.method,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
  
  //MongoDB Duplicate Key Error
  if (err.code === 11000) {
    err.statusCode = 400;
    const field = Object.keys(err.keyValue)[0];
    err.message = `${field} already exists`;
  }
  
  //MongoDB Validation Error
  if (err.name === 'ValidationError') {
    err.statusCode = 400;
    const errors = Object.values(err.errors).map(e => e.message);
    err.message = `Validation Error: ${errors.join(', ')}`;
  }
  
  //JWT Errors
  if (err.name === 'JsonWebTokenError') {
    err.statusCode = 401;
    err.message = 'Invalid token. Please authenticate.';
  }
  
  if (err.name === 'TokenExpiredError') {
    err.statusCode = 401;
    err.message = 'Token expired. Please login again.';
  }
  
  //Cast Error (wrong ObjectId)
  if (err.name === 'CastError') {
    err.statusCode = 400;
    err.message = `Invalid ${err.path}: ${err.value}`;
  }
  
  res.status(err.statusCode).json({
    success: false,
    error: err.message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};