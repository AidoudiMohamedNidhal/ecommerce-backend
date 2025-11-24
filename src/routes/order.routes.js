// src/routes/order.routes.js
const express = require('express');
const prisma = require('../prisma');

const router = express.Router();

/**
 * POST /orders
 * body: { items: [ { productId: number, quantity: number }, ... ] }
 * nécessite auth (req.user.id موجود)
 */
router.post('/', async (req, res) => {
  try {
    const userId = req.user.id;
    const { items } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: 'Liste des items invalide' });
    }

    // Vérifier que tous les produits existent
    const productIds = items.map((i) => i.productId);
    const products = await prisma.product.findMany({
      where: { id: { in: productIds } }
    });

    if (products.length !== items.length) {
      return res
        .status(400)
        .json({ message: "Un ou plusieurs produits n'existent pas" });
    }

    // Calcul du total
    let total = 0;
    for (const item of items) {
      const prod = products.find((p) => p.id === item.productId);
      total += prod.price * item.quantity;
    }

    // Transaction: créer Order + OrderItems
    const order = await prisma.$transaction(async (tx) => {
      const createdOrder = await tx.order.create({
        data: {
          userId,
          total,
          items: {
            create: items.map((item) => ({
              productId: item.productId,
              quantity: item.quantity
            }))
          }
        },
        include: {
          items: {
            include: { product: true }
          }
        }
      });

      return createdOrder;
    });

    res.status(201).json(order);
  } catch (err) {
    console.error('POST /orders error:', err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

/**
 * GET /orders/my
 * commandes de l’utilisateur connecté
 */
router.get('/my', async (req, res) => {
  try {
    const userId = req.user.id;

    const orders = await prisma.order.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: {
        items: {
          include: { product: true }
        }
      }
    });

    res.json(orders);
  } catch (err) {
    console.error('GET /orders/my error:', err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

module.exports = router;
