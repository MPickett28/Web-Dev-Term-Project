const pool = require("../config/database");

function createHttpError(status, message) {
  const error = new Error(message);
  error.status = status;
  return error;
}

function requiredText(value) {
  return typeof value === "string" ? value.trim() : "";
}

function validateOrderBody(body) {
  const shipping = body?.shipping;
  const items = body?.items;

  if (!shipping || typeof shipping !== "object" || Array.isArray(shipping)) {
    throw createHttpError(400, "Complete shipping information is required.");
  }

  const shippingData = {
    name: requiredText(shipping.name),
    address: requiredText(shipping.address),
    city: requiredText(shipping.city),
    region: requiredText(shipping.region),
    postalCode: requiredText(shipping.postalCode),
    country: requiredText(shipping.country)
  };

  const missingShippingFields = Object.entries(shippingData)
    .filter(([, value]) => !value)
    .map(([field]) => field);

  if (missingShippingFields.length > 0) {
    throw createHttpError(
      400,
      `Missing shipping fields: ${missingShippingFields.join(", ")}.`
    );
  }

  const maximumLengths = {
    name: 100,
    address: 150,
    city: 75,
    region: 75,
    postalCode: 20,
    country: 75
  };

  for (const [field, maximumLength] of Object.entries(maximumLengths)) {
    if (shippingData[field].length > maximumLength) {
      throw createHttpError(
        400,
        `Shipping ${field} must be ${maximumLength} characters or fewer.`
      );
    }
  }

  if (!Array.isArray(items) || items.length === 0) {
    throw createHttpError(400, "The cart must contain at least one item.");
  }

  const quantitiesByProduct = new Map();

  for (const item of items) {
    const productId = Number(item?.productId);
    const quantity = Number(item?.quantity);

    if (!Number.isInteger(productId) || productId <= 0) {
      throw createHttpError(400, "Every item must have a valid productId.");
    }

    if (!Number.isInteger(quantity) || quantity <= 0) {
      throw createHttpError(400, "Every item quantity must be a positive integer.");
    }

    const combinedQuantity = (quantitiesByProduct.get(productId) || 0) + quantity;

    if (!Number.isSafeInteger(combinedQuantity)) {
      throw createHttpError(400, "An item quantity is too large.");
    }

    quantitiesByProduct.set(productId, combinedQuantity);
  }

  return {
    shipping: shippingData,
    items: Array.from(quantitiesByProduct, ([productId, quantity]) => ({
      productId,
      quantity
    }))
  };
}

function formatOrderSummary(order) {
  return {
    orderId: order.order_id,
    totalAmount: Number(order.total_amount),
    status: order.status,
    createdAt: order.created_at,
    itemCount: Number(order.item_count)
  };
}

