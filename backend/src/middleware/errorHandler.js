export const errorHandler = (err, req, res, next) => {
  console.error(`Error: ${err.message}`);

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map((val) => val.message);
    return res.status(400).json({
      error: message,
    });
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    return res.status(400).json({
      error: 'Duplicate value entered',
    });
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      error: 'Invalid token',
    });
  }

  // Send generic error in production or full error in development
  res.status(err.statusCode || 500).json({
    error: err.message || 'Server Error',
  });
};
