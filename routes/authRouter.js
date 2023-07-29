const router = require('express').Router()
const authCtrl = require('../controllers/authController')

router.post('/register',authCtrl.register)
router.post('/verify/email',authCtrl.verifyEmail)
router.post('/login',authCtrl.login)
router.post('/logout',authCtrl.logout)
router.post('/refresh_token',authCtrl.generateAccessToken)
router.post('/forgot/pass',authCtrl.forgotPassword)
router.put('/reset/password',authCtrl.resetPass)

module.exports = router