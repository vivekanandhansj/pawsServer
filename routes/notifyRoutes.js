const express = require("express");
const { isLoggedIn } = require("../controllers/authController");
const { notificationList, emergencyList } = require("../controllers/notifyController");
const router = express.Router();

router.get("/notificationList",isLoggedIn,notificationList);

router.get("/emergencyList",isLoggedIn,emergencyList);

module.exports = router;