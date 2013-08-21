var Book=require('./../../models/book.js');
var User=require('./../../models/user.js');
var pageSize=20;
module.exports=function(app){
	app.get('/api/book',function(req,res){
		var cateId=parseInt(req.query.cateId);
		var page=parseInt(req.query.page);
		var findObj=Book.find({state:1});
		if (cateId) {
			findObj.where("cateId",cateId);
		}
		if(!page){
			page=1;
		}
		findObj.select({id:1,name:1,pic:1,desc:1,publishDate:1,author:1,studyPeoples:1,commentNum:1}).limit(page*pageSize).exec(function(err,doc){
			if (err) {throw err}
			// _.each(doc,function(item){
			// 	if (item.desc.length>140) {
			// 		//item.ellipsis=item.desc.substring(0,140)+'....';
			// 		item.set('ellipsis',item.desc.substring(0,140)+'....');
			// 	};
			// })
		console.log(doc);
			res.json(doc);
		})
	})
	app.get('/api/book/:id',function(req,res){
		if (req.params.id) {
			Book.findByBookId(req.params.id,function(doc){
				if (doc) {
					res.json({ret:0,data:doc});
				}else{
					res.json({ret:-1,msg:'无效地址'});
				}
				
			})
		}
		else{
			res.json(null);
		}
	})
	app.post('/api/book/addstudy',function(req,res){
		if (req.session.user) {
			var studyType=parseInt(req.body.studyType);
			if (studyType!=1) {
				studyType=0
			}
			if (req.body.id) {
				var studyUser={userId:req.session.user.id,userName:req.session.user.username,state:studyType};
				Book.addStudy(req.body.id,studyUser);
				
				res.json({ret:0});
		
			}
			else{
				res.json(412,{msg:'id empty'});
			}
		}
		else{
			res.json(401,{msg:'not login'});
		}
		
	})
	app.delete('/api/book/addstudy',function(req,res){
		if (req.session.user) {
			if (req.body.id) {
				Book.removeStudy(req.body.id,req.session.user.id);
				res.json({ret:0});
			}
			else{
				res.json(412,{msg:'id empty'});
			}
		}
		else{
			res.json(401,{msg:'not login'});
		}
		
	})
	app.get('/api/book/search',function(req,res){
		if (req.query.w) {
			var regex=new RegExp(req.query.w);
			Book.findOne({name:regex},function(err,doc){
				if (err) {throw err}
				res.json(doc);
			})
		}
		else{
			res.json(null);
		}
	})
}