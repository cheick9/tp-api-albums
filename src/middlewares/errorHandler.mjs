export default function errorHandler(err, req, res, next) {
  console.error('❌ [ERROR HANDLER]', err.message);

  if (res.headersSent) {
    next(err);
    return;
  }

  res.status(err.status || 500).json({
    message: err.message || 'Erreur interne du serveur'
  });
}
