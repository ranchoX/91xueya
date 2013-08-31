var Recommend=require('./../../bll/recommend');
var User=require('./../../models/user');
module.exports=function(app){
	app.get('/api/recommend/ques',function(req,res){
		if (req.session.user) {
			User.findByUserId(req.session.user.id,function(user){
				Recommend.question(user,25,function(arr){
					res.json(arr);
				})
			})
		};
	})
}