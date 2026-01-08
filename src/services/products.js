// routes/products.js

// ... (kode sebelumnya sama)

// GET ALL PRODUCTS
router.get("/", async (req, res) => {
  // ... kode yang sudah ada ...
});

// ✅ TAMBAHKAN INI - GET SINGLE PRODUCT
router.get("/:id", async (req, res) => {
  try {
    const productId = req.params.id;
    console.log("🔍 GET /api/products/:id - Requested ID:", productId);
    
    // Ambil data produk
    const [products] = await pool.query(`
      SELECT p.*, c.name AS category_name
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.id = ?
    `, [productId]);

    if (!products || products.length === 0) {
      console.log("❌ Product not found:", productId);
      return res.status(404).json({ error: "Product not found" });
    }

    const product = products[0];

    // Ambil images untuk produk ini
    try {
      const [imgs] = await pool.query("SELECT * FROM product_images WHERE product_id = ?", [productId]);

      const mapped = (imgs || []).map((im) => {
        const imgObj = { ...im };
        const isPrimary = imgObj.is_primary == 1 || imgObj.is_primary === true || imgObj.primary == 1;
        const urlCandidate =
          imgObj.image_url ||
          imgObj.url ||
          imgObj.path ||
          imgObj.image ||
          imgObj.file ||
          (imgObj.filename ? `/uploads/${imgObj.filename}` : null) ||
          null;

        return {
          id: imgObj.id,
          image_url: urlCandidate,
          is_primary: isPrimary,
        };
      });

      product.images = mapped;
    } catch (imgErr) {
      console.error("Failed to read product_images:", imgErr);
      product.images = [];
    }

    console.log("✅ Product found:", product.nama);
    res.json(product);
  } catch (err) {
    console.error("GET /api/products/:id error:", err);
    res.status(500).json({ error: "server error" });
  }
});

// POST, PUT, DELETE routes tetap sama di bawah...