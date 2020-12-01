/**
 * Created by zhanghuihua on 2017/1/1.
 */
(function ($) {
	$.fn.extend({
		scrollTo(options) {
			return this.each(function () {
				let $main = $(this).children().eq(0);
				if (options.y == 'end') {
					let scrollY = $main.height() - $(this).height();
					if (scrollY > 0) {
						options.y = -scrollY + 'px';
						$main.translate(options);
					}
				} else {
					$main.translate(options);
				}
			});
		},
		scroll(options) {
			let op = $.extend(
				{
					scrollX: false,
					scrollY: true,
					delayTime: 400, // 效果持续时间
					touchstart: null,
					touchmove: null, // touchmove事件触发scroll
					touchend: null,
					scroll$: '.scroll',
					topBtn$: '.top-btn',
					stopPropagationEvents: false
				},
				options
			);

			return this.each(function () {
				let $wrap = $(this),
					$main = $wrap.find(op.scroll$),
					$topBtn = $wrap.find(op.topBtn$);

				let topBtnTime = 0;
				$topBtn.click(function (event) {
					event.stopPropagation();
					topBtnTime = new Date().getTime();

					$wrap.scrollTo({ y: 0, duration: 800 });
					$topBtn.addClass('hide');
				});

				function getScrollW() {
					let scrollW = $main.get(0).clientWidth - $wrap.get(0).clientWidth;
					return scrollW > 0 ? scrollW : 0;
				}
				function getScrollH() {
					let scrollH = $main.get(0).clientHeight - $wrap.get(0).clientHeight;
					return scrollH > 0 ? scrollH : 0;
				}

				let startTime = 0,
					endTime = 0;
				let currentPos = { x: 0, y: 0 };
				let direction = 'vertical';
				if (op.scrollX) {
					direction = op.scrollY ? 'all' : 'horizontal';
				}

				$wrap.touchwipe({
					direction: direction,
					stopPropagationEvents: op.stopPropagationEvents,
					touchstart(event, pos) {
						currentPos = $main.getComputedPos();
						if (op.scrollY) {
							$main.translateY(currentPos.y + 'px', 0);
						}
						if (op.scrollX) {
							$main.translateX(currentPos.x + 'px', 0);
						}

						if (op.touchstart) op.touchstart.call($main, event, pos);
					},
					touchmove(event, pos) {
						let timestamp = new Date().getTime();

						// We need to move at least 10 pixels for the scrolling to initiate
						if (
							timestamp - endTime > 300 &&
							Math.abs(pos.dx) < 10 &&
							Math.abs(pos.dy) < 10
						) {
							return;
						}

						startTime = timestamp;

						if (op.scrollY) {
							let scrollH = getScrollH();
							let scrollY = -Math.round(pos.dy - currentPos.y);

							if (scrollY > 0) {
								scrollY = scrollY / 3;
							} else if (scrollY < -scrollH) {
								scrollY = (scrollY + scrollH) / 3 - scrollH;
							}

							$main.translateY(scrollY + 'px', 0, 'linear');

							if ($topBtn.size() > 0) {
								if (scrollY < -100) {
									$topBtn.removeClass('hide');
								} else {
									$topBtn.addClass('hide');
								}
							}

							// 添加touchmove参数
							pos.scrollH = scrollH;
							pos.scrollY = scrollY;
						}

						if (op.scrollX) {
							let scrollW = getScrollW();
							let scrollX = -Math.round(pos.dx - currentPos.x);

							if (scrollX > 0) {
								scrollX = scrollX / 3;
							} else if (scrollX < -scrollW) {
								scrollX = (scrollX + scrollW) / 3 - scrollW;
							}
							$main.translateX(scrollX + 'px', 0, 'linear');

							// 添加touchmove参数
							pos.scrollW = scrollW;
							pos.scrollX = scrollX;
						}

						if (op.touchmove) op.touchmove.call($main, event, pos);
					},
					touchend(event, pos) {
						endTime = new Date().getTime();

						if (endTime - topBtnTime < 300) {
							// 点击topBtn禁止滚动
							return;
						}

						if (op.scrollY && Math.abs(pos.dy) > 20) {
							pos.scrollH = getScrollH();
							if (pos.dy - currentPos.y < 0) {
								// 定位到顶部
								$main.animate(
									{ y: 0 },
									op.delayTime,
									'cubic-bezier(0.1, 0.57, 0.1, 1)'
								);
							} else if (pos.dy - currentPos.y > pos.scrollH) {
								//定位到底部
								$main.animate(
									{ y: -pos.scrollH },
									op.delayTime,
									'cubic-bezier(0.1, 0.57, 0.1, 1)'
								);
							} else {
								// 加速度处理
								let scrollPos = $main.getComputedPos();
								let scrollY =
									dwz.speed.getY() * ($wrap.get(0).clientHeight / 680) +
									scrollPos.y;

								if (scrollY < -pos.scrollH) scrollY = -pos.scrollH;
								else if (scrollY > 0) scrollY = 0;

								$main.animate(
									{ y: scrollY },
									op.delayTime * 3,
									'cubic-bezier(0.1, 0.57, 0.1, 1)'
								); // ease, linear
							}
						}
						if (op.scrollX && Math.abs(pos.dx) > 20) {
							pos.scrollW = getScrollW();
							if (pos.dx - currentPos.x < 0) {
								$main.animate(
									{ x: 0 },
									op.delayTime,
									'cubic-bezier(0.1, 0.57, 0.1, 1)'
								);
							} else if (pos.dx - currentPos.x > pos.scrollW) {
								$main.animate(
									{ x: -pos.scrollW },
									op.delayTime,
									'cubic-bezier(0.1, 0.57, 0.1, 1)'
								);
							} else {
								// 加速度处理
								let scrollPos = $main.getComputedPos();
								let scrollX = dwz.speed.getX() + scrollPos.x;

								if (scrollX < -pos.scrollW) scrollX = -pos.scrollW;
								else if (scrollX > 0) scrollX = 0;

								$main.animate(
									{ x: scrollX },
									op.delayTime * 3,
									'cubic-bezier(0.1, 0.57, 0.1, 1)'
								); // ease, linear
							}
						}

						if (op.touchend) op.touchend.call($main, event, pos);
					}
				});
			});
		}
	});
})(dwz);
