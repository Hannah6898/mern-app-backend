const HttpError = require("../model/http-error");
const { validationResult } = require("express-validator");
const getCoordsforAddress = require("../util/location");
const Place = require("../model/place");
const User = require("../model/user");
const mongoose = require("mongoose");
const fs = require('fs');

const getPlaceById = async (req, res, next) => {
  const placeId = req.params.pid;
  let place;
  try {
    place = await Place.findById(placeId);
  } catch (err) {
    return next(
      new HttpError(
        "Something went wrong! Could not find place for provided place id",
        500
      )
    );
  }
  if (!place) {
    return next(
      new HttpError("Could not find place for provided place id", 404)
    );
  }
  res.status(200).json({ place: place.toObject({ getters: true }) });
};

const getPlacesByUserId = async (req, res, next) => {
  const userId = req.params.uid;
  let places;
  try {
    places = await Place.find({ creator: userId });
  } catch (err) {
    return next(
      new HttpError(
        "Something went wrong! Could not find places by user ID",
        500
      )
    );
  }
  if (!places) {
    return next(
      new HttpError("Could not find places for provided user id", 404)
    );
  }
  res.status(200).json({
    places: places.map((place) => place.toObject({ getters: true })),
  });
};

const createPlace = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(HttpError("Invalid input passed, please check data", 422));
  }
  console.log(req);
  const { title, description, address, creator } = req.body;

  let coordinates;
  try {
    coordinates = await getCoordsforAddress(address);
  } catch (error) {
    return next(error);
  }
  const createdPlace = new Place({
    title: title,
    description: description,
    image: req.file.path,
    address: address,
    location: coordinates,
    creator: creator,
  });

  let user;

  try {
    user = await User.findById(creator);
  } catch (err) {
    return next(new HttpError("Creating place failed, please try again", 500));
  }

  if (!user) {
    return next(new HttpError("Could not find user for provided ID", 404));
  }

  try {
    const sess = await mongoose.startSession();
    sess.startTransaction();
    await createdPlace.save({ session: sess });
    user.places.push(createdPlace);
    await user.save({ session: sess });
    await sess.commitTransaction();
  } catch (err) {
    const error = new HttpError("Creating place failed, please try again", 500);
    return next(error);
  }

  res.status(201).json({ place: createdPlace });
};

const updatePlace = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new HttpError("Invalid input passed, please check data", 422));
  }
  const { title, description } = req.body;
  const placeID = req.params.pid;
  let place;
  try {
    place = await Place.findById(placeID);
  } catch (err) {
    return next(
      new HttpError("Something went wrong! Could not update place", 500)
    );
  }

  place.title = title;
  place.description = description;

  try {
    await place.save();
  } catch (err) {
    return next(
      new HttpError("Something went wrong! Could not update place", 500)
    );
  }

  res.status(200).json({ place: place.toObject({ getters: true }) });
};

const deletePlace = async (req, res, next) => {
  const placeID = req.params.pid;
  let place;
  try {
    //Populate method allows us to refer to a document stored in another collection and to work with data in that existing document of that other collection
    place = await Place.findById(placeID).populate("creator");
  } catch (err) {
    return next(new HttpError("Something went wrong! Please try again", 500));
  }

  if (!place) {
    return next(
      new HttpError("Something went wrong! Could not find place by ID", 404)
    );
  }

  const imagePath = place.image;

  try {
    const sess = await mongoose.startSession();
    sess.startTransaction();
    place.deleteOne({ session: sess });
    place.creator.places.pull(place);
    await place.creator.save({ sessions: sess });
    await sess.commitTransaction();
  } catch (err) {
    return next(
      new HttpError("Something went wrong! Could not delete place", 500)
    );
  }
  fs.unlink(imagePath, (err) => {
    console.log(err);
  });

  res.status(200).json({ message: "Place deleted" });
};

exports.getPlaceById = getPlaceById;
exports.getPlacesByUserId = getPlacesByUserId;
exports.createPlace = createPlace;
exports.updatePlace = updatePlace;
exports.deletePlace = deletePlace;
