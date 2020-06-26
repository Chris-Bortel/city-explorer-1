'use strict';

// Bring in npm libraries
const express = require('express');
const cors = require('cors');
const superagent = require('superagent');
const pg = require('pg');
const { response } = require('express');

// Bring in dotenv package to let us talk to our .env file
require('dotenv').config();

// Grab port number from .env file
const PORT = process.env.PORT || 3000;

// Get an instance of express as our app
const app = express();
const client = new pg.Client(process.env.DATABASE_URL);

// Enable Cors
app.use(cors());

// Declare Routes
app.get('/', handleHomePage);
app.get('/location', handleLocation);
app.get('/weather', handleWeather);
app.get('/trails', handleTrails);
app.use('*', handleNotFound);
app.use(errorHandler);

// Initialize the server if database gets connected
client.connect()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server is up on port ${PORT}.`);
    });
  })
  .catch(err => {
    throw `PG startup error: ${err.message}`;
  });


// In Memory Cache
let locations = {};

////////////////    Home Page
function handleHomePage(request, response) {
  response.send('Hello World again. Initial route');
}


/////////////////   Location
function handleLocation(request, response) {
  if (locations[request.query.city]) {
    response.status(200).send(locations[request.query.city]);
  } else {
    fetchLocationDataFromAPI(request.query.city, response);
  }
}

function fetchLocationDataFromAPI(city, response) {
  const API = `https://us1.locationiq.com/v1/search.php`;

  let queryObject = {
    key: process.env.GEOCODE_API_KEY,
    q: city,
    format: 'json'
  };

  superagent
    .get(API)
    .query(queryObject)
    .then((apiData) => {
      let location = new Location(apiData.body[0], city);
      locations[city] = location;
      response.status(200).send(location);
    })
    .catch(() => {
      response.status(500).send('Something went wrong in LOCATION Route');
    });
}

function Location(obj, city) {
  this.formatted_query = obj.display_name;
  this.latitude = obj.lat;
  this.longitude = obj.lon;
  this.search_query = city;
}


//////////////////    Weather
function handleWeather(request, response) {
  const API = `https://api.weatherbit.io/v2.0/forecast/daily`;

  let queryObject = {
    lat: request.query.latitude,
    lon: request.query.longitude,
    key: process.env.WEATHER_API_KEY
  };

  superagent
    .get(API)
    .query(queryObject)
    .then((apiData) => {
      let weatherDataArr = apiData.body.data;
      let weatherForcast = weatherDataArr.map((day) => new Forecast(day));
      response.status(200).send(weatherForcast);
    })
    .catch(() => {
      response.status(500).send('Something went wrong in WEATHER Route');
    });
}

function Forecast(obj) {
  this.forecast = obj.weather.description;
  this.time = new Date(obj.datetime).toDateString();
}


///////////////////    Trails
function handleTrails(request, response) {
  const API = `https://www.hikingproject.com/data/get-trails`;

  let queryobject = {
    lat: request.query.latitude,
    lon: request.query.longitude,
    key: process.env.TRAIL_API_KEY
  };

  superagent
    .get(API)
    .query(queryobject)
    .then((apiData) => {
      let trailsDataArr = apiData.body.trails;
      let trailsRefactored = trailsDataArr.map(trail => new Trails(trail));
      response.status(200).send(trailsRefactored);
    })
    .catch(() => {
      response.status(500).send('Something wrong with TRAILS Route');
    });
}

function Trails(obj) {
  this.name = obj.name;
  this.location = obj.location;
  this.length = obj.length;
  this.stars = obj.stars;
  this.star_votes = obj.starVotes;
  this.summary = obj.summary;
  this.trail_url = obj.url;
  this.conditions = obj.conditionDetails;
  this.condition_date = obj.conditionDate.slice(0, obj.conditionDate.indexOf(' '));
  this.condition_time = obj.conditionDate.slice(obj.conditionDate.indexOf(' '));
}


function handleNotFound(request, response) {
  response.status(404).send('Route not present');
}

function errorHandler(error, request, response) {
  response.status(500).send(error);
}
