const toLowerCaseOrNull = (value) => {
    if (value === '' || value === null || value === undefined)
        return null
    else
        return String(value).toLowerCase()
}

module.exports = { toLowerCaseOrNull }