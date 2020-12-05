/**
 * @author 张慧华 <350863780@qq.com>
 */
(function ($) {
	$.fn.extend({
		slide(options) {
			let op = $.extend(
				{
					titActive: 'on', // 导航指示圆点活跃class name
					titSelector: '.hd > ul', // 导航指示圆点选择器
					wrapCell: '.bd', // 切换轮播包裹层
					currentIndex: 0, // 默认的当前位置索引。0是第一个; currentIndex:1 时，相当于从第2个开始执行
					delayTime: 400, // 效果持续时间
					interTime: 5000, // 自动播放间隔
					loop: true, // 循环播放
					autoPlay: false, // 自动播放
					autoCss: false // js设置容器css
				},
				options
			);

			return this.each(function () {
				let slideId = Math.round(Math.random() * 10000000),
					$box = $(this).attr('data-slide-id', slideId),
					$wrapCell = op.wrapCell ? $box.find(op.wrapCell) : $box,
					$mainCell = $wrapCell.children(),
					$tits = null,
					$titsWrap = $box.find(op.titSelector);

				let wrapW = $wrapCell.width(),
					slideW = wrapW,
					$slides = $mainCell.children();

				if (op.autoCss) {
					$wrapCell.css({ overflow: 'hidden', position: 'relative' });
					$mainCell.css({
						overflow: 'hidden',
						position: 'relative',
						padding: '0px',
						margin: '0px'
					});
					$slides.css({ display: 'table-cell', 'vertical-align': 'top' });
				}

				let currentIndex = op.currentIndex,
					count = $slides.size();

				if (count == 0) {
					return;
				}

				if (count > 0) {
					// 支持两边留白情况
					slideW = $box.width();
				}
				if (count < 2) {
					// 只有一页时，禁止循环播放
					op.loop = false;
				}

				if ($titsWrap.size()) {
					$titsWrap.html('<li></li>'.repeat(count));
					$tits = $titsWrap.find('> li');
				}

				$slides.css({ width: slideW + 'px' });
				$mainCell.css({ width: slideW * count + 'px' });

				// 禁止鼠标托运图片
				$mainCell.find('img').on('dragstart', function (event) {
					return false;
				});

				// 循环播放头尾处理：clone最后一个放到第一个前面，clone第一个前面放到最后
				if (op.loop) {
					$mainCell.append($slides.eq(0).clone(true));
					$mainCell.prepend($slides.eq(count - 1).clone(true));
					$mainCell.css({ width: slideW * (count + 2) + 'px' });
				}

				// 处理横竖屏切换适配
				$box.on('slide-resize', function () {
					setTimeout(function () {
						wrapW = $wrapCell.width();
						slideW = wrapW;
						if (count > 0) {
							// 支持两边留白情况
							slideW = $box.width();
						}

						$mainCell.children().css({ width: slideW + 'px' });
						$mainCell.css({ width: slideW * count + 'px' });
						if (op.loop) {
							$mainCell.css({ width: slideW * (count + 2) + 'px' });
						}
						switchSlide();
					}, 200);
				});

				function switchSlide(pos) {
					let centerW = (wrapW - slideW) / 2;
					if (op.loop) {
						if (currentIndex == -1) {
							// 滑动到最前面，滑动完成后回到最后一个
							$mainCell.animate({ x: -(currentIndex + 1) * slideW + centerW }, op.delayTime, 'ease', function () {
								currentIndex = count - 1;
								$mainCell.translateX(-(currentIndex + 1) * slideW + centerW + 'px');
								if ($tits) $tits.removeClass(op.titActive).eq(currentIndex).addClass(op.titActive);
							});
						} else if (currentIndex >= count) {
							// 滑动到最后面，滑动完成后回到第一个
							$mainCell.animate({ x: -(currentIndex + 1) * slideW + centerW }, op.delayTime, 'ease', function () {
								currentIndex = 0;
								$mainCell.translateX(-(currentIndex + 1) * slideW + centerW + 'px');
								if ($tits) $tits.removeClass(op.titActive).eq(currentIndex).addClass(op.titActive);
							});
						} else {
							$mainCell.animate({ x: -(currentIndex + 1) * slideW + centerW }, op.delayTime, 'ease');
							if ($tits) $tits.removeClass(op.titActive).eq(currentIndex).addClass(op.titActive);
						}
					} else {
						if (currentIndex >= count) {
							currentIndex = 0;
						}
						$mainCell.animate({ x: -currentIndex * slideW + centerW }, op.delayTime, 'ease');
						if ($tits) $tits.removeClass(op.titActive).eq(currentIndex).addClass(op.titActive);
					}
				}
				let nIntervId = -1;

				function play() {
					if (nIntervId != -1 || !op.autoPlay) return;

					nIntervId = setInterval(function () {
						if ($('div[data-slide-id="' + slideId + '"]').size() == 0) {
							clearInterval(nIntervId);
							return;
						}

						currentIndex++;
						switchSlide();
					}, op.interTime);
				}

				function stop() {
					if (nIntervId != -1) {
						clearInterval(nIntervId);
						nIntervId = -1;
					}
				}

				switchSlide();

				if (count > 1) {
					play();

					if ($tits)
						$tits.each(function (index) {
							$(this).touchwipe({
								touch(event) {
									currentIndex = index;
									switchSlide();
								}
							});
						});

					$mainCell.touchwipe({
						// stopPropagationEvents:true,
						direction: 'horizontal',
						touchstart(event, pos) {
							stop();
						},
						touchmove(event, pos) {
							let index = op.loop ? 1 : 0;
							$mainCell.translateX(-(currentIndex + index) * slideW - pos.dx + 'px');
						},
						touchend(event, pos) {
							if (pos.dx > 40) {
								if (currentIndex < count - (op.loop ? 0 : 1)) {
									currentIndex++;

									if ($.slideMedia) {
										$.slideMedia.play();
									}
								}
							} else if (pos.dx < -40) {
								if (currentIndex > (op.loop ? -1 : 0)) {
									currentIndex--;

									if ($.slideMedia) {
										$.slideMedia.play();
									}
								}
							}

							switchSlide(pos);
							play();
						}
					});
				}
			});
		}
	});
})(dwz);
