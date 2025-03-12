const { globalError } = require("../../../../../errors/globalError");
const Worker = require("../../../../../model/worker/worker");

const updateWorkerDetailsByWorkerId = async (req, res, next) => {
  try {
    const {
      worker_name,
      worker_mobile,
      worker_address,
      worker_status,
      worker_id,
    } = req.body;

    const value = {
      worker_name,
      worker_mobile,
      worker_address,
      worker_status,
      worker_id,
    };

    const worker = await Worker.update(value, {
      where: {
        worker_id,
      },
    });

    if (worker[0] === 0) {
      return next(globalError(404, "Worker not found"));
    }
    return res
      .status(200)
      .json({ success: true, message: "Worker successfully updated" });
  } catch (error) {
    next(globalError(500, error));
  }
};

module.exports = { updateWorkerDetailsByWorkerId };
