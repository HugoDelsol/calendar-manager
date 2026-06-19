const jwt = require('jsonwebtoken');

// Si un token est présent, décode-le et attache entrepriseId.
// Si absent, continue sans bloquer (route publique).
function authOptionnel(req, res, next) {
    const authHeader = req.headers['authorization'];

    if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.split(' ')[1];
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.entrepriseIdConnectee = decoded.entrepriseId;
        } catch (err) {
            // Token invalide, on ignore simplement (route reste publique)
        }
    }

    next();
}

module.exports = authOptionnel;