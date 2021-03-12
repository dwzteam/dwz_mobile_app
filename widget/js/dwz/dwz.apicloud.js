/**
 * @author 张慧华 <350863780@qq.com>
 * 基于APICloud文件上传的核心脚本
 */
(function ($) {
	$.plus = {
		openImg(callback) {
			let FNPhotograph = api.require('FNPhotograph');
			let imageFilter = api.require('imageFilter');

			FNPhotograph.open(
				{
					path: 'fs://savePath',
					album: true,
					quality: 'medium'
				},
				function (ret) {
					if (ret.eventType == 'takePhoto') {
						console.log(JSON.stringify(ret));
						FNPhotograph.close();
						let imgName = 'small_' + new Date().getTime() + '.jpg';
						imageFilter.compress(
							{
								img: ret.imagePath,
								quality: 0.5,
								scale: 0.5,
								save: {
									imgPath: 'fs://smallImage',
									imgName: imgName
								}
							},
							function (e, err) {
								console.log(JSON.stringify(e));
								if (e.status) {
									console.log('fs://smallImage/' + imgName);
									callback('fs://smallImage/' + imgName);
								} else {
									console.log(JSON.stringify(err));
								}
							}
						);
					}
				}
			);
		},

		/**
		 * 从摄像头或相册获取图片 {title:'', maximum:4, maxWidth:800, maxHeight:800, callback: null}
		 * 使用miscCallback时需要自己处理，忽略maxWidth, maxHeight, callback
		 */
		chooseImage(options) {
			let me = this;
			if (biz.checkPermission && !biz.checkPermission('camera', '摄像头')) {
				return;
			}
			api.actionSheet(
				{
					title: options.title || '上传图片',
					cancelTitle: '取消',
					buttons: ['拍照', '从手机相册选择']
				},
				function (btn) {
					/*actionSheet 按钮点击事件*/

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
				}
			);
		},
		// 拍照
		captureImage(options) {
			let op = $.extend(
				{
					sourceType: 'camera',
					maxWidth: 800,
					maxHeight: 800,
					callback: null,
					destinationType: 'url'
				},
				options
			);

			if (biz.checkPermission) {
				if (op.sourceType == 'camera' && !biz.checkPermission('camera', '摄像头')) {
					return;
				}
				if (op.sourceType == 'library' && !biz.checkPermission('photos', '相册')) {
					return;
				}
			}

			api.getPicture(
				{
					sourceType: op.sourceType, // camera, library
					encodingType: 'jpg',
					mediaValue: 'pic',
					destinationType: op.destinationType, // url, base64
					allowEdit: false,
					quality: 50,
					targetWidth: op.maxWidth,
					targetHeight: op.maxHeight,
					saveToPhotoAlbum: false
				},
				function (ret, err) {
					if (ret) {
						// alert(JSON.stringify(ret));
						if (op.callback) {
							op.callback(ret.base64Data || ret.data);
						}
					} else {
						alert(JSON.stringify(err));
					}
				}
			);
		},
		// 压缩图片
		compressImage(options, callback) {
			return this.getBase64Image(options);
		},
		// 转换base64编码
		getBase64Image(options) {
			let op = $.extend({ imgPath: '', maxWidth: 800, maxHeight: 800, callback: null }, options);
			let img = new Image();

			img.src = op.imgPath;
			img.onload = function () {
				let canvas = document.createElement('canvas');
				let width = img.width;
				let height = img.height;
				// calculate the width and height, constraining the proportions
				if (width > height) {
					if (width > op.maxWidth) {
						height = Math.round((height *= op.maxWidth / width));
						width = op.maxWidth;
					}
				} else {
					if (height > op.maxHeight) {
						width = Math.round((width *= op.maxHeight / height));
						height = op.maxHeight;
					}
				}

				canvas.width = width; /*设置新的图片的宽度*/
				canvas.height = height; /*设置新的图片的长度*/
				let ctx = canvas.getContext('2d');
				ctx.drawImage(img, 0, 0, width, height); /*绘图*/
				let strBase64 = canvas.toDataURL('image/jpeg', 0.8);
				//              strBase64 = strBase64.replace("data:image/jpeg;base64,", "");
				if (op.callback) op.callback(strBase64);
			};
		}
	};

	function previewUploadImg(previewElem, strBase64, inputName, maxW, maxH) {
		let thumb = document.createElement('li');
		thumb.classList.add('thumbnail');

		let img = document.createElement('img');
		img.src = strBase64;
		thumb.appendChild(img);
		previewElem.appendChild(thumb);

		let inputBase64 = strBase64.replace('data:image/jpeg;base64,', '');
		let inputElem = dwz.parseHTML('<input type="hidden" name="' + inputName + '" value="' + inputBase64 + '">');
		thumb.appendChild(inputElem);

		img.onload = function () {
			let width = img.naturalWidth,
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
			let $link = $('<a class="img-del"><i class="dwz-icon-delete"></i></a>').prependTo(thumb);
			$link.click((event) => {
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
		previewUploadImg(options) {
			let op = $.extend(
				{
					maxW: 80,
					maxH: 80,
					maxCount: 4,
					inputName: 'pics[]',
					callback: null
				},
				options
			);
			return this.each(function () {
				let $uploadWrap = $(this),
					rel = $uploadWrap.attr('rel'),
					$previewElem = rel ? $(rel) : $uploadWrap.parent().find('.upload-preview'),
					previewElem = $previewElem.get(0);

				let $button = $uploadWrap.find('button');
				let selectCount = $previewElem.find('li').size();
				if (selectCount >= op.maxCount) {
					$uploadWrap.hide();
				}
				$button.click(() => {
					selectCount = $previewElem.find('li').size();
					if (selectCount < op.maxCount) {
						dwz.plus.chooseImage({
							maximum: op.maxCount - selectCount,
							destinationType: 'base64',
							callback(base64Data) {
								if (!base64Data) return; // 取消拍照时，停止处理逻辑
								$.plus.getBase64Image({
									imgPath: base64Data,
									maxWidth: op.maxWidth,
									maxHeight: op.maxHeight,
									callback(strBase64) {
										// console.log(strBase64)
										previewUploadImg(previewElem, strBase64, op.inputName, op.maxW, op.maxH);

										if (op.callback) {
											op.callback(base64Data, $previewElem);
										}
									}
								});

								if (selectCount + 1 >= op.maxCount) {
									$uploadWrap.hide();
								}
							}
						});
					}
				});
			});
		},
		/**
		 * 查看大图片预览
		 * @param options
		 */
		previewImg(options) {
			let op = $.extend({ attrW: 'data-width', attrH: 'data-height', attrSrc: 'data-src' }, options);
			return this.each(function () {
				let $wrap = $(this);

				$wrap.click((event) => {
					event.preventDefault();
					event.stopPropagation();

					let $imgs = $wrap.find('img');
					$.previewBigImg.open($imgs, event);
				});
			});
		}
	});

	$.previewBigImg = {
		isOpen: false,
		autoLayout(event) {
			let me = this,
				$previewBox = $('#preview-big-img');

			let _screenW = document.body.offsetWidth,
				_screenH = window.screen.availHeight - 20,
				$lis = $previewBox.find('.bd li');
			$lis.each(function () {
				$(this).css({ width: _screenW + 'px' });
			});
			$previewBox.find('.bd ul').css({ width: _screenW * $lis.size() + 'px' });
		},

		open($imgs, touchEvent) {
			let me = this,
				$previewBox = $('#preview-big-img');
			if ($previewBox.size() == 0) {
				$('body').append('<div id="preview-big-img" style="display:none"></div>');
				$previewBox = $('#preview-big-img');

				$previewBox.click((event) => {
					event.preventDefault();
					event.stopPropagation();

					me.close(true);
				});
			}

			let screenW = document.body.offsetWidth,
				tpl = `<div class="dwz-slide" data-auto-play="false" data-loop="false" data-zoom="true" data-open-index="#currentIndex#">
					<div class="bd"><ul>#li#</ul></div><div class="hd"><ul>#item#</ul></div>
					</div>`;

			let fragLi = '',
				fragItem = '';
			let currentIndex = 0;
			$imgs.each(function (index) {
				let $img = $(this),
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

			if ($.history) $.history.add('previewBigImg');
			this.isOpen = true;
		},

		close(popHistory) {
			let me = this,
				$previewBox = $('#preview-big-img');

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
	};
})(dwz);
