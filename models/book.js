var Schema=require('mongoose').Schema;
var BookSchema=new Schema({
	id:Number,
	name:{type:String},
	pic:{type:String,require:true},
	desc:{type:String,require:true},
	author:{type:String,require:true},
	publisher:{type:String,require:true},
	publishDate:Date,
	pdf:String,
	cateId:{type:Number,require:true},
	cateName:String,
	userId:Number,
	userName:String,
	addDate:{type:Date,default:Date.now()},
	menus:{type:String},
	commentNum:{type:Number,default:0},
	studyPeoples:[{
		userId:{type:Number},
		userName:{type:String},
		state:{type:Number,default:0}
	}],
	state:{type:Number,default:0}
});

BookSchema.pre('save',function(next){
	var self=this;
	if (!this.id) {
		//var idGenerator=require('./idGenerator');
		idGenerator.getNewId('book',function(id){
		 	self.id=id;
			next();
		});
	}
	else{
		next();
	}
})
BookSchema.pre('save',function(next){
	var self=this;
	if (this.pic.indexOf('tmp')>0) {
		var filePath= __dirname+'/../public'+self.pic;
		var fs=require('fs');
		var path=require('path');
		fs.readFile(filePath,function(err,data){
			if (err) {
				throw err;
			}else{
				var url=self.pic.replace('img/tmp','img/book');
				var newPath=__dirname+'/../public'+url;
				fs.writeFile(newPath,data,function(err){
					if (err) {
						throw err;
					}else{
						self.pic=url;
						fs.unlink(filePath);
						next();
					}
				})
			}
		})
	}else{
		next();
	}
})
BookSchema.virtual("publishDate2").get(function(){
	if (this.publishDate) {
		var date=this.publishDate;
		return date.getFullYear()+'年'+(date.getMonth()+1)+'月'+date.getDate()+'日';
	}else{
		return undefined;
	}
	
})
BookSchema.virtual("subjectType").get(function(){
	return 'book';
})
BookSchema.statics.findSimpleById=function(id,fn){
	this.findOne({id:id},{id:1,name:1,pic:1,cateId:1,cateName:1},function(err,doc){
		if (err) {
			utils.error(err);
		}
		fn(doc);
	})
}
BookSchema.statics.findByBookId=function(id,fn){
	var key="bookId"+id;
	var self=this;
	cache.get(key,function(err,book){
		if (book) {
			fn(JSON.parse(book));
		}else{
			self.findOne({id:id},function(err,doc){
				if (err) {
					utils.error(err);
				}
				cache.set(key,JSON.stringify(doc));
				fn(doc);
			})
		}
	})
	
}
BookSchema.statics.addStudy=function(id,studyUser){
	var self=this;
	self.findByBookId(id,function(book){
		if (book) {
			var people=_.find(book.studyPeoples,function(p){
				return p.userId==studyUser.userId;
			});
			if (people) {
				self.update({id:book.id,"studyPeoples.userId":studyUser.userId},{"$set":{"studyPeoples.$.state":studyUser.state}},function(err){
					if (err) {
						util.error(err);
					};
				})
			}else{
				self.update({id:book.id},{"$push":{"studyPeoples":studyUser}},function(err){
					if (err) {
						util.error(err);
					};
				})
			}
			//不等待上面的执行
			var User=require('./user');
			var studyBook={id:book.id,name:book.name,pic:book.pic,state:studyUser.state};
			User.addStudyBooks(studyUser.userId,studyBook);
		};
			
	})
}
BookSchema.statics.removeStudy=function(id,userId){
	this.update({id:id},{"$pull":{"studyPeoples":{userId:userId}}},function(err){
		if (err) {
			console.error(err);
		};
	})
	var User=require('./user');
	User.removeStudyBooks(userId,id);
}
BookSchema.statics.push=function(id){
	this.findByBookId(id,function(book){
		if (book) {
			var Broadcast=require('./broadcast');
			var broadcast=new Broadcast();
			broadcast.source='book';
			broadcast.title="最近添加的书籍《"+book.name+"》";
			broadcast.content=book.desc.substring(0,200);
			broadcast.cateId=book.cateId;
			broadcast.userName='系统';
			broadcast.link='/book/'+book.id;
			broadcast.save(function(err){
				if (err) {
					util.error(err);
				}
			})
		};
	})
}
BookSchema.set('toJSON', { virtuals: true })
module.exports=db.model('book',BookSchema);

