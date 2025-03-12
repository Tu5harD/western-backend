const { globalError } = require("../../../../../errors/globalError");
const { Op } = require("sequelize");
const Bill = require("../../../../../model/bill/bill");

const getMonthlyBill = async (req, res, next) => {
  try {
    const { retailer_id = "" } = req.body;

    const { count, rows: bills } = await Bill.findAndCountAll({
      where: {
        retailer_id: retailer_id,
        bill_status: {
          [Op.or]: ["pending", "paid"],
        },
      },
    });

    if (count === 0) {
      return res.status(200).json({
        success: true,
        total: 0,
        data: [],
        message: "Bill not Created",
      });
    }

    return res.status(200).json({ success: true, total: count, data: bills });
  } catch (error) {
    return next(globalError(500, error.message));
  }
};

module.exports = { getMonthlyBill };
