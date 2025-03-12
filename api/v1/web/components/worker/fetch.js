const { Op } = require("sequelize");
const Worker = require("../../../../../model/worker/worker");
const { globalError } = require("../../../../../errors/globalError");

const getAllWorker = async (req, res, next) => {
  try {
    const { pageIndex = 1, pageSize = 10, query = "", status } = req.query;

    const condition = {
      [Op.and]: [{ worker_deleted: false }],
    };

    if (status === "true" || status === "false") {
      condition.vendor_status = status;
    }

    if (query.startsWith("#")) {
      condition[Op.and].push({ worker_id: Number(query.split("#")[1]) });
    } else {
      condition[Op.and].push({
        [Op.or]: [
          {
            worker_name: {
              [Op.like]: `%${query}%`,
            },
          },
        ],
      });
    }

    const worker = await Worker.findAndCountAll({
      where: {
        ...condition,
      },
      limit: +pageSize,
      offset: (+pageIndex - 1) * +pageSize,

    });
    if (worker?.rows.length === 0) {
      return res.status(200).json({
        success: true,
        total: 0,
        data: [],
        message: "Worker not Created",
      });
    }
    const data = worker?.rows.map((obj) => {
      const { worker_deleted, ...otherData } = obj.toJSON();
      return otherData;
    });
    return res.status(200).json({ success: true, total: worker.count, data });
  } catch (error) {
    next(globalError(500, error.message));
  }
};

const getWorkerById = async (req, res, next) => {
  try {
    const { worker_id } = req.body;
    const condition = {
      [Op.and]: [{ worker_deleted: false }],
    };

    const worker = await Worker.findOne({
      where: {
        ...condition,
        worker_id: worker_id,
      },
    });
    if (!worker) {
      return res.status(200).json({
        success: true,
        total: 0,
        data: [],
        message: "Worker not Created",
      });
    }

    const { worker_deleted, ...otherData } = worker.toJSON();
    return res.status(200).json({ success: true, data: otherData });
  } catch (error) {
    next(globalError(500, error.message));
  }
};

module.exports = { getAllWorker, getWorkerById };

