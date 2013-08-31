var app=new function(){
	this.models={};
	var templates={};
	this.template=function(templateName,callback){
		if (templates[templateName]) {
				callback(templates[templateName]);
		}else{
			$.get('/js/template/'+templateName,function(re){
				templates[templateName]=re;
				callback(re);
			}).fail(function(){
				console.log(arguments);
				console.log('fail');
			});
		
		}
		
	}
	this.views={};
	this.collections={};
};
$(function(){

	/*book*/
	//backbone.js
	app.models.Book=Backbone.Model.extend({
			urlRoot:'/api/book',
			validate:function(attr){
			},
			initialize:function(){
				
			}
			
	});
	app.collections.Books=Backbone.Collection.extend({
		url:'/api/book',
		model:app.models.Book,
		initialize:function(cateId){
			if (cateId) {
				var self=this;
				this.url=this.url+"?cateId="+cateId;
				this.fetch({reset:true})
			};
			this.on('reset',this.initAttributes,this);
		},
		initAttributes:function(){
			_.each(this.models,function(item){
				if (item.get('desc').length>100) {
					//item.ellipsis=item.desc.substring(0,140)+'....';
					item.set('ellipsis',item.get('desc').substring(0,100)+'....');
				};
				var studyPeoples= item.get('studyPeoples');
				var studyState='';
				_.each(studyPeoples,function(study){
					if (study.userId==user.id) {
						if (study.state==0) {
							studyState='正在学习';
						}else{
							studyState='已学习';
						}
					};
				});
				item.set('studyState',studyState);
				var studingPeopleNum=_.filter(studyPeoples,function(study){
					return study.state==0;
				}).length;
				var studiedPeopleNum=_.filter(studyPeoples,function(study){
					return study.state!=0;
				}).length;
				item.set('studingPeopleNum',studingPeopleNum);
				item.set('studiedPeopleNum',studiedPeopleNum);
				
			})
		}
	});
	
	
	/*end book 
		begin comment
	*/
	app.models.Comment=Backbone.Model.extend({
		urlRoot:'/api/comment',
		defaults:{
			content:''
		},
		initialize:function(){
		},
		validate:function(attr){
			if ($.trim(attr.content)=='') {
				return '评论内容不能为空';
			};
		}
	})
	app.collections.Comments=Backbone.Collection.extend({
		url:'/api/comment',
		model:app.models.Comment,
		initialize:function(plat,targetId){
			if (plat&&targetId) {
				this.url=this.url+'?plat='+plat+'&targetId='+targetId;
				this.fetch({reset:true});
			};
			
		}
	})
	app.views.CommentsView=Backbone.View.extend({
		el:"#comment-container",
		initialize:function(){
			
			this.collection.on('reset',this.render,this);
			this.collection.on('add',this.add,this);
		},
		render:function(){
			var self=this;
			app.template('comment.html',function(data){
				templateData=_.template(data,{comments:self.collection.models,user:user});
				self.$el.html(templateData);
			})
		},
		add:function(comment){
			var self=this;
			comment.set('addDate3','刚刚');
			app.template('comment.html',function(data){
				templateData=_.template(data,{comments:[comment],user:user});
				self.$el.find(".comment-items .item-first:first").after($(templateData).find(".comment-item"));
				//self.$el.find(".comment-item:last").after($(templateData).find(".comment-item"));
			})
			//self.$el.find(".comment-response-content").val('');
		},
		events:{
			"click .comment-login":"login",
			"click  .comment-response-btn":"response",
			"keydown .comment-response":"ctrlEnter",
			"click .comment-item .response-btn":"showItemResponse",
			"click  .comment-item .response-container input":"itemResponse"
		},
		login:function(){
			forceLogin();
		},
		response:function(){
			var self=this;
			var comment=new app.models.Comment();
			var content= this.$el.find(".comment-response-content").val()
			comment.set({content:content,plat:this.options.plat,targetId:this.options.targetId});
			if(!comment.isValid()){
				alert('回复内容不能为空');
				return false;
			}
			comment.save({},{success:function(){
					self.collection.add(comment);
					
					self.$el.find(".comment-response-content").val('');
				},error:function(){
					self.$el.find(".comment-response-content").append($('<span>share error</span>'));
					alert('response error');
				}
			});
		},
		ctrlEnter:function(e){
			if (e.ctrlKey&&e.keyCode==13) {
				this.response();
			};
		},
		showItemResponse:function(e){
			var $self=$(e.currentTarget);
			var replyUserId=$self.attr("data-userid");
			var replyUserName=$self.attr("data-username");
			$self.parents(".comment-content").find(".response-container").data("userId",replyUserId).data("userName",replyUserName).toggle();
			//$self.parents(".comment-content").find(".response-container").toggle();
		},
		itemResponse:function(e){
			var self=this;
			var $itemResponse=$(e.currentTarget).parents(".comment-item");
			var id=$itemResponse.attr("data-id");
			var content=$itemResponse.find(".response-content").val();
			if (content=='') {
				alert('回复内容不能为空');
				return false;
			};
			var replyUserId=$(e.currentTarget).parents(".response-container").data("userId");
			var replyUserName=$(e.currentTarget).parents(".response-container").data("userName");
			var replyData={id:id,content:content,replyUserId:replyUserId,replyUserName:replyUserName};
			$.post('/api/comment/reply',replyData,function(re){
				if (re.ret==0) {
					app.template('comment.html',function(data){
						replyData.userId=user.id;
						replyData.userName=user.name;
						var comment=new app.models.Comment();
						comment.set('children',[replyData]);
						var templateData=_.template(data,{comments:[comment],user:user});
						var html=$($(templateData)[2]).find(".reply-item");
						$itemResponse.find(".reply-items .reply-last").before(html);

						$itemResponse.find(".response-content").val('');
						//self.$el.find(".comment-item:last").after($(templateData).find(".comment-item"));
					})
				}else{
					alert(re.msg);
				}
			})
		}
	})
	/*
		end comment
		begin question
	*/
	app.models.Question=Backbone.Model.extend({
		urlRoot:'/api/question',
		defaults:{
			title:'',
			content:''
		},
		initialize:function(){

		},
		validate:function(attrs){
			if ($.trim(attrs.title)=='') {
				return '请输入标题'
			}
			if ($.trim(attrs.content)=='') {
				return '请输入内容'
			}
		}
	})
	app.collections.Questions=Backbone.Collection.extend({
		url:'/api/question',
		initialize:function(cateId,page){
			if (cateId) {
				var self=this;
				this.url=this.url+"?cateId="+cateId+"&page="+page;
				this.fetch({success:function(arguments){
					
				},error:function(obj,xhr){
					console.log(xhr.responseText);
				},reset:true})
			};
		},
		model:app.models.Question
	})
	app.views.QuestionsView=Backbone.View.extend({
		initialize:function(){
			this.collection.on('reset',this.render,this);
		},
		render:function(callback){
			var self=this;
			app.template('question.html',function(data){
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
	app.views.QuestionView=Backbone.View.extend({
		el:'#question-form',
		initialize:function(){
			this.render();
		},
		events:{
			"click .submit":"submit"
		},
		render:function(){
			var self=this;
			app.template('question-form.html',function(template){
				//var html= _.template(template,self.model);
				//self.$el.text(template);
				var html=_.template(template,{question:self.model.attributes});
				self.$el.html(html);
				self.editor=KindEditor.create('.question-content',{
					minWidth:'450px',
					allowPreviewEmoticons:false,
					items:['image','code','template']
				})
				$("#question-books-hide").click(function(){
					$(this).hide();
					$( "#question-books" ).show();
					$( "#question-books" ).trigger("focus");
				})
				$( "#question-books" ).autocomplete({
				  		source: "/api/book/search",
					    select:function(event,ui){
					    	if (ui.item.value=='') {
					    		$("#question-books-hide").text('未选中').show();
					    		$(this).hide();
					    		self.model.set('subjectId',0);
					    	}else{
					    		$("#question-books-hide").text(ui.item.value).show();
					    		$(this).hide();
					    		self.model.set('subjectId',ui.item.id);
					    	}
					    },
				      	response: function( event, ui ) {
				      		_.each(ui.content,function(item){
				      			item.label=item.name;
				      			item.value=item.name;
				      		})
				      		if (ui.content.length==0) {
				      			self.model.set('subjectId',0);
				      			ui.content.push({
				      				label:'没有找到对应的书籍',
				      				value:''
				      			})
				      		};
				      	}
				}).blur(function(){
					$(this).hide();
					$("#question-books-hide").show();
					if (self.model.get('subjectId')==0) {
						$("#question-books-hide").text("未选中");
						$("#question-chapter").hide();
					}else{
						$("#question-chapter").show();
					}
					
					
				});
				$("#question-cate").change(function(){
					self.model.set('cateId',$(this).val());
					$( "#question-books" ).autocomplete( "option", "source", "/api/book/search?cateId="+$(this).val());
				})
				$("#question-cate").change();
			})
		},
		submit:function(){
			var self=this;
			var title=this.$el.find(".question-title").val();
			var content=self.editor.html();
			var chapter=$.trim(this.$el.find(".question-location").val());
			this.model.set({
				title:title,
				content:content
			});
			if (this.model.get('subjectId')&&chapter!='') {
				this.model.set('chapter',chapter);
			};
			if (!this.model.isValid()) {
				alert(this.model.validationError);
				return false;
			}
			this.model.save({},{success:function(model){
				location.href='/question/'+model.id;
			},error:function(){
				alert('save error');
			}})
			
		},
		show:function(){
			var self=this;
			
			this.$el.dialog({
				title:'描述问题',
				width:450,
				height:400
			})
		}
	})
	/*end question*/

	/*note*/
	app.models.Note=Backbone.Model.extend({
		urlRoot:'/api/note',
		defaults:{
		},
		initialize:function(){

		},
		validate:function(attrs){
		
		}
	})
	app.collections.Notes=Backbone.Collection.extend({
		model:app.models.Note,
		url:'/api/note',
		initialize:function(cateId,page){
			if (cateId) {
				var self=this;
				this.url=this.url+"?cateId="+cateId+"&page="+page;
				this.fetch({success:function(arguments){
					
				},error:function(obj,xhr){
					console.log(xhr.responseText);
				},reset:true})
			};
		},
	})
	app.views.NotesView=Backbone.View.extend({
		initialize:function(){
			this.collection.on('reset',this.render,this);
		},
		render:function(callback){
			var self=this;
			app.template('note.html',function(data){
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

	
})