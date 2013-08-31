function toDate(date){
	if (date instanceof Date) {
		return date.getFullYear()+'年'+date.getMonth()+'月'+date.getDay()+'日';
	};
	return undefined;
}
function toDate3(date){
	if (date instanceof Date) {
		var timestamp=Date.now()-date;
		var second=Math.floor( timestamp/1000);
		switch(true){
			case second<60:
				return second+'秒前';
			case second<3600:
				return Math.floor(second/60)+'分钟前';
			case second<7200:
				return '1小时前'
			case second<86400:
				return this.addDate.getHours()+":"+this.addDate.getMinutes();
			default:
				return toDate(date);
		}
	};
	return undefined;
}
function isUndefined(str,replace){
	if (!replace) {
		replace='';
	};
	return str==undefined?replace:str;
}
function getRowStr(str,num){
	var charNum=0;
	var rowNum=0;
	for (var i = 0; i < str.length; i++) {
		if(str[i]=='\n'){
			charNum=0;
			rowNum++;
		}
		else if (charNum==80) {
			rowNum++;
			charNum=0;
		}else{
			charNum++;
		}
		if (rowNum==num) {
			return str.substring(0,i)+'....';
		};
	};
	return str;
}
var module= module.exports;
module.toDate=toDate;
module.toDate3=toDate3;
module.isUndefined=isUndefined;
module.getRowStr=getRowStr;
module.noteTitle=function(note,isme){
	if (note.title) {
		return note.title;
	}
	else if(note.subject){
		return '关于《'+note.subject.name+'》的笔记';
	}
	else if(isme){
		return toDate(note.addDate)+'新建的笔记';
	}else{
		return note.userName+'的笔记';
	}
}
module.ellipsis=function(str,len){
	if (str instanceof String) {
		return str.substr(0,len)+'...'
	};
	return str;
}