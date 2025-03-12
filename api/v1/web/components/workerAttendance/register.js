const { globalError } = require("../../../../../errors/globalError");
const WorkerAttedance = require("../../../../../model/worker/workerAttendance");

const WorkerAttendanceRegistration = async (req, res, next) => {
  try {
    const { worker_id, worker_attended, reason = "", date } = req.body;
    const value = {
      worker_id: +worker_id,
      worker_attended,
      reason,
      date,
    };

    const found = await WorkerAttedance.findOne({
      where: { worker_id: +worker_id, date: new Date(date) },
    });

    if (found) {
      const updatedAttendance = await WorkerAttedance.update(
        { worker_attended, reason },
        {
          where: { worker_id: +worker_id, date: new Date(date) },
        }
      );
      return res.status(201).json({
        success: true,
        data: updatedAttendance,
        message: `Worker Attendance successfully Marked`,
      });
    }
    const workerAttendance = await WorkerAttedance.create(value);
    if (!workerAttendance) {
      return next(globalError(500, "Something went wrong"));
    }
    await workerAttendance.save();
    const { ...createdWorkerAttendance } = workerAttendance.toJSON();
    return res.status(201).json({
      success: true,
      data: createdWorkerAttendance,
      message: `Worker Attendance successfully Marked`,
    });
  } catch (error) {
    next(globalError(500, error.message));
  }
};

module.exports = { WorkerAttendanceRegistration };
