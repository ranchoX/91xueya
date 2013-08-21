/*
rancho
2013.6.24
layout.js 

*/
// Backbone.ajax({
// 	beforeSend:function(){
// 		console.log('backbone.ajax before send');
// 	},
// 	complete:function(){
// 		console.log('backbone.ajax complete');
// 	}
// })


function tips_close(callback,tips){
	if (tips) {
		$(".tips-close").text(tips);
	};
	$(".tips-close").dialog({
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
	
	

	
})
