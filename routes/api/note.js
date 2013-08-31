var Note=require('./../../models/note.js');
var User=require('./../../models/user.js');
var Book=require('./../../models/book.js');
var Broadcast=require('./../../models/broadcast.js');
var xss=require('xss');
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
			note.content=xss(req.body.content);
			if (note.content.trim()=="") {
				res.json({ret:-1,msg:'内容不能为空'});
				return ;
			};
			if (note.state==1) {
				note.publishDate=Date.now();
			};
			var subjectId=parseInt(req.body.subjectId);
			if (subjectId) {
				Book.findByBookId(subjectId,function(book){
					if (book) {
						note.subject={
							id:book.id,
							pic:book.pic,
							name:book.name
						}
						if (req.body.chapter) {
							note.subject.chapter=req.body.chapter;
						};
						note.save(function(err,doc){
							if (err) {
								util.error(err);
								res.json({ret:-500,msg:'server error'});
							};
							//draft
							if (doc.state==0) {
								var pushTitle;
								if (note.title) {
									pushTitle= note.title;
								}
								else if(note.subjectName){
									pushTitle= '关于《'+note.subjectName+'》的笔记';
								}
								else {
									var dt=new Date();
									pushTitle= dt.getFullYear()+'年'+dt.getMonth()+'月'+dt.getDay()+'日'+'新建的笔记';
								}
								User.addDraft(note.userId,'/note/'+doc.id,pushTitle,doc.id);
							}else{
								//广播推送
								Note.push(doc.id);
							}
							res.json({ret:0,data:doc.id});
						});
					};
				})
			}else{
				note.save(function(err,doc){
					if (err) {
						util.error(err);
						res.json({ret:-500,msg:'server error'});
					};
					//draft
					if (doc.state==0) {
						var pushTitle;
						if (note.title) {
							pushTitle= note.title;
						}
						else if(note.subject){
							pushTitle= '关于《'+note.subject.name+'》的笔记';
						}
						else {
							pushTitle= note.addDate+'新建的笔记';
						}
						User.addDraft(note.userId,'/note/'+doc.id,pushTitle,doc.id);
					}else{
						//广播推送
						Note.push(doc.id);
					}
					res.json({ret:0,data:doc.id});
				});
			}
			
	})
	app.put('/api/note/:id',function(req,res){
			if (req.params.id) {
				var set={
					content:xss(req.body.content),
					cateId:req.body.cateId,
					cateName:req.body.cateName
				};
				if (set.content.trim()=="") {
					res.json({ret:-1,msg:'内容不能为空'});
					return ;
				};
				if (req.body.title) {
					set.title=req.body.title;
				}
				
				var isPublish=false;
				var state=req.body.state;
				if (state==2) {
					set.state=1;
					isPublish=true;
					set.publishDate=Date.now();
				};
				var modify;
				if (req.body.modify) {
					modify=req.body.modify;
				}else{
					modify="未填写";
				}
				var update={"$set":set,"$push":{modifies:{
					content:modify,
					addDate:new Date()
				}}};
				var updateData=function(){
					
					Note.update({id:req.params.id,userId:req.session.user.id},update,function(err,doc){
						if (err) {
							util.error(err);
							res.json(500,{msg:'server error'});
						}
						if (doc) {
							if (isPublish) {
								Note.push(req.params.id);
								User.remvoeDraft(req.session.user.id,'note',doc.id);
							};
							cache.del("NoteId"+req.params.id);
							res.json({ret:0,data:req.params.id});
						}else{
							res.json({ret:-1,msg:'id not exists'});
						}
					})
				}
				var subjectId=parseInt(req.body.subjectId)
				if (subjectId) {
					Book.findByBookId(subjectId,function(book){
						update["$set"].subject={
							id:book.id,
							pic:book.pic,
							name:book.name
						}
						if (req.body.chapter) {
							update["$set"].subject.chapter=req.body.chapter;
						};
						updateData();
					})
				}else{
					update["$unset"]={"subject":1};
					updateData();
				}
				
			}else{
				res.json({ret:-1,msg:'请提供NoteId'})
			}
		
	})
	app.post('/api/note/publish',function(req,res){
		if (req.session.user) {
			if (req.body.id) {
				Note.update({id:req.body.id,userId:req.session.user.id},{state:1},function(err,re){
					if (err) {
						throw err;
					};
					if (re) {
						res.json({ret:0,data:re});
						User.remvoeDraft(req.session.user.id,'note',req.body.id);
					}else{
						res.json({ret:-1,msg:'error'});
					}
				})
			}else{
				res.json(412,{msg:'need note id'});
			}
		}else{
			res.json(401,{msg:'pelase login'});
		}
		
	})
	app.delete('/api/note/:id',function(req,res){
		if (req.params.id) {
			Note.remove({id:req.params.id,userId:req.session.user.id},function(err,re){
				if (err) {
					res.json({ret:-1})
				}else{
					res.json({ret:0,data:req.params.id});
				}
			})
		}
		else{
			res.json(412,{msg:'need note id'});
		}
	})
}