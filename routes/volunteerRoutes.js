const express = require('express');
const router = express.Router();
const volunteerController = require('../controllers/volunteerController');
const authController = require('../controllers/authController');


router.get('/volunteerList',authController.isLoggedIn,volunteerController.volunteerList);

router.get('/volunteerInfo',authController.isLoggedIn,volunteerController.volunteerInfo);

router.get('/setting',authController.isLoggedIn,volunteerController.setting);

router.get('/settingInfo',authController.isLoggedIn,volunteerController.settingInfo);

router.put('/settingEdit',authController.isLoggedIn,volunteerController.settingEdit);
module.exports = router;