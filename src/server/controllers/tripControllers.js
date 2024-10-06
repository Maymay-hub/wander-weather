const axios = require("axios");

async function createTripData(req, res) {
  const tripData = {};
  const location = req.body.location;
  const startDate = req.body.startDate;
  const daysUntilTrip = req.body.daysUntilTrip;
  if (!location || !startDate) {
    return res.status(400).send({ error: "Invalid input" });
  }
  console.log(
    `user input is ${location} and ${startDate} and their trip is in ${daysUntilTrip} days`
  );
  const geoNamesUser = process.env.GEONAMES_USER;
  const weatherBitApiKey = process.env.WEATHERBIT_API_KEY;
  const pixabayApiKey = process.env.PIXABAY_API_KEY;
  try {
    const geoNamesData = await getDataFromGeoNames(geoNamesUser, location);

    const weatherInfo = await getWeather(
      geoNamesData.lat,
      geoNamesData.lon,
      weatherBitApiKey,
      daysUntilTrip
    );
    console.log(weatherInfo);

    let destinationImageUrl = await getImage(
      pixabayApiKey,
      location,
      geoNamesData.country
    );

    tripData.weatherInfo = weatherInfo;
    tripData.destinationImageUrl = destinationImageUrl;
    tripData.country = geoNamesData.country;
    res.send(tripData);
    console.log(tripData);
  } catch (err) {
    console.log(err);
    return res.status(500).send({ error: "Internal server error!" });
  }
}

async function getDataFromGeoNames(username, city) {
  const url = `http://api.geonames.org/searchJSON?q=${city}&maxRows=1&username=${username}`;
  const res = await axios.get(url);
  const geoNamesData = {
    lat: res.data.geonames[0]?.lat,
    lon: res.data.geonames[0]?.lng,
    country: res.data.geonames[0]?.countryName,
  };
  return geoNamesData;
}

async function getWeather(lat, lon, apiKey, day) {
  const url = `https://api.weatherbit.io/v2.0/forecast/daily?lat=${lat}&lon=${lon}&key=${apiKey}`;
  console.log(lat, lon);
  if (day >= 15) {
    day = 15;
  }

  const res = await axios.get(url);
  console.log("Data Day:", res.data.data[day]);
  const weatherData = {
    temperature: res.data.data[day]?.temp,
    description: res.data.data[day]?.weather.description,
    icon_code: res.data.data[day]?.weather.icon
  };
  console.log("Weather data: ", weatherData);
  return weatherData;
}

async function getImage(apiKey, searchWord, searchWord2) {
  const url1 = `https://pixabay.com/api/?key=${apiKey}&q=${encodeURIComponent(
    searchWord
  )}&image_type=photo`;
  const url2 = `https://pixabay.com/api/?key=${apiKey}&q=${encodeURIComponent(
    searchWord2
  )}&image_type=photo`;

  const res = await axios.get(url1);
  let photoUrl = res.data.hits[0]?.webformatURL;
  if (!photoUrl) {
    const res = await axios.get(url2);
    photoUrl = res.data.hits[0]?.webformatURL;
  }
  return photoUrl;
}

module.exports = {createTripData};
