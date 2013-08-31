var Schema=require('mongoose').Schema;
var AnswerSchema=new Schema({
	id:Number,
	userId:{type:Number},
	userName:{type:String},
	content:String,
	addAsk:Array,
	updateDate:{type:Date,default:Date.now()}
});
AnswerSchema.virtual("updateDate2").get(function(){
	var date=this.updateDate;
	return date.getFullYear()+'年'+(date.getMonth()+1)+'月'+date.getDate()+'日';
})
AnswerSchema.virtual("updateDate3").get(function(){
	var timestamp=Date.now()-this.updateDate;
	var second=Math.ceil( timestamp/1000);
	switch(true){
		case second<60:
			return second+'秒前';
		case second<3600:
			return Math.ceil(second/60)+'分钟前';
		case second<86400:
			return Math.ceil(second/60/60)+'小时前';
		default:
			return this.addDate2;
	}
})
AnswerSchema.pre('save',function(next){
	var self=this;
	if (!self.id) {
		idGenerator.getNewId('answer',function(id){
			self.id=id;
			next();
		})
	}
	else{
		next();
	}
})
var QuestionSchema=new Schema({
	id:{type:Number},
	title:{type:String},
	content:{type:String},
	state:{type:Number,default:0},
	userId:{type:Number},
	userName:{type:String},
	answers:[AnswerSchema],
	answerNum:{type:Number,default:0},
	viewNum:{type:Number,default:0},
	suportNum:{type:Number,default:0},
	suportUsers:[],
	subject:Object,
	cateId:Number,
	cateName:String,
	answer:Object,
	addDate:{type:Date,default:Date.now()}
})
QuestionSchema.pre('save',function(next){
	var self=this;
	if (!self.id) {
		idGenerator.getNewId('question',function(id){
			self.id=id;
			next();
		})
	}
	else{
		next();
	}
})
QuestionSchema.virtual("addDate2").get(function(){
	var date=this.addDate;
	return date.getFullYear()+'年'+(date.getMonth()+1)+'月'+date.getDate()+'日';
})
QuestionSchema.virtual("addDate3").get(function(){
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
// QuestionSchema.virtual("subjectType").get(function(){
// 	return 'question';
// })
QuestionSchema.statics.findByQuesId=function(id,fn){
	this.findOne({id:id},function(err,ques){
		if (err) {
			throw err;
		}
		fn(ques);
	})
}

QuestionSchema.statics.addAnswer=function(id,answer,callback){
	var self=this;
	self.findByQuesId(id,function(ques){
		if (ques) {
			var match=_.find(ques.answers,function(item){
				return item.userId==answer.userId;
			})
			if (match) {
				callback({ret:-1,msg:'你已经回答过该问题'});
			}
			else{
				self.update({id:id},{"$push":{"answers":answer}},function(err){
					if (err) {
						throw err;
					}
					callback({ret:0});
				})
			}
		}
		else{
			callback({ret:-2,msg:'没有找到对应的问题'});
		}
	})
}
QuestionSchema.statics.addAsk=function(id,userId,answerId,content,callback){
	var self=this;
	var askContent={
		ask:content
	};
	self.update({id:id,userId:userId,"answers.id":answerId},{"$push":{"answers.$.addAsk":askContent}},function(err,re){
		if (err) {
			callback(-1);
		}else{
			callback(re);
		}
	})
}
QuestionSchema.statics.reAnswer=function(id,userId,answerId,reAskId,content,callback){
	var self=this;
	var obj={};
	obj["$set"]={};
	obj["$set"]["answers.$.addAsk."+reAskId+".answer"]=content;
	console.log(obj);
	self.update({id:id,"answers.id":answerId,"answers.userId":userId},obj,function(err,re){
		if (err) {
			callback(-1);
		}else{
			callback(re);
		}
	})
}
QuestionSchema.set('toJSON', { virtuals: true })
module.exports=db.model('question',QuestionSchema);