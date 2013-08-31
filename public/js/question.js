$(function(){
	var view =Backbone.View.extend({
		el:'body',
		initialize:function(){
			var self=this;
			self.editor=KindEditor.create('#question-answer-form textarea',{
				minWidth:'450px',
				allowPreviewEmoticons:false,
				items:['image','code','template']
			})
		},
		events:{
			"keydown #question-answer-form":"keydown",
			"click #question-answer-form input":"submit",
			"click #quetion-other-answers .pushAsk":"pushAsk",
			"click #quetion-other-answers .accept":"accept",
			"click .pushAsk-btn":"pushShow",
			"click .addAsk-answer-btn":"addSubmit",
			"click .addAsk-reanswer":"addAnswer"
		},
		keydown:function(e){
			if (e.ctrlKey&&e.keyCode==10) {
				$("#question-answer-form input").trigger("click");
			};
		},
		submit:function(e){
			var self=this;
			if (forceLogin()) {
				var content= self.editor.html();
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
		},
		pushAsk:function(e){
			var $div=$(e.currentTarget).parent();
			var answerId=$(e.currentTarget).attr("data-answerId");
			if($div.hasClass("added")){
				$div.next(".pushAsk-container").toggle();
			}
			else{
				$div.addClass('added');
				var html=$("#pushAsk-container-hide").html();
				$div.next(".pushAsk-container").html(html).show().find(".pushAsk-btn").attr("data-answerId",answerId);
			}
		},
		accept:function(e){
			var answerId= $(e.currentTarget).attr("data-answerId")
			$.post('/api/question/accept/'+question.id,{answerId:answerId},function(re){
				if (re.ret==0) {
					alert('accept success');
					location.reload();
				}else{
					alert('error');
				}
			})
		},
		pushShow:function(e){
			var self=e.currentTarget;
			var val= $(self).prev().val()
			var answerId=$(self).attr("data-answerId");
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
		},
		addSubmit:function(e){
			if (!$(e.currentTarget).data("open")) {
				var answerId=$(e.currentTarget).attr("data-answerId");
				var reAskId=$(e.currentTarget).attr("data-reAskId");
				var html="<div class='addAsk-container'><input type='text'/><input type='button' class='addAsk-reanswer' value='回答'/></div>";
				$(e.currentTarget).data("open",1).after(html); 
				$(e.currentTarget).next().find(".addAsk-reanswer").attr({"data-answerId":answerId,"data-reAskId":reAskId});
			}else{
				$(e.currentTarget).next(".addAsk-container").toggle();
			}
		},
		addAnswer:function(e){
			var self=e.currentTarget;
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
		}
	})
	var View=new view();
})