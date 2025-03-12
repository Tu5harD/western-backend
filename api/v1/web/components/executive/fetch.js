const { Op } = require("sequelize");
const Executive = require("../../../../../model/executive/executive");
const Order = require("../../../../../model/order/order");
const Bill = require("../../../../../model/bill/bill");
const VillageAlloted = require("../../../../../model/village/villageAlloted");
const { Sequelize, sequelize } = require("../../../../../config/database");
const { globalError } = require("../../../../../errors/globalError");

const getAllExecutive = async (req, res, next) => {
  try {
    const { pageIndex = 1, pageSize = 10, query = "", status = "" } = req.query;
    const condition = {
      [Op.and]: [{ executive_deleted: false }],
    };

    if (status === "true" || status === "false") {
      condition.executive_status = status === "true";
    }

    if (query.startsWith("#")) {
      condition[Op.and].push({ executive_id: Number(query.split("#")[1]) });
    } else {
      condition[Op.and].push({
        [Op.or]: [
          {
            executive_name: {
              [Op.like]: `%${query}%`,
            },
          },
        ],
      });
    }

    const executives = await Executive.findAndCountAll({
      where: {
        ...condition,
      },
      limit: +pageSize,
      offset: (+pageIndex - 1) * +pageSize,
    });
    if (executives?.rows.length === 0) {
      return res.status(200).json({
        success: true,
        total: 0,
        data: [],
        message: "Executive not Created",
      });
    }
    const data = executives?.rows.map((obj) => {
      const { password, executives_deleted, ...otherData } = obj.toJSON();
      return otherData;
    });
    return res
      .status(200)
      .json({ success: true, total: executives.count, data });
  } catch (error) {
    next(globalError(500, error.message));
  }
};

const getExecutiveById = async (req, res, next) => {
  try {
    const { executive_id } = req.body;
    const condition = {
      [Op.and]: [{ executive_deleted: false }],
    };

    const executive = await Executive.findOne({
      where: {
        ...condition,
        executive_id: executive_id,
      },
    });
    if (!executive) {
      return res.status(200).json({
        success: true,
        total: 0,
        data: [],
        message: "Executive not Created",
      });
    }

    const { executive_deleted, ...otherData } = executive.toJSON();
    return res.status(200).json({ success: true, data: otherData });
  } catch (error) {
    next(globalError(500, error.message));
  }
};

const getAllVillagesAllotedToExecutive = async (req, res, next) => {
  try {
    const { executive_id } = req.body;
    const condition = {
      [Op.and]: [{ deleted: false }, { status: true }],
    };

    const villages = await VillageAlloted.findAndCountAll({
      where: {
        ...condition,
        executive_id: executive_id,
      },
    });
    if (!villages?.rows?.length === 0) {
      return res.status(200).json({
        success: true,
        total: 0,
        data: [],
        message: "Villages not Created",
      });
    }
    const data = villages?.rows.map((obj) => {
      const { village_id, ...otherData } = obj.toJSON();
      return village_id;
    });

    return res.status(200).json({ success: true, data: data });
  } catch (error) {
    next(globalError(500, error.message));
  }
};

const getExecutiveTargetById = async (req, res, next) => {
  try {
    const { executive_id } = req.body;

    const currentDate = new Date();

    const firstDayOfMonth = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      1
    );

    const lastDayOfMonth = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth() + 1,
      0
    );

    const executive = await Order.findAll({
      where: {
        order_added_by_id: Number(executive_id),
        order_added_by: "executive",
      },
      include: [
        {
          model: Bill,
          where: {
            [Op.and]: [
              { created_at: { [Op.gte]: firstDayOfMonth } },
              { created_at: { [Op.lte]: lastDayOfMonth } },
            ],
          },
          attributes: ["billing_amount", "order_id"],
        },
      ],
      group: ["Order.order_id"],
    });
    if (!executive || executive.length === 0) {
      return res.status(200).json({
        success: true,
        data: 0,
        message: "Target Not Fetched",
      });
    }

    const data = executive?.map((obj) => {
      const { ...otherData } = obj.toJSON();
      return otherData;
    });

    let totalTarget = executive.reduce(
      (acc, curr) => (curr.Bill ? Number(curr.Bill.billing_amount) + acc : acc),
      0
    );

    return res.status(200).json({ success: true, data: totalTarget });
  } catch (error) {
    next(globalError(500, error.message));
  }
};

module.exports = {
  getAllExecutive,
  getExecutiveById,
  getAllVillagesAllotedToExecutive,
  getExecutiveTargetById,
};
