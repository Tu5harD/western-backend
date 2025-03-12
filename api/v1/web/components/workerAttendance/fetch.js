const { Op } = require("sequelize");
const WorkerAttedance = require("../../../../../model/worker/workerAttendance");
const Worker = require("../../../../../model/worker/worker");
const { globalError } = require("../../../../../errors/globalError");

const getWorkerAttendanceById = async (req, res, next) => {
  try {
    const { worker_id, month, pageIndex = 1, pageSize = 10 } = req.body;

    const [year, monthNumber] = month.split("-");
    const startOfMonth = new Date(`${year}-${monthNumber}-01`);
    const endOfMonth = new Date(startOfMonth);
    endOfMonth.setMonth(endOfMonth.getMonth() + 1, 0);

    const workerAttendance = await WorkerAttedance.findAndCountAll({
      where: {
        worker_id: +worker_id,
        date: {
          [Op.between]: [startOfMonth, endOfMonth],
        },
      },
      include: [
        {
          model: Worker,
          attributes: ["worker_name"],
          where: { worker_id: +worker_id },
        },
      ],
      limit: +pageSize,
      offset: (+pageIndex - 1) * +pageSize,
    });
    if (workerAttendance?.rows.length === 0) {
      return res.status(200).json({
        success: true,
        total: 0,
        data: [],
        message: "Worker Attendance not Created",
      });
    }
    const data = workerAttendance?.rows.map((obj) => {
      const { ...otherData } = obj.toJSON();
      return otherData;
    });
    return res
      .status(200)
      .json({ success: true, total: workerAttendance.count, data });
  } catch (error) {
    next(globalError(500, error.message));
  }
};

module.exports = { getWorkerAttendanceById };
