-- use following in terminal
-- psql -d city_explorer -f schema.sql


DROP TABLE IF EXISTS locations;

CREATE TABLE locations (
  id SERIAL PRIMARY KEY,
  formatted_query VARCHAR(255),
  latitude NUMERIC,
  longitude NUMERIC,
  search_query VARCHAR(255) 
);