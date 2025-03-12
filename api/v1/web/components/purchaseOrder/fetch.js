const { Op, Sequelize } = require("sequelize");
const PurchaseOrder = require("../../../../../model/order/purchaseOrder");
const Vendor = require("../../../../../model/vendor/vendor");
const PurchaseBill = require("../../../../../model/bill/purchaseOrderBill");
const PurchaseOrderList = require("../../../../../model/order/purchaseOrderList");
const Product = require("../../../../../model/product/product");
const Category = require("../../../../../model/category/category");
const { globalError } = require("../../../../../errors/globalError");

const fetchAllPurchaseOrder = async (req, res, next) => {
  try {
    const { pageIndex = 1, pageSize = 10, query = "", status = "" } = req.query;

    const condition = {
      [Op.and]: [{ purchase_order_deleted: false }],
    };

    if (query.startsWith("#")) {
      condition[Op.and].push({
        purchase_order_id: Number(query.split("#")[1]),
      });
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

    const orders = await PurchaseOrder.findAndCountAll({
      where: {
        ...condition,
      },
      include: [
        {
          model: Vendor,
          attributes: ["vendor_id", "vendor_name"],
        },
        {
          model: PurchaseBill,
          attributes: [
            "purchase_bill_id",
            "billing_amount",
            "pending_amount",
            "purchase_bill_status",
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
        message: "Purchase Order not Created",
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

const fetchPurchaseOrderDetailsById = async (req, res, next) => {
  try {
    const { purchase_order_id } = req.body;
    const condition = {
      purchase_order_id: purchase_order_id,
      purchase_order_deleted: false,
    };

    const orders = await PurchaseOrder.findOne({
      where: condition,
      include: [
        {
          model: Vendor,
          attributes: [
            "vendor_id",
            "vendor_name",
            "vendor_mobile",
            "vendor_address",
            "vendor_fssai",
            "vendor_gst_no",
            "vendor_gst_type",
          ],
        },
        {
          model: PurchaseBill,
          attributes: [
            "purchase_bill_id",
            "billing_amount",
            "pending_amount",
            "purchase_bill_status",
            "sub_total",
          ],
        },
        {
          model: PurchaseOrderList,
          attributes: [
            "purchase_order_list_id",
            "purchase_order_id",
            "quantity",
            "product_id",
            "price",
            "gst_rate",
            "unit",
            "discount",
            "expiry_date",
          ],
          include: [
            {
              model: Product,
              attributes: [
                "product_name",
                "product_id",
                "product_base_unit",
                "product_secondary_unit",
                "product_conversion_rate",
                "product_tax_rate",
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
  fetchAllPurchaseOrder,
  fetchPurchaseOrderDetailsById,
};
