const { Op, Sequelize } = require("sequelize");
const Order = require("../../../../../model/order/order");
const Retailer = require("../../../../../model/retailer/retailer");
const Bill = require("../../../../../model/bill/bill");
const OrderList = require("../../../../../model/order/orderList");
const Product = require("../../../../../model/product/product");
const Category = require("../../../../../model/category/category");
const { globalError } = require("../../../../../errors/globalError");

const fetchAllAndroidOrderByRetailerId = async (req, res, next) => {
  try {
    const condition = {
      [Op.and]: [{ order_deleted: false }],
    };

    if (
      req?.authData?.authority[0].includes("retailer") ||
      req?.authData?.authority[0].includes("wholesaler")
    ) {
      const orders = await Order.findAndCountAll({
        where: {
          ...condition,
          retailer_id: req?.authData?.user[req?.authData?.authority[0] + "_id"],
        },
        include: [
          {
            model: Retailer,
            attributes: ["retailer_id", "retailer_name"],
          },
          {
            model: Bill,
            attributes: [
              "bill_id",
              "billing_amount",
              "pending_amount",
              "bill_status",
            ],
          },
        ],
        order: [["created_at", "DESC"]],
      });

      if (orders?.rows.length === 0) {
        return res.status(200).json({
          success: true,
          total: 0,
          data: [],
          message: "Order not Created",
        });
      }

      const data = orders?.rows.map((obj) => {
        const { orders_deleted, ...otherData } = obj.toJSON();
        return otherData;
      });
      return res.status(200).json({ success: true, total: orders.count, data });
    } else {
      const orders = await Order.findAndCountAll({
        where: {
          ...condition,
          order_added_by_id:
            req?.authData?.user[req?.authData?.authority[0] + "_id"],
          order_added_by: "executive",
        },
        include: [
          {
            model: Retailer,
            attributes: ["retailer_id", "retailer_name"],
          },
          {
            model: Bill,
            attributes: [
              "bill_id",
              "billing_amount",
              "pending_amount",
              "bill_status",
            ],
          },
        ],
        order: [["created_at", "DESC"]],
      });

      if (orders?.rows.length === 0) {
        return res.status(200).json({
          success: true,
          total: 0,
          data: [],
          message: "Order not Created",
        });
      }

      const data = orders?.rows.map((obj) => {
        const { orders_deleted, ...otherData } = obj.toJSON();
        return otherData;
      });
      return res.status(200).json({ success: true, total: orders.count, data });
    }
  } catch (error) {
    return next(globalError(500, error.message));
  }
};

const fetchAndroidOrderDetailsById = async (req, res, next) => {
  try {
    const { order_id } = req.body;

    const condition = {
      order_id: order_id,
      //   [Op.and]: [{ order_deleted: false }],
    };

    const orders = await Order.findOne({
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
          model: Bill,
          attributes: [
            "bill_id",
            "billing_amount",
            "pending_amount",
            "bill_status",
            "sub_total",
            "gst_type",
          ],
        },
        {
          model: OrderList,
          attributes: [
            "order_list_id",
            "order_id",
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
        message: "Order not Created",
      });
    }

    return res.status(200).json({ success: true, data: orders });
  } catch (error) {
    return next(globalError(500, error.message));
  }
};

module.exports = {
  fetchAllAndroidOrderByRetailerId,
  fetchAndroidOrderDetailsById,
};
