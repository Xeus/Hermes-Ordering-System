module.exports.configureSchema = function(Schema, mongoose) {

	var Menu = new Schema({
		menuName : String,
		menuCost : Number,
		menuDesc : String,
		menuCalories : Number,
		menuType : String,
		menuAdded : { type : Date, default : Date.now },
		menuOptions : [Options]
	});

	var Options = new Schema({ 
		optionName : String,
		optionCost : { type : Number, default : 0 },
		optionDesc : String,
		optionAdded : { type : Date, default : Date.now },
		id : String
	}); 

	// add schemas to Mongoose
	mongoose.model('Menu', Menu);
	mongoose.model('Options', Options);
};