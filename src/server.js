// src/server.js
const express = require('express');
const cors = require('cors');
require('dotenv').config();

// Middleware
const { auth, isAdmin } = require('./middleware/auth');

// Routes
const authRoutes = require('./routes/auth.routes');
const productRoutes = require('./routes/product.routes');
const orderRoutes = require('./routes/order.routes');
const adminRoutes = require('./routes/admin.routes');

const app = express();

// Middlewares globaux
app.use(cors());
app.use(express.json());

// Servir le frontend (public/index.html, etc.)
app.use(express.static('public'));

// ---------- Public API ----------
app.use('/auth', authRoutes);
app.use('/products', productRoutes);

// ---------- User protégés ----------
app.use('/orders', auth, orderRoutes);

// ---------- Admin protégés ----------
app.use('/admin', auth, isAdmin, adminRoutes);

// 404 handler API (si aucune route ne matche après ce point)
app.use((req, res) => {
  res.status(404).json({ message: 'Route non trouvée' });
});

// Démarrage serveur
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log('Serveur démarré sur le port ' + port);
});
