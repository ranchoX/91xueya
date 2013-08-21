var Broadcast=require('./../../models/broadcast');
module.exports=function(app){
	app.all('/api/broadcast/:cateid/*',function(req,res,next){
		var cate=_.find(cates,function(item){
			return req.params.cateid==item.id;
		})
		if (cate) {
			next();
		}else{
			res.json(401,'cateid empty');
		}
	})
	app.get('/api/broadcast/:cateid',function(req,res){
		var query= Broadcast.find({cateId:req.params.cateid});
		query.limit(20).exec(function(err,broadcasts){
			if (err) {
				res.json(500,err);
			}else{
				res.json(broadcasts);
			}

		})
	})
}