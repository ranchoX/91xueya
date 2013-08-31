var Book=require('./../models/book.js');
var Note=require('./../models/note.js');
module.exports=function(app){
	app.all('/note/add',function(req,res,next){
		if (req.session.user) {next();}
		else{
			res.redirect('/login?returnUrl=/note/add');
		}
	});
	app.get('/note/add',function(req,res){
		var reffer=req.headers.referer;
		if (!reffer) {
			reffer="/"
		};
		res.locals.reffer=reffer;
		res.locals.title='新建分享'
		var subjectId=parseInt(req.query.subjectId);
		var note=new Note();
		var id=parseInt(req.query.id);
		if (subjectId) {
			Book.findSimpleById(id,function(doc){
				if (doc) {
					note.subjectId=subjectId;
					note.cateId=doc.cateId;
					res.render('note/add',{title:'写笔记',note:note});
				}else{
					res.render('note/add',{title:'写笔记',note:note});
				}
			})
		}
		else if(id){
			res.locals.title='编辑分享';
			Note.findByNoteId(id,function(doc){
				if (doc) {
					if (doc.userId==req.session.user.id) {
						res.render('note/add',{title:'写笔记',note:doc});
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
				if (doc.state==1||(req.session.user&&doc.userId==req.session.user.id)) {
					var cate=_.find(cates,function(item){
						return item.id==doc.cateId;
					});
					var title;
					if (doc.title) {
						title= doc.title;
					}
					else if(doc.subject){
						return '关于《'+doc.subject.name+'》的笔记';
					}
					else if(req.session.user&&note.userId==req.session.user.id){
						title= toDate(doc.addDate)+'新建的笔记';
					}else{
						title= doc.userName+'的笔记';
					}
					res.render('note/index',{title:title,note:doc,cate:cate});
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