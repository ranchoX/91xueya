
/**
 * Module dependencies.
 */

var express = require('express')
  , http = require('http')
  , path = require('path')
  ,partials=require('express-partials')
  //,cluster=require('cluster')
  //,numCPUs=require('os').cpus().length
  ,mongoose=require('mongoose')
  ,params=require('express-params')
  ,util=require('util')
  ,route=require('./route.js')
  ,redis=require('redis')
  ,setting=require('./config')
  ,fs=require('fs')
  ,viewHelper=require('./viewhelper'); 

var accessLogfile=fs.createWriteStream(__dirname+'/access.log', {flags:'a'});
var errorLogfile=fs.createWriteStream(__dirname+'/error.log', {flags:'a'});
var uri='mongodb://localhost/'+setting.db;
global.db=mongoose.connect(uri);
var idGenerator=require('./models/idGenerator');
global.idGenerator=idGenerator;
global.util=util;

var _=require('underscore');
var app = express();
global._=_;
global.cache=redis.createClient();

// all environments
app.set('port', process.env.PORT || 3000);
app.use(express.favicon());
app.use(express.static(__dirname+'/public'));
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
/*develop*/
app.configure('development',function(){
   app.use(express.logger('dev'));
})
app.configure('production',function(){
  app.use(express.logger({stream:accessLogfile}));
})

app.use(express.bodyParser({
  uploadDir:__dirname+'/tmp'
}));
app.use(express.methodOverride());
app.use(express.cookieParser());
var RedisStore = require('connect-redis')(express);
app.use(express.session({key:setting.key, secret: setting.cookieSecret,store:new RedisStore()}));

app.use(partials());

params.extend(app);
var User=require('./models/user');
app.locals(viewHelper);
app.locals.userId=0;
app.locals.username='';
app.locals.attentionCates=[];
app.locals.role=0;
app.locals.keywords='node.js,mongodb,asp.net';
app.locals.descript='91学呀是学习分享类的社区网站，提供大家学习node.js,mongodb,asp.net等大家正在学习的东西';
app.use(function(req,res,next){
  if (req.session.user) {
        res.locals.userId=req.session.user.id;
        res.locals.username=req.session.user.username;

        //以后按照数据的..
        if (res.locals.username=='rancho'||res.locals.username=='Lycoria'||res.locals.username=='暖暖圆') {
          req.role=1;
          res.locals.role=1;
        }
        if (req.method=="GET"&&req.url.indexOf('/api')!=0) {
            User.findByUserId(req.session.user.id,function(doc){
              if (doc) {
                  res.locals.attentionCates=doc.attentionCates;
                  res.locals.drafts=doc.drafts;
                  res.locals.studyBooks=doc.studyBooks;
                  req.cUser=doc;
                  //todo:filter image
              }else{
                 res.locals.userId=0;
                 res.locals.username='';
                 req.session.user=null;
              }
              next();
            })

        }else{
          next();
        }
        
  }else{
     next();
  }
})
app.use(app.router);
route(app);



var cates=require('./models/cate');
cates.simples(function(doc){
    global.cates=doc;
});

//for xhr error
app.use(function(err,req,res,next){
  if (req.xhr) {
    util.error(err);
    res.send(500,{ret:-100,error:err})
  }else{
    next(err);
  }
})
//routes(app);
//app.use(express.router(routes));
// catch-all implementation may be defined
app.use(function(err, req, res, next){
  // if an error occurs Connect will pass it down
  // through these "error-handling" middleware
  // allowing you to respond however you like
  //dev
  // var meta='['+new Date()+']'+req.url+'\n';
  // errorLogfile.write(meta+err.stack+'\n');
  // res.send(500, { error: err });
  throw err;
})
cache.on("error", function (err) {
        console.log("redis Error " + err);
});
/*test*/
var Rss=require('./models/rss.js');
// var rss=new Rss({
//   cateId:3,
//   url:[{
//     url:'www.baidu.com5',
//     updateDate:Date.now()
//   }],
//   data:[{
//     title:'wxp51',
//     summary:'test capped4',
//     link:'www.baidu.com/link4',
//     author:{
//       name:'me2',
//       link:'www.baidu.com/u78***4'
//     }}
//   ]
// })
// rss.save(function(err,doc){
//   if (err) {
//     console.error(err);
//   }else{
//     console.log(doc);
//   }
// })

// development only
// if ('development' == app.get('env')) {
//   app.use(express.errorHandler());
// }

// if(cluster.isMaster){
//   //master
//   cluster.on('death',function(worker){
//     delete workers[worker.pid];
//     worker=cluster.fork();
//     workers[worker.pid]=worker;
//   });
//   for (var i = 0; i < numCPUs; i++) {
//     var worker=cluster.fork();
//     workers[worker.pid]=worker;
//     //console.log(worker.pid);
//   }
// }
// else{
//   http.createServer(app).listen(app.get('port'), function(){
//   //console.log('Express server listening on port ' + app.get('port'));
// });
//   process.on('SIGTERM',function(){
//     for(var pid in workers){
//       process.kill(pid);
//     }
//     process.exit(0);
//   })
// }
 http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
