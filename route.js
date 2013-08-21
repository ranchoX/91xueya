
module.exports=function(app){
	var User=require('./models/user.js');
	var Book=require('./models/book.js');
	app.param('id',Number); 
	app.param('user',function(req,res,next,id){
	  if (!/^\d+$/.test(id)) {next(new Error('格式错误'))};
	  User.findOne({id:id},function(err,user){
	    if (err) {next(err)}
	    else if(user){
	      req.user=user;
	      next();
	    }
	    else{
	      next(new Error('没有找到对应的用户'));
	    }
	  })
	});
	app.param('book',function(req,res,next,id){
	  if (!/^\d+$/.test(id)) {next(new Error('格式错误'))};
	  Book.findOne({id:id},function(err,book){
	    if (err) {next(err)}
	    else if(book){
	      req.book=book;
	      next();
	    }
	    else{
	      next(new Error('没有找到对应的书籍'));
	    }
	  })
	});
	var routes = require('./routes/index.js')
	routes(app);
	var route_user = require('./routes/user.js')
	route_user(app);
	
	var route_subject=require('./routes/book.js');
	route_subject(app);
	var route_note=require('./routes/note.js');
	route_note(app);
	var route_word=require('./routes/word.js');
	route_word(app);
	var route_question=require('./routes/question.js');
	route_question(app);
	//api
	var apiUser=require('./routes/api/user');
	apiUser(app);
	var apiSubject=require('./routes/api/book');
	apiSubject(app);
	var apiNote=require('./routes/api/note');
	apiNote(app);
	var apiComment=require('./routes/api/comment');
	apiComment(app);
	var apiQuestion=require('./routes/api/question');
	apiQuestion(app);
	var apiFile=require('./routes/api/file');
	apiFile(app);
	var apiBroadcast=require('./routes/api/broadcast');
	apiBroadcast(app);

	//admin
	var admin=require('./routes/admin/index');
	admin(app);
	var route_cate=require('./routes/cates.js');
	route_cate(app);
}