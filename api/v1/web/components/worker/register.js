const { globalError } = require("../../../../../errors/globalError");
const Worker = require("../../../../../model/worker/worker");

const newWorkerRegistration = async (req, res, next) => {
  try {
    const { worker_name, worker_mobile, worker_address } = req.body;
    const value = {
      worker_name,
      worker_mobile,
      worker_address,
    };
    const worker = await Worker.create(value);
    if (!worker) {
      return next(globalError(500, "Something went wrong"));
    }
    await worker.save();
    const { worker_deleted, ...createdWorker } = worker.toJSON();
    return res.status(201).json({
      success: true,
      data: createdWorker,
      message: `Worker successfully created`,
    });
  } catch (error) {
    next(globalError(500, error.message));
  }
};

module.exports = { newWorkerRegistration };
