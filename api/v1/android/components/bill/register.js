const { globalError } = require("../../../../../errors/globalError");
const Order = require("../../../../../model/order/order");
const Bill = require("../../../../../model/bill/bill");
const { Sequelize, sequelize } = require("../../../../../config/database");

const billAndroidRegister = async (req, res, next) => {
  try {
    const { quantity = [], type = "ngst", cGST = 0.0, sGST = 0.0 } = req.body;

    const invoiceTotal = quantity
      .map((item, index) => {
        return item * Number(req.productList[index].price);
      })
      .reduce((accumulator, currentValue) => accumulator + currentValue, 0);

    const subTotal = quantity
      .map((item, index) => {
        const price =
          type === "GST"
            ? Math.round(
                Number(req.productList[index].price) /
                  (1 + req.productList[index].gst / 100)
              )
            : Number(req.productList[index].price);
        return item * price;
      })
      .reduce((accumulator, currentValue) => accumulator + currentValue, 0);

    const total = Math.round(
      // Math.round(cGST * invoiceTotal) +
      //   Math.round(sGST * invoiceTotal) +
      invoiceTotal
    );
    let gst_percentage =
      type === "GST" ? ((total - subTotal) / subTotal) * 100 : 0;

    if (req?.order) {
      const found = await Bill.findOne({
        where: {
          order_id: req?.order?.order_id,
        },
      });
      if (found) {
        const update = await Bill.update(
          {
            billing_amount: Number(found.billing_amount) + Number(total),
            pending_amount: Number(found.billing_amount) + Number(total),
            gst_type: type,
            sub_total: Number(found.sub_total) + subTotal,
            gst_rate: gst_percentage,
          },
          {
            where: {
              bill_id: Number(found.bill_id),
            },
          }
        );
      }
      return next();
    }

    const billData = {
      billing_amount: total,
      order_id: req?.orders.order_id,
      vendor_id: req?.orders.vendor_id,
      retailer_id: req?.orders.retailer_id,
      pending_amount: total,
      gst_type: type,
      sub_total: subTotal,
      gst_rate: gst_percentage,
    };

    const createdBill = await Bill.create(billData);

    if (!createdBill) {
      return next(globalError(405, `Order did not create`));
    } else {
      req.bill = {
        ...billData,
        status: "pending",
        bill_id: createdBill.bill_id,
      };
      return next();
    }
  } catch (error) {
    const t = await sequelize.transaction();
    try {
      await Order.destroy({
        where: { order_id: req?.orders.order_id },
        transaction: t,
      });
      await t.commit();
    } catch (rollbackError) {
      await t.rollback();
    }

    return next(globalError(500, error.message));
  }
};

module.exports = { billAndroidRegister };
