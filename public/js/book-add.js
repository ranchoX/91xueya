/*
subject/add.ejs
*/

$(function($){
     $("#publishDate").datepicker({
      dateFormat:'yy-mm-dd',
      changeYear:true,
      changeMonth:true
     });
      $('#fileupload').fileupload({
          add: function (e, data) {
              $.each(data.files,function(i,index){
                 if(index.size>5000000){
                    alert('图片大小不能超过4M');
                    return false;
                 }
                 if (!/(\.|\/)(gif|jpe?g|png)$/i.test(index.type)) {
                    alert('只支持gif、jpeg、png格式');
                    return false;
                 };
                  var jqXHR = data.submit().success(function (result, textStatus, jqXHR) {
                      if (result.ret==0) {
                         $("#bookpic").attr("src",result.data).show();
                         $("#pic").val(result.data);
                      }else{
                        alert(result.msg);
                      }
                  }).error(function (jqXHR, textStatus, errorThrown) {
                        console.log(jqXHr);
                        console.log('error');
                      });
              })
             
          }
      });
      $("#draft").click(function(){
        $("#state").val(0);
        $("#publish").click();
      })
      $("#book-form").validate({
        rules:{
          pic:{required:true},
          name:{required:true},
          desc:{required:true},
          cateId:{required:true},
          author:{required:true},
          publisher:{required:true},
          publishDate:{required:true},
          menus:{required:true}
        }
      })
    });