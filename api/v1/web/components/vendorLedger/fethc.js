const { Op } = require("sequelize");
const { globalError } = require("../../../../../errors/globalError");
const VendorLedger = require("../../../../../model/ledger/vendorLedger");

const fetchAllLedgerByVendorIdAndAuthority = async (req, res, next) => {
  try {
    const {
      pageIndex = 1,
      pageSize = 10,
      status = null,
      vendor_id,
      startDate,
      endDate,
    } = req.body;

    if (req?.authData?.authority.includes("admin")) {
      let StartDate = new Date(startDate);
      let EndDate = new Date(endDate);

      let options = {
        where: {
          vendor_id: +vendor_id,
          created_at: {
            [Op.between]: [StartDate, EndDate],
          },
        },
        order: [["created_at", "DESC"]],
        limit: +pageSize,
        offset: (+pageIndex - 1) * +pageSize,
      };
      if (status) {
        options.where.type = status;
      }

      const { count, rows: ledger } = await VendorLedger.findAndCountAll(
        options
      );

      if (count === 0) {
        return res.status(200).json({
          success: true,
          total: 0,
          data: [],
          message: "Vendor Ledger not Created",
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

module.exports = { fetchAllLedgerByVendorIdAndAuthority };
