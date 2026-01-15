//this file defines the User model for the auth-service
const mongoose = require("mongoose");
//the code below defines the schema for a User in the authentication service
//the schema is then used to create a Mongoose model which interacts with the MongoDB database
const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true
    },
    password: {
      type: String,
      required: true
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", UserSchema);
