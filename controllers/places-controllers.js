const HttpError = require('../model/http-error');

const DUMMY_PLACES = [
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
      throw new HttpError('Could not find place for provided place id', 404); 
    }
    res.json({ place });
  };


  const getPlacesByUserId = (req, res, next) => {
    const userId = req.params.uid;
    const places = DUMMY_PLACES.find((u) => {
      return u.creator === userId;
    });
    if (!places) {
      return next(new HttpError('Could not find place for provided user id', 404));
    }
    res.json({ places });
  };

  const createPlace = (req, res,next)=>{
    const {title, description, coordinates, address, creator}= req.body;
    const createdPlace = {
        title,
        description,
        location: coordinates,
        address, 
        creator
    }
    DUMMY_PLACES.push(createdPlace)
   
    res.status(201).json({place: createdPlace})
}

  exports.getPlaceById = getPlaceById;
  exports.getPlacesByUserId = getPlacesByUserId;
  exports.createPlace = createPlace;