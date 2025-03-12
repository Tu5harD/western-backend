const Product = require("../../../model/product/product");
const Order = require("../../../model/order/order");
const Stock = require("../../../model/stock/stock");
const Retailer = require("../../../model/retailer/retailer");
const { Op } = require("sequelize");
const { globalError } = require("../../../errors/globalError");

const isProductArrayExists = async (req, res, next) => {
  try {
    const { product = [], retailer_id, order_id = "" } = req.body;
    const data = [];

    if (order_id) {
      let found = await Order.findOne({
        where: {
          order_id: order_id,
        },
      });

      if (!found) {
        return next(globalError(404, "Order not found"));
      }

      if (found.order_status === "confirmed") {
        return next(globalError(400, "Order already confirmed"));
      }
    }

    const retailer_type = await Retailer.findOne({
      where: {
        retailer_id: Number(retailer_id),
      },
    });

    for (let i = 0; i < product.length; i++) {
      const productResponse = await Product.findOne({
        attributes: [
          "product_id",
          "product_tax_rate",
          "product_retailer_price",
          "product_wholesaler_price",
        ],
        where: {
          product_id: product[i],
        },
      });

      if (!productResponse) {
        return next(globalError(404, `Product Not Found `));
      }

      // const stockResponse = await Stock.findOne({
      //   attributes: [
      //     "stock_id",
      //   ],
      //   where: {
      //     product_id: product[i],
      //       current_stock:{
      //         [Op.gte]: quantity[index],
      //       }
      //   },
      // });

      // if (!stockResponse) {
      //   return next(globalError(404, "One Of The Product is Out Of Stock"));
      // }

      data.push({
        id: productResponse.product_id,
        price:
          retailer_type.type === "retailer"
            ? productResponse.product_retailer_price
            : productResponse.product_wholesaler_price,
        discount: productResponse.product_discount,
        discount_type: productResponse.product_purchase_price,
        gst: productResponse.product_tax_rate,
      });
    }

    req.productList = data;
    return next();
  } catch (error) {
    return next(globalError(500, error.message));
  }
};

module.exports = { isProductArrayExists };
