var Comment=require('./../../models/comment');
var Book=require('./../../models/book');
var Note=require('./../../models/note');
var Question=require('./../../models/question');
var CommentPlats=require('./../../models/commentPlat.json');
module.exports=function(app){
	app.all('/api/comment',function(req,res,next){
		// if (!req.session.user) {
		// 	res.json({ret:-100,msg:'pelase login'});
		// }else{
			var platName=req.param('plat');//query.plat||req.body.plat;
			var targetId=req.param('targetId');//query.targetId||req.body.targetId;
			var plat= _.find(CommentPlats,function(type){
				return type.name==platName;
			})
			if (plat&&!isNaN(targetId)) {
				req.platId=plat.id;
				req.targetId=parseInt(targetId);
			}
			next();
			
			
		//}
	})
	app.get('/api/comment',function(req,res){
		if (req.platId&&req.targetId) {
			var qurey= Comment.find({state:0,plat:req.platId,targetId:req.targetId});
			qurey.sort('-addDate').exec(function(err,comments){
				if (err) {
					util.error(err);
					res.json(500,'server error');

				}
				res.json(comments);
			})
		}
		else{

			res.json(412,'plat not match2');
		}
	})
	app.post('/api/comment',function(req,res){
		if (req.session.user) {
			if (req.platId&&req.targetId) {
				var comment=new Comment();
				comment.content=req.body.content;
				comment.userId=req.session.user.id;
				comment.userName=req.session.user.username;
				comment.plat=req.platId;
				comment.targetId=req.targetId;
				comment.save(function(err,doc){
					if (err) {
						util.error(err);
						res.json(500,'server error');
					}else{
						var platName=req.param('plat');
						switch(platName){
							case 'book':
								Book.update({id:req.targetId},{"$inc":{"commentNum":1}}).exec();
								break;
							case 'note':
								Note.update({id:req.targetId},{"$inc":{"commentNum":1}}).exec();
								break;
							case 'question':
								Question.update({id:req.targetId},{"$inc":{"commentNum":1}}).exec();
								break;
							default:
								console.log('default');
						}
						res.json(doc);
					}
				})
			}
			else{
				res.json(412,'plat not match');
			}
		}else{
			res.json(401,'not login');
		}
		
		
	})
	app.post('/api/comment/reply',function(req,res){
		if (req.session.user) {
			var comment={
				content:req.body.content,
				replyUserId:req.body.replyUserId,
				replyUserName:req.body.replyUserName,
				userId:req.session.user.id,
				userName:req.session.user.username
			};
			var id=req.body.id;
			if (id&&comment.content&&comment.replyUserId&&comment.replyUserName) {
				Comment.update({id:id},{"$push":{children:comment}},function(err){
					if (err) {
						throw err;
					}else{
						res.json({ret:0});
					}
				})
			}
			else{
				res.json(412,'params not match');
			}
			
		}else{
			res.json(401,'not login');
		}
	})
	app.delete('/api/comment/:id',function(req,res){
		Comment.remove({id:req.params.id},function(doc){
			console.log(arguments);
			res.json({ret:0,data:req.body.id});
		})
	})
}