$(function(){
	$(".cate-atten").click(function(){
		var id= $(this).attr("data-id");
		var alias=$(this).attr("data-alias");
		var self=this;
		$.post("/api/user/atten",{cateId:id},function(re){
			if (re.ret==0) {
				$(self).after('<a href="/'+alias+'">进入主页</a>');
				$(self).remove();
			}else{
				alert(re.msg);
			}
		})
	})
})