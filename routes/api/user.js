var User=require('./../../models/user.js');

module.exports=function(app){
	app.get('/api/user/valid',function(req,res){
		if(req.query.username!=undefined){
			User.findOne({username:req.query.username},function(err,user){
				if (err) {res.send(500,'error')};
				if (user!=undefined) {
					res.send('false');
				}else{
					res.send('true');
				}
			})
		} 
		else if (req.query.useremail!=undefined) {
			User.findOne({email:req.query.useremail},function(err,user){
				if (err) {res.send(500,'error')};
				if (user!=undefined) {
					res.send('false');
				}
				else{
					res.send('true');
				}
			})
		}
	})
	app.post('/api/user/login',function(req,res){
		var username=req.body.username;
		var password=req.body.password;
		var remember=req.body.remember;
		if (username==undefined||username.trim()=="") {
			res.json('login',{ret:-1,msg:"username can't empty"});
		};
		if (password==undefined||password=="") {
			res.json('login',{ret:-1,msg:"password can't empty"});
		};
		var md5=require('crypto').createHash('md5');
		password=md5.update(req.body.password).digest('base64');

		if(/^[_0-9a-zA-Z\u4e00-\u9fa5]{2,12}$/i.test(username)){
		User.findOne({username:username},function(err,user){
			if (err||user==null) {
				res.json({ret:-1,msg:"username can't find"});
			}
			else if (user.password==password) {
				// req.session.user=user;
				// userHelper.login(res,user.username,user.id,remember);
				// res.redirect('/');
				req.session.user=user;
				res.json({ret:0,data:user});
			}
			else{
				res.json({ret:-1,msg:'password error'});
			}
		})
		}
		else{
			User.findOne({email:username},function(err,user){
				if (err||user==null) {
					res.json({ret:-1,msg:"email can't find"});
				}
				else if (user.password==password) {
					req.session.user=user;
					res.json({ret:0,data:user});
				}
				else{
					res.json({ret:-1,msg:'password error'});
				}
			})
		}

	})
	app.post('/api/user/atten',function(req,res){
		if (req.session.user) {
			var cateId=req.body.cateId;
			var cate=_.find(cates,function(item){
				return item.id==cateId;
			})
			if (cate) {
				User.update({id:req.session.user.id},{"$addToSet":{"attentionCates":cate}},function(err,doc){
					if (err) {
						throw err;
					}
					res.json({ret:0,data:doc});
				})
			}else{
				res.json(401,'params not match');
			}
			
		}else{
			res.json(410,'not login');
		}
	})
	app.delete('/api/user/atten',function(req,res){
		if (req.session.user) {
			var cateId=req.body.cateId;
			if (cateId) {
				User.update({id:req.session.user.id},{"$pull":{"attentionCates":{id:cateId}}},function(err,doc){
					if (err) {
						throw err;
					}
					res.json({ret:0,data:doc});
				})
			}else{
				res.json(401,'params not match');
			}
			
		}else{
			res.json(410,'not login');
		}
	})
}