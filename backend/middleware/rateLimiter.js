const rateLimit = require('express-rate-limit');

// Limite globale : 100 requêtes par 15 minutes par IP
const limiterGlobal = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: { error: 'Trop de requêtes, réessayez dans 15 minutes' },
    standardHeaders: true,
    legacyHeaders: false
});

// Limite stricte pour l'auth : 5 tentatives par 15 minutes
const limiterAuth = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5,
    message: { error: 'Trop de tentatives de connexion, réessayez dans 15 minutes' },
    standardHeaders: true,
    legacyHeaders: false
});

module.exports = { limiterGlobal, limiterAuth };