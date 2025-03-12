const { globalError } = require("../../../../../errors/globalError");
const Stock = require("../../../../../model/stock/stock");

const deleteStockByStockId = async (req, res, next) => {
  try {
    const { stock_id } = req.body;
    const value = {
      stock_deleted: true,
    };
    const deletedStock = await Stock.update(value, {
      where: {
        stock_id,
      },
    });
    if (deletedStock[0] === 0) {
      return next(globalError(404, "Stock not deleted"));
    }
    return res
      .status(200)
      .json({ success: true, message: "Stock successfully deleted" });
  } catch (error) {
    return next(globalError(500, error.message));
  }
};

module.exports = { deleteStockByStockId };
