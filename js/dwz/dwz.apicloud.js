/**
 * Created by huihuazhang on 2017/4/18.
 * 基于HBuilder文件上传的核心脚本
 */
(function ($) {
	$.plus = {
		openImg: function (callback) {
			var FNPhotograph = api.require('FNPhotograph');
			var imageFilter = api.require('imageFilter');

			FNPhotograph.open({
				path: 'fs://savePath',
				album: true,
				quality: 'medium'
			}, function (ret) {
				if (ret.eventType == 'takePhoto') {
					console.log(JSON.stringify(ret));
					FNPhotograph.close();
					var imgName = 'small_' + new Date().getTime() + '.jpg';
					imageFilter.compress({
						img: ret.imagePath,
						quality: 0.5,
						scale: 0.5,
						save: {
							imgPath: "fs://smallImage",
							imgName: imgName
						}
					}, function (e, err) {
						console.log(JSON.stringify(e));
						if (e.status) {
							console.log("fs://smallImage/" + imgName);
							callback("fs://smallImage/" + imgName);

						} else {
							console.log(JSON.stringify(err));
						}
					});
				}
			});
		},

		/**
		 * 从摄像头或相册获取图片 {title:'', maximum:4, maxWidth:800, maxHeight:800, callback: null}
		 * 使用miscCallback时需要自己处理，忽略maxWidth, maxHeight, callback
		 */
		chooseImage: function (options) {
			var me = this;
			// if(biz.checkPermission && !biz.checkPermission('camera', '摄像头')){
			// 	return;
			// }
			api.actionSheet({
				title: options.title || "上传图片",
				cancelTitle: "取消",
				buttons: ["拍照", "从手机相册选择"]
			}, function (btn) { /*actionSheet 按钮点击事件*/

				switch (btn.buttonIndex) {
					case 0:
						break;
					case 1:
						options.sourceType = 'camera'; /*拍照*/
						me.captureImage(options);
						break;
					case 2:
						options.sourceType = 'library'; /*打开相册*/
						me.captureImage(options);
						break;
					default:
						break;
				}
			});

		},
		// 拍照
		captureImage: function (options) {
			var op = $.extend({sourceType: 'camera', maxWidth: 800, maxHeight: 800, callback: null, destinationType: 'url'}, options);

			if(biz.checkPermission){
				if (op.sourceType == 'camera' && !biz.checkPermission('camera', '摄像头')) {
					return;
				}
				if (op.sourceType == 'library' && !biz.checkPermission('photos', '相册')) {
					return;
				}
			}

			api.getPicture({
				sourceType: op.sourceType,// camera, library
				encodingType: 'jpg',
				mediaValue: 'pic',
				destinationType: op.destinationType, // url, base64
				allowEdit: false,
				quality: 50,
				targetWidth: op.maxWidth,
				targetHeight: op.maxHeight,
				saveToPhotoAlbum: false
			}, function (ret, err) {
				if (ret) {
					// alert(JSON.stringify(ret));
					if (op.callback) {
						op.callback(ret.base64Data || ret.data);
					}
				} else {
					alert(JSON.stringify(err));
				}
			});
		},
		// 压缩图片
		compressImage: function compressImage(options, callback) {
			return this.getBase64Image(options);

			// plus.zip.compressImage(
			// 	op,
			// 	function(event) {
			// 		var target = event.target; // 压缩转换后的图片url路径，以"file://"开头
			// 		// var size = event.size; // 压缩转换后图片的大小，单位为字节（Byte）
			// 		// var width = event.width; // 压缩转换后图片的实际宽度，单位为px
			// 		// var height = event.height; // 压缩转换后图片的实际高度，单位为px
			//
			// 		plus.io.resolveLocalFileSystemURL(target, function(entry) {
			// 			callback(entry);
			// 		}, function(e) {
			// 			$.alert.toast("压缩图片失败：" + e.message);
			// 		});
			//
			// 	},function(error) {
			// 		$.alert.toast("压缩图片失败，请稍候再试");
			// 	}
			// );
		},
		// 转换base64编码
		getBase64Image: function (options) {
			var op = $.extend({imgPath: '', maxWidth: 800, maxHeight: 800, callback: null}, options);
			var img = new Image();

			img.src = op.imgPath;
			img.onload = function () {
				var canvas = document.createElement("canvas");
				var width = img.width;
				var height = img.height;
				// calculate the width and height, constraining the proportions
				if (width > height) {
					if (width > op.maxWidth) {
						height = Math.round(height *= op.maxWidth / width);
						width = op.maxWidth;
					}
				} else {
					if (height > op.maxHeight) {
						width = Math.round(width *= op.maxHeight / height);
						height = op.maxHeight;
					}
				}

				canvas.width = width;   /*设置新的图片的宽度*/
				canvas.height = height; /*设置新的图片的长度*/
				var ctx = canvas.getContext("2d");
				ctx.drawImage(img, 0, 0, width, height); /*绘图*/
				var strBase64 = canvas.toDataURL("image/jpeg", 0.8);
//              strBase64 = strBase64.replace("data:image/jpeg;base64,", "");
				if (op.callback) op.callback(strBase64);
			}

//		    var bitmap = new plus.nativeObj.Bitmap("test");
//		    bitmap.load(imgPath, function(){
//			    var strBase64 = bitmap.toBase64Data();
//			    callback(strBase64);
//		    });
		}
	};

	function previewUploadImg(previewElem, strBase64, inputName, maxW, maxH) {

		var thumb = document.createElement("li");
		thumb.classList.add('thumbnail');

		var img = document.createElement("img");
		img.src = strBase64;
		thumb.appendChild(img);
		previewElem.appendChild(thumb);

		var inputElem = dwz.parseHTML('<input type="hidden" name="' + inputName + '" value="' + strBase64 + '">');
		thumb.appendChild(inputElem);

		img.onload = function () {
			var width = img.naturalWidth,
				height = img.naturalHeight;
			img.setAttribute('data-width', width);
			img.setAttribute('data-height', height);
			img.setAttribute('data-src', strBase64);
			if (maxW && maxH) {
				if (width / maxW > height / maxH) {
					img.setAttribute('width', maxW);
				} else {
					img.setAttribute('height', maxH);
				}
			}
		};

		// 图片删除按钮
		if ($(previewElem).hasClass('dwz-ctl-del')) {
			var $link = $('<a class="img-del"></a>').prependTo(thumb);
			$link.click(function (event) {
				$(thumb).remove();
				event.stopPropagation();
			});
		}

	}

	$.fn.extend({
		/**
		 * 选择上传图片缩略图列表预览
		 * @param options
		 */
		previewUploadImg: function (options) {
			var op = $.extend({maxW: 80, maxH: 80, maxCount: 4, inputName: 'pics[]', callback: null}, options);
			return this.each(function () {
				var $uploadWrap = $(this),
					$previewElem = $($uploadWrap.attr('rel')),
					previewElem = $previewElem.get(0);

				var $button = $uploadWrap.find('button');
				var selectCount = $previewElem.find('li').size();
				if (selectCount + 1 >= op.maxCount) {
					$uploadWrap.hide();
				}
				$button.touchwipe({
					touch: function () {
						selectCount = $previewElem.find('li').size();
						if (selectCount < op.maxCount) {
							dwz.plus.chooseImage({
								maximum: op.maxCount - selectCount,
								destinationType: 'base64',
								callback: function (base64Data) {

									$.plus.getBase64Image({
										imgPath: base64Data,
										maxWidth: op.maxWidth,
										maxHeight: op.maxHeight,
										callback: function (strBase64) {
											// console.log(strBase64)
											previewUploadImg(previewElem, strBase64, op.inputName, op.maxW, op.maxH);
										}
									});

									if (selectCount + 1 >= op.maxCount) {
										$uploadWrap.hide();
									}

									if (op.callback) {
										op.callback(base64Data);
									}
								}
							});
						}
					}
				});

			});
		},
		/**
		 * 查看大图片预览
		 * @param options
		 */
		previewImg: function (options) {
			var op = $.extend({attrW: 'data-width', attrH: 'data-height', attrSrc: 'data-src'}, options);
			return this.each(function () {
				var $wrap = $(this);

				$wrap.touchwipe({
					touch: function (event) {
						event.preventDefault();
						event.stopPropagation();

						var $imgs = $wrap.find('img');
						$.previewBigImg.open($imgs, event);
					}
				});
			});
		}
	});

	$.previewBigImg = {
		isOpen: false,
		autoLayout: function (event) {
			var me = this, $previewBox = $('#preview-big-img');

			var _screenW = document.body.offsetWidth,
				_screenH = window.screen.availHeight - 20,
				$lis = $previewBox.find('.bd li');
			$lis.each(function () {
				$(this).css({width: _screenW + 'px'});
			});
			$previewBox.find('.bd ul').css({width: (_screenW * $lis.size()) + 'px'});
		},

		open: function ($imgs, touchEvent) {
			var me = this, $previewBox = $('#preview-big-img');
			if ($previewBox.size() == 0) {
				$('body').append('<div id="preview-big-img" style="display:none"></div>');
				$previewBox = $("#preview-big-img");

				$previewBox.touchwipe({
					touch: function (event) {
						event.preventDefault();
						event.stopPropagation();

						me.close(true);
					}
				});
			}

			var screenW = document.body.offsetWidth,
				tpl = '<div class="slideBox" data-auto-play="false" data-loop="false" data-zoom="true" data-open-index="#currentIndex#"><div class="bd"><ul>#li#</ul></div><div class="hd"><ul>#item#</ul></div></div>';

			var fragLi = '', fragItem = '';
			var currentIndex = 0;
			$imgs.each(function (index) {
				var $img = $(this),
					src = $img.attr('data-src') || $img.attr('src');

				fragLi += '<li><div class="pop-inner"><img src="' + src + '"></div></li>';
				fragItem += '<li class="' + (index == 0 ? 'on' : '') + '"></li>';

				// 判断打开图片预览时，点击了第几张图片
				if (touchEvent.target == this) {
					currentIndex = index;
				}
			});

			$previewBox.html(tpl.replaceAll('#li#', fragLi).replaceAll('#item#', fragItem).replaceAll('#currentIndex#', currentIndex)).show().initUI();

			window.addEventListener('resize', me.autoLayout, false);

			me.autoLayout();

			// if ($.history) $.history.add('previewBigImg');
			this.isOpen = true;
		},

		close: function (popHistory) {
			var me = this, $previewBox = $('#preview-big-img');

			if ($previewBox.size() == 0) {
				return;
			}

			if (me._scroll) {
				me._scroll.destroy();
				me._scroll = null;
			}
			$previewBox.html('').hide();
			window.removeEventListener('resize', me.autoLayout, false);

			if ($.history && popHistory) {
				$.history.pop();
			}

			this.isOpen = false;
		}
	}

})(dwz);
