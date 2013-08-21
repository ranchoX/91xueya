var Note=require('./note.js');
var Book=require('./book.js');
var Question=require('./question.js');
var Cate=require('./cate.js');
module.exports=function(){
	this.waitCallback=function(callback){
		if (this.books&&this.notes&&this.questions) {
			var arr=_.union(this.books,this.notes,this.questions);
			
			var sortArr=_.sortBy(arr,function(item){
							return item.addDate;
						})
		
			callback(sortArr);
		};
		
	};
	this.user=function(user,callback){
		var self=this;
		var query=Book.find();
		var noteQuery=Note.find();
		var QuesQuery=Question.find({acceptIndex:{"$exists":false}});

		if (user) {
			if (user.attentionCates&&user.attentionCates.length>0) {
				var attenCates=_.map(user.attentionCates,function(item){
					return item.id;
				});
				query.where('cateId').in(attenCates);
				noteQuery.where('cateId').in(attenCates);
				QuesQuery.where('cateId').in(attenCates);
			};
			if (user.studyBooks) {
				var books=_.map(user.studyBooks,function(item){
					return item.id;
				});
				_.each(books,function(item){
					console.log(item);
				})
				query.where('id').nin(books);
			};
			//todo:添加大于最后登录时间，笔记发布时间大于最后登录时间，笔记大于最后登录时间。笔记按照人气排行
		};
		query.sort('-addDate');
		noteQuery.sort('-addDate');
		QuesQuery.sort('-updateDate');
		query.exec(function(err,books){
			if (err) {
				util.error(err);
			};
			if (!books) {
				self.books=[];
			}else{
				self.books=books;
			}
			self.waitCallback(callback);
		})
		noteQuery.exec(function(err,notes){
			if (err) {
				util.error(err);
			}
			if (!notes) {
				self.notes=[]
			}else{
				self.notes=notes;
			}
			self.waitCallback(callback);
		})
		QuesQuery.exec(function(err,ques){
			if (err) {
				util.error(err);
			}
			if (!ques) {
				self.questions=[]
			}else{
				self.questions=ques;
			}
			self.waitCallback(callback);
		})
	}
	this.cate=function(fn){
		//todo:算法还有待修正
		Cate.find().select({id:1,name:1,_id:0,alias:1}).limit(5).exec(function(err,cates){

			if (err) {
				throw err;
			}else{
				fn(cates);
			}
		})
	}
}