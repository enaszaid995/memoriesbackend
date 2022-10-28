const express = require('express');
const router = express.Router();
const placeController = require('../controller/places-controller');
const {check} = require('express-validator');
const checkAuth=require('../middleware/checkAuth');
const fileUpload = require('../middleware/fileUpload');
router.get('/:pid', placeController.getPlaceById);

router.get('/user/:uid',placeController.getPlaceByUserId);
router.use(checkAuth);
router.post('/',fileUpload.single('image'),[check('title').not().isEmpty(), 
                 check('description').isLength({min:5}),
                 check('address').not().isEmpty()],
                 placeController.createPlace
            );
router.patch('/:pid', [check('title').not().isEmpty(),
                       check('description').isLength({min:6}),
                        // check('email').normalizeEmail().isEmail()],
                        // check('password').isLength({min:6}),
                        ], placeController.updatePlace
            );
router.delete('/:pid', placeController.deletePlace);
module.exports=router;