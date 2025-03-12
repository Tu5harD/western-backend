const toUpperCase = (value) => {
    return String(value).replace(/\s+/g, ' ').toUpperCase()
}

module.exports = { toUpperCase }