var Schema=require('mongooes').Schema;
var WordSchema=new Schema({
	id:{type:Number},
	title:{type:String},
	reUrl:{type:String},
	content:{type:String},
	menus:[{
		chapterId:{type:Number},
		chapterName:{type:String},
		reUrl:{type:String},
		content:{type:String}
	}],
	userId:{type:Number},
	userName:{type:String},
	addDate:{type:Date,default:Date.now()},
	state:{type:Number}
})

WordSchema.pre('save',function(next){
	var self=this;
	if (!this.id) {
		idGenerator.getNewId('word',function(id){
			self.id=id;
			next();
		})
	}
	else{
		next();
	}
})

module.exports=db.model('word',WordSchema);