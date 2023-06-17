const express = require("express");

const placesController = require('../controllers/places-controllers');


const router = express.Router();

router.get("/:pid", placesController.getPlaceById);

router.get("/user/:uid", placesController.getPlacesByUserId);

router.post('/', placesController.createPlace)

// router.patch('/:pid', (req, res,next)=>{
//     console.log('PATCH Request in places')
//     res.json({message:"it works"})
// })

// router.delete('/:pid', (req, res,next)=>{
//     console.log('DELETE Request in places')
//     res.json({message:"it works"})
// })

module.exports = router;
