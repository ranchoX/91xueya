
var Question=require('./../models/question.js');
var Book=require('./../models/book.js');
module.exports=function(app){
	app.get('/question/:id',function(req,res){
		Question.findOne({id:req.params.id},function(err,ques){
			if (err) {
				util.error(err);
			};
			if (ques) {
				var hadAnswer=false;
				if (req.cUser) {
					var answer= _.find(ques.answers,function(item){
						return item.userId==req.cUser.id;
					})
					if (answer) {
						hadAnswer=true;
					};
				};
				if (ques.subject) {
					Book.findByBookId(ques.subject.id,function(book){
						res.render('question/index',{title:ques.title+'-问题',ques:ques,hadAnswer:hadAnswer,book:book});	
					})
				}else{
					res.render('question/index',{title:ques.title+'-问题',ques:ques,hadAnswer:hadAnswer,book:null});	
				}
				
				

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