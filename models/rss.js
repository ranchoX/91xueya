var Schema=require('mongoose').Schema;
var RssData=new Schema({
	title:String,
	summary:String,
	link:String,
	publishDate:{type:Date},
	author:Object
},{_id:false,__v:false})
var RssUrl=new Schema({
	url:String,
	state:Number, 
	updateDate:{type:Date,default:Date.now}
},{_id:false,__v:false})
var RssSchema=new Schema({
	cateId:{type:Number,unique:true},
	url:[RssUrl],
	data:[RssData]
});
module.exports=db.model('rss',RssSchema);