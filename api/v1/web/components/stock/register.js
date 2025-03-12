const { globalError } = require("../../../../../errors/globalError");
const Stock = require("../../../../../model/stock/stock");

const newStockRegistration = async (req, res, next) => {
  const t = req.t;
  try {
    const {
      vendor_id,
      category_id,
      minimum_stock,
      current_stock,
      expiry_date,
      purchase_price,
    } = req.body;
    const { product_id } = req.Product;

    let stock_status = "outofstock";

    if (Number(minimum_stock) >= Number(current_stock)) {
      stock_status = "limitedstock";
    } else if (Number(current_stock) > Number(minimum_stock)) {
      stock_status = "instock";
    }
    const value = {
      vendor_id,
      category_id,
      product_id,
      current_stock,
      minimum_stock,
      stock_status,
      expiry_date,
      purchase_price,
    };

    const stock = await Stock.create(value, { transaction: t });

    if (!stock) {
      await t.rollback();
      return next(globalError(500, "Something went wrong"));
    }
    await t.commit();
    return res.status(201).json({
      success: true,
      message: "Product successfully created",
    });
  } catch (error) {
    await t.rollback();
    next(globalError(500, error.message));
  }
};

module.exports = { newStockRegistration };
