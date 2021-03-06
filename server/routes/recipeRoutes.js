const express = require('express');
const multer = require('multer'); // Node.js middleware for handling `multipart/form-data`
const upload = multer({ dest: 'TempUpload/' }); // set temp location of new files
const cloudinary = require('cloudinary');
const authRoutes = require('./authRoutes.js');
const path = require('path');
const fs = require('fs');
const config = require('../env/config');
const router = express.Router();
const db = require('../db/db.js');

cloudinary.config(config.cloudConfig);

//route for homepage which returns recent recipes
router.get('/', function(req, res) {
    if (req.query.term && req.query.term !== '') {
    var term = req.query.term
        db.recipeFunctions.searchRecipes(term, req.query.offset)
            .then((recipes) => {
                res.send(recipes)
            })
            .catch((err) => {
                res.send(err)
            })
    } else {
        db.recipeFunctions.findRecentRecipes(req.query.offset)
            .then((recipes) => {
                if(recipes.length === 0) {
                    recipes = 'No Results'
                }
                res.send(recipes)
            })
            .catch((err) => {
                res.send(err)
            })
    }
})

router.get('/:username/userrecipes', function(req, res) {
    let offset = 0;
    let username = req.params.username
    // check to see if we are passed a query variable in the request
    if (req.query.offset) {
        // set offset to the query string
        offset = req.query.offset;
    }
    db.recipeFunctions.findRecipesByUserName(username, offset)
        .then((recipes) => {
            res.send(recipes);
        })
        .catch((err) => {
            res.send(err);
        })
})

//saves a recipe to the DB
//Note: authRoutes.authRecaptcha will only work is multer is called before it
      // there is multipart form data that is being sent in req.body
router.post('/:_id/addrecipe', authRoutes.ensureAuthenticated, upload.single('images'), authRoutes.authRecaptcha, function(req, res) {
    var userId = req.params._id
    var response = null
    var parent = req.body.forked_parent
    //delete captcha verification string if present - otherwise it will get put into the DB
    var captchaVerification = req.body['g-recaptcha-response']
    if ( captchaVerification ){
        delete captchaVerification
    }

    db.recipeFunctions.findRecipesByUserId(userId).then((userObj) => {
        if (userObj.my_recipes.length !== 0) {
            userObj.my_recipes.forEach((recipe) => {
                if (recipe.title === req.body.title) {
                    throw new Error('Looks like you already have a recipe with that title. You can\'t add recipes with the same title twice. Please change the title and submit again.')
                }
            })
        }
        db.recipeFunctions.addNewRecipe(userId, req.body).then((recipe) => {
            response = recipe
            return db.userFunctions.addRecipeToMyRecipes(userId, recipe._id)
        })
        .catch((err) => {
            res.status(500).send(err.message)
        })
        .then(() => {
            if(parent){
               return db.recipeFunctions.addChildRecipe(parent, response._id)
            }
        })
        .catch((err) => {
            res.status(500).send(err.message)
        })
        .then((recipe) => {
            // checks to see if req.file is empty
            if (req.file !== undefined) {
                // upload to cloudinary
                cloudinary.uploader.upload(req.file.path, (result) => {
                    fs.unlink(req.file.path, (err) => {
                        if (err) {
                            console.error('Error on image delete:', err);
                        } else {
                            // adds the photo to the recipe in the database
                            db.recipeFunctions.addPhotoUrl(response._id, result).then(function(recipeDB) {
                                res.send(recipeDB)
                            })
                        }
                    });
                });
            } else {
                res.send(response);
            }
        }).catch((err) => {
            res.status(500).send(err.message)
        })
    }).catch((err) => {
        res.status(500).send(err.message)
    })

})

router.post('/:_id/editrecipe/', authRoutes.ensureAuthenticated, upload.single('images'), function(req, res) {
  var recipeId = req.body.id
  req.body.ingredients = JSON.parse(req.body.ingredients)
  console.log(req.body.ingredients);
  db.recipeFunctions.editRecipe(recipeId, req.body)
  .then((recipe) => {
    if (req.file !== undefined) {
        // upload to cloudinary
        cloudinary.uploader.upload(req.file.path, (result) => {
            fs.unlink(req.file.path, (err) => {
                if (err) {
                    console.error('Error on image delete:', err);
                } else {
                    // adds the photo to the recipe in the database
                    db.recipeFunctions.addPhotoUrl(recipe._id, result).then(function(recipeDB) {
                        res.send(recipeDB)
                    })
                }
            });
        });
    } else {
        res.send(recipe);
    }
  })
  .catch((err)=>{
    res.status(500).send(err)
  })
})

//route to return a single recipe
router.get('/:recipeId', function(req, res) {
    var recipeId = req.params.recipeId
    db.recipeFunctions.findRecipeById(recipeId)
        .catch((err) => {
            res.send(err);
        })
        .then((recipe) => {
            res.send(recipe);
        })
})

//go grab a recipe from a url
//save it to the DB
//send recipe object back to client
//if invalid website or no recipe is scraped
//it sends back and error
router.post('/scraperecipe', authRoutes.authRecaptcha, function(req, res) {
    var url = req.body.url
    var userId = req.body.userId
    recipeResponse = null
    db.scraperFunctions.lookUpRecipeByUrl(url)
        .then((recipe) => {
            if (recipe === null) {
                db.scraperFunctions.scrapeRecipe(url)
                    .catch((err) => {
                        throw new Error(err)
                    })
                    .then((scrapedRecipe) => {
                        scrapedRecipe.url = url
                        return db.recipeFunctions.addNewRecipe(userId, scrapedRecipe)
                            .catch((err) => {
                                res.status(500).send(err.message)
                            })
                            .then((recipeObj) => {
                                recipeResponse = recipeObj
                                return db.userFunctions.addRecipeToMyRecipes(userId, recipeObj._id)
                            })
                            .then((user) => {
                                res.send(200, recipeResponse._id)
                            })
                    })
                    .catch((err) => {
                        res.status(500).send(err.message)
                    })
            } else if (recipe !== null) {
                var statusObj = {
                    recipeId: recipe._id,
                    saved: true
                }
                res.status(200).send(statusObj)
            }
        })
        .catch((err) => {
            res.status(500).send(err.message)
        })
})

module.exports = router
