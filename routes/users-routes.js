const express = require('express');
const router = express.Router();
const fileUpload = require('../middleware/fileUpload');
const userController = require('../controller/users-controller');
const {check} = require('express-validator');
router.get('/', userController.getAllUser);
router.post('/signUp',fileUpload.single('image'),userController.signUp);
router.post('/login',userController.logIn);
module.exports=router;