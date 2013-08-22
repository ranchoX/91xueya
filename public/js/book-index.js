$(function(){
	// var subjectId=$(".subject-id").val();
	// var subjectName=$(".subject-name").text();
	$(".subject-studingNum").click(function(){
		if (forceLogin()) {
			$(".subject-study-dialog").text('已经将该书添加到正在学习列表。你可以发表你学习过程的笔记和大家一起分享讨论');
			$(".subject-study-dialog").dialog({
			title:"提示",
			buttons:[{text:'确定',click:function(){
				$.ajax({
					url:'/api/book/menus',
					data:{subjectId:subject.id,studyType:0},
					type:'post',
					dataType:'json',
					success:function(re){
						if (re.ret==0) {
							$(".subject-study").html('学习中');
							$(".subject-study-dialog").dialog('close');
						}
						else{
							console.error(re.msg);
						}
					},
					error:function(err){
						console.error(err);
					}
				})
			}}]
		})
		};
		
	});
	$(".subject-studiedNum").click(function(){
		if (forceLogin()) {
			$(".subject-study-dialog").text('已经将该书添加到已学习列表。你可以去帮助其它用户解答下问题');
			$(".subject-study-dialog").dialog({
			title:"提示",
			buttons:[{text:'确定',click:function(){
				$.ajax({
					url:'/api/book/menus',
					data:{subjectId:subject.id,studyType:1},
					type:'post',
					dataType:'json',
					success:function(re){
						if (re.ret==0) {
							$(".subject-study").html('已经学习过');
							$(".subject-study-dialog").dialog('close');
						}
						else{
							console.error(re.msg);
						}
					},
					error:function(err){
						console.error(err);
					}
				})
			}},{text:'cancle',click:function(){
				$(this).dialog('close');
			}}]
		})
		};
		
	})
	// var question=new app.models.Question();
	// question.set({
	// 	subjectId:subject.id,
	// 	subjectName:subject.name,
	// 	cateId:subject.cateId,
	// 	cateName:subject.cateName
	// });
	// var questionView=new app.views.QuestionView({model:question});
	// $(".subject-question").click(function(){
	// 	if (forceLogin()) {
	// 		questionView.show();
	// 	};
	// })
	$(".book-menus-more a").click(function(){
		$(".book-menus-more").hide();
		$(".book-menus-pick").show();
	})
	$(".book-menus-pick a").click(function(){
		$(".book-menus-more").show();
		$(".book-menus-pick").hide();
	})

	$("#book-deleteStudy").click(function(){
		$.ajax({
			type:"delete",
			url:'/api/book/addstudy',
			data:{id:subject.id},
			success:function(re){
				if (re.ret==0) {
					location.reload();
				};
			}
		})
	})
})