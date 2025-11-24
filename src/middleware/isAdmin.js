function isAdmin(req, res, next) {
  if (!req.user || req.user.role !== 'ADMIN') {
    return res.status(403).json({ message: 'Accès refusé: admin seulement' });
  }
  next();
}

module.exports = isAdmin;
