const generateUniqueNumber = require("./generateUniqueUserName");
const isNumberUnique = require("./isUserNameUnique");

const getUniqueNumber = async (type, tableName) => {
    let number = generateUniqueNumber(type);
    while (!(await isNumberUnique(number, tableName))) {
        number = generateUniqueNumber(type);
    }

    return number;
}

module.exports = getUniqueNumber
