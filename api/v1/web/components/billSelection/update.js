const { globalError } = require("../../../../../errors/globalError");
const BillSelected = require("../../../../../model/billSelection/billSelection");

const updateBillSelection = async (req, res, next) => {
  try {
    const { bill_value } = req.body;

    const value = {
      bill_selected: bill_value,
    };

    const updateBillSelection = await BillSelected.update(value, {
      where: {
        bill_selected_id: 1,
      },
    });

    if (updateBillSelection[0] === 0) {
      return next(globalError(404, "bill not found"));
    }
    return res
      .status(200)
      .json({ success: true, message: "Bill Format successfully updated" });
  } catch (error) {
    next(globalError(500, error));
  }
};

module.exports = { updateBillSelection };
