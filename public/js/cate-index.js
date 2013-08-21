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
			var view=new app.views.QuestionsView({collection:questions,el:'#cate-container'});
			//view.render();
		},
		book:function(){
			$("#cate-nav li.active").removeClass("active");
			$("#cate-nav a[href='#book']").parent().addClass("active");
			var books=new app.collections.Books(cate.id);
			
			var view=new app.views.BooksView({collection:books,el:'#cate-container'});
			
		},
		share:function(){
			$("#cate-nav li.active").removeClass("active");
			$("#cate-nav a[href='#share']").parent().addClass("active");
			var notes=new app.collections.Notes(cate.id);
			var view=new app.views.NotesView({collection:notes,el:'#cate-container'});
			
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
		$.ajax({
			url:'/api/user/atten',
			data:{cateId:cate.id},
			success:function(re){
				if (re.ret==0) {
					$(self).parent().after("<a href='javascript:;' class='btn btn-danger' id='cate-atten' >关注<%=cate.name%></a>");
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