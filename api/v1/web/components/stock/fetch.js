const { Op } = require("sequelize");
const Stock = require("../../../../../model/stock/stock");
const Product = require("../../../../../model/product/product");
const Vendor = require("../../../../../model/vendor/vendor");
const Category = require("../../../../../model/category/category");
const { globalError } = require("../../../../../errors/globalError");
const { sequelize } = require("../../../../../config/database");

const getAllStock = async (req, res, next) => {
  try {
    const { pageIndex = 1, pageSize = 10, query = "", status = "" } = req.query;
    //  ${status ? `AND s.stock_status = :status` : ""}
    const limit = +pageSize;
    const offset = (+pageIndex - 1) * +pageSize;

    // Define SQL query
    const sqlQuery = `
      SELECT *
      FROM 
          view_stock 
      WHERE
              product_name LIKE :query OR :query = ''
      LIMIT :limit OFFSET :offset;
    `;

    // Execute SQL query with Sequelize
    const stockBatches = await sequelize.query(sqlQuery, {
      replacements: {
        query: `%${query}%`,
        limit,
        offset,
      },
    });

    if (stockBatches[0].length === 0) {
      return res.status(200).json({
        success: true,
        total: 0,
        data: [],
        message: "Stock not Created",
      });
    }

    const data = stockBatches[0].map((batch) => {
      let {
        product_id,
        current_stock,
        loose_quantity,
        product_conversion_rate,
        product_name,
        product_base_unit,
        product_secondary_unit,
        category_name,
      } = batch;
      let looseQuantity = parseFloat(loose_quantity);
      const conversion_rate = parseFloat(product_conversion_rate);

      let Loose_In_Base_Unit = Math.floor(looseQuantity / conversion_rate);
      let remainingLoose = looseQuantity % conversion_rate;

      let total_effective_quantity =
        parseFloat(current_stock) + Loose_In_Base_Unit;
      looseQuantity = remainingLoose;

      return {
        product_id,
        product_name,
        category_name,
        product_base_unit,
        product_secondary_unit,
        current_stock: parseFloat(total_effective_quantity).toFixed(2),
        loose_quantity: parseFloat(looseQuantity).toFixed(2),
      };
    });

    return res.status(200).json({
      success: true,
      total: stockBatches.length,
      data,
    });
  } catch (error) {
    return next(globalError(500, error.message));
  }
};

const updateStockWhenOrderRegister = async (req, res, next) => {
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

    res.status(201).json({
      success: true,
      message: "Order successfully placed",
      data: { ...req.orders },
    });
  } catch (error) {
    return next(globalError(500, error.message));
  }
};

const updateStockWhenReturnOrderRegister = async (req, res, next) => {
  try {
    const { quantity = [], return_type } = req.body;

    for (let i = 0; i < req?.productList.length; i++) {
      const stockId = req.productList[i].stock_id;
      const stock = quantity[i];
      const available = req.productList[i].current_stock;
      let status = "";

      if (return_type === "non-expiry") {
        const availableStock = available + Number(stock);
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
    }

    res.status(201).json({
      success: true,
      message: "return Order successfully placed",
      data: { ...req.orders },
    });
  } catch (error) {
    return next(globalError(500, error.message));
  }
};

const updateStockWhenPurchseOrderRegister = async (req, res, next) => {
  try {
    const { quantity = [] } = req.body;

    for (let i = 0; i < req?.productList.length; i++) {
      const stockId = req.productList[i].stock_id;
      const stock = quantity[i];
      const available = req.productList[i].current_stock;
      let status = "";

      const availableStock = Number(available) + Number(stock);

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
  getAllStock,
  updateStockWhenOrderRegister,
  updateStockWhenReturnOrderRegister,
  updateStockWhenPurchseOrderRegister,
};
