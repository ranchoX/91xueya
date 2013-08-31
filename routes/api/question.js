var Question=require('./../../models/question.js');
var xss=require('xss');
var pageSize=20;
module.exports=function(app){
	app.get('/api/question',function(req,res){
		var cateId=parseInt(req.query.cateId);
		var page=parseInt(req.query.page);
		var findObj=Question.find({state:0});
		if (cateId) {
			findObj.where("cateId",cateId);
		}
		if(!page){
			page=1;
		}
		findObj.sort("-addDate");
		findObj.limit(page*pageSize).exec(function(err,doc){
			if (err) {throw err}
			res.json(doc);
		})
	})
	app.post('/api/question',function(req,res){
		if (req.session.user) {
			var question=new Question();
			var cate=_.find(cates,function(item){
				return item.id==req.body.cateId;
			})
			if (!cate) {
				res.json({ret:-1,msg:'分类没有找到'})
			}
			question.cateId=cate.id;
			question.cateName=cate.name;
			var subjectId=parseInt(req.body.subjectId);
			if (subjectId) {
				question.subject={
					id:subjectId
				}
				if (req.body.chapter) {
					question.subject.chapter=req.body.chapter;
				};
			};
			question.title=req.body.title;
			question.content=xss(req.body.content);
			question.userId=req.session.user.id;
			question.userName=req.session.user.username;
			question.save(function(err,doc){
				if (err) {
					res.json(411,err);
				}
				res.json(doc);
			})
		}else{
			res.json(401,'请先登录');
		}
	})
	app.post('/api/question/:id',function(req,res){
		if (req.session.user) {
			var content= req.body.content;
			var answer={
				content:content,
				userId:req.session.user.id,
				userName:req.session.user.username
			};
			if (content) {
				Question.addAnswer(req.params.id,answer,function(re){
					res.json(re);
				})
			}else{
				res.json(412,'请提供必要的参数')
			}
		}else{
			res.json(401,'请先登录');
		}
	})
	app.post('/api/question/reask/:id',function(req,res){
		if (req.session.user) {
			var answerId=req.body.answerId;
			var content=req.body.content;
			if (answerId&&content) {
				Question.addAsk(req.params.id,req.session.user.id,answerId,content,function(ques){
					res.json({ret:0,data:req.params.id});
				})
			}else{
				res.json(412,'请提供必要的参数')
			}
		}else{
			res.json(401,'请先登录');
		}
	})
	app.post('/api/question/reanswer/:id',function(req,res){
		if (req.session.user) {
			var answerId=parseInt(req.body.answerId);
			var content=req.body.content;
			var reAskId=parseInt(req.body.reAskId);
	
			if (answerId&&content&&(reAskId>-1)) {
				Question.reAnswer(req.params.id,req.session.user.id,answerId,reAskId,content,function(ques){
					res.json({ret:0,data:req.params.id});
				})
			}else{
				res.json(412,'请提供必要的参数')
			}
		}else{
			res.json(401,'请先登录');
		}
	})
	app.post('/api/question/accept/:id',function(req,res){
		if (req.session.user) {
			var answerId= req.body.answerId;
			if (answerId) {
				Question.update({id:req.params.id,userId:req.session.user.id},{acceptIndex:answerId},function(ques){
					console.log(ques);
					res.json({ret:0,data:req.param.id});
				})
			}else{
				res.json(412,'请提供必要的参数')
			}
		}else{
			res.json(401,'请先登录');
		}
	})
	app.delete('/api/question/:id',function(req,res){
		if (req.session.user) {
			Question.update({id:req.params.id,userId:req.session.user.id},{"$set":{state:-1}},function(err,question){
					if (err) {
						util.error(err);
						res.json(500,'server error');
					}
					if (question) {
						res.json('ok');
					}else{
						res.json(410);
					}
			})
		}else{
			res.json(401,'请先登录');
		}
	})
}