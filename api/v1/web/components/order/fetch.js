const { Op, Sequelize } = require("sequelize");
const Order = require("../../../../../model/order/order");
const Retailer = require("../../../../../model/retailer/retailer");
const Bill = require("../../../../../model/bill/bill");
const OrderList = require("../../../../../model/order/orderList");
const Stock = require("../../../../../model/stock/stock");
const Product = require("../../../../../model/product/product");
const Category = require("../../../../../model/category/category");
const { globalError } = require("../../../../../errors/globalError");

const fetchAllOrder = async (req, res, next) => {
  try {
    const { pageIndex = 1, pageSize = 10, query = "", status = "" } = req.query;

    const condition = {
      [Op.and]: [{ order_deleted: false }],
    };

    if (query.startsWith("#")) {
      condition[Op.and].push({ order_id: Number(query.split("#")[1]) });
    }

    // console.log(req.authData);

    if (req.authData.authority.includes("admin")) {
    } else if (req.authData.authority.includes("retailer")) {
      condition[Op.and].push({ retailer_id: req.authData.user.retailer_id });
    } else if (req.authData.authority.includes("executive")) {
      condition[Op.and].push({
        order_added_by_id: req.authData.user.executive_id,
      });
    }

    const orders = await Order.findAndCountAll({
      where: {
        ...condition,
      },
      include: [
        {
          model: Retailer,
          attributes: ["retailer_id", "retailer_name"],
          where: {
            retailer_name: {
              [Op.like]: `%${query}%`,
            },
          },
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
      limit: +pageSize,
      offset: (+pageIndex - 1) * +pageSize,
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
  } catch (error) {
    return next(globalError(500, error.message));
  }
};

const fetchOrderDetailsById = async (req, res, next) => {
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
            "type",
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
          ],
        },
        {
          model: OrderList,
          attributes: [
            "order_list_id",
            "order_id",
            "quantity",
            "free_quantity",
            "product_id",
            "unit",
            "price",
            "discount",
            "gst_rate",
          ],
          include: [
            {
              model: Product,
              attributes: [
                "product_name",
                "product_id",
                "product_tax_rate",
                "product_discount_type",
                "product_discount",
                "product_hsn_code",
                "product_discount_type",
                "product_discount",
                "product_base_unit",
                "product_secondary_unit",
                "product_conversion_rate",
              ],
              include: [
                {
                  model: Category,
                  attributes: ["category_name", "category_id"],
                },
              ],
            },
          ],
        },
      ],
    });

    const pendingAmount = await Bill.sum("pending_amount", {
      where: {
        retailer_id: orders?.retailer_id,
        [Op.and]: { bill_status: "pending" },
      },
    });

    if (!orders) {
      return res.status(200).json({
        success: true,
        total: 0,
        data: [],
        message: "Order not Created",
      });
    }

    return res.status(200).json({
      success: true,
      data: { ...orders.toJSON(), pending_amount: pendingAmount },
    });
  } catch (error) {
    return next(globalError(500, error.message));
  }
};

const fetchAllOrderCreatedByExecutive = async (req, res, next) => {
  try {
    const id = req.params.id;
    const { pageIndex = 1, pageSize = 10, query = "", status = "" } = req.query;
    const condition = {
      [Op.and]: [{ order_deleted: false }, { order_added_by: "executive" }],
    };

    const orders = await Order.findAndCountAll({
      where: {
        ...condition,
        order_added_by_id: id,
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
      limit: +pageSize,
      offset: (+pageIndex - 1) * +pageSize,
    });

    if (orders?.rows.length === 0) {
      return res.status(200).json({
        success: true,
        total: 0,
        data: [],
        message: "Order not By Executive",
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

const fetchAllOrderCreatedByRetailer = async (req, res, next) => {
  try {
    const id = req.params.id;
    const { pageIndex = 1, pageSize = 10, query = "", status = "" } = req.query;
    const condition = {
      [Op.and]: [{ order_deleted: false }],
    };

    const orders = await Order.findAndCountAll({
      where: {
        ...condition,
        retailer_id: id,
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
      limit: +pageSize,
      offset: (+pageIndex - 1) * +pageSize,
    });

    if (orders?.rows.length === 0) {
      return res.status(200).json({
        success: true,
        total: 0,
        data: [],
        message: "Order not By Executive",
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

module.exports = {
  fetchAllOrder,
  fetchOrderDetailsById,
  fetchAllOrderCreatedByExecutive,
  fetchAllOrderCreatedByRetailer,
};
