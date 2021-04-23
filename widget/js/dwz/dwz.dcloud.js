/**
 * @author 张慧华 <350863780@qq.com>
 * @deprecated
 * 基于HBuilder文件上传的核心脚本
 *
 */
(function ($) {
	const _plus = {
		// 拍照
		captureImage(options) {
			let op = $.extend({ maxWidth: 800, maxHeight: 800, callback: null }, options);

			let cmr = plus.camera.getCamera();
			cmr.captureImage(
				(path) => {
					plus.io.resolveLocalFileSystemURL(
						path,
						(entry) => {
							$.plus.getBase64Image({
								imgPath: entry.toLocalURL(),
								maxWidth: op.maxWidth,
								maxHeight: op.maxHeight,
								callback(strBase64) {
									if (op.callback) {
										op.callback([strBase64], entry);
									}
								}
							});
						},
						(ret) => {
							$.alert.toast('读取拍照文件错误：' + e.message);
						}
					);
				},

				(ret) => {},

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
					maxWidth: 800,
					maxHeight: 800,
					callback: null
				},
				options
			);

			plus.gallery.pick(
				(ret) => {
					let arrayBase64 = [];
					for (let i = 0; i < ret.files.length; i++) {
						let path = ret.files[i];

						plus.io.resolveLocalFileSystemURL(
							path,
							(entry) => {
								arrayBase64.push(entry.toLocalURL());
								if (ret.files.length == arrayBase64.length && op.callback) {
									op.callback(arrayBase64, entry);
								}
							},
							(ret) => {
								$.alert.toast('读取拍照文件错误：' + ret.message);
							}
						);
					}
				},

				(ret) => {},

				{
					filename: '_doc/camera/',
					filter: 'image',
					multiple: true,
					maximum: op.maximum,
					system: false,
					onmaxed() {
						$.alert.error('最多只能选择' + op.maximum + '张图片');
					}
				}
			);
		}
	};

	$.plus.dcloudInit = () => {
		$.extend($.plus, {
			captureImage(options) {
				let op = $.extend(
					{
						sourceType: 'camera' // camera, library
					},
					options
				);

				// 拍照
				if (op.sourceType == 'camera') {
					_plus.captureImage(options);
				} else {
					// 打开相册
					_plus.galleryImage(options);
				}
			},

			// 裁剪图片
			clipImage(options, callback) {
				let op = $.extend(
					{
						src: '', //src: (String 类型 )压缩转换原始图片的路径
						dst: '', //压缩转换目标图片的路径
						overwrite: true, //overwrite: (Boolean 类型 )覆盖生成新文件
						width: '800px',
						height: '800px',
						quality: 50, //quality: (Number 类型 )压缩图片的质量.取值范围为1-100
						format: 'jpg',
						clip: null //裁剪图片的区域
					},
					options
				);

				plus.zip.compressImage(
					op,
					(event) => {
						let target = event.target; // 压缩转换后的图片url路径，以"file://"开头

						plus.io.resolveLocalFileSystemURL(
							target,
							(entry) => {
								callback(entry);
							},
							(e) => {
								$.alert.toast('压缩图片失败：' + e.message);
							}
						);
					},
					(error) => {
						$.alert.toast('压缩图片失败，请稍候再试');
					}
				);
			}
		});
	};
})(dwz);
