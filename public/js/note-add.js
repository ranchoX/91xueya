var editor;
KindEditor.ready(function(K){
	editor=K.create('#content',{
		width:'520px',
		height:'230px',
		allowPreviewEmoticons:false,
		uploadJson : '/api/file/image/editor',
        fileManagerJson : '../asp/file_manager_json.asp',
        allowFileManager : true,
		items:['bold','underline','strikethrough','justifyleft','justifycenter','justifyright','image','insertfile','anchor','link','insertorderedlist','indent','outdent','code','fullscreen']
	})
})
$(function(){
	var View=Backbone.View.extend({
		el:'body',
		events:{
			"change #note-cate":"changeCate",
			"click .note-submit":"submit2",
			"change #refbook":"changeBook"
		},
		initialize:function(){
			 var self=this;
		},
		changeCate:function(e){
			var self=this;
			var cateId=$(e.currentTarget).val();
			$.get('/api/user/readbook?cateId='+cateId,function(re){
				if (re.ret==0) {
					//self.$el.find("#refbook").children().remove();
					if (re.data.length>0) {
						var html='<option value=0 >可以不选择</option>';
						_.each(re.data,function(item){
							html+='<option value="'+item.id+'" '+(subjectId==item.id?"selected=selected":"")+'>'+item.name+'</option>';
						})
						self.$el.find("#refbook").html(html);
					}else{
						self.$el.find("#refbook").html('<option value=0 >该分类下您暂未读过任何书籍</option>');
					}
					
				}else{

				}
			})
		},
		submit2:function(e){
			var self=e.currentTarget;
			var content=$.trim(editor.html());
			if (content==''||$.trim(editor.text())=='') {
				alert('内容需要填写的');
				return;
			};
			if (!parseInt(this.$el.find("#note-cate").val())) {
				alert('没有读取到分享到的领域');
				return ;
			};
			this.model.set('state',$(self).attr("data-state"));
			this.model.set('content',content);
			if (this.$el.find("#title").val()) {
				this.model.set('title',this.$el.find("#title").val());
			};
			this.model.set('cateId',this.$el.find("#note-cate").val());
			this.model.set('cateName',this.$el.find("#note-cate option:selected").text());
			if (parseInt(this.$el.find("#refbook").val())) {
				this.model.set('subjectId',this.$el.find("#refbook").val());
				//this.model.set('subjectName',this.$el.find("#refbook option:selected").text()); 
			};
			if (this.$el.find("#bookchapter").val()) {
				this.model.set('chapter',this.$el.find("#bookchapter").val());
			};
			if (this.$el.find("#modify").val()) {
				this.model.set('modify',this.$el.find("#modify").val());
			};
			
			this.model.save({},{success:function(re){
				location.href='/note/'+ re.changed.data;
			},error:function(){
				alert('error');
			}})
		},
		changeBook:function(e){
			var self=e.currentTarget;
			var bookId=parseInt($(self).val());
			if (bookId) {
				this.$el.find(".bookchapter").show();
			}else{
				this.$el.find(".bookchapter").hide();
			}
		}
		
	})
	var model=new  app.models.Note(note);
	var view=new View({model:model});
	$("#note-cate").change();
})
