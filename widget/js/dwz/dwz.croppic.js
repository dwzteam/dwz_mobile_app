/**
 * @author 张慧华 <350863780@qq.com>
 * @deprecated
 * 头像裁剪JS实现方案，使用APICloud FNImageClip模块代替
 */
(function ($) {
	$.croppic = {
		/**
		 * 获取裁剪图片位置和尺寸
		 * @param $box
		 * @param options
		 */
		imgCropData($box, options) {
			let op = $.extend({ imgBg$: 'img.croppic-bg', imgWrap$: '.crop-img-wrap' }, options);
			let $imgWrap = $box.find(op.imgWrap$),
				$img = $imgWrap.find('img'),
				elem = $img.get(0),
				imgPos = $img.position();

			let data = {
				src: $img.attr('src'),
				left: -imgPos.left,
				top: -imgPos.top,
				width: $imgWrap.width(),
				naturalWidth: elem.naturalWidth,
				height: $imgWrap.height(),
				naturalHeight: elem.naturalHeight,
				rate: 1
			};

			if (data.naturalWidth > 0) {
				data.rate = $img.width() / data.naturalWidth;
				data.left = data.left / data.rate;
				data.top = data.top / data.rate;
				data.width = data.width / data.rate;
				data.height = data.height / data.rate;
			}
			if (data.left < 0) {
				data.left = 0;
			}
			if (data.top < 0) {
				data.top = 0;
			}
			if (data.width > data.naturalWidth - data.left) {
				data.width = data.naturalWidth - data.left;
			}
			if (data.height > data.naturalHeight - data.top) {
				data.height = data.naturalHeight - data.top;
			}

			return data;
		},
		/**
		 * 图片裁剪事件处理
		 * @param $box
		 * @param options
		 */
		render($box, options) {
			let op = $.extend({ imgBg$: 'img.croppic-bg', imgWrap$: '.crop-img-wrap' }, options);
			let $imgWrap = $box.find(op.imgWrap$),
				$img = $imgWrap.find('img'),
				$imgBg = $box.find(op.imgBg$);

			if ($imgBg.size() == 0) {
				$imgBg = $('<img class="croppic-bg" src="' + $img.attr('src') + '">').appendTo($box);
			} else {
				$imgBg.attr('src', $img.attr('src'));
			}

			let boxW = $box.width();
			if (boxW < $imgWrap.width()) {
				$imgWrap.css({ width: boxW + 'px', height: boxW + 'px' });
			}

			$img.on('load', function () {
				let wrapPos = $imgWrap.position();
				$img.css({ width: $imgWrap.width() + 'px' });
				$imgBg.css({ width: $imgWrap.width() + 'px' });
				let imgPos = {
					top: ($imgWrap.height() - $img.height()) / 2,
					left: ($imgWrap.width() - $img.width()) / 2
				};
				$img.css({
					top: imgPos.top + 'px',
					left: imgPos.left + 'px'
				});
				$imgBg.css({
					top: wrapPos.top + imgPos.top + 'px',
					left: wrapPos.left + imgPos.left + 'px'
				});
			});

			let zoomUtil = {
				getImgStyle() {
					let cpos = $imgBg.position();
					let elem = $imgBg.get(0);
					return {
						left: cpos.left,
						top: cpos.top,
						width: $imgBg.width(),
						naturalWidth: elem.naturalWidth,
						height: $imgBg.height(),
						naturalHeight: elem.naturalHeight
					};
				},
				cacheStartStyle() {
					$imgBg.data('zoom-start', zoomUtil.getImgStyle());
				},
				setZoom(eventPos) {
					let distanceStart = $.event.getDistance(eventPos.startX, eventPos.startY, eventPos.startX2, eventPos.startY2);
					let distance = $.event.getDistance(eventPos.x, eventPos.y, eventPos.x2, eventPos.y2);
					// let centerPos = $.event.getCenterPos(eventPos.startX, eventPos.startY, eventPos.startX2, eventPos.startY2);

					let wrapPos = $imgWrap.position();
					let startData = $imgBg.data('zoom-start') || zoomUtil.getImgStyle();
					let width = (startData.width * distance) / distanceStart;
					if (width < $imgWrap.width()) {
						width = $imgWrap.width();
					}

					let _pos = {
						top: startData.top + (startData.height - (startData.height * width) / startData.width) / 2,
						left: startData.left + (startData.width - width) / 2
					};
					$imgBg.css({
						top: _pos.top + 'px',
						left: _pos.left + 'px',
						width: width + 'px'
					});
					$img.css({
						top: _pos.top - wrapPos.top + 'px',
						left: _pos.left - wrapPos.left + 'px',
						width: width + 'px'
					});
				},
				checkRestore() {
					if ($img.width < $imgWrap.width()) {
						$img.css({ width: $imgWrap.width() + 'px' });
						$imgBg.css({ width: $imgWrap.width() + 'px' });
					}

					let wrapPos = $imgWrap.position();
					let imgBgPos = $imgBg.position();
					let imgH = $img.height(),
						wrapH = $imgWrap.height();

					if (imgH < wrapH) {
						$img.css({
							top: (wrapH - imgH) / 2 + 'px'
						});
						$imgBg.css({
							top: wrapPos.top + (wrapH - imgH) / 2 + 'px'
						});
					} else if (imgBgPos.top > wrapPos.top) {
						$img.css({
							top: 0 + 'px'
						});
						$imgBg.css({
							top: wrapPos.top + 'px'
						});
					} else if (imgBgPos.top + $imgBg.height() < wrapPos.top + $imgWrap.height()) {
						$img.css({
							top: $imgWrap.height() - $imgBg.height() + 'px'
						});
						$imgBg.css({
							top: wrapPos.top + $imgWrap.height() - $imgBg.height() + 'px'
						});
					}

					if (imgBgPos.left > wrapPos.left) {
						$img.css({
							left: 0 + 'px'
						});
						$imgBg.css({
							left: wrapPos.left + 'px'
						});
					} else if (imgBgPos.left + $imgBg.width() < wrapPos.left + $imgWrap.width()) {
						$img.css({
							left: $imgWrap.width() - $imgBg.width() + 'px'
						});
						$imgBg.css({
							left: wrapPos.left + $imgWrap.width() - $imgBg.width() + 'px'
						});
					}
				},
				setPos(eventPos) {
					let startData = $imgBg.data('zoom-start') || zoomUtil.getImgStyle(),
						x = -eventPos.dx + startData.left,
						y = -eventPos.dy + startData.top;
					let wrapPos = $imgWrap.position();

					$img.css({
						top: -wrapPos.top + y + 'px',
						left: -wrapPos.left + x + 'px'
					});
					$imgBg.css({
						top: y + 'px',
						left: x + 'px'
					});
				}
			};

			$box.touchwipe({
				// stopPropagationEvents:true,
				direction: 'all',
				touchstart(event, pos) {
					zoomUtil.cacheStartStyle();
				},
				touchmove(event, pos) {
					if (pos.touchType == 'zoom') {
						zoomUtil.setZoom(pos);
					}

					// 单指touch
					if (pos.touchType == 'touch') {
						zoomUtil.setPos(pos);
					}
				},
				touchend(event, pos) {
					zoomUtil.checkRestore();
				}
			});
		}
	};
})(dwz);
