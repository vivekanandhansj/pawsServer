const express = require('express');
const router = express.Router();
const multer = require('multer');
const authController = require('../controllers/authController');

const storage = multer.memoryStorage(); // Store file in memory
const upload = multer({
  storage: storage,
  limits: { fileSize: 1 * 1024 * 1024, 
            fieldSize: 50 * 1024 * 1024 }
});
router.post('/signup', upload.single('uImgData'),authController.signupUser);

router.post('/login', authController.loginUser);

router.post('/updateLocation', authController.updateLocation);

router.post('/logout', authController.logout);

module.exports = router;