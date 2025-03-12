const { globalError } = require("../../../../../errors/globalError");
const Retailer = require("../../../../../model/retailer/retailer");

const deleteRetailerByRetailerId = async (req, res, next) => {
  try {
    const { retailer_id } = req.body;
    const value = {
      retailer_deleted: true,
    };
    const deletedRetailer = await Retailer.update(value, {
      where: {
        retailer_id,
      },
    });
    if (deletedRetailer[0] === 0) {
      return next(globalError(404, "Retailer not deleted"));
    }
    return res
      .status(200)
      .json({ success: true, message: "Retailer successfully deleted" });
  } catch (error) {
    return next(globalError(500, error.message));
  }
};

module.exports = { deleteRetailerByRetailerId };
