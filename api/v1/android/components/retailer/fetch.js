const { globalError } = require("../../../../../errors/globalError");
const { Op } = require("sequelize");
const Retailer = require("../../../../../model/retailer/retailer");
const Executive = require("../../../../../model/executive/executive");
const VillageAlloted = require("../../../../../model/village/villageAlloted");
const Village = require("../../../../../model/village/village");
const Route = require("../../../../../model/routePath/route");
const { Sequelize, sequelize } = require("../../../../../config/database");

const getRetailerAllotedToExecutive = async (req, res, next) => {
  try {
    const { count: count1, rows: retailers } = await Retailer.findAndCountAll({
      attributes: ["retailer_name", "retailer_id", "village_id"],
      where: {
        retailer_deleted: false,
      },
    });

    const { count, rows: executives } = await VillageAlloted.findAndCountAll({
      attributes: ["executive_id", "village_id"],
      where: {
        status: 1,
        executive_id: req?.authData?.user[req?.authData?.authority[0] + "_id"],
      },
    });

    let arr = retailers.map((f) => {
      let otherData = f.toJSON();
      let found = executives.find((e) => {
        let otherData1 = e.toJSON();
        return Number(otherData1.village_id) === Number(otherData.village_id);
      });
      if (found) {
        return otherData;
      } else {
        return null;
      }
    });

    arr = arr.filter((item) => item !== null);

    if (arr.length === 0) {
      return res.status(200).json({
        success: true,
        total: 0,
        data: [],
        message: "Village Not Alloted",
      });
    }

    return res.status(200).json({ success: true, data: arr });
  } catch (error) {
    return next(globalError(500, error.message));
  }
};

module.exports = { getRetailerAllotedToExecutive };
