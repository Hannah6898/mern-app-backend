const mongoose = require("mongoose");

//This is our data schema
const placeSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  image: { type: String, required: true },
  address: { type: String, required: true },
  location: {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true },
  },
  //Adding this to the schema tells Mongoose that this id is the object id from the User schema 
  creator: { type: mongoose.Types.ObjectId, required: true, ref:'User' },
});

module.exports = mongoose.model("Place", placeSchema);
