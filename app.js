
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
  ,setting={
    key:'91xueya',
    cookieSecret:'Lycoria$%^&&rancho',
    db:'microblog'
  }; 


var uri='mongodb://localhost/'+setting.db;
global.db=mongoose.connect(uri);
var idGenerator=require('./models/idGenerator');
global.idGenerator=idGenerator;
global.util=util;

var _=require('underscore');
var app = express();
global._=_;
global.redis=redis.createClient();
// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.use(express.favicon());

app.use(express.logger('dev'));
app.use(express.bodyParser({
  uploadDir:__dirname+'/tmp'
}));
app.use(express.methodOverride());
app.use(express.cookieParser());
var RedisStore = require('connect-redis')(express);
app.use(express.session({key:setting.key, secret: setting.cookieSecret,store:new RedisStore()}));
app.use(express.static(path.join(__dirname, 'public')));
app.use(partials());

params.extend(app);

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
  console.log(err);
  util.error(err);
  res.send(500, { error: err });
})
/*当前属于分支xueya下吗*/
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
