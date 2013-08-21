var Book=require('./../models/book.js');

var Note=require('./../models/note.js');
var Question=require('./../models/question.js');

module.exports=function(app){
	app.all('/book/add',function(req,res,next){
		if (req.session.user) {next();}
		else{
			res.redirect('/login?returnUrl=/book/add');
		}
	});
	
	app.get('/book/:id',function(req,res){
		Book.findOne({id:req.params.id},function(err,doc){
			if (err) {throw err};
			if (doc) {
				var currentPeople;
				if (req.session.user) {
					 currentPeople=_.find(doc.studyPeoples,function(people){
					 		if (people.userId==req.session.user.id) {
					 			return people;
					 		};
						});
				};
				Note.find({subjectId:doc.id,State:1},function(err,notes){
					if (err) {
						util.error(err);
						notes=[];
					}
					Question.find({subjectId:doc.id},function(err,questions){
						if (err) {
							util.error(err);
							questions=[];
						};
						res.render('book/index',{title:doc.name,subject:doc,current:currentPeople,notes:notes,questions:questions});
					})
				})
				
			}else{
				res.redirect('/error?msg=id_not_find');
			}
		})
	});
}

function getMenus(str){
	var menus=[];
	var c='\n';
	var rows=str.split(c);
	var row,chapter,desc,currentMenu;
	for (var i = 0; i < rows.length; i++) {
		row= rows[i].split(' ');
		if (row.length>2) {
			chapter=row[0];
			desc=row[1];
		}
		else{
			var matchs=row[0].match(/第(.*)章/);
			if (!matchs) {
				matchs=row[0].match(/\d+(.\d+)*/);
			};
			if (matchs) {
				chapter=matchs[0];
				desc=row[0].substring(chapter.length);
			}else{
				continue;
			}
		}
		//
		if (chapter.indexOf('章')>0) {
			if (!currentMenu) {
				currentMenu={
					chapter:chapter,
					desc:desc,
					children:[]
				};	
			}
			else if (chapter!=currentMenu.chapter) {
				var menu={
					chapter:currentMenu.chapter,
					desc:currentMenu.desc,
					children:currentMenu.children
				};
				menus.push(menu);
				currentMenu.chapter=chapter;
				currentMenu.desc=desc;
				currentMenu.children=[];
			};
		}
		else{
			if (currentMenu) {
				currentMenu.children.push({
					chapter:chapter,
					desc:desc
				});
				if (i==(rows.length-1)) {
					menus.push(currentMenu);
				};
			}
		}
	};
	for (var i = 0; i < menus.length; i++) {
		menus[i].id=(i+1);
	};
	return menus;
}	