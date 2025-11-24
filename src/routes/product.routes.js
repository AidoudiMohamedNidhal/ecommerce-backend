// src/routes/product.routes.js
const express = require("express");
const router = express.Router();
const prisma = require("../prisma");

// ---------------------------
// 🔹 GET ALL PRODUCTS (recherche + filtre prix)
// ---------------------------
router.get("/", async (req, res) => {
  try {
    const { q, minPrice, maxPrice } = req.query;

    let where = {};

    // 🔍 recherche par nom + description
    if (q) {
      where = {
        ...where,
        OR: [
          { name: { contains: q, mode: "insensitive" } },
          { description: { contains: q, mode: "insensitive" } },
        ],
      };
    }

    // 💰 filtre prix
    if (minPrice || maxPrice) {
      where = {
        ...where,
        price: {},
      };

      if (minPrice) where.price.gte = Number(minPrice);
      if (maxPrice) where.price.lte = Number(maxPrice);
    }

    const products = await prisma.product.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });

    res.json(products);

  } catch (err) {
    console.error("GET /products error:", err);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

// ---------------------------
// 🔹 GET ONE PRODUCT BY ID
// ---------------------------
router.get("/:id", async (req, res) => {
  try {
    const product = await prisma.product.findUnique({
      where: { id: Number(req.params.id) },
    });

    if (!product)
      return res.status(404).json({ message: "Produit introuvable" });

    res.json(product);

  } catch (err) {
    console.error("GET /products/:id error:", err);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

// ---------------------------
// 🔹 CREATE PRODUCT
// ---------------------------
router.post("/", async (req, res) => {
  try {
    const { name, description, price, image } = req.body;

    const product = await prisma.product.create({
      data: {
        name,
        description,
        price: Number(price),
        image,
      },
    });

    res.json(product);

  } catch (err) {
    console.error("POST /products error:", err);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

// ---------------------------
// 🔹 UPDATE PRODUCT
// ---------------------------
router.put("/:id", async (req, res) => {
  try {
    const { name, description, price, image } = req.body;

    const product = await prisma.product.update({
      where: { id: Number(req.params.id) },
      data: {
        name,
        description,
        price: Number(price),
        image,
      },
    });

    res.json(product);

  } catch (err) {
    console.error("PUT /products/:id error:", err);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

// ---------------------------
// 🔹 DELETE PRODUCT
// ---------------------------
router.delete("/:id", async (req, res) => {
  try {
    await prisma.product.delete({
      where: { id: Number(req.params.id) },
    });

    res.json({ message: "Produit supprimé" });

  } catch (err) {
    console.error("DELETE /products/:id error:", err);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

module.exports = router;
