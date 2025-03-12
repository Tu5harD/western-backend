const { globalError } = require("../../../errors/globalError");

const isWorkerDeleted = async (req, res, next) => {
  try {
    const { worker_deleted } = req.worker;
    if (worker_deleted) {
      return next(globalError(406, "Worker has been already deleted"));
    } else {
      return next();
    }
  } catch (error) {
    return next(globalError(500, error.message));
  }
};

module.exports = { isWorkerDeleted };
