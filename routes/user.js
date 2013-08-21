
var Note=require('./../models/note');

module.exports = function(app){
	app.get('/u:user',function(req,res){
		Note.find({userId:req.user.id}).limit(5).sort("addDate").exec(function(err,notes){
			if (err) {
				util.error(err);
				notes=[];
			};
			res.render('user/index',{title:req.user.username+'的主页',user:req.user,notes:notes});
		})
		
	})
	app.get('/u:user/note',function(req,res){
		Note.find({userId:req.user.id}).limit(5).sort("addDate").exec(function(err,notes){
			if (err) {
				util.error(err);
				notes=[];
			};
			res.render('user/index',{title:req.user.username+'的主页',user:req.user,notes:notes});
		})
		
	})
	app.get('/u:user/question',function(req,res){
		Note.find({userId:req.user.id}).limit(5).sort("addDate").exec(function(err,notes){
			if (err) {
				util.error(err);
				notes=[];
			};
			res.render('user/index',{title:req.user.username+'的主页',user:req.user,notes:notes});
		})
		
	})
	app.get('/u:user',function(req,res){
		Note.find({userId:req.user.id}).limit(5).sort("addDate").exec(function(err,notes){
			if (err) {
				util.error(err);
				notes=[];
			};
			res.render('user/index',{title:req.user.username+'的主页',user:req.user,notes:notes});
		})
		
	})
};