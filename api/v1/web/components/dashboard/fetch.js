const { Op } = require("sequelize");
const Executive = require("../../../../../model/executive/executive");
const Retailer = require("../../../../../model/retailer/retailer");
const Vendor = require("../../../../../model/vendor/vendor");
const Worker = require("../../../../../model/worker/worker");
const Admin = require("../../../../../model/admin");
const Product = require("../../../../../model/product/product");
const Stock = require("../../../../../model/stock/stock");
const Order = require("../../../../../model/order/order");
const Bill = require("../../../../../model/bill/bill");
const ExecutiveLedger = require("../../../../../model/ledger/executiveLedger");
const WorkerLedger = require("../../../../../model/ledger/workerLedger");
const RetailerLedger = require("../../../../../model/ledger/retailerLedger");
const VendorLedger = require("../../../../../model/ledger/vendorLedger");
const { globalError } = require("../../../../../errors/globalError");

const getDashboardData = async (req, res, next) => {
  try {
    // const { pageIndex = 1, pageSize = 10, query = "", status = "" } = req.query;
    const executives = await Executive.count({
      where: {
        executive_deleted: false,
      },
    });
    const retailer = await Retailer.count({
      where: {
        retailer_deleted: false,
      },
    });
    const vendor = await Vendor.count({
      where: {
        vendor_deleted: false,
      },
    });
    const worker = await Worker.count({
      where: {
        worker_deleted: false,
      },
    });
    const admin = await Admin.count({
      where: {
        admin_deleted: false,
      },
    });
    const product = await Product.count({
      where: {
        product_deleted: false,
      },
    });
    const stock = await Stock.count({
      where: {
        stock_deleted: false,
      },
    });
    const order = await Order.count({
      where: {
        order_deleted: false,
      },
    });

    const build = await Order.findAndCountAll({
      where: {
        order_deleted: false,
        createdAt: {
          [Op.lt]: new Date(new Date() - 15 * 24 * 60 * 60 * 1000),
        },
      },
      include: [
        {
          model: Retailer,
          attributes: [
            "retailer_name",
            "retailer_id",
            "retailer_gst_no",
            "retailer_fssai",
            "retailer_mobile",
            "retailer_gst_type",
          ],
          where: {
            retailer_status: true,
          },
        },
      ],
    });

    let unbuild = await Bill.findAndCountAll({
      where: {
        updatedAt: {
          [Op.lt]: new Date(new Date() - 15 * 24 * 60 * 60 * 1000),
        },
      },
      include: [
        {
          model: Retailer,
          attributes: [
            "retailer_name",
            "retailer_id",
            "retailer_gst_no",
            "retailer_fssai",
            "retailer_mobile",
            "retailer_gst_type",
          ],
          where: {
            retailer_deleted: false,
            retailer_status: true,
          },
          distinct: true,
        },
      ],
    });

    const uniqueRetailersMap = new Map();

    build.rows.forEach((order) => {
      const retailerId = order.retailer_id;
      if (!uniqueRetailersMap.has(retailerId)) {
        uniqueRetailersMap.set(retailerId, order.Retailer);
      }
    });

    const uniqueRetailers = Array.from(uniqueRetailersMap.values());
    unbuild = unbuild?.rows?.map((un) => {
      const { Retailer, ...otherData } = un.toJSON();
      return Retailer;
    });

    const executiveBalances = await ExecutiveLedger.findAll({
      attributes: ["executive_id", "balance"],
      group: ["executive_id"],
      order: [["executive_id", "DESC"]],
    });

    executiveTotal = executiveBalances.reduce(
      (acc, curr) => Math.round(parseFloat(curr.balance) + acc),
      0
    );

    const workerBalances = await WorkerLedger.findAll({
      attributes: ["worker_id", "balance"],
      group: ["worker_id"],
      order: [["worker_id", "DESC"]],
    });

    workerTotal = workerBalances.reduce(
      (acc, curr) => Math.round(parseFloat(curr.balance) + acc),
      0
    );

    const retailerBalances = await RetailerLedger.findAll({
      attributes: ["retailer_id", "balance"],
      group: ["retailer_id"],
      order: [["retailer_id", "DESC"]],
    });

    retailerTotal = retailerBalances.reduce(
      (acc, curr) => Math.round(-parseFloat(curr.balance) + acc),
      0
    );

    const vendorBalances = await VendorLedger.findAll({
      attributes: ["vendor_id", "balance"],
      group: ["vendor_id"],
      order: [["vendor_id", "DESC"]],
    });

    vendorTotal = vendorBalances.reduce(
      (acc, curr) => Math.round(-parseFloat(curr.balance) + acc),
      0
    );

    return res.status(200).json({
      success: true,
      data: {
        executves: executives,
        retailer: retailer,
        vendor: vendor,
        worker: worker,
        admin: admin,
        product: product,
        stock,
        order,
        build: uniqueRetailers,
        unbuild,
        executiveTotal,
        workerTotal,
        retailerTotal,
        vendorTotal,
        totalExpense: Math.round(executiveTotal + workerTotal + vendorTotal),
      },
    });
  } catch (error) {
    next(globalError(500, error.message));
  }
};

module.exports = { getDashboardData };
