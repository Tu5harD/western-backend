const { globalError } = require("../../../../../errors/globalError");
const Order = require("../../../../../model/order/order");
const OrderPayment = require("../../../../../model/paymentHistory/orderPayments");
const { Sequelize, sequelize } = require("../../../../../config/database");

const OrderPaymentRegistration = async (req, res, next) => {
  const t = req.t;
  try {
    const { payments = [] } = req.body;

    let value = payments.map((m) => {
      return {
        bill_id: req?.bill?.bill_id,
        payment_method: m.payment_method,
        amount: parseFloat(m.amount),
      };
    });

    const createdPayment = await OrderPayment.bulkCreate(value, {
      transaction: t,
    });

    if (!createdPayment) {
      await t.rollback();
      return next(globalError(405, `Payment did not created`));
    } else {
      await t.commit();

      return res
        .status(200)
        .json({ success: true, mesage: "Order Successfully Placed" });
    }
  } catch (error) {
    await t.rollback();
    next(globalError(500, error.message));
  }
};

module.exports = { OrderPaymentRegistration };
