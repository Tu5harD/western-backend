const { Op } = require("sequelize");
const PaymentHistory = require("../../../../../model/paymentHistory/paymentHistory");
const dayjs = require("dayjs");
const { globalError } = require("../../../../../errors/globalError");

const getPaymentHistoryByBillId = async (req, res, next) => {
  try {
    const {
      pageIndex = 1,
      pageSize = 10,
      startDate = "",
      endDate = "",
      bill_id = "",
    } = req.query;

    const condition = {
      [Op.and]: [
        { history_deleted: false },
        {
          transaction_date: {
            [Op.between]: [
              startDate,
              dayjs(endDate).add(1, "day").format("YYYY-MM-DD"),
            ],
          },
        },
      ],
    };
    condition.bill_id = Number(bill_id);
    const paymentHistory = await PaymentHistory.findAndCountAll({
      where: {
        ...condition,
      },
      limit: +pageSize,
      offset: (+pageIndex - 1) * +pageSize,
      order: [["history_id", "DESC"]],
    });
    if (paymentHistory?.rows.length === 0) {
      return res.status(200).json({
        success: true,
        total: 0,
        data: [],
        message: "No Previous History",
      });
    }
    const data = paymentHistory?.rows.map((obj) => {
      const { history_deleted, ...otherData } = obj.toJSON();
      return otherData;
    });
    return res
      .status(200)
      .json({ success: true, total: paymentHistory.count, data });
  } catch (error) {
    next(globalError(500, error.message));
  }
};

module.exports = { getPaymentHistoryByBillId };
