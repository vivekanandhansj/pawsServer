const express = require('express');
const router = express.Router();
const multer = require('multer');
const dogController = require('../controllers/dogController');
const authController = require('../controllers/authController');

const storage = multer.memoryStorage(); // Store file in memory
const upload = multer({
  storage: storage,
  limits: { fileSize: 1 * 1024 * 1024, 
            fieldSize: 50 * 1024 * 1024 }
});

router.post('/addDog',upload.single('dImgData'),authController.isLoggedIn,dogController.addDog);

router.get('/dogList',authController.isLoggedIn,dogController.dogList);

router.get('/dogInfo',authController.isLoggedIn,dogController.dogInfo);

router.post('/dogEdit',authController.isLoggedIn,dogController.dogEdit);

module.exports = router;