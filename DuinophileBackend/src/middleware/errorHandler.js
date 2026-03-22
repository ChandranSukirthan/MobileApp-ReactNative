const errorHandler = (err, req, res, next) => {
  console.error('Error:', err.stack);

  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map(e => e.message);
    return res.status(400).json({
      success: false,
      message: messages.join(', '),
      data: null,
    });
  }

  if (err.code === 11000) {
    return res.status(400).json({
      success: false,
      message: 'Duplicate field value entered',
      data: null,
    });
  }

  if (err.name === 'CastError') {
    return res.status(404).json({
      success: false,
      message: 'Resource not found',
      data: null,
    });
  }

  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || 'Server Error',
    data: null,
  });
};

module.exports = errorHandler;