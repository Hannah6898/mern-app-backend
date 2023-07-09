const HttpError = require("../model/http-error");
const uuid = require("uuid");
const { validationResult } = require("express-validator");
const getCoordsforAddress = require("../util/location");

let DUMMY_PLACES = [
  {
    id: "p1",
    title: "London",
    description: "My home",
    location: {
      lat: 40.7483785,
      lng: -73.7869969,
    },
    address: "hinjf",
    creator: "u1",
  },
  {
    id: "p2",
    title: "London",
    description: "My home",
    location: {
      lat: 40.7483785,
      lng: -73.7869969,
    },
    address: "hinjf",
    creator: "u1",
  },
];

const getPlaceById = (req, res, next) => {
  const placeId = req.params.pid;
  const place = DUMMY_PLACES.find((p) => {
    return p.id === placeId;
  });
  if (!place) {
    throw new HttpError("Could not find place for provided place id", 404);
  }
  res.json({ place });
};

const getPlacesByUserId = (req, res, next) => {
  const userId = req.params.uid;
  const places = DUMMY_PLACES.filter((u) => {
    return u.creator === userId;
  });
  if (!places || places.length === 0) {
    return next(
      new HttpError("Could not find places for provided user id", 404)
    );
  }
  res.json({ places });
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
    return next(error)
  }
  const createdPlace = {
    id: uuid.v4(),
    title,
    description,
    location: coordinates,
    address,
    creator,
  };
  DUMMY_PLACES.push(createdPlace);

  res.status(201).json({ place: createdPlace });
};

const updatePlace = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new HttpError("Invalid input passed, please check data", 422);
  }
  const { title, description } = req.body;
  const placeID = req.params.pid;

  const updatedPlace = { ...DUMMY_PLACES.find((p) => p.id === placeID) };

  const placeIndex = DUMMY_PLACES.findIndex((p) => p.id === placeID);

  updatedPlace.title = title;
  updatedPlace.description = description;

  DUMMY_PLACES[placeIndex] = updatedPlace;
  res.status(200).json({ place: updatedPlace });
};

const deletePlace = (req, res, next) => {
  const placeID = req.params.pid;
  if (!DUMMY_PLACES.find((p) => p.id === placeID)) {
    throw new HttpError("Could not find place for Id", 404);
  }
  DUMMY_PLACES = DUMMY_PLACES.filter((p) => p.id !== placeID);
  res.status(200).json({ message: "Place deleted" });
};

exports.getPlaceById = getPlaceById;
exports.getPlacesByUserId = getPlacesByUserId;
exports.createPlace = createPlace;
exports.updatePlace = updatePlace;
exports.deletePlace = deletePlace;
