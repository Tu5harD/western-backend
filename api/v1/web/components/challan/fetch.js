const { Op, Sequelize } = require("sequelize");
const Order = require("../../../../../model/order/order");
const Challan = require("../../../../../model/challan/challan");
const ChallanList = require("../../../../../model/challan/challanList");
const Retailer = require("../../../../../model/retailer/retailer");
const Bill = require("../../../../../model/bill/bill");
const OrderList = require("../../../../../model/order/orderList");
const Product = require("../../../../../model/product/product");
const Category = require("../../../../../model/category/category");
const { globalError } = require("../../../../../errors/globalError");

const fetchAllDeliveryChallan = async (req, res, next) => {
  try {
    const { pageIndex = 1, pageSize = 10, query = "", status = "" } = req.query;

    const condition = {
      [Op.and]: [],
    };

    if (query.startsWith("#")) {
      condition[Op.and].push({ challan_id: Number(query.split("#")[1]) });
    }

    const orders = await Challan.findAndCountAll({
      where: {
        ...condition,
      },
      include: [
        {
          model: Retailer,
          attributes: [
            "retailer_id",
            "retailer_name",
            "retailer_mobile",
            "retailer_address",
            "route_id",
            "retailer_fssai",
            "retailer_gst_no",
            "retailer_gst_type",
          ],
          where: {
            retailer_name: {
              [Op.like]: `%${query}%`,
            },
          },
        },
        {
          model: ChallanList,
          attributes: [
            "challan_list_id",
            "challan_id",
            "quantity",
            "stock_id",
            "product_id",
            "price",
          ],
          include: [
            {
              model: Product,
              attributes: ["product_name", "product_id"],
              include: [
                {
                  model: Category,
                  attributes: ["category_name"],
                },
              ],
            },
          ],
        },
      ],
      limit: +pageSize,
      offset: (+pageIndex - 1) * +pageSize,
    });

    if (!orders) {
      return res.status(200).json({
        success: true,
        total: 0,
        data: [],
        message: "Challan not Created",
      });
    }

    const data = orders?.rows.map((obj) => {
      const { ...otherData } = obj.toJSON();
      return otherData;
    });

    return res
      .status(200)
      .json({ success: true, data: data, total: orders.count });
  } catch (error) {
    return next(globalError(500, error.message));
  }
};

const fetchChallanDetailsById = async (req, res, next) => {
  try {
    const { challan_id } = req.body;

    const condition = {
      challan_id: challan_id,
      //   [Op.and]: [{ order_deleted: false }],
    };

    const orders = await Challan.findOne({
      where: {
        ...condition,
      },
      include: [
        {
          model: Retailer,
          attributes: [
            "retailer_id",
            "retailer_name",
            "retailer_mobile",
            "retailer_address",
            "route_id",
            "retailer_fssai",
            "retailer_gst_no",
            "retailer_gst_type",
          ],
        },
        {
          model: ChallanList,
          attributes: [
            "challan_list_id",
            "challan_id",
            "quantity",
            "stock_id",
            "product_id",
            "price",
          ],
          include: [
            {
              model: Product,
              attributes: ["product_name", "product_id"],
              include: [
                {
                  model: Category,
                  attributes: ["category_name"],
                },
              ],
            },
          ],
        },
      ],
    });

    if (!orders) {
      return res.status(200).json({
        success: true,
        total: 0,
        data: [],
        message: "Challan not Created",
      });
    }

    return res.status(200).json({ success: true, data: orders });
  } catch (error) {
    return next(globalError(500, error.message));
  }
};

module.exports = {
  fetchChallanDetailsById,
  fetchAllDeliveryChallan,
};
