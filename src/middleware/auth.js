const jwt = require('jsonwebtoken');
require('dotenv').config();

// لازم يكون connecté
function auth(req, res, next) {
  try {
    const authHeader = req.headers['authorization'] || req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Token manquant (Authorization: Bearer ...)' });
    }

    const token = authHeader.split(' ')[1];
    const payload = jwt.verify(token, process.env.JWT_SECRET);

    req.user = {
      id: payload.id,
      role: payload.role
    };

    next();
  } catch (err) {
    console.error('auth middleware error:', err);
    return res.status(401).json({ message: 'Token invalide ou expiré' });
  }
}

// لازم يكون ADMIN
function isAdmin(req, res, next) {
  if (!req.user || req.user.role !== 'ADMIN') {
    return res.status(403).json({ message: 'Accès refusé: admin seulement' });
  }
  next();
}

module.exports = { auth, isAdmin };
