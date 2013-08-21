var Subject=require('./../models/book.js');
var Note=require('./../models/note.js');
module.exports=function(app){
	app.all('/note/add',function(req,res,next){
		if (req.session.user) {next();}
		else{
			res.redirect('/login?returnUrl=/note/add');
		}
	});
	app.get('/note/add',function(req,res){
		var reffer='';
		var subjectId=parseInt(req.query.subjectId);
		var note=new Note();
		var id=parseInt(req.query.id);
		if (subjectId) {
				Subject.findOne({id:subjectId},{"name":1,"menus.id":1,"menus.chapter":1,"menus.desc":1},function(err,doc){
					if (doc) {
						note.chapters=doc.menus;
						note.subjectName=doc.name;
						note.subjectId=subjectId;
						res.render('note/add',{title:'写笔记',note:note});

					}else{
						res.render('note/add',{title:'写笔记',note:note});
					}
				})
		}
		else if(id){
			Note.findOne({id:id},function(err,doc){
				if (err) {
					utils.error(err);
					res.render('note/add',{title:'写笔记',note:note});
				};
				if (doc) {
					if (doc.userId==req.session.user.id) {
						note=doc;
						Subject.findOne({id:note.subjectId},{"menus.id":1,"menus.chapter":1,"menus.desc":1},function(err,doc){
							if (doc) {
								note.chapters=doc.menus;
								res.render('note/add',{title:'修改笔记',note:note});

							}else{
								res.render('note/add',{title:'写笔记',note:note});
							}
						})
					}else{
						res.redirect('/error?msg=not auth');
					}
				}else{
					res.redirect('/error?msg=noteid not exist');
				}
			})	
		}
		else{
			res.render('note/add',{title:'写笔记',note:note});
		}
	})
	app.get('/note/:id',function(req,res){
		Note.findOne({id:req.params.id},function(err,doc){
			if (err) {
				util.error(err);
				res.redirect('/note');
			}
			if (doc) {
				if (doc.state==1||doc.userId==req.session.user.id) {
					var cate=_.find(cates,function(item){
						return item.id==doc.cateId;
					});
					res.render('note/index',{title:doc.userName+'对《'+doc.subjectName+'》的笔记',note:doc,cate:cate});
				}else{
					res.redirect('/error?msg=note not auth');
				}
				
			}else{
				res.redirect('/error?msg=noteid not exists');
			}
		})
	})
	app.get('/notes',function(req,res){
		var query=Note.find({userId:req.session.user.id});
		query.limit(20).sort("addDate").exec(function(err,doc){
			if (err) {
				util.error(500);
				res.redirect('/error?msg=error');
			}
			else{
				res.render('note/list.ejs',{title:req.session.user.username+'的笔记',notes:doc});
			}
		})
	})
}