const { Op } = require("sequelize");
const WorkerAttedance = require("../../../../../model/worker/workerAttendance");
const { globalError } = require("../../../../../errors/globalError");

const getTotalAttendanceById = async (req, res, next) => {
  try {
    const { worker_id } = req.body;
    const condition = {
      worker_id: worker_id,
    };

    const workerTotalAttendance = await WorkerAttedance.findAndCountAll({
      where: {
        ...condition,
        [Op.or]: [
          { worker_attended: "present" },
          { worker_attended: "halfday" },
        ],
      },
    });

    return res
      .status(200)
      .json({ success: true, data: workerTotalAttendance.count });
  } catch (error) {
    next(globalError(500, error.message));
  }
};

module.exports = { getTotalAttendanceById };
