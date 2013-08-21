var Schema=require('mongoose').Schema;

var RowId=new Schema({
	objName:{type:String},
	currentId:{type:Number,default:1}
})
var model=db.model('rowid',RowId);

module.exports.getNewId=function(objName,callback){
	model.findOne({objName:objName},function(err,id){
		if (err) {throw err('idGenerato find one')};
		if (id) {id.currentId+=1;}
		else{
			id=new model();
			id.objName=objName;
		}
		id.save(function(err,doc){
				if (err) {throw err('idGenerato save')};
				callback(parseInt(id.currentId.toString()));
		})
	})
}