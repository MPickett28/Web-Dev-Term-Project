const db = require("../config/database");

const getAllProducts = async (req, res) => {
  try {
    const { search, category, featured } = req.query;

    let sql = `
      SELECT
        p.product_id,
        p.product_name,
        p.description,
        p.price,
        p.inventory_quantity,
        p.image_url,
        p.is_featured,
        p.is_active,
        p.category_id,
        c.category_name
      FROM products p
      JOIN categories c
        ON p.category_id = c.category_id
      WHERE p.is_active = 1
    `;

    const values = [];

    if (search) {
      sql += `
        AND (
          p.product_name LIKE ?
          OR p.description LIKE ?
        )
      `;

      values.push(`%${search}%`, `%${search}%`);
    }

    if (category) {
      sql += ` AND c.category_name = ?`;
      values.push(category);
    }

    if (featured === "true") {
      sql += ` AND p.is_featured = 1`;
    }

    sql += ` ORDER BY p.product_id`;

    const [products] = await db.execute(sql, values);

    res.status(200).json(products);
  } catch (error) {
    console.error("Error retrieving products:", error);

    res.status(500).json({
      message: "Unable to retrieve products."
    });
  }
};

module.exports = {
  getAllProducts
};