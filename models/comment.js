
var Schema=require('mongoose').Schema;
var ReplySchema=new Schema({
	content:String,
	addDate:{type:Date,default:Date.now()},
	userId:Number,
	userName:String,
	replyUserId:Number,
	replyUserName:String
},{_id:false});
ReplySchema.virtual('addDate2',function(date){
	if (this.addDate) {
		var date=this.addDate;
		return date.getFullYear()+'年'+(date.getMonth()+1)+'月'+date.getDate()+'日';
	}else{
		return undefined;
	}
	
})

ReplySchema.virtual("addDate3").get(function(){
	if (this.addDate) {
		var timestamp=Date.now()-this.addDate;
		var second=Math.floor( timestamp/1000);
		switch(true){
			case second<60:
				return second+'秒前';
			case second<3600:
				return Math.floor(second/60)+'分钟前';
			case second<7200:
				return '1小时前'
			case second<86400:
				return this.addDate.getHours()+":"+this.addDate.getMinutes();
			default:
				return this.addDate2;
		}
	};
	return undefined;
})
ReplySchema.set('toJSON', { virtuals: true })
var CommentSchema=new Schema({
	id:Number,
	content:String,
	addDate:{type:Date,default:Date.now()},
	userId:Number,
	userName:String,
	plat:Number,
	targetId:Number,
	children:[ReplySchema],
	state:{type:Number,default:0}
})
CommentSchema.pre('save',function(next){
	var self=this;
	if (!self.id) {
		idGenerator.getNewId('comment',function(id){
		 	self.id=id;
			next();
		});
	}
	else{
		next();
	}
});
CommentSchema.virtual('addDate2',function(date){
	if (this.addDate) {
		var date=this.addDate;
		return date.getFullYear()+'年'+(date.getMonth()+1)+'月'+date.getDate()+'日';
	}else{
		return undefined;
	}
	
})
CommentSchema.virtual("addDate3").get(function(){
	if (this.addDate) {
		var timestamp=new Date()-this.addDate;
		var second=Math.floor( timestamp/1000);
		switch(true){
			case second<60:
				return second+'秒前';
			case second<3600:
				return Math.floor(second/60)+'分钟前';
			case second<7200:
				return '1小时前'
			case second<86400:
				return this.addDate.getHours()+":"+this.addDate.getMinutes();
			default:
				return this.addDate2;
		}
	};
	return undefined;
})
CommentSchema.set('toJSON', { virtuals: true })
module.exports=db.model('comment',CommentSchema);

