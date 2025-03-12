const Product = require("../../../../model/product/product");
const Stock = require("../../../../model/stock/stock");
const Retailer = require("../../../../model/retailer/retailer");
const { Op } = require("sequelize");
const { globalError } = require("../../../../errors/globalError");

const isAndroidProductArrayExists = async (req, res, next) => {
  try {
    const { product = [], quantity = [], retailer_id } = req.body;
    const data = [];

    const retailer_type = await Retailer.findOne({
      where: {
        retailer_id: Number(retailer_id),
      },
    });

    for (let i = 0; i < product.length; i++) {
      const productResponse = await Product.findOne({
        attributes: [
          "product_id",
          "product_current_stock",
          "product_minimum_stock",
          "product_tax_rate",
        ],
        where: {
          product_id: product[i],
          product_current_stock: {
            [Op.gte]: quantity[i],
          },
        },
      });

      if (!productResponse) {
        return next(globalError(404, "Product out of stock"));
      }

      const stockResponse = await Stock.findOne({
        attributes: [
          "stock_id",
          "stock_wholesaler_price",
          "stock_retailer_price",
          "stock_purchase_price",
          "stock_discount_type",
          "stock_discount",
        ],
        where: {
          product_id: product[i],
        },
      });

      if (!stockResponse) {
        return next(globalError(404, "Stock not found for the product"));
      }
      // price:
      // stockResponse.stock_discount_type === "percentage"
      //   ? stockResponse.stock_sale_price *
      //       (stockResponse.stock_discount / 100) -
      //     stockResponse.stock_sale_price
      //   : stockResponse.stock_sale_price - stockResponse.stock_discount,

      data.push({
        id: productResponse.product_id,
        current_stock: productResponse.product_current_stock,
        stock_id: stockResponse.stock_id,
        price:
          retailer_type.type === "retailer"
            ? stockResponse.stock_retailer_price
            : stockResponse.stock_wholesaler_price,
        discount: stockResponse.stock_discount,
        discount_type: stockResponse.stock_discount_type,
        minimum_stock: productResponse.product_minimum_stock,
        gst: productResponse.product_tax_rate,
      });
    }

    req.productList = data;
    return next();
  } catch (error) {
    return next(globalError(500, error.message));
  }
};

module.exports = { isAndroidProductArrayExists };
