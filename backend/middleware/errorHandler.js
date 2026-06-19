function errorHandler(err, req, res, next) {
    // Log complet visible uniquement côté serveur (terminal)
    console.error(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}:`, err);

    // Message générique envoyé au client, jamais err.message
    res.status(500).json({ error: 'Une erreur est survenue, veuillez réessayer' });
}

module.exports = errorHandler;