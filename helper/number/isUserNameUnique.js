
const Employee = require("../../model/employee/employee")

const isNumberUnique = async (number, tableName) => {
    const userColumn = (String(tableName).toLowerCase() + "_number")
    let condition = {}
    condition[userColumn] = number
    let existingUser
    if (tableName === 'Employee') {
        existingUser = await Employee.findOne({
            where: {
                ...condition
            },
        });
    }

    // If no user with the same Number is found, it's unique
    return !existingUser;
}

module.exports = isNumberUnique
