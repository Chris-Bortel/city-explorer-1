'use strict';

// Bring in npm libraries & configs
const express = require('express');
const cors = require('cors');
const superagent = require('superagent');
const pg = require('pg');
require('dotenv').config();

// Grab port number from .env file
const PORT = process.env.PORT || 3000;

// Get an instance of express and postgres
const app = express();
const client = new pg.Client(process.env.DATABASE_URL);

// Enable Cors
app.use(cors());

// Declare Routes
app.get('/', handleHomePage);
app.get('/location', handleLocation);
app.get('/weather', handleWeather);
app.get('/trails', handleTrails);
app.get('/movies', handleMovies);
app.get('/yelp', handleYelp);
app.use('*', handleNotFound);
app.use(errorHandler);


// Connect the Database and Initialize the server
client.connect()
  .then(() => {
    app.listen(PORT, () => console.log(`Server is up on port ${PORT}.`));
  })
  .catch(err => {
    throw `PG startup error: ${err.message}`;
  });


////////////////    Home Page
function handleHomePage(request, response) {
  response.send('Hello World again. Initial route');
}


/////////////////   Location
function handleLocation(request, response) {
  const safeQuery = [request.query.city];
  const SQL = 'SELECT * FROM locations WHERE search_query = $1;';
  client.query(SQL, safeQuery)
    .then(results => {
      if (results.rowCount) {
        response.status(200).send(results.rows[0]);
      } else {
        fetchLocationDataFromAPI(request.query.city, response);
      }
    })
    .catch(error => response.status(500).send(error));
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
      cacheLocationToDataBase(location);
      response.status(200).send(location);
    })
    .catch(() => {
      response.status(500).send('Something went wrong in LOCATION Route using superagent');
    });
}

function cacheLocationToDataBase(locationObj) {
  const safeQuery1 = [locationObj.formatted_query, locationObj.latitude, locationObj.longitude, locationObj.search_query];
  const SQL1 = `
      INSERT INTO locations (formatted_query, latitude, longitude, search_query) 
      VALUES ($1, $2, $3, $4)
      RETURNING *;`;
  client.query(SQL1, safeQuery1)
    .then(results => console.log('New City has been added to PSQL Database: ', results.rows[0]));
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


////////////////   Movies
function handleMovies(request, response) {
  const API = 'https://api.themoviedb.org/3/search/movie';
  let queryObj = {
    query: request.query.search_query,
    api_key: process.env.MOVIE_API_KEY
  };

  superagent
    .get(API)
    .query(queryObj)
    .then(apiData => {
      let moviesArr = apiData.body.results.map(movies => new Movies(movies));
      response.status(200).send(moviesArr);
    })
    .catch(() => response.status(500).send('Something wrong with MOVIES route'));
}

function Movies(obj) {
  this.title = obj.title;
  this.overview = obj.overview;
  this.average_votes = obj.vote_average;
  this.total_votes = obj.vote_count;
  this.image_url = `https://image.tmdb.org/t/p/w500${obj.poster_path}`;
  this.popularity = obj.popularity;
  this.released_on = obj.release_date;
}


/////////////////  Yelp
function handleYelp(request, response) {
  let API = 'https://api.yelp.com/v3/businesses/search';
  let queryObj = {
    term: 'restaurants',
    latitude: request.query.latitude,
    longitude: request.query.longitude,
    limit: 5,
    offset: (request.query.page - 1) * 5
  };

  superagent
    .get(API)
    .set('Authorization', `Bearer ${process.env.YELP_API_KEY}`)
    .query(queryObj)
    .then((apiData) => {
      console.log('First console log from request', request.query);
      let restaurantArr = apiData.body.businesses.map(restaurant => new Restaurants(restaurant));
      response.status(200).send(restaurantArr);
    })
    .catch(() => response.status(500).send('Something wrong with YELP route'));
}

function Restaurants(obj) {
  this.name = obj.name;
  this.image_url = obj.image_url;
  this.price = obj.price;
  this.rating = obj.rating;
  this.url = obj.url;
}

function handleNotFound(request, response) {
  response.status(404).send('Route not found');
}

function errorHandler(error, request, response) {
  response.status(500).send(error);
}
