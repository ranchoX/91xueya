var editor;
KindEditor.ready(function(K){
	editor=K.create('#content',{
		width:'520px',
		height:'230px',
		allowPreviewEmoticons:false,
		items:['bold','underline','strikethrough','justifyleft','justifycenter','justifyright','image','anchor','insertorderedlist','indent','outdent','code','fullscreen','preview']
	})
})
$(function(){
	$("#form-note").keydown(function(e){
		if (e.keyCode==13) {
			return false;
		};
	})
	$("#subjectName").val($("#name").text());
	$("#link").change(function(){
		var self=this;
		var matchs=/http:\/\/91xueya.com\/book\/(\d+)/.exec($(this).val());
		$("#subjectId").val(0);
		$("#chapters option").remove();
		if (matchs&&matchs.length) {
			var id=matchs[1];
			$.ajax({
				url:'/api/book/'+id,
				success:function(re){
					if (re.ret==0) {
						$("#name").text(re.data.name);
						note.subjectId=id;
					}
					else{
						$("#name").text(re.msg);
						delete note.subjectId;
					}
				},
				error:function(err){
					$("#name").text('submit error');
				}
			})
		}
		else{
			$("#name").text('格式错误');
		}
		
	})
	$(".note-submit").click(function(){
		
		if (!note.subjectId) {
			$("#name").text('未找到对应的图书')
			return false;
		}
		note.chapterName=$.trim($("#chapterName").val());
		if (note.chapterName=='') {
			$("#tips").text('位置');
			return false;
		};
		note.content=editor.html();
		if (note.content=='') {
			$("#tips").text('请填写笔记');
			return false;
		};
		var type="post";
		var url='/api/note';
		if(note.id){
			type="put";
			url=url+'/'+note.id;
			note.modifyContent=$("#modifyContent").val();
		}
		var state=$(this).attr("data-state");
		note.state=state;
		$.ajax({
			url:url,
			data:note,
			type:type,
			dataType:'json',
			success:function(re){
				if (re.ret==0) {
					location.href='/note/'+re.data;
				}
				else {
					console.log('submit error');
				}
			}
		})
	})
	
})
