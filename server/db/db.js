require('dotenv').load()

const mongoose = require('mongoose');
const config = require('../env/config.js');
const env = process.env;

mongoose.Promise = global.Promise;
const mongodbUri = 'mongodb://'+ env.MLAB_USERNAME + ':' + env.MLAB_PASSWORD + '@ds141464.mlab.com:41464/heroku_b8x5xr2m';
mongoose.connect(mongodbUri);
const connection = mongoose.connection;

//define models BEFORE functions
const recipeModel = require('./models/recipe.js')
const userModel = require('./models/user.js')
const photoModel = require('./models/photo.js')

//functions should be able to access the models because they are defined BEFORE
const commentFunctions = require('./functions/commentFunctions.js')
const photoFunctions = require('./functions/photoFunctions.js')
const recipeFunctions = require('./functions/recipeFunctions.js')
const userFunctions = require('./functions/userFunctions.js')
const scraperFunctions = require('./functions/scraperFunctions.js')



//DEFINE EXPORTS LASTSSSSS
const xPorts = {
  mongoose: mongoose,
  connection: connection,
  mongodbUri: mongodbUri,
  photoModel: photoModel,
  recipeModel: recipeModel,
  userModel: userModel,
  commentFunctions: commentFunctions,
  photoFunctions: photoFunctions,
  recipeFunctions: recipeFunctions,
  userFunctions: userFunctions,
  scraperFunctions: scraperFunctions
}

module.exports = xPorts;
