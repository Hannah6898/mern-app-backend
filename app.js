const express = require('express');
const bodyParder = require ('body-parser');

const placesRoutes = require('./routes/places-routes');
const userRoutes = require('./routes/user-routes');

const app = express();

app.use(bodyParder.json())

app.use('/api/places',placesRoutes);

// app.use('api/users',userRoutes);

//Only executes on request that have an error attached 
app.use((error ,req,res,next )=>{
if(res.headerSent){
    return next(error)
}
res.status(error.code || 500);
res.json({message: error.message || 'An unknown error occured'});
})

app.listen(3000);