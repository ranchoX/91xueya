var Note=require('./../../models/note.js');
var User=require('./../../models/user.js');
var Book=require('./../../models/book.js');
var Broadcast=require('./../../models/broadcast.js');
var pageSize=20;
module.exports=function(app){
	app.get('/api/note',function(req,res){
		var cateId=parseInt(req.query.cateId);
		var page=parseInt(req.query.page);
		var findObj=Note.find({state:1});
		if (cateId) {
			findObj.where("cateId",cateId);
		}
		if(!page){
			page=1;
		}
		findObj.limit(page*pageSize).sort("-addDate").exec(function(err,doc){
			if (err) {throw err}
			res.json(doc);
		})
	})
	app.all('/api/note',function(req,res,next){
		if (req.session.user) {
			next();
		}else{
			res.json(401,{msg:'pelase login'});
		}
	})
	
	app.post('/api/note',function(req,res){
			var note=new Note(req.body);
			note.userId=req.session.user.id;
			note.userName=req.session.user.username;
			note.state=parseInt(req.body.state);
			Book.findOne({id:note.subjectId},{cateId:1,cateName:1,name:1},function(err,book){
				if (err) {
					throw err;
				}
				else if(book){
					note.subjectName=book.name;
					note.cateId=book.cateId;
					note.cateName=book.cateName;
					note.save(function(err,doc){
						if (err) {
							util.error(err);
							res.json({ret:-500,msg:'server error'});
						};
						//draft
						if (doc.state==0) {
							User.addDraft(note.userId,'/note/'+doc.id,doc.chapterName+'笔记',doc.id);
						}else{
							//广播推送
							Note.push(doc.id);
						}
						res.json({ret:0,data:doc.id});
					});
				}else{
					res.json(412,'book not find');
				}
			})
			
		
		
	})
	app.put('/api/note/:id',function(req,res){
			if (req.params.id) {
				var modify={
					content:req.body.modifyContent,
					addDay:new Date()
				};
				var isPublish=false;
				var state=req.body.state;
				if (state==2) {
					state=1;
					isPublish=true;
					//todo:
				};
				Note.update({id:req.params.id,userId:req.session.user.id},{"$set":{
					chapterName:req.body.chapterName,
					content:req.body.content,
					state:state,
					updateDate:new Date()
				},"$push":{modifies:modify}},function(err,doc){
					if (err) {
						util.error(err);
						res.json(500,{msg:'server error'});
					}
					if (doc) {
						if (isPublish) {
							Note.push(req.params.id);
							User.remvoeDraft(note.userId,'note',doc.id);
						};
						res.json({ret:0,data:req.params.id});
					}else{
						res.json({ret:-1,msg:'id not exists'});
					}
					
				})
			}else{
				res.json({ret:-1,msg:'请提供NoteId'})
			}
		
	})
	app.delete('/api/note/:id',function(req,res){
		
		if (req.params.id) {
			Note.remove({id:req.params.id,userId:req.session.user.id},function(err){
				if (err) {
					res.json({ret:-1})
				}else{
					res.json({ret:0,data:id});
				}
			})
		}
		else{
			res.json(412,{msg:'need note id'});
		}
	})
}