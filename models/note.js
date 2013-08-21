var Schema=require('mongoose').Schema;
var NoteSchema=new Schema({
	id:{type:Number,unique:true},
	subjectId:{type:Number,require:true},
	subjectName:{type:String,require:true},
	cateId:{type:Number,require:true},
	cateName:String,
	chapterName:{type:String,require:true},
	userId:{type:Number,require:true},
	userName:{type:String,require:true},
	content:{type:String,require:true},
	addDate:{type:Date,default:Date.now()},
	updateDate:{type:Date},
	publishDate:{type:Date},
	readNum:{type:Number,default:0},
	commentNum:{type:Number,default:0},
	modifies:Array,
	state:{type:Number,default:0}
});
NoteSchema.path("content").validate(function(value){
	return value.trim()!=''
},'笔记不能为空')
NoteSchema.pre('save',function(next){
	var self=this;
	if (self.isNew) {
		idGenerator.getNewId('note',function(id){
		 	self.id=id;
			next();
		});
	}
	else{
		next();
	}
})
NoteSchema.virtual('addDate2').get(function(date){
	var date=this.addDate;
	return date.getFullYear()+'年'+(date.getMonth()+1)+'月'+date.getDate()+'日';

})
NoteSchema.virtual("addDate3").get(function(){
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
NoteSchema.virtual("subjectType").get(function(){
	return 'note';
})
NoteSchema.statics.push=function(id){
	this.findOne({id:id},function(err,note){
		var Broadcast=require('./broadcast');
		var broadcast=new Broadcast();
		broadcast.source='note';
		broadcast.title=note.userName+note.subjectName+" 的笔记";
		broadcast.content=note.content.substring(0,200);
		broadcast.cateId=note.cateId;
		broadcast.userId=note.userId;
		broadcast.userName=note.userName;
		broadcast.link='/note/'+note.id;
		broadcast.save(function(err){
			if (err) {
				util.error(err);
			}
		})
	})
}
NoteSchema.set('toJSON',{virtuals:true})
module.exports=db.model('note',NoteSchema);