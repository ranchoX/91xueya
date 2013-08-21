$(function(){
	$(".recommend-items").on("click",".ques-item .ques-quick-answer",function(){
			var self=this;
			$(self).find("i").toggleClass("icon-caret-down").toggleClass("icon-caret-up");
			var $parent=$(self).parent();
			if ($parent.next(".answer-form").length>0) {
				$parent.next(".answer-form").toggle();
			}else{
				$parent.after("<div class='answer-form'><textarea></textarea><input type='button' class='pull-right' value='提交回答'></div>");
			}
	})
	$(".recommend-items").on("click",".note-item .note-comment",function(){
			var self=this;
			var $commentContainer=$(self).parent().next(".comment-container");
			if ($commentContainer.length==0) {
				var noteId=$(self).attr("data-id");
				var $container=$("<div class='comment-container'></div>");
				$(self).parent().after($container)
				var comments=new app.collections.Comments('note',noteId);
				var commentNoteView=new app.views.CommentsView({el:$container,collection:comments,plat:'note',targetId:noteId});
				
			}else{
				$commentContainer.toggle();
			}
			
	})
	$(".recommend-items").on("click",".ques-item .answer-form input",function(){
			var self=this;
			var $parent=$(self).parent();
			var content=$parent.find("textarea").val();
			var id=$parent.parent().parent().attr("data-id");
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
							var $parent=$(self).parent();
							var $btn= $parent.prev(".ques-btn");
							
							$btn.find(".ques-quick-answer").remove();
							$btn.append("<span class='pull-right'>已回答</span>");
							$parent.hide();
						}else{
							alert(re.msg);
						}
					},
					error:function(){
						console.error(arguments);
					}
				})
			})
	})
	$(".book-item").on("click",".book-btn a",function(){
			var self=this;
			var bookId=$(self).attr("data-bookId");
			var studyType=$(self).attr("data-studyType");
			var typeName='正在学习';
			var tips='已经将该书添加到<a href="/u'+user.id+'#readied">正在学习</a>列表。你可以发表你学习过程的笔记和大家一起分享讨论';
			if (studyType!=0) {
				typeName='已学习';
				tips='已经将该书添加到<a href="/u'+user.id+'#readied">已学习</a>列表。你可以发表你学习过程的笔记和大家一起分享讨论';
			}
			$.ajax({
				url:'/api/book/addstudy',
				data:{id:bookId,studyType:studyType},
				type:'post',
				dataType:'json',
				success:function(re){
					if (re.ret==0) {
						var $dialog=$("<div></div>");
						$dialog.html(tips);
						$dialog.dialog({
							title:"添加成功",
							buttons:[{text:'确定',click:function(){
								$(this).dialog('close');
								var parent= $(self).parent();
								parent.find("a").remove;
								parent.append(typeName);
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

})