const express = require('express');
const router = express.Router();
const { isLoggedIn } = require("../controllers/authController");
const { dashboardCounts, dashboardWeekReport } = require('../controllers/dashboardController');

router.get("/dashboardCounts",isLoggedIn,dashboardCounts);

router.get("/dashboardWeekReport",isLoggedIn,dashboardWeekReport);

module.exports = router;