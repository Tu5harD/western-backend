const { Op, Sequelize } = require("sequelize");
const Stock = require("../../../../../model/stock/stock");
const Product = require("../../../../../model/product/product");
// const { emitEvent } = require("../../../../../socket/events/emit");
const { globalError } = require("../../../../../errors/globalError");
const {
  sendPushNotificationToAdmin,
} = require("../../../../../Notifications/notification");

const updateStockWhenAndroidOrderRegister = async (req, res, next) => {
  try {
    const { quantity = [] } = req.body;

    for (let i = 0; i < req?.productList.length; i++) {
      const stockId = req.productList[i].stock_id;
      const stock = quantity[i];
      const available = req.productList[i].current_stock;
      let status = "";

      const availableStock = available - Number(stock);

      if (availableStock < 1) {
        status = "outofstock";
      } else if (availableStock < req.productList[i].minimum_stock) {
        status = "limitedstock";
      } else {
        status = "instock";
      }

      await Stock.update(
        { stock_status: status },
        { where: { stock_id: stockId } }
      );

      await Product.update(
        { product_current_stock: availableStock },
        { where: { product_id: req.productList[i].id } }
      );
    }

    await sendPushNotificationToAdmin(
      "New Order",
      `New Order Placed By ${req?.authData?.authority[0]} ${
        req?.authData?.user[req?.authData?.authority[0] + "_name"]
      }`
    );

    res.status(201).json({
      success: true,
      message: "Order successfully placed",
      data: { ...req.orders },
    });
  } catch (error) {
    return next(globalError(500, error.message));
  }
};

module.exports = {
  updateStockWhenAndroidOrderRegister,
};
