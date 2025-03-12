const Admin = require("../../model/admin")
// const Department = require("../../model/department")
// const Employee = require("../../model/employee/employee")
// const Guard = require("../../model/guard")

const isUsernameUnique = async (username, tableName) => {
    const userColumn = (String(tableName).toLowerCase() + "_username")
    let condition = {}
    condition[userColumn] = username
    let existingUser
    if (tableName === 'Admin') {
        existingUser = await Admin.findOne({
            where: {
                ...condition
            },
        });
    // } else if (tableName === 'Guard') {
    //     existingUser = await Guard.findOne({
    //         where: {
    //             ...condition
    //         },
    //     });
    // } else if (tableName === 'Employee') {
    //     existingUser = await Employee.findOne({
    //         where: {
    //             ...condition
    //         },
    //     });
    // } else if (tableName === 'Department') {
    //     existingUser = await Department.findOne({
    //         where: {
    //             ...condition
    //         },
    //     });
    }

    // If no user with the same username is found, it's unique
    return !existingUser;
}

module.exports = isUsernameUnique
