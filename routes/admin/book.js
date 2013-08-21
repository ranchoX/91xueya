var Book=require('./../../models/book.js');
var Cate=require('./../../models/cate.js');

module.exports=function(app){
	var cateConfig=[
		{"name":"书籍","link":"book"},
		{"name":"分享中心","link":"share"},
		{"name":"答疑","link":"question"},
		{"name":"交流中心","link":"change"}
	];
	app.all('/admin/*',function(req,res,next){
		if (req.session.user) {
			if (req.session.user.username=='rancho'||req.session.user.username=='Lycoria') {
				next();
			};
		}else{
			res.redirect('/error?msg=not auth');
		}
	})
	app.get('/admin/book/add',function(req,res){
		var book=new Book();
		book.name='';
		book.desc='';
		book.publisher='';
		book.author='';
		book.menus='';
		book.pic='';
		book.id=0;
		book.publishDate='2008-01-01';
		Cate.simples(function(newCates){
			res.render('book/add',{title:'书籍修改-要学涯',book:book,newCates:newCates});
		})
		
	})
	app.get('/admin/book/edit/:book',function(req,res){
		Cate.simples(function(newCates){
			res.render('book/add',{title:'书籍修改-要学涯',book:req.book,newCates:newCates});
		})
	})
	app.post('/admin/book/add',function(req,res){
		var book=new Book(req.body);
		book.userId=req.session.user.id;
		book.userName=req.session.user.username;
		book.type=1;
		for (var i = 0; i < cates.length; i++) {
			if(book.cateId==cates[i].id)
				book.cateName=cates[i].name;
		};
		book.desc=book.desc.trim();
		book.menus=book.menus.trim();
		if (book.id>0) {
			Book.update({id:book.id},{
				pic:book.pic,
				name:book.name,
				desc:book.desc,
				author:book.author,
				cateId:book.cateId,
				cateName:book.cateName,
				publisher:book.publisher,
				publishDate:book.publishDate,
				menus:book.menus
			},function(err,re){
				if (err) {
					console.log(err);
					res.render('book/add',{title:'书籍添加-要学涯',book:book});
					
				}else{

					res.redirect('book/'+book.id);
				}
			})
		}else{
			book.save(function(err,doc){
				if (err) {
					console.log(err);
					res.render('book/add',{title:'书籍添加-要学涯',book:doc});
				}
				else{
					Book.push(doc.id);
					res.redirect('book/'+doc.id);
				}
			})	
		}
		
		
	})
	app.get('/admin/cates',function(req,res){
		Cate.find({},function(err,data){
			if (err) {
				throw err;
			};
			res.render('cate/list',{title:'cates',data:data,config:cateConfig});
		})
	})
	app.get('/admin/cate/add',function(req,res){
		var cate=new Cate();
		res.render('cate/edit',{title:'cate add',data:cate,config:cateConfig});
	})
	app.get('/admin/cate/edit/:id',function(req,res){
		Cate.findOne({id:req.params.id},function(err,cate){
			if (err) {
				throw err;
			}else{
				res.render('cate/edit',{title:'cate add',data:cate,config:cateConfig});
			}
		})
		
	})
	app.post('/admin/cate/add',function(req,res){
		var cate=new Cate(req.body);
		var config=[];
		_.each(req.body.config,function(item){
			var confs=item.split(',');
			config.push({
				name:confs[0],
				link:confs[1]
			})
		});
		cate.config=config;
		if (cate.id) {
			Cate.update({id:cate.id},{
				name:cate.name,
				alias:cate.alias,
				desc:cate.desc,
				config:cate.config
			},function(err,re){
				if (err) {
					throw err;
				}else{
					res.redirect('/admin/cates');
				}
			})
		}else{
			cate.save(function(err,doc){
				if (err) {
					throw err;
				}
				else{
					res.redirect('/admin/cates');
				}
			})

		}
	})
}