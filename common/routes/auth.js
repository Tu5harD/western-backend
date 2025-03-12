const express = require('express')
const { isLoginUserExistsByType } = require('../middleware/auth/isLoginUserExistsByType')
const { isAuthUserDeleted } = require('../middleware/auth/isAuthUserDeleted')
const { userLogin } = require('../components/auth/login')
const router = express.Router()

router.post('/login', isLoginUserExistsByType, isAuthUserDeleted, userLogin)

module.exports = router
