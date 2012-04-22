module.exports.configureSchema = function(Schema, mongoose) {
	var Options = new Schema({ 
		optionName : String,
		optionCost : { type : Number, default : 0.00 },
		optionDesc : String,
		optionAdded : { type : Date, default : Date.now}
	}); 

	mongoose.model('Options', Options);
};