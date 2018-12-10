
$(function(){

  // 图片处理功能
  function PictureEdit(){

    this.imageWrap = $('#J_upload_box');
    this.uploadBtnWrap = $('#J_file_wrap');
    this.btnGroup = $('#J_btn_group');
    this.cropGroup = $('#J_crop_group');
    this.cropBox = $('#J_file_box');
    this.preImg = $('#J_file_box_img');
    this.cropImg = null;

    this.uploadBtn = $('#J_file');
    this.cropBtn = $('#J_crop');
    this.cancelCropBtn = $('#J_cancel');

    this.pics = {};
    this.cropOption = {
       aspectRatio: 4 / 3,
       guides: false,
       cropBoxResizable: false,
       cropBoxMovable: false,
       dragCrop: false,
       minContainerWidth: 200,
       minContainerHeight: 200
    };

    this.upload();

  }


  PictureEdit.prototype.submit = function(){
		that = this;
		var reg=/^0?1[3578]\d{9}$/;
		var myReg=/^\w+((-\w+)|(\.\w+))*\@[A-Za-z0-9]+((\.|-)[A-Za-z0-9]+)*\.[A-Za-z0-9]+$/;		
    $('.mui-btn-primary').click(function(){
// 			if(!reg.test($('.conect').val()) && !myReg.test($('.conect').val())){
// 				plus.nativeUI.toast('输入格式错误');
// 				return
// 			}
			var ID = that.getPicsData();
			var idArry = [];
			ID.forEach(function(item){
				console.log(Date.parse(new Date()))
				$.ajax({
					type: 'post',
					async: false,//使用同步的方式,true为异步方式
					url: url_all+"/api/PackMobileV1/UploadAttachment?",		 
					dataType: 'json',
					data:{
						UserId:localStorage.getItem('MyUserId'),
						Filename:Date.parse(new Date())+'.jpg',
						Content:item
					},					
					success: function(data) {
						if(data.status == 0){
							idArry.push(data.data)
						}						
					},
					error: function(xhr) {
						console.log(JSON.stringify(xhr))
					}
				});
			});
			console.log(idArry)
			$.ajax({
				url: url_all+"/api/PackMobileV1/Suggest?",		 
				dataType: 'json',
				async: true,
				data:{
					UserId:localStorage.getItem('MyUserId'),
					SuggestType:$('.mui-btn-outlined.mui-active').text(),
					Contact:$('.conect').val(),
					Remark:$('textarea').val(),
					AttachmentIds:idArry
				},
				method: 'get',
				success: function(data) {
					console.log(JSON.stringify(data))
					if(data.status ==0){
						plus.nativeUI.toast("提交成功");
						plus.webview.currentWebview().close();
					}else{
						plus.nativeUI.toast(data.message);
					}
					
				},
				error: function(xhr) {
						plus.nativeUI.toast("提交失败");
				}
			});
    });
  };

  // 选择上传图片
  PictureEdit.prototype.upload = function(){
    var that = this;

    that.delPics();
    that.crop();
    that.changeCropScale();
    that.submit();

    that.uploadBtn.change(function(){
        if (this.files.length === 0){
          return;
        }
        var file = this.files[0];

        window
        .lrz(file,{width: 600}) // 展示预览图
        .then(function (rst) {
          that.showCropBox();

          that.preImg.load(function(){
            // 触发图像裁剪
            that.preImg.cropper(that.cropOption);
          });
          that.preImg.attr('src',rst.base64);

        })
        .catch(function (err) {
          that.hideCropBox();
          alert('读取图像失败！');
        })
        .always(function () {

        });
    });
  };

  // 显示裁剪框
  PictureEdit.prototype.showCropBox = function(){
    this.cropBox.show();
    this.btnGroup.show();
    this.cropGroup.show();
  };

  // 隐藏裁剪框
  PictureEdit.prototype.hideCropBox = function(){
    this.cropBox.hide();
    this.btnGroup.hide();
    this.cropGroup.hide();
    this.preImg.cropper('destroy');
  };

  // 处理上传图片(选择裁剪比例)
  PictureEdit.prototype.changeCropScale = function(){
    var that = this;
    that.cropGroup.on('change','input',function(){
      var scale = this.value.split('/');
      that.preImg.cropper('destroy');
      that.preImg.cropper($.extend(that.cropOption,{ aspectRatio: scale[0]/scale[1] }));
    });

  };


  // 处理上传图片(裁剪，缩放)
  PictureEdit.prototype.crop = function(){
    var that = this;

    // 取消裁剪
    that.cancel();

    // 确认裁剪
    that.cropBtn.click(function(){
      that.addPics();
      that.hideCropBox();
    });

  };

  // 取消上传图片
  PictureEdit.prototype.cancel = function(){
    var that = this;
    that.cancelCropBtn.click(function(){
      that.hideCropBox();
    });
  };

  // 生成上传图片的key
  PictureEdit.prototype.getFileKey = function(){
    var str = '0123456789abcdefghijklmnopqrstuvwxyz',
        n = str.length,
        key = "",
        i = 1;
    while (i < n) {
        var a = Math.floor(n * Math.random());
        key += str.charAt(a);
        i++;
    }
    return key
  };

  // 添加上传的图片
  PictureEdit.prototype.addPics = function(){
		if($('.item').length>4){
			plus.nativeUI.toast('最多只能上传5张');
			return
		}
    var thumb = $('<div class="item"><i>x</i></div>'),
        key = this.getFileKey(),
        data = '';

    this.cropImg = this.preImg.cropper('getCroppedCanvas', { width: 200, height: 200 });
    data = this.cropImg.toDataURL();
    thumb.css('backgroundImage','url('+data+')').attr('key',key);
    thumb.insertBefore(this.uploadBtnWrap);
    this.pics[key] = data.split(',').pop();


  };

  // 删除上传的图片
  PictureEdit.prototype.delPics = function(){
    var that = this;

    that.imageWrap.on('click','i',function(){
      var parent = $(this).parent('.item'),
          key = parent.attr('key');
      parent.remove();
      delete that.pics[key];

    });

  };

  // 获取全部base64数据
  PictureEdit.prototype.getPicsData = function(){
    var arr = [];
    $.each(this.pics,function(i,n){
      arr.push(n);
    });
    return arr;
  };

  new PictureEdit();

});
