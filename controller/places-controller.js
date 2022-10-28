const uuid = require('uuid');
const fs=require('fs');
const {validationResult} = require('express-validator');
const getCoordsForAddress = require('../util/location');
const Place = require('../model/place');
const User = require('../model/user')

const HttpError =require('../model/http-error');
const mongoose = require('mongoose')
 const getPlaceById =async (req, res, next)=>{
    const placeId = req.params.pid;
    let place;
    try{
        place = await Place.findById(placeId);
    }catch(error){
        return next(new HttpError('Something went wrong'),404)
    }
    // const place = DUMMY_PLACES.find(p => {
    //     return p.id === placeId;
    // });
    if(!place){
        return next(new HttpError('Can not find place' , 404));
    }
    res.json({place:place.toObject({getters:true})});

}

const getPlaceByUserId = async(req, res, next)=>{
    const userID = req.params.uid;
    let places;
    try{
        places = await Place.find({creator:userID});
    }catch(error){
        return next(new HttpError('Get places Failed!'),404)
    }
    // const place = DUMMY_PLACES.find(p => {
    //     return p.creator === userID;
    // });
    if(!places || places.length === 0){
        return next(new HttpError('Can not find place' , 404));
    }
    res.json({places:places.map(place=>place.toObject({getters:true}))});

}

const createPlace= async(req,res,next)=>{
    const errors =validationResult(req);
    if(!errors.isEmpty()){
        return next(new HttpError('Validation Error in create Post'),422);
    }
 const {title , description  , address } = req.body;
 let coordinates;
 try{
    coordinates = await getCoordsForAddress(address);
 }catch(error){
    return next(new HttpError(error.message,422));
 }
 const createdPlace = new Place({
    title,
    description , 
    location:coordinates,
    address,
    image:req.file.path,
    creator:req.userData.userId
 });
 //DUMMY_PLACES.push(createPlace);
 let user;
 try{
    user = await User.findById(req.userData.userId);
 }catch (error){
    return next(new HttpError('Something Failed in find user!'),404)
 }
 try{
    const sess = await mongoose.startSession();
    sess.startTransaction();
    await createdPlace.save({session:sess});
    await user.places.push(createdPlace);
    await user.save({session:sess});
    await sess.commitTransaction();
 }catch(error){
        return next(new HttpError('Creayt place Failed!'),404)
 }
 
 res.status(201).json({createdPlace});
}
const updatePlace = async(req, res , next)=>{
    const {title , description} =req.body;
     const placeId = req.params.pid;
    let place;
    try{
        place = await Place.findById(placeId);
    }catch(error){
        return next(new HttpError('Can not find place!'),404)
    }
    if(place.creator.toString() !== req.userData.userId){
        return next('Not Allowed to Edit!')
    }
    place.title = title;
    place.description = description;
    try{
       await place.save();
    }catch(error){
        return next(new HttpError('Update Failed!'),404)
    }

//  const updatedPlace = {...DUMMY_PLACES.find(p => p.id === placeId)};
//  const placeIndex = DUMMY_PLACES.findIndex(p =>p.id === placeId);
//  updatedPlace.title = title;
//  updatedPlace.description = description;
 const errors =validationResult(req);
    if(!errors.isEmpty()){
        return next(new HttpError('Validation Error in update Post'),422);
    }
//  DUMMY_PLACES[placeIndex] = updatedPlace;
//  res.status(201).json({place:updatedPlace});
res.status(200).json({place:place.toObject({getters:true})});
}

const deletePlace = async(req, res , next)=>{
    const placeId = req.params.pid;
    let place;
    try{
        place = await Place.findById(placeId).populate('creator');
        
    }catch(error){
        return next(new HttpError('Find Place by Id Failed!'),404)
    }
    if(!place){
        return next(new HttpError('Find place to delete it Failed!'),404)
    }
    if(place.creator.id !== req.userData.userId){
        return next('Not Allowed to delete!')
    }
    const imagePath=place.image;
    try{
        const sess = await mongoose.startSession();
        sess.startTransaction();
        await place.remove({session:sess});
        await place.creator.places.pull(place);
        await place.creator.save({session:sess});
        await sess.commitTransaction();
        
      
    }catch(error){
        return next(new HttpError('Delete Failed!'),404)
    }
    // DUMMY_PLACES = DUMMY_PLACES.filter(p => p.id !== placeId);
    // res.status(201).json({DUMMY_PLACES});
    fs.unlink(imagePath)
    res.status(200).json({message:'Success Deleted'});
}
exports.getPlaceById = getPlaceById;
exports.getPlaceByUserId =getPlaceByUserId;
exports.createPlace = createPlace;
exports.updatePlace = updatePlace;
exports.deletePlace = deletePlace;