var Schema=require('mongoose').Schema;

//valid
var usernameValid=[{validator:function(name){
	return /^[_0-9a-zA-Z\u4e00-\u9fa5]{2,12}$/i.test(name)
},msg:'只能包括中文字、英文字母、数字和下划线'},{
	validator:function(name){
		return !/^[0-9]{2,12}$/.test(name);
	},
	msg:'不能是纯数字'
}]

var UserSchema=new Schema({
	username:{type:String,validate:usernameValid,unique:true},
	email:{type:String,unique:true},
	password:String,
	id:Number,
	state:{type:Number,default:0},
	studyBooks:[{
		id:{type:String},
		name:{type:String},
		pic:{type:String},
		state:{type:Number},
		cateId:{type:Number},
		addDate:{type:Date,default:Date.now()}
	}],
	drafts:[{
		plat:String,
		link:String,
		name:String,
		dataId:Number
	}],
	attentionCates:Array,
	lastLoginDate:{type:Date,default:Date.now()},
	addDate:{type:Date,default:Date.now()}
})
UserSchema.path("email").validate(function(value){
	return /^((([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+(\.([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+)*)|((\x22)((((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(([\x01-\x08\x0b\x0c\x0e-\x1f\x7f]|\x21|[\x23-\x5b]|[\x5d-\x7e]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(\\([\x01-\x09\x0b\x0c\x0d-\x7f]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))))*(((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(\x22)))@((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))$/i.test(value);
},'电子邮箱格式错误')
UserSchema.pre('save',function(next){
	if (!this.id) {
		var self=this;
		//var idGenerator=require('./idGenerator');
		idGenerator.getNewId('user',function(id){
		 	self.id=id;
			next();
		});
	}
	else{
		next();
	}
})
UserSchema.virtual('addDate2').get(function(date){
	var date=this.addDate;
	return date.getFullYear()+'年'+(date.getMonth()+1)+'月'+date.getDate()+'日';
})
UserSchema.statics.findByUserId=function(id,fn){
	var key="webUser2"+id;
	var self=this;
	cache.get(key,function(err,data){
		if (err) {
			throw err;
		}
		if (data) {
			
			fn(JSON.parse(data));
		}else{
			
			self.findOne({id:id}).select({password:0,_id:0,__v:0}).exec(function(err,user){
				if (err) {
					throw err;
				}
				cache.set(key,JSON.stringify(user));
				fn(user);
			})
		}
	})
	
}
UserSchema.statics.addStudyBooks=function(id,book){
	var self=this;
	this.findByUserId(id,function(user){
		if (user.studyBooks) {
			var state=_.find(user.studyBooks,function(item){
				return book.id==item.id
			})
			
			if (state) {
				self.update({id:user.id,"studyBooks.id":book.id},{"$set":{"studyBooks.$.state":book.state}}).exec(function(err,re){
					if (err) {
						throw err;
					}
					console.log(re);
				})
			}else{
				self.update({id:user.id},{"$push":{"studyBooks":book}},function(err){
					if (err) {
						console.log(err);
					};
				})
			}
			cache.del("webUser2"+id);
		}
	})
}
UserSchema.statics.removeStudyBooks=function(id,bookId){
	this.update({id:id},{"$pull":{"studyBooks":{id:bookId}}},function(err){
		if (err) {
			console.error(err);
		};
		cache.del("webUser2"+id);
	})
}
UserSchema.statics.addDraft=function(id,link,name,plat,dataId){
	this.update({id:id},{"$push":{"drafts":{
									plat:plat,
									link:link,
									name:name,
									dataId:dataId
									}}},function(err,doc){
								if (err) {
									util.error(err);
								};
								cache.del("webUser2"+id);
							});
}
UserSchema.statics.removeDraft=function(id,plat,dataId){
	this.update({id:id},{"$pull":{"drafts":{plat:plat,dataId:dataId}}},function(err,doc){
								if (err) {
									util.error(err);
								};
								cache.del("webUser2"+id);
							});
}
module.exports=db.model('User',UserSchema);