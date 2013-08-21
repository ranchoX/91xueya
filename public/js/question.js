$(function(){
	$("#quetion-better-answer").click(function(){
		$(this).find("i").toggleClass("icon-caret-down").toggleClass("icon-caret-up");
		$("#question-answer-form").slideToggle('show');
	})
	$("#question-answer-form").keydown(function(e){
		if (e.ctrlKey&&e.keyCode==10) {
			$("#question-answer-form input").trigger("click");
		};
	})
	$("#question-answer-form input").click(function(){
		if (forceLogin()) {
			var content= $("#question-answer-form textarea").val();
			if (content) {
				$.post('/api/question/'+question.id,{content:content},function(re){
					if (re.ret==0) {
						alert('success');
						location.reload();
					}else{
						alert(re.msg);
					}
				})
			}else{
				alert('content null');
			}
		};
		
	})
	$("#quetion-other-answers .pushAsk").click(function(){
		var $div=$(this).parent();
		var answerId=$(this).attr("data-answerId");
		if($div.hasClass("added")){
			$div.next(".pushAsk-container").toggle();
		}
		else{
			$div.addClass('added');
			var html=$("#pushAsk-container-hide").html();
			$div.next(".pushAsk-container").html(html).show().find(".pushAsk-btn").attr("data-answerId",answerId);
		}
	})
	$("#quetion-other-answers .accept").click(function(){
		var answerId= $(this).attr("data-answerId")
		$.post('/api/question/accept/'+question.id,{answerId:answerId},function(re){
			if (re.ret==0) {
				alert('accept success');
				location.reload();
			}else{
				alert('error');
			}
		})
		
	});
	$("#quetion-other-answers").on("click",".pushAsk-btn",function(){
		var self=this;
		var val= $(this).prev().val()
		var answerId=$(this).attr("data-answerId");
		if ($.trim(val)=="") {
			alert('not empty');
		}else{
			$.post('/api/question/reask/'+question.id,{answerId:answerId,content:val},function(re){
				if (re.ret==0) {
					var html="<div>追问:"+val+"</div>";
					$(self).parent().parent().after(html);
				}else{
					alert(re.msg);
				}
			})
		}
	})
	$(".addAsk-answer-btn").click(function(){
		if (!$(this).data("open")) {
			var answerId=$(this).attr("data-answerId");
			var reAskId=$(this).attr("data-reAskId");
			var html="<div class='addAsk-container'><input type='text'/><input type='button' class='addAsk-reanswer' value='回答'/></div>";
			$(this).data("open",1).after(html); 
			$(this).next().find(".addAsk-reanswer").attr({"data-answerId":answerId,"data-reAskId":reAskId});
		}else{
			$(this).next(".addAsk-container").toggle();
		}
		
	})
	$("#quetion-other-answers").on("click",".addAsk-reanswer",function(){
		var self=this;
		var answerId=$(this).attr("data-answerId");
		var reAskId=$(this).attr("data-reAskId");
		var content=$(this).prev().val();
		if (content=="") {
			alert("empty");
		}else{
			$.post('/api/question/reanswer/'+question.id,{answerId:answerId,reAskId:reAskId,content:content},function(re){
				if (re.ret==0) {
					$(self).parent().prev().remove();
					var html="回答:"+content
					$(self).parent().before(html);
					$(self).parent().hide();
				}else{
					alert(re.msg);
				}
			})
		}
	})
})