const { globalError } = require("../../../../../errors/globalError");
const PaymentHistory = require("../../../../../model/paymentHistory/paymentHistory");

const newPaymentThroughBillRegistration = async (req, res, next) => {
  try {
    const {
      transaction_date = "",
      payment_type = "",
      description = "",
      amount = "",
      retailer_id = "",
      bill_id = "",
      order_id = "",
    } = req.body;
    const value = {
      transaction_date,
      payment_type,
      description,
      amount,
      retailer_id,
      bill_id,
      order_id,
    };
    const payment = await PaymentHistory.create(value);
    if (!payment) {
      return next(globalError(500, "Something went wrong"));
    }
    await payment.save();
    const { history_deleted, ...otherData } = payment.toJSON();
    return next();
  } catch (error) {
    next(globalError(500, error.message));
  }
};

module.exports = { newPaymentThroughBillRegistration };
