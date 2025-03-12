const { Op } = require("sequelize");
const WorkerAttedance = require("../../../../../model/worker/workerAttendance");
const { globalError } = require("../../../../../errors/globalError");

const getMonthlyAttendanceById = async (req, res, next) => {
  try {
    const { worker_id, month } = req.body;

    const [year, monthNumber] = month.split("-");
    const startOfMonth = new Date(`${year}-${monthNumber}-01`);
    const endOfMonth = new Date(startOfMonth);
    endOfMonth.setMonth(endOfMonth.getMonth() + 1);

    const condition = {
      worker_id: +worker_id,
      [Op.or]: [{ worker_attended: "present" }, { worker_attended: "halfday" }],
      date: {
        [Op.between]: [startOfMonth, endOfMonth],
      },
    };
    const workerMonthlyAttendance = await WorkerAttedance.findAndCountAll({
      where: {
        ...condition,
      },
    });
    if (workerMonthlyAttendance?.rows.length === 0) {
      return res.status(200).json({
        success: true,
        total: 0,
        data: 0,
        message: "Worker Attendance not Created",
      });
    }
    const data = workerMonthlyAttendance?.rows.map((obj) => {
      const { ...otherData } = obj.toJSON();
      return otherData;
    });
    return res.status(200).json({
      success: true,
      data: workerMonthlyAttendance.count,
      startOfMonth,
      endOfMonth,
    });
  } catch (error) {
    next(globalError(500, error.message));
  }
};

module.exports = { getMonthlyAttendanceById };
