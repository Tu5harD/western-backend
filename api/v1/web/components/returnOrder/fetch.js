const { Op, Sequelize } = require("sequelize");
const ReturnOrder = require("../../../../../model/order/returnOrder");
const Retailer = require("../../../../../model/retailer/retailer");
const ReturnBill = require("../../../../../model/bill/returnBill");
const ReturnOrderList = require("../../../../../model/order/returnOrderList");
const Product = require("../../../../../model/product/product");
const Category = require("../../../../../model/category/category");
const { globalError } = require("../../../../../errors/globalError");

const fetchAllReturnOrder = async (req, res, next) => {
  try {
    const { pageIndex = 1, pageSize = 10, query = "", status = "" } = req.query;

    const condition = {
      [Op.and]: [{ return_order_deleted: false }],
    };

    if (query.startsWith("#")) {
      condition[Op.and].push({ order_id: Number(query.split("#")[1]) });
    }
    //   } else {
    //     condition[Op.and].push({
    //       [Op.or]: [
    //         {
    //           retailer_name: {
    //             [Op.like]: `%${query}%`,
    //           },
    //         },
    //       ],
    //     });
    //   }

    const orders = await ReturnOrder.findAndCountAll({
      where: {
        ...condition,
      },
      include: [
        {
          model: Retailer,
          attributes: ["retailer_id", "retailer_name"],
        },
        {
          model: ReturnBill,
          attributes: [
            "return_bill_id",
            "billing_amount",
            "pending_amount",
            "return_bill_status",
          ],
        },
      ],
      order: [["created_at", "DESC"]],
      limit: +pageSize,
      offset: (+pageIndex - 1) * +pageSize,
    });

    if (orders?.rows.length === 0) {
      return res.status(200).json({
        success: true,
        total: 0,
        data: [],
        message: "return Order not Created",
      });
    }

    const data = orders?.rows.map((obj) => {
      const { orders_deleted, ...otherData } = obj.toJSON();
      return otherData;
    });
    return res.status(200).json({ success: true, total: orders.count, data });
  } catch (error) {
    return next(globalError(500, error.message));
  }
};

const fetchReturnOrderDetailsById = async (req, res, next) => {
  try {
    const { return_order_id } = req.body;

    const condition = {
      return_order_id: return_order_id,
      [Op.and]: [{ return_order_deleted: false }],
    };

    const orders = await ReturnOrder.findOne({
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
          model: ReturnBill,
          attributes: [
            "return_bill_id",
            "billing_amount",
            "pending_amount",
            "return_bill_status",
            "sub_total",
          ],
        },
        {
          model: ReturnOrderList,
          attributes: [
            "return_order_list_id",
            "return_order_id",
            "quantity",
            "product_id",
            "price",
            "gst_rate",
            "discount",
            "expiry_date",
            "return_type",
            "unit",
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
        message: "Return Order not Created",
      });
    }

    return res.status(200).json({ success: true, data: orders });
  } catch (error) {
    return next(globalError(500, error.message));
  }
};
module.exports = { fetchAllReturnOrder, fetchReturnOrderDetailsById };
