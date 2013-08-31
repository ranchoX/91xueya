$(function(){
	$(".note-delete").click(function(){
		tips_close(function(){
			$.ajax({
				url:'/api/note/'+note.id,
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
	$("#note-publish").click(function(){
		$.ajax({
			url:'/api/note/publish',
			data:{id:note.id},
			type:'post',
			success:function(re){
				if (re.ret==0) {
					alert('发布成功');
				}else{
					alert(re.msg);
				}
			}
		})
	})
	

})
