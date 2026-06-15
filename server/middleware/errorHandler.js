function errorHandler(err, req, res, next) {
  console.error("[ERROR]", err.message, err.stack);
  const status = err.status || 500;
  const isProd = process.env.NODE_ENV === "production";
  // In production, only expose messages from explicitly thrown app errors (status < 500).
  // Raw DB errors (constraint violations, schema details) become a generic message.
  const message = isProd && status >= 500
    ? "Internal server error"
    : err.message || "Internal server error";
  res.status(status).json({
    error: message,
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
}

module.exports = errorHandler;
