
var Cate=require('./../models/cate.js');
module.exports=function(app){
	
	app.get('/:alias',function(req,res){
		Cate.findOne({alias:req.params.alias},function(err,cate){
			if (err) {
				throw err;
			}else if(cate){
				res.render('cate/index',{title:cate.name+'涯',cate:cate});

			}
			else{
				res.redirect('/error?msg=alias_not_find');
			}
		})	
	})
} 