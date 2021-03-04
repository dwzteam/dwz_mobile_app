/**
 * @author 张慧华 <350863780@qq.com>
 * $(document).touchwipe({
 *      wipeLeft:function(event, pos){ alert("向左滑动了")},
 *      wipeRight:function(event, pos){alert("向右滑动了")},
 *      touch: function(event, pos){}
 * });
 */
(function ($) {
	$.fn.extend({
		touchwipe(settings) {
			let config = {
				min_move_x: 30,
				min_move_y: 30,
				wipeLeft(event, pos) {},
				wipeRight(event, pos) {},
				wipeUp(event, pos) {},
				wipeDown(event, pos) {},
				touch: null,
				touchstart: null,
				touchmove: null, // touchmove事件触发scroll
				touchend: null,
				longpress: null, // 长按事件
				direction: 'vertical', // 允许滚动方向：vertical, horizontal, all
				preventDefaultEvents: false,
				stopPropagationEvents: false,
				data: null // 自定义参数
			};

			if (settings) $.extend(config, settings);

			return this.each(function () {
				let $me = $(this);
				let startX = 0,
					startY = 0,
					startX2 = 0,
					startY2 = 0,
					endX = 0,
					endY = 0,
					endX2 = 0,
					endY2 = 0,
					touchType = null, // touch, zoom
					longpressTimer = 0, // 长按事件 setTimeout
					directionStart = null; // 滚动开始方向：vertical, horizontal

				let maxMove = { dx: 0, dy: 0 };

				function cancelTouch() {
					$.event.remove($me.get(0), 'touchmove', onTouchMove);
					$.event.remove($me.get(0), 'mousemove', onTouchMove);
				}

				function onTouchMove(e) {
					if (touchType) {
						let pos = {
							startX: startX,
							startY: startY,
							endX: endX,
							endY: endY,
							startX2: startX2,
							startY2: startY2,
							endX2: endX,
							endY2: endY,
							x: e.type == 'mousemove' ? e.pageX : e.touches[0].pageX,
							y: e.type == 'mousemove' ? e.pageY : e.touches[0].pageY,
							touchType: touchType
						};
						pos.dx = startX - pos.x;
						pos.dy = startY - pos.y;
						endX = pos.x;
						endY = pos.y;

						if (e.touches && e.touches.length > 1) {
							pos.x2 = e.touches[1].pageX;
							pos.y2 = e.touches[1].pageY;
							endX2 = pos.x2;
							endY2 = pos.y2;
						}

						if (!directionStart && (Math.abs(pos.dx) > config.min_move_x || Math.abs(pos.dy) > config.min_move_y)) {
							// 判断开始滚动方向
							directionStart = Math.abs(pos.dx) > Math.abs(pos.dy) ? 'horizontal' : 'vertical';
						}

						if (Math.abs(pos.dx) > maxMove.dx) {
							maxMove.dx = pos.dx;
						}
						if (Math.abs(pos.dy) > maxMove.dy) {
							maxMove.dy = pos.dy;
						}

						if (config.touchmove) {
							// 滚动处理函数
							if (config.direction == directionStart || config.direction == 'all') {
								config.touchmove.call(this, e, pos);
							}
						} else {
							if (Math.abs(pos.dx) >= config.min_move_x && directionStart == 'horizontal') {
								cancelTouch(); // touch完成取消touch事件
								if (pos.dx > 0) {
									config.wipeLeft.call(this, e, pos);
								} else {
									config.wipeRight.call(this, e, pos);
								}
							} else if (Math.abs(pos.dy) >= config.min_move_y && directionStart == 'vertical') {
								cancelTouch(); // touch完成取消touch事件
								if (pos.dy > 0) {
									config.wipeUp.call(this, e, pos);
								} else {
									config.wipeDown.call(this, e, pos);
								}
							}
						}

						if (e.type == 'mousemove' && e.buttons === 0) {
							cancelTouch();
							onTouchEnd(e);
						}
					}

					// 长按事件
					if (config.longpress && longpressTimer) {
						clearTimeout(longpressTimer);
						longpressTimer = 0;
					}
				}

				function onTouchStart(e) {
					directionStart = null;
					if (config.preventDefaultEvents) {
						e.preventDefault();
					}

					if (config.stopPropagationEvents) {
						e.stopPropagation();
					}

					e.data = config.data; // 自定义传参

					if (e.type == 'mousedown') {
						// 鼠标事件
						startX = endX = e.pageX;
						startY = endY = e.pageY;
						touchType = 'touch';
						$.event.add($me.get(0), 'mousemove', onTouchMove);
					} else {
						// 解控事件
						if (!e.touches.length) {
							return;
						}
						startX = endX = e.touches[0].pageX;
						startY = endY = e.touches[0].pageY;
						touchType = 'touch';
						if (e.touches.length > 1) {
							startX2 = endX2 = e.touches[1].pageX;
							startY2 = endY2 = e.touches[1].pageY;
							touchType = 'zoom';
						}
						$.event.add($me.get(0), 'touchmove', onTouchMove);
					}

					if (config.touchstart) {
						let pos = {
							x: startX,
							y: startY,
							x2: startX2,
							y2: startY2,
							touchType: touchType
						};
						config.touchstart.call(this, e, pos);
					}

					// 长按事件
					if (config.longpress) {
						longpressTimer = setTimeout(() => {
							config.longpress.call(this, e);
							longpressTimer = 0;
						}, 500);
					}
				}

				function onTouchEnd(e) {
					e.data = config.data; // 自定义传参

					if (config.touchend) {
						let pos = {
							startX: startX,
							startY: startY,
							x: endX,
							y: endY,
							dx: startX - endX,
							dy: startY - endY,
							startX2: startX2,
							startY2: startY2,
							x2: endX2,
							y2: endY2,
							touchType: touchType
						};

						config.touchend.call(this, e, pos);
					}

					// 判断非滑动操作触发touch
					if (touchType == 'touch' && Math.abs(maxMove.dx) < config.min_move_x && Math.abs(maxMove.dy) < config.min_move_y) {
						if (config.touch && this !== window) config.touch.call(this, e, { x: startX, y: startY });
					}
					// 长按事件
					if (config.longpress && longpressTimer) {
						clearTimeout(longpressTimer);
						longpressTimer = 0;
					}

					cancelTouch(); // touch完成取消touch事件
					maxMove = { dx: 0, dy: 0 };
				}

				// 禁止重复绑定touch事件
				if (config.touch && $me.attr('dwz-event-touchwipe-touch')) {
					return;
				}
				if (config.touch) {
					$me.attr('dwz-event-touchwipe-touch', 'touch');
				}

				if ('ontouchstart' in window) {
					// 处理touchstart
					$.event.add($me.get(0), 'touchstart', onTouchStart);

					// 处理touchend
					$.event.add($me.get(0), 'touchend', onTouchEnd);
				} else {
					// if (config.touch) {$.event.add($me.get(0), 'click', config.touch);}

					$.event.add($me.get(0), 'mousedown', onTouchStart);
					$.event.add($me.get(0), 'mouseup', onTouchEnd);
				}

				// 处理鼠标滚动
				$.event.add($me.get(0), 'mousewheel', function (e) {
					if (config.stopPropagationEvents) {
						e.stopPropagation();
					}
					let pos = {
						startX: 0,
						startY: 0,
						x: 0,
						y: e.deltaY,
						dx: 0,
						dy: -e.deltaY,
						type: 'mousewheel'
					};

					config.touchmove && config.touchmove.call(this, e, pos);
				});
			});
		}
	});
})(dwz);
