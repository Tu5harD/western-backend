const { globalError } = require("../../../../../errors/globalError");
const Bill = require("../../../../../model/bill/bill");
const { Sequelize, sequelize } = require("../../../../../config/database");

const updatebillAndroidByOrderId = async (req, res, next) => {
  try {
    const { quantity = [], type = "ngst", cGST = 0.0, sGST = 0.0 } = req.body;

    const invoiceTotal = quantity
      .map((item, index) => {
        return item * req.productList[index].price;
      })
      .reduce((accumulator, currentValue) => accumulator + currentValue, 0);

    const total = Math.round(
      Math.round(cGST * invoiceTotal) +
        Math.round(sGST * invoiceTotal) +
        invoiceTotal
    );

    if (req?.order) {
      const found = await Bill.findOne({
        where: {
          order_id: req?.order?.order_id,
        },
      });
      if (found) {
        const update = await Bill.update(
          {
            billing_amount: Number(total),
            pending_amount: Number(total),
            gst_type: type,
            sub_total: Number(invoiceTotal),
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
  } catch (error) {
    return next(globalError(500, error.message));
  }
};

module.exports = { updatebillAndroidByOrderId };
