const app = require("./app");
/*const dotenv = require("dotenv");*/
const connectDatabase = require("./config/database");
const cloudinary = require("cloudinary");
const cluster = require("cluster");
const parseArgs = require("minimist");
const numCPUs = require("os").cpus().length;
const optMinimist = { default: { PORT: 8080, MODE: "FORK" } };
const args = parseArgs(process.argv.slice(2), optMinimist);
const MODE = args.MODE;

// Handle Uncaught Exceptions

process.on("uncaughtException", (err) => {
  console.log(`ERROR: ${err.stack}`);
  console.log(`Shutting down server due to uncaught exception.`);
  process.exit(1);
});

// Setting up config File
if (process.env.NODE_ENV !== "PRODUCTION")
  require("dotenv").config({ path: "backend/config/config.env" });

// Cloudinary Setup
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Connecting To DataBase
connectDatabase();

const PORT = process.env.PORT || 4000;

if (MODE === "FORK") {
  app.listen(PORT, () => {
    console.log(
      `Server Process Id: ${process.pid} Running on Port: ${PORT} in FORK mode`
    );
  });
} else {
  if (cluster.isMaster) {
    for (let i = 0; i < numCPUs; i) {
      cluster.fork();
    }
    cluster.on("exit", (worker, code, signal) => {
      console.log(`Process ${process}`);
    });
  } else {
    app.listen(PORT, () => {
      console.log(
        `Server Process Id: ${process.pid} Running on Port: ${PORT} in CLUSTER mode`
      );
    });
  }
}

// Handle Unhandled Promises Rejections

process.on("unhandledRejection", (err) => {
  console.log(`ERROR: ${err.message}`);
});

//Start Server with Cluster = nodemon index.js --PORT 'PORT NUMBER' --MODE CLUSTER

//Start Server with FORK = nodemon index.js --PORT 'PORT NUMBER' --MODE FORK
