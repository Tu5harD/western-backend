const { Op } = require("sequelize");
const Retailer = require("../../../../../model/retailer/retailer");
const Ledger = require("../../../../../model/ledger/retailerLedger");
const { globalError } = require("../../../../../errors/globalError");

const { Sequelize } = require("../../../../../config/database");

const getAllRetailerReportWhoseBalanceisPending = async (req, res, next) => {
  try {
    const { pageIndex = 1, pageSize = 10, query = "" } = req.body;
    const condition = {
      [Op.and]: [{ retailer_deleted: false }, { type: "retailer" }],
    };

    if (query.startsWith("#")) {
      condition[Op.and].push({ retailer_id: Number(query.split("#")[1]) });
    } else {
      condition[Op.and].push({
        [Op.or]: [
          {
            retailer_name: {
              [Op.like]: `%${query}%`,
            },
          },
        ],
      });
    }

    const latestLedgers = await Ledger.findAll({
      attributes: [
        "ledger_id",
        "retailer_id",
        "amount",
        "balance",
        "type",
        "created_at",
        "updated_at",
        "payment_type",
        "description",
      ],
      include: [
        {
          model: Retailer,
          attributes: [
            "retailer_id",
            "retailer_name",
            "retailer_mobile",
            "last_date",
            "note",
          ],
          where: condition,
        },
      ],
      where: {
        balance: {
          [Sequelize.Op.and]: [Sequelize.literal("ABS(balance) > 0")],
        },
      },
      order: [
        ["retailer_id", "ASC"],
        ["created_at", "DESC"],
      ],
      raw: true,
      nest: true,
    });

    const uniqueRetailersMap = new Map();

    latestLedgers.forEach((ledger) => {
      const currentLatest = uniqueRetailersMap.get(ledger.retailer_id);
      if (
        !currentLatest ||
        new Date(ledger.created_at) > new Date(currentLatest.created_at)
      ) {
        uniqueRetailersMap.set(ledger.retailer_id, ledger);
      }
    });

    const result = Array.from(uniqueRetailersMap.values());

    const paginatedResult = result.slice(
      (+pageIndex - 1) * +pageSize,
      +pageIndex * +pageSize
    );

    if (result?.length === 0) {
      return res.status(200).json({
        success: true,
        total: 0,
        data: [],
        message: "Ledger not created",
      });
    }

    return res.status(200).json({
      success: true,
      total: paginatedResult.length,
      data: paginatedResult,
    });
  } catch (error) {
    next(globalError(500, error.message));
  }
};

const getAllRetailerToRecoverPayment = async (req, res, next) => {
  try {
    const condition = {
      [Op.and]: [{ retailer_deleted: false }, { type: "retailer" }],
    };

    const latestLedgers = await Ledger.findAll({
      attributes: ["ledger_id", "retailer_id", "balance"],
      include: [
        {
          model: Retailer,
          attributes: ["retailer_id", "retailer_name", "last_date", "note"],
          where: condition,
        },
      ],
      where: {
        balance: {
          [Sequelize.Op.and]: [Sequelize.literal("ABS(balance) > 0")],
        },
      },
      order: [
        ["retailer_id", "ASC"],
        ["created_at", "DESC"],
      ],
      raw: true,
      nest: true,
    });

    const uniqueRetailersMap = new Map();

    latestLedgers.forEach((ledger) => {
      const currentLatest = uniqueRetailersMap.get(ledger.retailer_id);
      if (
        !currentLatest ||
        new Date(ledger.created_at) > new Date(currentLatest.created_at)
      ) {
        uniqueRetailersMap.set(ledger.retailer_id, ledger);
      }
    });

    let result = Array.from(uniqueRetailersMap.values());

    result = result.filter(
      (f) => f?.Retailer?.last_date !== null && f?.Retailer?.last_date !== ""
    );

    if (result?.length === 0) {
      return res.status(200).json({
        success: true,
        total: 0,
        data: [],
        message: "Ledger not created",
      });
    }

    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(globalError(500, error.message));
  }
};

module.exports = {
  getAllRetailerReportWhoseBalanceisPending,
  getAllRetailerToRecoverPayment,
};
