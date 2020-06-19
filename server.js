'use strict';

// import dotenv, express, cors
require('dotenv').config();
const express = require('express');
const cors = require('cors');

// Anything from .env file shows up here
const PORT = process.env.PORT;

// Get an instance of express as our app
const app = express();

app.use(cors());


//  Location
app.get('/location', (request, response) => {
  let data = require('./data/location.json');
  let actualData = new Location(data[0], request);
  // actualData['search_query'] = request.query.city;
  response.status(200).json(actualData);
});

function Location(obj, request) {
  this.formatted_query = obj.display_name;
  this.latitude = obj.lat;
  this.longitude = obj.lon;
  this.search_query = request.query.city;
}

// Weather
app.get('/weather', (request, response) => {
  let weatherData = require('./data/weather.json');
  let weekPrediction = [];
  weatherData.data.forEach(day => {
    let forecast = new Forecast(day);
    weekPrediction.push(forecast);
  });
  response.status(200).json(weekPrediction);
});

function Forecast(obj) {
  this.forecast = obj.weather.description;
  this.time = obj.datetime;
}


app.use('*', (request, response) => {
  response.status(404).send('Huh');
});

app.use((error, request, response, next) => {
  console.log(error);
  let errorMsg = {
    status: 500,
    responseText: 'Sorry, something went wrong'
  };
  response.status(500).json(errorMsg);
});

app.listen(PORT, () => console.log('Server is running on port ', PORT));

