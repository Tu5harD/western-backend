const { Op } = require("sequelize");
const Retailer = require("../../../../../model/retailer/retailer");
const { globalError } = require("../../../../../errors/globalError");

const getAllRetailer = async (req, res, next) => {
  try {
    const { pageIndex = 1, pageSize = 10, query = "", status } = req.body;
    const condition = {
      [Op.and]: [{ retailer_deleted: false }, { type: "retailer" }],
    };

    if (status === true || status === false) {
      condition.retailer_status = status === true;
    }

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

    const retailers = await Retailer.findAndCountAll({
      where: {
        ...condition,
      },
      limit: pageSize,
      offset: (pageIndex - 1) * pageSize,
    });
    if (retailers?.rows.length === 0) {
      return res.status(200).json({
        success: true,
        total: 0,
        data: [],
        message: "Retailer not created",
      });
    }
    const data = retailers?.rows.map((obj) => {
      const { password, retailer_deleted, ...otherData } = obj.toJSON();
      return {
        ...otherData,
        retailer_route: otherData.route_id,
        retailer_village: otherData.village_id,
      };
    });
    return res
      .status(200)
      .json({ success: true, total: retailers.count, data });
  } catch (error) {
    next(globalError(500, error.message));
  }
};

const getAllRetailerWithoutPaginated = async (req, res, next) => {
  try {
    const condition = {
      [Op.and]: [{ retailer_deleted: false }],
    };

    const retailers = await Retailer.findAndCountAll({
      where: { ...condition },
    });
    if (retailers?.rows.length === 0) {
      return res.status(200).json({
        success: true,
        total: 0,
        data: [],
        message: "Retailer not created",
      });
    }
    const data = retailers?.rows.map((obj) => {
      const { password, retailer_deleted, ...otherData } = obj.toJSON();
      return otherData;
    });
    return res.status(200).json({ success: true, data });
  } catch (error) {
    next(globalError(500, error.message));
  }
};

const getAllRetailerWithRetailerId = async (req, res, next) => {
  try {
    const { retailer_id } = req.body;

    const condition = {
      [Op.and]: [{ retailer_deleted: false }],
    };

    const retailers = await Retailer.findOne({
      where: { ...condition, retailer_id },
    });
    if (!retailers) {
      return res.status(200).json({
        success: true,
        data: [],
        message: "Retailer not created",
      });
    }

    const { password, retailer_deleted, ...otherData } = retailers.toJSON();

    return res.status(200).json({ success: true, data: otherData });
  } catch (error) {
    next(globalError(500, error.message));
  }
};

const getAllWholesaler = async (req, res, next) => {
  try {
    const { pageIndex = 1, pageSize = 10, query = "", status } = req.body;
    const condition = {
      [Op.and]: [{ retailer_deleted: false }, { type: "wholesaler" }],
    };

    if (status === true || status === false) {
      condition.retailer_status = status === true;
    }

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

    const retailers = await Retailer.findAndCountAll({
      where: {
        ...condition,
      },
      limit: pageSize,
      offset: (pageIndex - 1) * pageSize,
    });
    if (retailers?.rows.length === 0) {
      return res.status(200).json({
        success: true,
        total: 0,
        data: [],
        message: "Retailer not created",
      });
    }
    const data = retailers?.rows.map((obj) => {
      const { password, retailer_deleted, ...otherData } = obj.toJSON();
      return {
        ...otherData,
        retailer_route: otherData.route_id,
        retailer_village: otherData.village_id,
      };
    });
    return res
      .status(200)
      .json({ success: true, total: retailers.count, data });
  } catch (error) {
    next(globalError(500, error.message));
  }
};

module.exports = {
  getAllRetailer,
  getAllRetailerWithoutPaginated,
  getAllRetailerWithRetailerId,
  getAllWholesaler,
};
