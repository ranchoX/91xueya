module.exports=function(app){
	app.get('/word/add',function(req,res){
		res.render('word/add',{title:'word add'});
	})
}