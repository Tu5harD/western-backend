const toLowerCase = (value) => {
    return String(value).replace(/\s+/g, ' ').toLowerCase()
}

module.exports = { toLowerCase }