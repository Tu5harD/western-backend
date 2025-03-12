const { globalError } = require("../../../../../errors/globalError");
const Challan = require("../../../../../model/challan/challan");
const ChallanList = require("../../../../../model/challan/challanList");
const { Sequelize, sequelize } = require("../../../../../config/database");

const newChallanRegistration = async (req, res, next) => {
  try {
    let value = {
      retailer_id: req?.body?.retailer_id,
      vendor_id: req?.body?.vendor_id,
      challan_no: req?.body?.challan_no,
      delivery_date: req?.body?.delivery_date,
      invoice_date: req?.body?.invoice_date,
      transporter_name: req?.body?.transporter_name,
      vehicle_no: req?.body?.vehicle_no,
      freight: req?.body?.freight,
      packaging: req?.body?.packaging,
    };

    const createdOrder = await Challan.create(value);

    if (!createdOrder) {
      return next(globalError(405, `Order did not created`));
    } else {
      req.orders = {
        ...value,
        status: "pending",
        challan_id: createdOrder.challan_id,
      };
      return next();
    }
  } catch (error) {
    next(globalError(500, error.message));
  }
};

const challanListRegister = async (req, res, next) => {
  try {
    const { quantity = [] } = req.body;

    const orderListData = req.productList.map((item, index) => {
      return {
        quantity: quantity[index],
        challan_id: req?.orders.challan_id,
        product_id: item.id,
        price: item.price,
        stock_id: item.stock_id,
      };
    });

    const createdOrderList = await ChallanList.bulkCreate(orderListData);

    if (!createdOrderList || createdOrderList.length === 0) {
      return next(globalError(405, `Order list did not create`));
    } else {
      return res.status(200).json({ message: "Challan Successfully Created" });
    }
  } catch (error) {
    const t = await sequelize.transaction();
    try {
      await Challan.destroy({
        where: { challan_id: req?.orders.challan_id },
        transaction: t,
      });
      await t.commit();
    } catch (rollbackError) {
      await t.rollback();
    }
    return next(globalError(500, error.message));
  }
};

module.exports = { newChallanRegistration, challanListRegister };
