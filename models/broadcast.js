
var Schema=require('mongoose').Schema;

var BroadcastSchema=new Schema({
	id:Number,
	source:String,
	link:String,
	title:String,
	content:String,
	cateId:Number,
	addDate:{type:Date,default:Date.now()},
	userId:Number,
	userName:String
})
BroadcastSchema.pre('save',function(next){
	if (!this.id) {
		var self=this;
		idGenerator.getNewId('broadcast',function(id){
		 	self.id=id;
			next();
		});
	}
	else{
		next();
	}
})
module.exports=db.model('broadcast',BroadcastSchema);