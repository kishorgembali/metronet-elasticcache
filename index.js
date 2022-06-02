const express = require("express");
const redis = require("redis");
const products = require('./products');
const dotenv = require('dotenv');
//const axios = require("axios");
const app = express();
dotenv.config();
const PORT = process.env.PORT || 5000;
const REDIS_PORT = process.env.REDIS_PORT || 6379;

//const redisURL = "redis://127.0.0.1:6379";

const client = redis.createClient(REDIS_PORT);

(async () => client.connect())();

client.on("connect", function () {
  console.log("Redis is ready");
});

client.on("error", function () {
  console.log("Error in Redis");
});



const delay = (time) => new Promise((res) => setTimeout(res, time));

async function getProducts(req, res, next) {
  console.log("Fetching data from Get Products API");
  client.set('products', JSON.stringify(products));
  await delay(5000);

  res.send(products);
}


// Cache middleware
async function cache(req, res, next) {
  console.log("Fetching data from Caches");
  const data = await client.get("products");
 
  if (data !== null) {
    console.log(data);
    res.send(JSON.parse(data));
  } else {
    next();
  }
}

const deleteCache = (req, res) => {
  client.del('products');
  res.send('<h2>Successfully deleted cache for metrocache!!</h2>');
};

app.get('/api/remove', deleteCache);

app.get("/api/products", cache, getProducts);

app.listen(5000, () => {
  console.log(`App listening on port ${PORT}`);
});

