const express = require("express");
const { isLoggedIn } = require("../controllers/authController");
const { pawsInformation, addEmergency, addFeed } = require("../controllers/navigationController");

const router = express.Router();

router.get("/pawsInformation",isLoggedIn,pawsInformation);
router.post("/addEmergency",isLoggedIn,addEmergency);
router.post("/addFeed",isLoggedIn,addFeed);


module.exports = router;