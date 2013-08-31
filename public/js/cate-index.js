$(function(){
	app.models.Broadcast=Backbone.Model.extend({
		urlRoot:'/api/broadcast'
	})
	app.collections.Broadcasts=Backbone.Collection.extend({
		url:'/api/broadcast',
		model:app.models.Broadcast,
		initialize:function(cateId){
			if (cateId) {
				var self=this;
				this.url=this.url+"/"+cateId;
				this.fetch({reset:true})
			};
		}
	});
	app.views.BroadcastsView=Backbone.View.extend({
		initialize:function(){
			this.collection.on("reset",this.render,this);
		},
		render:function(){
			var self=this;
			app.template('broadcast.html',function(data){
				var template=_.template(data,{broadcasts:self.collection.models});
				self.$el.html(template);
			})
		}
	});
	
	/*book*/
	var BooksView=Backbone.View.extend({
		initialize:function(){
			this.collection.on('reset',this.render,this);
		},
		render:function(callback){
			var self=this;
			app.template('cateBooks.html',function(data){
				var templateData=_.template(data,{books:self.collection.models});
				self.$el.html(templateData);
				if (callback instanceof Function) {
					callback(self);
				};
			});
		},
		events:{
			"click .study-btn":"addStudy",
			"click .book-commnetNum":"getComment"
		},
		addStudy:function(e){
			forceLogin(function(){
				var self=e.currentTarget;
				var bookId=$(self).attr("data-bookId");
				var studyType=$(self).attr("data-studyType");
				var typeName='正在学习';
				var tips='已经将该书添加到正在学习列表。你可以发表你学习过程的笔记和大家一起分享讨论';
				if (studyType!=0) {
					typeName='已学习';
					tips='已经将该书添加到已学习列表。你可以发表你学习过程的笔记和大家一起分享讨论';
				}
				$.ajax({
						url:'/api/book/addstudy',
						data:{id:bookId,studyType:studyType},
						type:'post',
						dataType:'json',
						success:function(re){
							if (re.ret==0) {
								var $dialog=$("<div></div>");
								$dialog.text(tips);
								$dialog.dialog({
									title:"提示",
									buttons:[{text:'确定',click:function(){
										$(this).dialog('close');
										var parent= $(self).parent();
										parent.find(".study-btn").remove();
										parent.parent().find(".book-name").after(typeName);
									}}]
								})
							}
							else{
								console.error(re.msg);
							}
						},
						error:function(err){
							console.error(err);
						}
					})
				
			})
		},
		getComment:function(e){
			var self=e.currentTarget;
			var $commentContainer=$(self).parent().next(".comment-container");
			if ($commentContainer.length==0) {
				var bookId=$(self).attr("data-bookId");
				var $container=$("<div class='comment-container'></div>");
				$(self).parent().after($container)
				var comments=new app.collections.Comments('book',bookId);
				var commentNoteView=new app.views.CommentsView({el:$container,collection:comments,plat:'book',targetId:bookId});
				
			}else{
				$commentContainer.toggle();
			}
			
		}
		
	})
		/*note*/
	var NotesView=Backbone.View.extend({
		initialize:function(){
			this.collection.on('reset',this.render,this);
		},
		render:function(callback){
			var self=this;
			app.template('cateNote.html',function(data){
				var templateData=_.template(data,{notes:self.collection.models});
				self.$el.html(templateData);
				if (callback instanceof Function) {
					callback(self);
				};
			});
		},
		events:{
			"click .note-comment":"getComment"
		},
		getComment:function(e){
			var self=e.currentTarget;
			var plat='note';
			var $commentContainer=$(self).parent().next(".comment-container");
			if ($commentContainer.length==0) {
				var bookId=$(self).attr("data-Id");
				var $container=$("<div class='comment-container'></div>");
				$(self).parent().after($container)
				var comments=new app.collections.Comments(plat,bookId);
				var commentNoteView=new app.views.CommentsView({el:$container,collection:comments,plat:plat,targetId:bookId});
				
			}else{
				$commentContainer.toggle();
			}
		}
	})
	/*ques*/
	var QuestionsView=Backbone.View.extend({
		initialize:function(){
			this.collection.on('reset',this.render,this);
		},
		render:function(callback){
			var self=this;
			app.template('cateQues.html',function(data){
				var templateData=_.template(data,{ques:self.collection.models});
				self.$el.html(templateData);
				if (callback instanceof Function) {
					callback(self);
				};
			});
		},
		events:{
			"click .ques-quick-answer":"quickAnswer",
			"click .answer-form input":"answer"
		},
		quickAnswer:function(e){
			var self=e.currentTarget;
			$(self).find("i").toggleClass("icon-caret-down").toggleClass("icon-caret-up");
			var $parent=$(self).parent();
			if ($parent.next(".answer-form").length>0) {
				$parent.next(".answer-form").toggle();
			}else{
				$parent.after("<div class='answer-form'><textarea></textarea><input type='button' class='pull-right' value='提交回答'></div>");

			}
		},
		answer:function(e){
			var self=e.currentTarget;
			var $parent=$(self).parent();
			var content=$parent.find("textarea").val();
			var id=$parent.parent().attr("data-id");
			if (content=='') {
				alert('content not empty');
				return false;
			}
			forceLogin(function(){
				$.ajax({
					type:'post',
					url:'/api/question/'+id,
					data:{content:content},
					success:function(re){
						if (re.ret==0) {
							alert('answer success');
						}else{
							alert(re.msg);
						}
					},
					error:function(){
						alert('error');
						console.error(arguments);
					}
				})
			})
		}
	})
	var Route=Backbone.Router.extend({
		routes:{
			"question":"question",
			"book":"book",
			"share":"share",
			"index":"index"
		},
		initialize:function(){
			
		},
		question:function(){
			$("#cate-nav li.active").removeClass("active");
			$("#cate-nav a[href='#question']").parent().addClass("active");
			var questions=new app.collections.Questions(cate.id);
			var view=new QuestionsView({collection:questions,el:'#cate-container'});
			//view.render();
		},
		book:function(){
			$("#cate-nav li.active").removeClass("active");
			$("#cate-nav a[href='#book']").parent().addClass("active");
			var books=new app.collections.Books(cate.id);
			var view=new BooksView({collection:books,el:'#cate-container'});
			
		},
		share:function(){
			$("#cate-nav li.active").removeClass("active");
			$("#cate-nav a[href='#share']").parent().addClass("active");
			var notes=new app.collections.Notes(cate.id);
			var view=new NotesView({collection:notes,el:'#cate-container'});
			
		},
		index:function(){
			$("#cate-nav li.active").removeClass("active");
			$("#cate-nav a[href='#index']").parent().addClass("active");
			var broads=new app.collections.Broadcasts(cate.id);
			var view=new app.views.BroadcastsView({collection:broads,el:'#cate-container'});
		}
	})
	window.route=new Route();
	Backbone.history.start();
	if (location.hash=="") {
		route.index();
	};
	
	$("body").on("click","#cate-atten",function(){
		var self=this;
		$.post('/api/user/atten',{cateId:cate.id,cateName:cate.name,cateAlias:cate.alias},function(re){
			if (re.ret==0) {
				$(self).after("<div>已经关注，<a href='javascript:;' class='' id='cate-atten-cancel' >取消</a></div>");
				$(self).remove();
			}else{
				alert(re.msg);
			}
		})
	})
	$("body").on("click","#cate-atten-cancel",function(){
		var self=this;
		$.ajax({
			url:'/api/user/atten',
			data:{cateId:cate.id},
			success:function(re){
				if (re.ret==0) {
					$(self).parent().after("<a href='javascript:;' class='btn btn-danger' id='cate-atten' >关注"+cate.name+"</a>");
					$(self).parent().remove();
				}else{
					alert(re.msg);
				}
			},
			type:'delete'
		})
	});
	//todo:
	//Backbone.history.start();
})