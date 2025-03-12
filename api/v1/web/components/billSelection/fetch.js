const { Op } = require("sequelize");
const BillSelected = require("../../../../../model/billSelection/billSelection");
const { globalError } = require("../../../../../errors/globalError");

const getAllSelectedBill = async (req, res, next) => {
  try {
    const bills = await BillSelected.findAndCountAll({});
    if (!bills?.rows?.length === 0) {
      return res.status(200).json({
        success: true,
        total: 0,
        data: [],
        message: "Bill not Selected",
      });
    }
    const data = bills?.rows.map((obj) => {
      const { ...otherData } = obj.toJSON();
      return otherData;
    });

    return res.status(200).json({ success: true, data: data });
  } catch (error) {
    next(globalError(500, error.message));
  }
};

module.exports = {
  getAllSelectedBill,
};
