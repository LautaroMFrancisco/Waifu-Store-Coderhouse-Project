const Product = require("../models/product");
const dotenv = require("dotenv");
const connectDatabase = require("../config/database");
const products = require("../data/product.json");
const { connect } = require("mongoose");

// Setting Dotenv File

dotenv.config({ path: "backend/config/config.env" });

connectDatabase();

const seedProduct = async () => {
  try {
    await Product.deleteMany();
    console.log("Products are deleted successfully");
    await Product.insertMany(products);
    console.log("All products are added successfully");
    process.exit();
  } catch (error) {
    console.log(error.message);
    process.exit();
  }
};

seedProduct();
