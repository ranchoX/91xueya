/*
rancho
file upload.
*/
(function($){
	$.fn.browseElement=function(){
		var input=$("<input type='file' >");
		input.css({
			"position":"absolute",
			"z-index":2,
			"cursor":"pointer",
			"-moz-opacity":"0",
			"filter":"alpha(opacity:0)",
			"opacity":"0"
		});
		input.mouseout(function(){
			input.detach();
		});
		var element=$(this);
		element.mouseover(function(){
			console.log(element.offset());
			input.offset(element.offset());
			input.width(element.outerWidth());
			input.height(element.outerHeight());
			$("body").append(input);
		});

		return input;
	}

})(jQuery)