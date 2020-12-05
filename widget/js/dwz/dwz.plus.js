/**
 * @author 张慧华 <350863780@qq.com>
 * @deprecated
 * 基于HBuilder文件上传的核心脚本, 目前的版本默认使用APICloud打包，如果想要使用HBuilder打包需要index.js中的dwz.apicloud.js换成dwz.plus.js
 *
 */
(function ($) {
	dwz.plus = {
		/**
		 * 从摄像头或相册获取图片 {title:'', maximum:4, maxWidth:1280, maxHeight:1280, callback: null, miscCallback: null}
		 * 使用miscCallback时需要自己处理，忽略maxWidth, maxHeight, callback
		 */
		chooseImage(options) {
			let me = this;

			let buttons = [
				{
					title: '拍照'
				},
				{
					title: '从手机相册选择'
				}
			];
			plus.nativeUI.actionSheet(
				{
					title: options.title || '上传图片',
					cancel: '取消',
					buttons: buttons
				},
				function (btn) {
					/*actionSheet 按钮点击事件*/
					switch (btn.index) {
						case 0:
							break;
						case 1:
							me.captureImage(options); /*拍照*/
							break;
						case 2:
							me.galleryImage(options); /*打开相册*/
							break;
						default:
							break;
					}
				}
			);
		},
		// 拍照
		captureImage(options) {
			let op = $.extend({ maxWidth: 1280, maxHeight: 1280, callback: null, miscCallback: null }, options);

			let me = this;
			let cmr = plus.camera.getCamera();
			cmr.captureImage(
				function (path) {
					plus.io.resolveLocalFileSystemURL(
						path,
						function (entry) {
							if (op.miscCallback) {
								// 使用miscCallback时需要自己处理，忽略maxWidth, maxHeight, callback
								return op.miscCallback(entry);
							}

							me.getBase64Image({
								imgPath: entry.toLocalURL(),
								maxWidth: op.maxWidth,
								maxHeight: op.maxHeight,
								callback(strBase64) {
									if (op.callback) {
										op.callback([strBase64]);
									}
								}
							});
						},
						function (e) {
							$.alert.toast('读取拍照文件错误：' + e.message);
						}
					);
				},
				function (e) {},
				{
					filename: '_doc/camera/',
					index: 1
				}
			);
		},
		// 打开相册
		galleryImage(options) {
			let op = $.extend(
				{
					maximum: 1,
					maxWidth: 1280,
					maxHeight: 1280,
					callback: null,
					miscCallback: null
				},
				options
			);
			let me = this;
			plus.gallery.pick(
				function (e) {
					let arrayBase64 = [];
					for (let i = 0; i < e.files.length; i++) {
						let path = e.files[i];

						plus.io.resolveLocalFileSystemURL(
							path,
							function (entry) {
								// me.compressImage(entry.toLocalURL(), "_doc/upload/"+entry.name, function(ditEntry){
								// });
								if (op.miscCallback) {
									// 使用miscCallback时需要自己处理，忽略maxWidth, maxHeight, callback
									return op.miscCallback(entry);
								}
								me.getBase64Image({
									imgPath: entry.toLocalURL(),
									maxWidth: op.maxWidth,
									maxHeight: op.maxHeight,
									callback(strBase64) {
										arrayBase64.push(strBase64);
										if (e.files.length == arrayBase64.length && op.callback) {
											op.callback(arrayBase64);
										}
									}
								});
							},
							function (e) {
								plus.nativeUI.toast('读取拍照文件错误：' + e.message);
							}
						);
					}
				},
				function (e) {},
				{
					filename: '_doc/camera/',
					filter: 'image',
					multiple: true,
					maximum: op.maximum,
					system: false,
					onmaxed() {
						plus.nativeUI.alert('最多只能选择' + op.maximum + '张图片');
					}
				}
			);
		},
		// 压缩图片 暂时没有用到
		compressImage(options, callback) {
			let me = this;
			let op = $.extend(
				{
					src: '', //src: (String 类型 )压缩转换原始图片的路径
					dst: '', //压缩转换目标图片的路径
					overwrite: true, //overwrite: (Boolean 类型 )覆盖生成新文件
					width: '1280px',
					height: '1280px',
					quality: 50, //quality: (Number 类型 )压缩图片的质量.取值范围为1-100
					format: 'jpg',
					clip: null //裁剪图片的区域
				},
				options
			);

			plus.zip.compressImage(
				op,
				function (event) {
					let target = event.target; // 压缩转换后的图片url路径，以"file://"开头
					// let size = event.size; // 压缩转换后图片的大小，单位为字节（Byte）
					// let width = event.width; // 压缩转换后图片的实际宽度，单位为px
					// let height = event.height; // 压缩转换后图片的实际高度，单位为px

					plus.io.resolveLocalFileSystemURL(
						target,
						function (entry) {
							callback(entry);
						},
						function (e) {
							plus.nativeUI.toast('压缩图片失败：' + e.message);
						}
					);
				},
				function (error) {
					plus.nativeUI.toast('压缩图片失败，请稍候再试');
				}
			);
		},
		// 转换base64编码
		getBase64Image(options) {
			let op = $.extend({ imgPath: '', maxWidth: 1280, maxHeight: 1280, callback: null }, options);
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
				let strBase64 = canvas.toDataURL('image/png', 0.5);
				//          strBase64 = strBase64.replace("data:image/png;base64,", "");
				if (op.callback) op.callback(strBase64);
			};

			//		let bitmap = new plus.nativeObj.Bitmap("test");
			//		bitmap.load(imgPath, function(){
			//			let strBase64 = bitmap.toBase64Data();
			//			callback(strBase64);
			//		});
		}
	};

	function previewUploadImg(previewElem, strBase64, inputName, maxW, maxH) {
		let thumb = document.createElement('li');
		thumb.classList.add('thumbnail');

		let img = document.createElement('img');
		img.src = strBase64;
		thumb.appendChild(img);
		previewElem.appendChild(thumb);

		let inputElem = dwz.parseHTML('<textarea style="display:none" name="' + inputName + '">' + strBase64 + '</textarea>');
		previewElem.appendChild(inputElem);

		img.onload = function () {
			let width = img.naturalWidth,
				height = img.naturalHeight;
			img.setAttribute('data-width', width);
			img.setAttribute('data-height', height);
			img.setAttribute('data-src', strBase64);
			if (maxW && maxH) {
				if (width / maxW > height / maxH) {
					img.setAttribute('height', maxH);
				} else {
					img.setAttribute('width', maxW);
				}
			}
		};
	}

	$.fn.extend({
		/**
		 * 选择上传图片缩略图列表预览
		 * @param options
		 */
		previewUploadImg(options) {
			let op = $.extend({ maxW: 80, maxH: 80, maxCount: 4, inputName: 'pics[]' }, options);
			return this.each(function () {
				let $uploadWrap = $(this),
					$previewElem = $($uploadWrap.attr('rel')),
					previewElem = $previewElem.get(0);

				let $button = $uploadWrap.find('button');

				$button.touchwipe({
					touch() {
						let selectCount = $previewElem.find('li').size();
						if (selectCount < op.maxCount) {
							dwz.plus.chooseImage({
								maximum: op.maxCount - selectCount,
								callback(arrayBase64) {
									for (let index = 0; index < arrayBase64.length; index++) {
										previewUploadImg(previewElem, arrayBase64[index], op.inputName, op.maxW, op.maxH);

										if (selectCount + arrayBase64.length >= op.maxCount) {
											$uploadWrap.hide();
										}
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
		previewImg(options) {
			let op = $.extend({ attrW: 'data-width', attrH: 'data-height', attrSrc: 'data-src' }, options);
			return this.each(function () {
				let $wrap = $(this);

				$wrap.touchwipe({
					touch(event) {
						event.preventDefault();
						event.stopPropagation();

						let $imgs = $wrap.find('img');
						$.previewBigImg.open($imgs, event);
					}
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

				$previewBox.touchwipe({
					touch(event) {
						event.preventDefault();
						event.stopPropagation();

						me.close(true);
					}
				});
			}

			let screenW = document.body.offsetWidth,
				tpl = `<div class="dwz-slide" data-auto-play="false" data-loop="false" data-zoom="true" data-open-index="#currentIndex#">
						<div class="bd"><ul>#li#</ul></div>
						<div class="hd"><ul>#item#</ul></div>
					</div>`;

			let fragLi = '',
				fragItem = '';
			let currentIndex = 0;
			$imgs.each(function (index) {
				let $img = $(this),
					src = $img.attr('data-src');

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
