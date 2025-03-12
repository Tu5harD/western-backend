const generateUniqueUsername = (type) => {
    const randomUsername = String(type).toUpperCase().trim() + '-' + Math.floor(Math.random() * 1000000);
    return randomUsername;
}

module.exports = generateUniqueUsername
