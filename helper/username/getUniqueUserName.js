const generateUniqueUsername = require("./generateUniqueUserName");
const isUserNameUnique = require("./isUserNameUnique");

const getUniqueUsername = async (type, tableName) => {
    let username = generateUniqueUsername(type);
    while (!(await isUserNameUnique(username, tableName))) {
        username = generateUniqueUsername(type);
    }

    return username;
}

module.exports = getUniqueUsername
