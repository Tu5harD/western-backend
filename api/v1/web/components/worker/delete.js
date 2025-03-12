const { globalError } = require("../../../../../errors/globalError");
const Worker = require("../../../../../model/worker/worker");

const deletedWorkerByWorkerId = async (req, res, next) => {
  try {
    const { worker_id } = req.body;
    const value = {
      worker_deleted: true,
    };
    const deletedWorker = await Worker.update(value, {
      where: {
        worker_id,
      },
    });
    if (deletedWorker[0] === 0) {
      return next(globalError(404, "Worker not deleted"));
    }
    return res
      .status(200)
      .json({ success: true, message: "Worker successfully deleted" });
  } catch (error) {
    return next(globalError(500, error.message));
  }
};

module.exports = { deletedWorkerByWorkerId };
