const uuid = require('uuid');
const fs=require('fs');
const User = require('../model/user');
const HttpError = require('../model/http-error');
const bcrypt=require('bcryptjs');
const {validationResult} =require('express-validator')
const jwt = require('jsonwebtoken')


const getAllUser =async(req, res, next)=>{
    let users;
    try{
        users = await User.find({} , '-password');
    }catch(error){
        return next(new HttpError('Something Went Wrong!'),404);
    }
   
    res.json({users:users.map(user => user.toObject({getters:true}))});
}

const signUp = async(req , res, next)=>{
    // const errors =validationResult(req);
    // if(!errors.isEmpty()){
    //     return next(new HttpError('Validation Error in create Post'),422);
    // }
    const {name , email , password } = req.body;
    let existingUser;
    try{
        existingUser = await User.findOne({email:email});
    }catch(error){
        return next(error)
    }
    if(existingUser){
        return next(new HttpError('You SignUp Already',422))
    }
    let hashedPassword;
    try{
        hashedPassword=await bcrypt.hash(password,12)
    }catch(error){
        return next(error)
    }
    const createdUser =new User({
        name,
        image:req.file.path,
        email,
        password:hashedPassword,
        places:[]
    });
    try{
        await createdUser.save();
    }catch(error){
        return next(new HttpError('Something Went Wrong!'),404)
    }
    let token;
    try{
        token = jwt.sign({userId:createdUser.id,
                          email:createdUser.email},
                          process.env.TOKEN_STR,
                          {expiresIn:'1h'})
    }catch(err){
        return next(err);
    }
    // const hasEmail = DUMMY_USERS.find(user =>user.email === email);
    // if(hasEmail){
    //     return next(new HttpError('You have Account with the same email', 401));
    // }
    // DUMMY_USERS.push(createdUser);
    // res.status(201).json({users:createdUser});
    // res.status(201).json({user:createdUser.toObject({getters:true})});
    res.status(201).json({userId:createdUser.id , email:createdUser.email ,token:token});
}

const logIn =async(req , res,next)=>{
    const {email, password} = req.body;
    let existingUser;
    
    try{
        existingUser = await User.findOne({email:email});
        console.log(existingUser.email)
    }catch(error){
        return next(new HttpError('Users Not Found!'),404);
    }
    let isValidPassword=false;
    try{
        isValidPassword=await bcrypt.compare(password,existingUser.password);

    }catch(error){
        return next(new HttpError('Password not Correct!'),404)
    }
    if(!existingUser){
        return next(new HttpError('USer Not Found!'),404)
    }
    if(!isValidPassword){
        return next(new HttpError('Uncorrect Password!'),404)
    }
    let token;
    try{
        token = jwt.sign({userId:existingUser.id,
                          email:existingUser.email},
                          process.env.TOKEN_STR,
                          {expiresIn:'1h'})
    }catch(err){
        return next(new HttpError('Login Failed!'),404);
    }
    //.status(200).json({user:existingUser,message:'Login Success'});
    // const identifiedUser = DUMMY_USERS.find( user => user.email === email);
    // if(!identifiedUser || identifiedUser.password !== password){
    //     return next(new HttpError('Login Failed', 404));
    // }
    //res.status(201).json({user:existingUser.toObject({getters:true}),message:"Success Login"});
    res.status(201).json({userId:existingUser.id , email:existingUser.email ,token:token});
}


exports.getAllUser= getAllUser;
exports.signUp = signUp;
exports.logIn = logIn;