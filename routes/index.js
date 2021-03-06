var Book=require('./../models/book.js');
var User=require('./../models/user.js');
var Note=require('./../models/note.js');
var Question=require('./../models/question.js');
/*
 * GET home page.
 */
 function login(req,res,user,isRemember,returnUrl){
 	req.session.user=user;
 	if (isRemember) {
 		var hour = 3600000;
		req.session.cookie.expires = new Date(Date.now() + hour);
		req.session.cookie.maxAge = hour;
 	};
	if (returnUrl) {
	}
	else if(req.query.returnUrl){
		returnUrl=req.query.returnUrl;
	}
	else if (!returnUrl&&req.headers.referer) {
		returnUrl=req.headers.referer;
	}
	else{
		returnUrl="/";
	}
	//auth
	if (returnUrl.indexOf('/')!=0) {
		if (!(/91xueya.com/i.test(returnUrl))) {
			returnUrl="/";
		};
	};
	User.update({id:user.id},{"$set":{lastLoginDate:Date.now()}}).exec();
	res.redirect(returnUrl);
 }
module.exports=function(app){
	
	app.get('/',  function(req, res){
		var title='91学涯'
			,studyBooks=[];
		if (req.cUser) {
			title=req.cUser.username;

			var readingBook=_.filter(req.cUser.studyBooks,function(item){
				return item.state==0;
			});
			studyBooks=_.sortBy(readingBook,function(item){
				return item.addDate;
			})

		};

		/*test*/
		var Recommend=require('./../bll/recommend.js');
		Recommend.note(req.cUser,15,function(arr){
			console.log('1');
			Recommend.cate(req.cUser,2,function(cates){
				console.log('2');	
				Recommend.book(req.cUser,5,function(book){
					console.log('3');
					res.render('index',{title:title,recommends:arr,hotCates:cates,readingBook:studyBooks,recommendBooks:book});
				})
			})
		})
		
	});
	app.get('/reg',function(req,res){
		res.render('reg',{title:'注册-要学涯',user:{username:"",email:""},error:''});
	});
	app.post('/reg',function(req,res){
		var User=require('./../models/user.js');
		var md5=require('crypto').createHash('md5');
		var password=md5.update(req.body.password).digest('base64');
		var newUser=new User({
			username:req.body.username,
			email:req.body.useremail,
			password:password,
			state:0,
			addDate:new Date()
		});

		newUser.save(function(err){
			if (err) {
				res.render('reg',{error:err,user:newUser,title:'注册-要学涯',error:'注册失败'})}
			else{
				login(req,res,newUser,false,"/");
			}	

		})
	});
	app.all('/login',function(req,res,next){
		if (req.session.user) {
			res.redirect('/');
		}else{
			next();
		}
	})
	app.get('/login',function(req,res){
		if (req.session.user) {
			res.redirect('/');
		}
		else{
			var url=req.headers.referer
			res.render('login',{title:'登录-要学涯',user:{username:""},error:'',url:url});
		}
		
	});
	app.post('/login',function(req,res){
		var username=req.body.username;
		var password=req.body.password;
		var url=req.body.url;
		if (req.query.returnUrl) {
			url=req.query.returnUrl;
		};
		var remember=req.body.remember;
		if (username==undefined||username.trim()=="") {
			res.render('login',{title:'登录-要学涯',user:{username:""},error:'用户名不能为空',url:url});
		};
		if (password==undefined||password=="") {
			res.render('login',{title:'登录-要学涯',user:{username:username},error:'密码不能为空',url:url});
		};
		var User=require('./../models/user.js');
		var md5=require('crypto').createHash('md5');
		password=md5.update(req.body.password).digest('base64');


		if(/^[_0-9a-zA-Z\u4e00-\u9fa5]{2,12}$/i.test(username)){
		User.findOne({username:username},{id:1,username:1,password:1},function(err,user){
			if (err||user==null) {
				res.render('login',{title:'登录-要学涯',user:{username:username},error:"该用户没有找到",url:url});
			}
			else if (user.password==password) {
				login(req,res,user,remember,url);
			}
			else{
				res.render('login',{title:'登录-要学涯',user:{username:username},error:'密码错误',url:url});
			}
		})
		}
		else{
			User.findOne({email:username},function(err,user){
				if (err||user==null) {
					res.render('login',{title:'登录-要学涯',user:{username:username},error:"该邮箱没有找到",url:url});
				}
				else if (user.password==password) {
					login(req,res,user,remember,url);
				}
				else{
					res.render('login',{title:'登录-要学涯',user:{username:username},error:'密码错误',url:url});
				}
			})
		}

		
	});
	app.get('/logout',function(req,res){
		//res.clearCookie('user');
		req.session.user=null;
		res.redirect('back');
	});
	app.get('/error',function(req,res){
		res.render('error',{title:'error',msg:req.query.msg})
	})
	app.get('/cates',function(req,res){
		var Cate=require('./../models/cate');
		if (req.session.user) {
			User.findByUserId(req.session.user.id,function(user){
				var  ids=[];
				if (user.attentionCates) {
					ids=_.map(user.attentionCates,function(item){
						return parseInt(item.id);
					})
				};
				Cate.find({},{id:1,name:1,alias:1,desc:1},function(err,cates){
					res.render('cates',{title:'发现',data:cates,ids:ids});
				})
			})
		}else{
			Cate.find({},{id:1,name:1,alias:1,desc:1},function(err,cates){
				res.render('cates',{title:'发现',data:cates,ids:[]});
			})
		}
		
		
	})
	app.get('/setting',function(req,res){
		if (req.session.user) {
			res.render('setting',{title:req.session.user.name+'de设置'});
		}
		else{
			res.redirect('/login');
		}
	})
	app.get('/about',function(req,res){
		res.render('about',{title:'about'});
	})
	app.get('/join',function(req,res){
		res.render('join',{title:'join'});
	})
	app.get('/message',function(req,res){
		res.render('message',{title:'message'});
	})
	app.get('/feedback',function(req,res){
		res.render('feedback',{title:'feedback'});
	})
}