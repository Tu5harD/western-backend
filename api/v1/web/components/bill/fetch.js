const { Op } = require("sequelize");
const Bill = require("../../../../../model/bill/bill");
const PurchaseBill = require("../../../../../model/bill/purchaseOrderBill");
const Order = require("../../../../../model/order/order");
const OrderList = require("../../../../../model/order/orderList");
const Product = require("../../../../../model/product/product");
const Category = require("../../../../../model/category/category");
const Stock = require("../../../../../model/stock/stock");
const Retailer = require("../../../../../model/retailer/retailer");
const Vendor = require("../../../../../model/vendor/vendor");
const dayjs = require("dayjs");
const { globalError } = require("../../../../../errors/globalError");
const PurchaseOrder = require("../../../../../model/order/purchaseOrder");
const PurchaseOrderList = require("../../../../../model/order/purchaseOrderList");

const getBillByBillId = async (req, res, next) => {
  try {
    //bill status Paids
    const { bill_id } = req.body;
    const bill = await Bill.findOne({
      where: {
        bill_id: bill_id,
        bill_status: "paid",
      },
      include: [
        {
          model: Order,
          include: [
            {
              model: Retailer,
              attributes: [
                "retailer_name",
                "retailer_mobile",
                "retailer_address",
                "retailer_fssai",
                "retailer_gst_no",
                "type",
              ],
            },
            {
              model: OrderList,
              include: [
                {
                  model: Product,
                  include: [
                    {
                      model: Category,
                    },
                    {
                      model: Stock,
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    });
    if (!bill) {
      return next(
        globalError(
          500,
          "Cant Return Until You Pay the Bill OR Bill Does not Exist"
        )
      );
    }

    return res.status(200).json({ success: true, data: bill });
  } catch (error) {
    next(globalError(500, error.message));
  }
};

const getAllBills = async (req, res, next) => {
  try {
    const {
      pageIndex = 1,
      pageSize = 10,
      query = "",
      retailer_id = "",
      startDate = "",
      endDate = "",
    } = req.query;

    const condition = {
      [Op.and]: [{ order_deleted: false }],
    };

    if (query.startsWith("#")) {
      condition[Op.and].push({ retailer_id: Number(query.split("#")[1]) });
    } else if (query) {
      condition[Op.and].push({
        retailer_name: {
          [Op.like]: `%${query}%`,
        },
      });
    }

    if (retailer_id) {
      condition[Op.and].push({ retailer_id: Number(retailer_id) });
    }

    if (startDate && endDate) {
      const formattedStartDate = dayjs(startDate).format("YYYY-MM-DD");
      const formattedEndDate = dayjs(endDate)
        .add(1, "day")
        .format("YYYY-MM-DD");

      var orderCondition = {
        createdAt: {
          [Op.between]: [formattedStartDate, formattedEndDate],
        },
      };
    } else {
      var orderCondition = {};
    }

    const bills = await Order.findAndCountAll({
      attributes: ["order_id", "order_status"],
      where: orderCondition,
      include: [
        {
          model: Bill,
        },
        {
          model: Retailer,
          where: condition,
          attributes: [
            "retailer_name",
            "retailer_mobile",
            "retailer_address",
            "retailer_fssai",
            "retailer_gst_no",
          ],
        },
      ],
      order: [["order_id", "DESC"]],
      limit: +pageSize,
      offset: (+pageIndex - 1) * +pageSize,
    });

    if (bills.count === 0) {
      return res.status(200).json({ success: false, data: [] });
    }

    let data = bills.rows.map((m) => {
      let { ...otherData } = m.toJSON();
      return otherData;
    });

    return res.status(200).json({ success: true, data: data });
  } catch (error) {
    next(globalError(500, error.message));
  }
};

const getGSTR1Report = async (req, res, next) => {
  try {
    const {
      pageIndex = 1,
      pageSize = 10,
      query = "",
      startDate = "",
      endDate = "",
    } = req.query;

    const condition = {
      [Op.and]: [
        {
          [Op.or]: [
            {
              retailer_name: {
                [Op.like]: `%${query}%`,
              },
            },
          ],
        },
      ],
    };

    const formattedStartDate = dayjs(startDate).format("YYYY-MM-DD");
    const formattedEndDate = dayjs(endDate).add(1, "day").format("YYYY-MM-DD");

    const bills = await Bill.findAndCountAll({
      where: {
        bill_status: {
          [Op.or]: ["pending", "paid"],
        },
        createdAt: {
          [Op.between]: [formattedStartDate, formattedEndDate],
        },
      },
      include: [
        {
          model: Retailer,
          attributes: [
            "retailer_name",
            "retailer_mobile",
            "retailer_address",
            "retailer_fssai",
            "retailer_gst_no",
          ],
          where: condition,
        },
      ],
      order: [["bill_id", "DESC"]],
      limit: +pageSize,
      offset: (+pageIndex - 1) * +pageSize,
    });
    if (bills.count === 0) {
      return res.status(200).json({ success: false, data: [] });
    }

    let data = bills.rows.map((m) => {
      let { billing_amount, gst_type, gst_rate, bill_id, ...otherData } =
        m.toJSON();

      let GStr = 1 + gst_rate / 100;

      let taxableValue = Math.round(billing_amount / GStr);
      let centralTaxAmount = Math.round(taxableValue * (gst_rate / 100));
      return {
        gst_no: otherData?.Retailer?.retailer_gst_no,
        party_name: otherData?.Retailer?.retailer_name,
        transaction_type: "Sale",
        invoice_no: bill_id,
        invoice_value: billing_amount,
        rate: gst_type == "GST" ? String(gst_rate) + " %" : "0 %",
        cess_rate: 0,
        taxable_value: taxableValue,
        reverse_charge: "N",
        integrated_tax_amount: 0,
        central_tax_amount: centralTaxAmount / 2,
        state_tax_amount: centralTaxAmount / 2,
        cess_amount: 0,
        place_of_supply: "MAHARASHTRA",
        date: otherData.createdAt,
      };
    });

    return res
      .status(200)
      .json({ success: true, data: data, total: bills.count });
  } catch (error) {
    next(globalError(500, error.message));
  }
};

const getGSTR2Report = async (req, res, next) => {
  try {
    const {
      pageIndex = 1,
      pageSize = 10,
      query = "",
      startDate = "",
      endDate = "",
    } = req.query;

    const condition = {
      [Op.and]: [],
    };
    if (query) {
      condition[Op.and].push({
        [Op.or]: [
          {
            vendor_name: {
              [Op.like]: `%${query}%`,
            },
          },
        ],
      });
    }

    const nextDayEndDate = new Date(
      new Date(endDate).getTime() + 24 * 60 * 60 * 1000
    );

    // const bills = await PurchaseBill.findAndCountAll({
    //   where: {
    //     purchase_bill_status: "paid",
    //     createdAt: {
    //       [Op.between]: [startDate, nextDayEndDate],
    //     },
    //   },
    //   include:[{
    //     model:PurchaseOrder,
    //     attributes:['purchase_order_id'],
    //     include:[{
    //       model:PurchaseOrderList,
    //       attributes:["purchase_order_list_id","price","gst","gst_rate","quantity"]
    //     }]
    //   }],
    //   include: [
    //     {
    //       model: Vendor,
    //       attributes: ["vendor_name", "vendor_gst_no"],
    //       where: condition,
    //     },
    //   ],
    //   order: [["purchase_bill_id", "DESC"]],
    //   limit: +pageSize,
    //   offset: (+pageIndex - 1) * +pageSize,
    // });
    const bills = await PurchaseOrderList.findAndCountAll({
      attributes: [
        "purchase_order_list_id",
        "price",
        "gst",
        "gst_rate",
        "quantity",
        "purchase_order_id",
      ],
      include: [
        {
          model: PurchaseOrder,
          attributes: ["purchase_order_id"],
          include: [
            {
              model: PurchaseBill,
              where: {
                purchase_bill_status: "paid",
                createdAt: {
                  [Op.between]: [startDate, nextDayEndDate],
                },
              },
              include: [
                {
                  model: Vendor,
                  attributes: ["vendor_name", "vendor_gst_no"],
                  where: condition,
                },
              ],
            },
          ],
        },
      ],
      order: [
        [
          { model: PurchaseOrder },
          { model: PurchaseBill },
          "purchase_bill_id",
          "DESC",
        ],
      ],
      limit: +pageSize,
      offset: (+pageIndex - 1) * +pageSize,
    });
    if (bills.count === 0) {
      return res.status(200).json({ success: false, data: [] });
    }

    let data = bills.rows.map((m) => {
      let {
        billing_amount,
        gst_type,
        purchase_bill_id,
        PurchaseOrder,
        ...otherData
      } = m.toJSON();

      let taxableValue = PurchaseOrder?.PurchaseOrderList?.reduce(
        (acc, curr) => acc + curr.quantity * curr.price,
        0
      );
      let gstAmount = PurchaseOrder?.PurchaseOrderList?.reduce(
        (acc, curr) => acc + (curr.quantity * curr.price * curr.gst_rate) / 100,
        0
      );
      let centralTaxAmount = Math.round(taxableValue * 0.09);
      return {
        gst_no: otherData?.Vendor?.vendor_gst_no,
        party_name: otherData?.Vendor?.vendor_name,
        invoice_no: purchase_bill_id,
        date: otherData.createdAt,
        transaction_type: "Purchase",
        invoice_value: billing_amount,
        rate: gst_type == "GST" ? "18 %" : "0 %",
        cess_rate: 0,
        taxable_value: taxableValue,
        reverse_charge: "N",
        integrated_tax_amount: 0,
        central_tax_amount: centralTaxAmount,
        state_tax_amount: centralTaxAmount,
        cess_amount: 0,
        place_of_supply: "MAHARASHTRA",
      };
    });

    return res
      .status(200)
      .json({ success: true, data: data, total: data.length });
  } catch (error) {
    next(globalError(500, error.message));
  }
};

module.exports = {
  getBillByBillId,
  getAllBills,
  getGSTR1Report,
  getGSTR2Report,
};
