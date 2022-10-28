const express = require('express');
const bodyParser=require('body-parser');
const app = express();
const cors = require('cors')
const mongoose = require('mongoose');
const placesRoutes=require('./routes/places-routes');
const usersRoutes =require('./routes/users-routes');
const fs =require('fs');
const path =require('path');
app.use(cors())
app.use(bodyParser.json());
app.use('/uploads/images',express.static(path.join('uploads','images')));
app.use((req,res,next)=>{
    res.setHeader("Access-Control-Allow-Origin",'*');
    res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With,Content-Type, Accept, Authorization");
    res.setHeader('Access-Control-Allow-Methodes','GET , POST , PATCH , DELETE');
    next();

})
app.use('/api/users',usersRoutes);
app.use('/api/places',placesRoutes);

app.use((error , req ,res, next)=>{
    if(req.file){
        fs.unlink(req.file.path, err => {
            console.log(err);
          });
    }
    if(res.headerSent){
        return next(error)
    }
    res.status(error.code || 500);
    res.json({
        message : error.message || ' Unknown error occured'
    });
})

mongoose.connect(`mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.vtlqonc.mongodb.net/?retryWrites=true&w=majority`).then(()=>{
    app.listen(5000);
}).catch(error => console.log(error));
