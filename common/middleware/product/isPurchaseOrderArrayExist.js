const Product = require("../../../model/product/product");
const Stock = require("../../../model/stock/stock");
const PurchaseOrder = require("../../../model/order/purchaseOrder");
const { Op } = require("sequelize");
const { globalError } = require("../../../errors/globalError");

const isPurchaseOrderProductArrayExists = async (req, res, next) => {
  try {
    const { product = [], purchase_order_id } = req.body;
    const data = [];

    if (purchase_order_id) {
      let found = await PurchaseOrder.findOne({
        where: {
          purchase_order_id: purchase_order_id,
        },
      });
      if (!found) {
        return next(globalError(404, "Purchase Order not found"));
      }

      if (found.status === "confirmed") {
        return next(globalError(400, "Purchase Order already confirmed"));
      }
    }

    for (let i = 0; i < product.length; i++) {
      const productResponse = await Product.findOne({
        attributes: ["product_id", "product_tax_rate"],
        where: {
          product_id: product[i],
        },
      });

      if (!productResponse) {
        return next(globalError(404, "Product not found"));
      }

      const stockResponse = await Stock.findOne({
        attributes: ["stock_id", "current_stock", "minimum_stock"],
        where: {
          product_id: product[i],
        },
      });

      if (!stockResponse) {
        return next(globalError(404, "Stock not found for the product"));
      }

      data.push({
        id: productResponse.product_id,
        current_stock: stockResponse.current_stock,
        stock_id: stockResponse.stock_id,
        minimum_stock: stockResponse.minimum_stock,
        gst: productResponse.product_tax_rate,
      });
    }

    req.productList = data;
    return next();
  } catch (error) {
    return next(globalError(500, error.message));
  }
};

module.exports = { isPurchaseOrderProductArrayExists };
