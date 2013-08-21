var path=require('path');
var fs=require('fs');
module.exports=function(app){
	app.all('/api/file',function(req,res,next){
		if (req.session.user) {
			next();
		}else{
			res.redirect('/error?msg=pleaseLogin');
		}
	})
	app.post('/api/file/image',function(req,res){
		if (req.files.files.length>0) {
			var file= req.files.files[0];
			if (file.size>5000000) {
				res.json(413,'file too big');
			}
			else if (!/(\.|\/)(gif|jpe?g|png)$/i.test(file.type)) {
                       res.json(413,'type not match');
                  }
                  var filePath=file.path;
                 
                  fs.readFile(filePath,function(err,data){
                  	if (err) {
                  		res.json(500,err);
                  	}
                        var fileClass=data[0].toString()+data[1].toString();
                        var extName="";
                        //7790 exe/ 8297 rar
                        switch(fileClass){
                              case "255216":
                                    extName=".jpg";
                                    break;
                              case "7173":
                                    extName=".gif";
                                    break;
                              case "6677":
                                    extName=".bmp";
                                    break;
                              case "13780":
                                    extName=".png";
                                    break;
                              default:
                                    res.json(413,'type not match');
                                    return ;
                       }
                        var imageUrl='/img/tmp/'+Date.now()+extName;
                        var newpath=__dirname+'/../../public'+imageUrl;
                  	fs.writeFile(newpath,data,function(err){
                  		if (err) {
                  			res.json(500,err);
                  		}
                  		else{
                  			res.json({ret:0,data:imageUrl});
                                    fs.unlink(filePath,function(err){
                                         if (err) {throw err}
                                    })
                  		}
                  	})
                        
                  })
		}else{
			res.json({ret:-1,msg:'null'});
		}
	})
}