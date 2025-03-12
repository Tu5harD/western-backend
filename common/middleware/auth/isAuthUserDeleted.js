const role = require("../../../constants/role")
const { globalError } = require("../../../errors/globalError")

const isAuthUserDeleted = async (req, res, next) => {
    try {
        const { username } = req.body
        if (req.user[String(role[username.split('-')[0]].label).toLowerCase() + '_deleted']) {
            return next(globalError(401, 'You have been deleted'))
        } else if (!req.user[String(role[username.split('-')[0]].label).toLowerCase() + '_status']) {
            return next(globalError(401, 'You have been in-activated by admin'))
        } else {
            return next()
        }
    } catch (error) {
        return next(globalError(500, error.message))
    }
}

module.exports = { isAuthUserDeleted }