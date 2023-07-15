const express = require('express');
const bodyParder = require ('body-parser');
const mongoose = require("mongoose");

const placesRoutes = require('./routes/places-routes');
const userRoutes = require('./routes/user-routes');

const HttpError = require('./model/http-error');
const { AxiosError } = require('axios');

const app = express();

app.use(bodyParder.json())


app.use('/api/places',placesRoutes);

app.use('/api/users',userRoutes);

app.use((req,res, next)=>{
const error = new HttpError('Could not find route', 404);
throw error;
});

//Only executes on request that have an error attached 
app.use((error ,req,res,next )=>{
if(res.headerSent){
    return next(error)
}
res.status(error.code || 500);
res.json({message: error.message || 'An unknown error occured'});
})

mongoose
  .connect(
    "mongodb+srv://hannahosibodu68:AAQTFyw7hschIcJS@cluster0.yertzeh.mongodb.net/locationapp?retryWrites=true&w=majority"
  )
  .then(() => {
    app.listen(3000);
    console.log("Connected to database");
  })
  .catch((err) => {
    console.log(err);
  });
