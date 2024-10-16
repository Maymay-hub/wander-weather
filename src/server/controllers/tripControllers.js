const axios = require("axios");

async function createTripData(req, res) {
  const tripData = {};
  const location = req.body.location;
  const startDate = req.body.startDate;
  const daysUntilTrip = req.body.daysUntilTrip;
  const latitude = req.body.latitude;
  const longitude = req.body.longitude;

  // Check if all required fields are provided, otherwise return 400 error
  if (!location || !startDate || !latitude || !longitude) {
    return res.status(400).send({ error: "Invalid input" });
  }

  console.log(
    `user input is ${location} at coordinates (${latitude}, ${longitude}) and ${startDate} and their trip is in ${daysUntilTrip} days`
  );

  // Environment variables for API credentials
  const weatherBitApiKey = process.env.WEATHERBIT_API_KEY;
  const pixabayApiKey = process.env.PIXABAY_API_KEY;

  try {
    // Fetch country information using reverse geocoding
    const countryInfo = await getCountryFromCoordinates(latitude, longitude);

    // Fetch weather data based on coordinates
    const weatherInfo = await getWeather(
      latitude,
      longitude,
      weatherBitApiKey,
      daysUntilTrip
    );
    console.log(weatherInfo);

    // Fetch image from Pixabay API for the destination
    let destinationImageUrl = await getImage(
      pixabayApiKey,
      location,
      countryInfo.country
    );

    // Assign weather info, image URL, and country to trip data
    tripData.weatherInfo = weatherInfo;
    tripData.destinationImageUrl = destinationImageUrl;
    tripData.country = countryInfo.country;

    // Send trip data as response
    res.send(tripData);
    console.log(tripData);
  } catch (err) {
    console.log(err);
    return res.status(500).send({ error: "Internal server error!" });
  }
}

// Fetch country information from coordinates using OpenStreetMap Nominatim API
async function getCountryFromCoordinates(lat, lon) {
  const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`;
  const res = await axios.get(url);
  return {
    country: res.data.address.country,
  };
}

// Fetch weather data from Weatherbit API using latitude, longitude, and day offset
async function getWeather(lat, lon, apiKey, day) {
  const url = `https://api.weatherbit.io/v2.0/forecast/daily?lat=${lat}&lon=${lon}&key=${apiKey}`;
  console.log(lat, lon);

  // Limit day to a maximum of 15 as the Weatherbit API provides a 15-day forecast
  if (day >= 15) {
    day = 15;
  }

  const res = await axios.get(url);
  console.log("Data Day:", res.data.data[day]);

  // Extract temperature, description, and weather icon from the response
  const weatherData = {
    temperature: res.data.data[day]?.temp,
    description: res.data.data[day]?.weather.description,
    icon_code: res.data.data[day]?.weather.icon,
  };
  console.log("Weather data: ", weatherData);
  return weatherData;
}

// Fetch destination image from Pixabay API using either location or country
async function getImage(apiKey, searchWord, searchWord2) {
  const url1 = `https://pixabay.com/api/?key=${apiKey}&q=${encodeURIComponent(
    searchWord
  )}&image_type=photo`;
  const url2 = `https://pixabay.com/api/?key=${apiKey}&q=${encodeURIComponent(
    searchWord2
  )}&image_type=photo`;

  const res = await axios.get(url1);
  let photoUrl = res.data.hits[0]?.webformatURL;

  // If no image is found for the location, try using the country name
  if (!photoUrl) {
    const res = await axios.get(url2);
    photoUrl = res.data.hits[0]?.webformatURL;
  }

  return photoUrl;
}

module.exports = { createTripData };