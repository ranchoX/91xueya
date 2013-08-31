/*
rancho
2013.6.24
layout.js 

*/
function toDate(date){
	if (date instanceof Date) {
		return date.getFullYear()+'年'+date.getMonth()+'月'+date.getDay()+'日';
	};
	return undefined;
}
function toDate3(date){
	if (date instanceof Date) {
		var timestamp=Date.now()-date;
		var second=Math.floor( timestamp/1000);
		switch(true){
			case second<60:
				return second+'秒前';
			case second<3600:
				return Math.floor(second/60)+'分钟前';
			case second<7200:
				return '1小时前'
			case second<86400:
				return this.addDate.getHours()+":"+this.addDate.getMinutes();
			default:
				return toDate(date);
		}
	};
	return undefined;
}
function addStudy(cateName,bookId,studyType,fn){
	forceLogin(function(){
		app.template('addStudy.html',function(template){

			var html= _.template(template,{studyType:studyType,today:new Date(),cateName:cateName})
			$(html).dialog({title:"提示"});
		})
		var typeName='正在学习';
		var tips='已经将该书添加到正在学习列表。你可以发表你学习过程的笔记和大家一起分享讨论';
		if (studyType!=0) {
			typeName='已学习';
			tips='已经将该书添加到已学习列表。你可以发表你学习过程的笔记和大家一起分享讨论';
		}
		$.ajax({
			url:'/api/book/addstudy',
			data:{id:bookId,studyType:studyType},
			type:'post',
			dataType:'json',
			success:function(re){
				if (re.ret==0) {
					var $dialog=$("<div></div>");
					$dialog.text(tips);
					$dialog.dialog({
						title:"提示",
						buttons:[{text:'确定',click:function(){
							$(this).dialog('close');
							var parent= $(self).parent();
							parent.find(".study-btn").remove();
							parent.parent().find(".book-name").after(typeName);
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
}

function tips_close(callback,tips){
	if (tips) {
		$("#tips-close").text(tips);
	};
	$("#tips-close").dialog({
			title:'提示',
			modal:true,
			buttons:[
				{text:'确定',click:function(){
					callback();
				}},
				{text:'取消',click:function(){
					$(this).dialog('close');
					return false;
				}}
			]
	});
	
}
function forceLogin(callback){
		if (user.id) {
			if (callback instanceof Function) {
				callback();
			};
			return true;
		}else{
			var $form=$(".login-force-form");
			if (!$form.hasClass("bind")) {
				$form.find("input[type='button']").click(function(){
					var username=$form.find("input[type='text']").val();
					var password=$form.find("input[type='password']").val();
					if (!username) {
						alert("用户名不能为空");
						return false;
					};
					if (!password) {
						alert('密码不能为空');
						return false;
					};
					$.ajax({
						url:'/api/user/login',
						data:{username:username,password:password},
						type:"post",
						dataType:"json",
						success:function(re){
							if (re.ret==0) {
								// user.id=data.data.id;
								// user.username=data.data.username;
								// $(".login-force-form").dialog('close');
								// if (currentLogin) {
								// 	currentLogin.trigger("click");
								// };
								if (callback instanceof Function) {
									user.id=re.data.id;
									user.username=re.data.username;
									 $form.dialog('close');
									 callback();
								}else{
									location.reload();
								}
							}
							else{
								alert(data.msg);
							}
						},
						error:function(err){
							console.error(err);
							alert(err);
						}
					})
				})
				$form.addClass("bind");
			};
			$form.dialog({
				title:'快捷登录'
			});
			return false;
		}
		
	};
function quickQuestion(cateId){
	forceLogin(function(){
		if(window.questionView){
			window.questionView.show();
		}else{
			var question=new app.models.Question();
			question.set({
				cateId:cateId
			});
			window.questionView=new app.views.QuestionView({model:question});
			questionView.show();
		}
	})
	
}
$(function(){
	if (location.pathname=='/') {
		$(".nav-index").addClass("active");
	};
	$(".login-nav").click(function(){
		$("#form-login").submit();
	})
	$("#form-login").keydown(function(e){
		if (e.keyCode==13) {
			$("#form-login").submit();
		};
	})
	//force login
	//var currentLogin;
	if (!user.id) {
		
	};
	$("#backToTop").click(function() {
	            $("html, body").animate({ scrollTop: 0 }, 120);
	    });
    $(window).bind("scroll", function() {
        var st = $(document).scrollTop(), winh = $(window).height();
        (st > 50)? $("#backToTop").show(): $("#backToTop").hide();
        //IE6下的定位
        if (!window.XMLHttpRequest) {
            $backToTopEle.css("top", st + winh - 166);
        }
    });
    $("#feedback").css("bottom",$(window).height()/2)
})
