'use strict';

// Bring in npm libraries
const express = require('express');
const cors = require('cors');
const superagent = require('superagent');

// Bring in dotenv package to let us talk to our .env file
require('dotenv').config();

// Grab port number from .env file
const PORT = process.env.PORT || 3000;

// Get an instance of express as our app
const app = express();

// Enable Cors
app.use(cors());

// Initialize
app.listen(PORT, () => console.log('Server is running on port ', PORT));

app.get('/', (request, response) => {
  response.send('Hello World again. Initial route');
});

//  Location
app.get('/location', (request, response) => {
  const API = `https://us1.locationiq.com/v1/search.php?key=${process.env.GEOCODE_API_KEY}&q=${request.query.city}&format=json`;

  superagent
    .get(API)
    .then((data) => {
      let location = new Location(data.body[0], request.query.city);
      response.status(200).json(location);
    })
    .catch(() => {
      response.status(500).send('Something went wrong in location route');
    });
});

function Location(obj, city) {
  this.formatted_query = obj.display_name;
  this.latitude = obj.lat;
  this.longitude = obj.lon;
  this.search_query = city;
}

// Weather
app.get('/weather', (request, response) => {
  // let weatherData = require('./data/weather.json');
  const API = `https://api.weatherbit.io/v2.0/current?city=Raleigh,NC&key=${process.env.WEATHER_API_KEY}`;

  superagent.get(API).then((data) => {
    console.log(data);
    response.status(200).json(data);
  });

  // let weekPrediction = weatherData.data.map((day) => {
  //   return new Forecast(day);
});

function Forecast(obj) {
  this.forecast = obj.weather.description;
  this.time = new Date(obj.datetime).toDateString();
}

app.use('*', (request, response) => {
  let errorMsg = {
    status: 500,
    responseText: 'Sorry, something went wrong',
  };
  response.status(500).json(errorMsg);
});
