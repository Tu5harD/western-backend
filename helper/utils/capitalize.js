
const capitalize = (value) => {
    if (value === null || value === undefined || value === '')
        return null
    else
        return String(value).charAt(0).toUpperCase() + String(value).slice(1);
}

module.exports = { capitalize }