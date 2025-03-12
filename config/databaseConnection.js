const { sequelize } = require("./database");

const dbConnection = async () => {
    try {
        await sequelize.authenticate();
        return true;
    } catch (error) {
        console.log('Error connecting to database:', error);
        return false
    }
}

module.exports = { dbConnection }
