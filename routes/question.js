
var Question=require('./../models/question.js');
module.exports=function(app){
	app.get('/question/:id',function(req,res){
		Question.findOne({id:req.params.id},function(err,ques){
			if (err) {
				util.error(err);
			};
			if (ques) {
				var hadAnswer=false;
				if (req.session.user) {
					var answer= _.find(ques.answers,function(item){
						return item.userId==req.session.user.id;
					})
					if (answer) {
						hadAnswer=true;
					};
				};
				
				res.render('question/index',{title:'question',ques:ques,hadAnswer:hadAnswer});

			}else{
				res.redirect('/error?msg=id_not_find');
			}
		})
		
	})
	app.get('/question/edit/:id',function(req,res){
		if (req.session.user) {
			Question.findOne({id:req.params.id},function(err,ques){
				if (err) {
					throw err;
				}
				else if (ques) {
					if (ques.userId==req.session.user.id) {
						res.render('question/edit',{title:'编辑问题',ques:ques});
					}else{
						res.redirect('/error?msg=notauth');
					}
				}else{
					res.redirect('/error?msg=id_not_find_question');
				}
			})
		}else{
			res.redirect('/login');
		}
	})
	app.post('/question/edit/:id',function(req,res){
		if (req.session.user) {
			Question.update({id:req.params.id,userId:req.session.user.id},{
				title:req.body.title,
				content:req.body.content,
				location:req.body.location
			},function(err,ques){
				if (err) {
					throw err;
				}else{
					res.redirect('/question/'+req.params.id);
				}
			})
			
		}else{
			res.redirect('/login');
		}
	})
}