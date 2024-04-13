var express = require('express');
var router = express.Router();
var controller = require('../controller/account_controller')
var controllerAdmin = require("../controller/Admin/account_controller")

router.post('/getAccount',controller.getAccount); 
router.post('/getAccountById',controller.getAccountById); 
router.post("/getInforAccount",controller.getInforAccount); // chua









router.post("/checkAccountName",controller.checkAccountName);

router.get('/getFullAccount',controllerAdmin.getFullAccount);   // ok
router.patch('/updateAccountRole',controllerAdmin.updateAccountRole);    // ok

router.post('/login',controller.login)
router.post('/register',controller.register)
router.post('/getAccount',controller.getAccount)
router.post('/checkEmail',controller.checkEmail)
router.post('/forgotPassword',controller.forgotPassword)
router.post('/resetPassword',controller.resetPassword)


module.exports = router;