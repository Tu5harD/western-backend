const { Op } = require("sequelize");
const { globalError } = require("../../../../../errors/globalError");
const Ledger = require("../../../../../model/ledger/retailerLedger");

const fetchAllLedgerByRetailerIdAndAuthority = async (req, res, next) => {
  try {
    const {
      pageIndex = 1,
      pageSize = 10,
      status = null,
      retailer_id,
      startDate,
      endDate,
    } = req.body;

    if (req?.authData?.authority.includes("retailer")) {
      let options = {
        where: {
          retailer_id: retailer_id,
          created_at: {
            [Op.between]: [startDate, endDate],
          },
        },
        order: [["created_at", "DESC"]],
        limit: +pageSize,
        offset: (+pageIndex - 1) * +pageSize,
      };
      if (status) {
        options.where.type = status;
      }

      const { count, rows: ledger } = await Ledger.findAndCountAll(options);

      if (count === 0) {
        return res.status(200).json({
          success: true,
          total: 0,
          data: [],
          message: "Ledger not Created",
        });
      }

      return res
        .status(200)
        .json({ success: true, total: count, data: ledger });
    } else {
      return next(globalError(401, "You are not authenticated"));
    }
  } catch (error) {
    return next(globalError(500, error.message));
  }
};

module.exports = { fetchAllLedgerByRetailerIdAndAuthority };
