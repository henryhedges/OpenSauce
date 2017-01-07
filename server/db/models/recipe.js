const mongoose = require('mongoose');
const Schema = mongoose.Schema;

var RecipeSchema = new Schema({
	title: {type: String, required: true},
	creator: {
		type: Schema.Types.ObjectId,
		ref: 'user'
	},
	description: String,
	ingredients: {type: [String], required: true},
	directions: {type: String, required: true},
	recipe_images: [{
		image_data: {type: Buffer, default: null},
		image_name: {type: String, default: null},
		mimetype: {type: String, default: null},
		placeholder: {type: String, default: 'https://placehold.it/900x600'}
	}],
	forked_parent:{
		type: Schema.Types.ObjectId,
		ref: 'recipes',
		default: null
	},
	forked_children:[{
		type: Schema.Types.ObjectId,
		ref: 'recipes'
	}],
	timestamps: { 
		createdAt: Date, 
		updatedAt: Date
	},
	url: String
})

RecipeSchema.index({title: 'text', descrption: 'text', directions: 'text'})

const Recipe = mongoose.model('recipes', RecipeSchema);

module.exports = Recipe;


//good export!
