const axios = require("axios");
const HttpError = require("../model/http-error");
const API_KEY = "AIzaSyBAJ6ntx-XiqT4j213ch_5aqRStktsLwdM";

async function getCoordsforAddress(address) {
  const response = await axios.get(
    `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
      address
    )}&key=${API_KEY}`
  );

  const data = response.data;

  if (!data || data.status === "ZERO_RESULTS") {
    const error = new HttpError("No coordinates found for the address", 422);
    throw error;
  }

  const coordinates = data.results[0].geometry.location;
  return coordinates;
}

module.exports = getCoordsforAddress;
