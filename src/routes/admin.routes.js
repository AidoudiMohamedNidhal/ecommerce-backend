// src/routes/admin.routes.js
const express = require('express');
const prisma = require('../prisma');

const router = express.Router();

/**
 * GET /admin/users
 * liste des utilisateurs (ADMIN seulement)
 */
router.get('/users', async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json(users);
  } catch (err) {
    console.error('GET /admin/users error:', err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

/**
 * PATCH /admin/users/:id/role
 * body: { role: 'ADMIN' | 'USER' }
 */
router.patch('/users/:id/role', async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { role } = req.body;

    if (!['ADMIN', 'USER'].includes(role)) {
      return res.status(400).json({ message: 'Role invalide' });
    }

    const updated = await prisma.user.update({
      where: { id },
      data: { role },
      select: { id: true, email: true, role: true }
    });

    res.json(updated);
  } catch (err) {
    console.error('PATCH /admin/users/:id/role error:', err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

/**
 * GET /admin/orders
 * toutes les commandes avec user + items
 */
router.get('/orders', async (req, res) => {
  try {
    const orders = await prisma.order.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { id: true, email: true } },
        items: {
          include: { product: true }
        }
      }
    });

    res.json(orders);
  } catch (err) {
    console.error('GET /admin/orders error:', err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

/**
 * GET /admin/stats
 * statistiques simples: ventes, nb commandes, nb users, nb produits
 */
router.get('/stats', async (req, res) => {
  try {
    const [orderAgg, usersCount, productsCount] = await Promise.all([
      prisma.order.aggregate({
        _sum: { total: true },
        _count: true
      }),
      prisma.user.count(),
      prisma.product.count()
    ]);

    res.json({
      totalSales: orderAgg._sum.total || 0,
      totalOrders: orderAgg._count,
      totalUsers: usersCount,
      totalProducts: productsCount
    });
  } catch (err) {
    console.error('GET /admin/stats error:', err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

module.exports = router;
