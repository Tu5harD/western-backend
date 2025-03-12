const generateUniqueNumber = (type) => {
    const randomNumber = Math.floor(Math.random() * 1000000);
    return randomNumber;
}

module.exports = generateUniqueNumber
