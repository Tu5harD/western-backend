const { Op } = require("sequelize");
const { globalError } = require("../../../../../errors/globalError");
const Admin = require("../../../../../model/admin");


const getAllAdmin = async (req, res, next) => {
    try {
        const { pageIndex = 1, pageSize = 10, query = '', status = '' } = req.body
        const condition = {
            [Op.and]: [
                { admin_deleted: false }
            ],

        };
        if (status === true) {
            condition[Op.and].push({ admin_status: true });
        } else if (status === false) {
            condition[Op.and].push({ admin_status: false });
        }

        if (query) {
            condition[Op.and].push({
                [Op.or]: [
                    {
                        admin_name: {
                            [Op.like]: `%${query}%`,
                        },
                    }
                ],
            })
        }

        const admins = await Admin.findAndCountAll({
            where: { ...condition },
            limit: pageSize,
            offset: (pageIndex - 1) * pageSize
        });
        if (admins.rows.length === 0) {
            return res.status(200).json({ success: true, total: 0, data: [] })
        }
        const data = admins.rows.map((item) => {
            const { password, admin_deleted, ...otherDetails } = item.toJSON()
            return otherDetails
        })
        return res.status(200).json({ success: true, total: admins.count, data })
    } catch (error) {
        next(globalError(500, error.message))
    }
}

module.exports = { getAllAdmin }