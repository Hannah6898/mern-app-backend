const HttpError = require("../model/http-error");
const { validationResult } = require("express-validator");
const getCoordsforAddress = require("../util/location");
const Place = require("../model/place");

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
        "Something went wrong! Could not find place by user ID",
        500
      )
    );
  }
  if (!places || places.length === 0) {
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
    image: "link",
    address: address,
    location: coordinates,
    creator: creator,
  });

  try {
    await createdPlace.save();
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
    place = await Place.findByIdAndDelete(placeID);
  } catch (err) {
    return next(
      new HttpError("Something went wrong! Could not delete place", 500)
    );
  }

  res.status(200).json({ message: "Place deleted" });
};

exports.getPlaceById = getPlaceById;
exports.getPlacesByUserId = getPlacesByUserId;
exports.createPlace = createPlace;
exports.updatePlace = updatePlace;
exports.deletePlace = deletePlace;