async function createOrder(req, res, next) {
  let connection;
  let transactionStarted = false;

  try {
    const orderData = validateOrderBody(req.body);
    connection = await pool.getConnection();
    await connection.beginTransaction();
    transactionStarted = true;

    const productIds = orderData.items.map((item) => item.productId);
    const placeholders = productIds.map(() => "?").join(", ");
    const [products] = await connection.query(
      `SELECT product_id, product_name, price, inventory_quantity, is_active
       FROM products
       WHERE product_id IN (${placeholders})
       FOR UPDATE`,
      productIds
    );

    if (products.length !== productIds.length) {
      throw createHttpError(404, "One or more products do not exist.");
    }

    const productsById = new Map(
      products.map((product) => [product.product_id, product])
    );
    let totalCents = 0;

    const orderItems = orderData.items.map((item) => {
      const product = productsById.get(item.productId);

      if (!product || !product.is_active) {
        throw createHttpError(404, "One or more products do not exist.");
      }

      if (item.quantity > product.inventory_quantity) {
        throw createHttpError(
          409,
          `Insufficient inventory for ${product.product_name}.`
        );
      }

      const unitPriceCents = Math.round(Number(product.price) * 100);
      const lineTotalCents = unitPriceCents * item.quantity;

      if (!Number.isSafeInteger(lineTotalCents)) {
        throw createHttpError(400, "The requested order quantity is too large.");
      }

      totalCents += lineTotalCents;

      if (!Number.isSafeInteger(totalCents)) {
        throw createHttpError(400, "The order total is too large.");
      }

      return {
        productId: product.product_id,
        productName: product.product_name,
        unitPrice: unitPriceCents / 100,
        quantity: item.quantity,
        lineTotal: lineTotalCents / 100
      };
    });

    const totalAmount = totalCents / 100;
    const [orderResult] = await connection.execute(
      `INSERT INTO orders (
         user_id,
         total_amount,
         shipping_name,
         shipping_address,
         shipping_city,
         shipping_region,
         shipping_postal_code,
         shipping_country
       ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        req.user.id,
        totalAmount,
        orderData.shipping.name,
        orderData.shipping.address,
        orderData.shipping.city,
        orderData.shipping.region,
        orderData.shipping.postalCode,
        orderData.shipping.country
      ]
    );

    for (const item of orderItems) {
      await connection.execute(
        `INSERT INTO order_items (
           order_id,
           product_id,
           product_name,
           unit_price,
           quantity,
           line_total
         ) VALUES (?, ?, ?, ?, ?, ?)`,
        [
          orderResult.insertId,
          item.productId,
          item.productName,
          item.unitPrice,
          item.quantity,
          item.lineTotal
        ]
      );

      const [inventoryResult] = await connection.execute(
        `UPDATE products
         SET inventory_quantity = inventory_quantity - ?
         WHERE product_id = ?
           AND inventory_quantity >= ?`,
        [item.quantity, item.productId, item.quantity]
      );

      if (inventoryResult.affectedRows !== 1) {
        throw createHttpError(
          409,
          `Insufficient inventory for ${item.productName}.`
        );
      }
    }

    await connection.commit();
    transactionStarted = false;

    res.status(201).json({
      message: "Order created successfully.",
      order: {
        orderId: orderResult.insertId,
        totalAmount,
        status: "Processing",
        items: orderItems
      }
    });
  } catch (error) {
    if (connection && transactionStarted) {
      try {
        await connection.rollback();
      } catch (rollbackError) {
        console.error("Order rollback failed:", rollbackError);
      }
    }

    next(error);
  } finally {
    if (connection) {
      connection.release();
    }
  }
}

async function getOrders(req, res, next) {
  try {
    const [orders] = await pool.execute(
      `SELECT
         o.order_id,
         o.total_amount,
         o.status,
         o.created_at,
         COALESCE(SUM(oi.quantity), 0) AS item_count
       FROM orders AS o
       LEFT JOIN order_items AS oi
         ON oi.order_id = o.order_id
       WHERE o.user_id = ?
       GROUP BY o.order_id, o.total_amount, o.status, o.created_at
       ORDER BY o.created_at DESC, o.order_id DESC`,
      [req.user.id]
    );

    res.status(200).json({
      orders: orders.map(formatOrderSummary)
    });
  } catch (error) {
    next(error);
  }
}

async function getOrderById(req, res, next) {
  try {
    const orderId = Number(req.params.id);

    if (!Number.isInteger(orderId) || orderId <= 0) {
      throw createHttpError(400, "Order ID must be a positive integer.");
    }

    const [orders] = await pool.execute(
      `SELECT
         order_id,
         total_amount,
         status,
         shipping_name,
         shipping_address,
         shipping_city,
         shipping_region,
         shipping_postal_code,
         shipping_country,
         created_at,
         updated_at
       FROM orders
       WHERE order_id = ? AND user_id = ?
       LIMIT 1`,
      [orderId, req.user.id]
    );

    const order = orders[0];

    if (!order) {
      throw createHttpError(404, "Order not found.");
    }

    const [items] = await pool.execute(
      `SELECT
         order_item_id,
         product_id,
         product_name,
         unit_price,
         quantity,
         line_total
       FROM order_items
       WHERE order_id = ?
       ORDER BY order_item_id ASC`,
      [orderId]
    );

    res.status(200).json({
      order: {
        orderId: order.order_id,
        totalAmount: Number(order.total_amount),
        status: order.status,
        createdAt: order.created_at,
        updatedAt: order.updated_at,
        shipping: {
          name: order.shipping_name,
          address: order.shipping_address,
          city: order.shipping_city,
          region: order.shipping_region,
          postalCode: order.shipping_postal_code,
          country: order.shipping_country
        },
        items: items.map((item) => ({
          orderItemId: item.order_item_id,
          productId: item.product_id,
          productName: item.product_name,
          unitPrice: Number(item.unit_price),
          quantity: item.quantity,
          lineTotal: Number(item.line_total)
        }))
      }
    });
  } catch (error) {
    next(error);
  }
}

module.exports = { createOrder, getOrders, getOrderById };
