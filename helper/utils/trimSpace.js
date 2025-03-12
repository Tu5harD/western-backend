const trimSpace = (value) => {
    if (value === '' || value === null || value === undefined)
        return null
    else
        return String(value).replace(/\s+/g, ' ').trim()
}

module.exports = { trimSpace }