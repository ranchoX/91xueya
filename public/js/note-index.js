$(function(){
	$(".note-delete").click(function(){
		tips_close(function(){
			$.ajax({
				url:'/api/note/'+date.id,
				type:'delete',
				success:function(re){
					if (re.ret==0) {
						location.href='/notes';
					}else{
						alert(re.msg+'删除失败');
					}
				}
			})
		})
	})
	if (note.state==1) {
		var comments=new app.collections.Comments();
		comments.url=comments.url+'?plat=note&targetId='+note.id;
		comments.fetch({success:function(){
			var commentNoteView=new app.views.CommentsView({collection:comments,plat:'note',targetId:note.id});
			commentNoteView.render();
		}});
	};
	
	

})
