var Schema=require('mongoose').Schema;


var CatesSchema=new Schema({
	id:Number,
	name:{type:String,require:true},
	alias:{type:String,unique:true},
	desc:String,
	config:Array
}, { _id: false })
CatesSchema.pre('save',function(next){
	if (!this.id) {
		var self=this;
		//var idGenerator=require('./idGenerator');
		idGenerator.getNewId('cate',function(id){
		 	self.id=id;
			next();
		});
	}
	else{
		next();
	}
})
CatesSchema.statics.simples=function(callback){
	this.find({},{id:1,name:1,_id:0,alias:1},function(err,cates){
		if (err) {
			throw err;
		}
		else{
			callback(cates);
		}
	})
}
module.exports=db.model('cate',CatesSchema);