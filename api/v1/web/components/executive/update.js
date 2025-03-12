const { globalError } = require("../../../../../errors/globalError");
const Executive = require("../../../../../model/executive/executive");

const updateExecutiveDetailsByExecutiveId = async (req, res, next) => {
  try {
    const {
      executive_name,
      executive_mobile,
      executive_status,
      executive_address,
      executive_id,
    } = req.body;

    const value = {
      executive_name,
      executive_mobile,
      executive_status,
      executive_address,
    };

    const executive = await Executive.update(value, {
      where: {
        executive_id,
      },
    });

    if (executive[0] === 0) {
      return next(globalError(404, "Executive not found"));
    }
    return res
      .status(200)
      .json({ success: true, message: "Executive successfully updated" });
  } catch (error) {
    next(globalError(500, error));
  }
};

const updateExecutiveTarget = async (req, res, next) => {
  try {
    const { executive_target, executive_id } = req.body;

    const value = {
      executive_target,
    };

    const executive = await Executive.update(value, {
      where: {
        executive_id,
      },
    });

    if (executive[0] === 0) {
      return next(globalError(404, "Executive not found"));
    }
    return res
      .status(200)
      .json({ success: true, message: "Executive Target successfully Set" });
  } catch (error) {
    next(globalError(500, error));
  }
};

module.exports = { updateExecutiveDetailsByExecutiveId, updateExecutiveTarget };
