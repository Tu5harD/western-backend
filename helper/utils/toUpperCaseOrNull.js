const toUpperCaseOrNull = (value) => {
    if (value === null || value === undefined || value === '')
        return null
    else
        return String(value).toUpperCase()
}

module.exports = { toUpperCaseOrNull }