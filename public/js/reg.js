/*
rancho
2013.06.24
reg.js

*/

$(function(){
	jQuery.validator.addMethod("nameCheck",function(value,element){
		return /^[_0-9a-zA-Z\u4e00-\u9fa5]{2,12}$/i.test(value);
	}, "只能包括中文字、英文字母、数字和下划线");
	jQuery.validator.addMethod("isNum",function(value,element){
		return !/^[0-9]{2,12}$/.test(value);
	},"不能是纯数字");
	$("#form-reg").validate({
		rules:{
			username:{
				required:true,
				minlength:2,
				isNum:true,
				nameCheck:true,
				remote:'/api/user/valid'
				
			},
			useremail:{
				required:true,
				email:true,
				remote:'/api/user/valid'
			},
			password:{
				required:true,
				minlength:6
			},
			rePassword:{
				required:true,
				equalTo:'#password'
			}

		},
		messages:{
			username:{
				required:"英文、数字、汉字或下划线，2-12位，不区分大小写",
				minlength:"用户名至少2位以上",
				remote:'该用户名已经存在'
			},
			useremail:{
				required:"输入你常用的电子邮箱",
				email:"电子邮箱格式错误",
				remote:'该邮箱已经注册了,<a href="/login" >立即登录</a>'
			},
			password:{
				required:"英文、数字或符号，6-20位，区分大小写:",
				minlength:"为保证密码的安全性，请至少使用 6 个字符"
			},
			rePassword:{
				required:"为保持密码的准确性，请再次输入密码",
				equalTo:"两次输入的密码不一致"
			}
		},
		success:"valid",
		errorElement:"span",
		onfocusOut: true
               
	});
	$("#form-reg").find("input").focus(function(){
		$(this).next(".help-inline").show();
		$(this).next("icon-warning-sign").remove();
	}).blur(function(){
		$(this).nextAll(".help-inline").hide();
	})
})