/**
 * @author 张慧华 <350863780@qq.com>
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
					delayTime: 700, // 效果持续时间
					touchstart: null,
					touchmove: null, // touchmove事件触发scroll
					touchend: null,
					scroll$: '.scroll',
					topBtn$: '.top-btn'
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

				let endTime = 0; // touchend 触发时间
				let lastMovePos; // 上次touchmove位置
				let currentMovePos; // 当前touchmove位置
				let currentPos = { x: 0, y: 0 };
				let direction = 'vertical';
				if (op.scrollX) {
					direction = op.scrollY ? 'all' : 'horizontal';
				}

				$wrap.touchwipe({
					direction: direction,
					stopPropagationEvents: false,
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
						if (timestamp - endTime > 300 && Math.abs(pos.dx) < 10 && Math.abs(pos.dy) < 10) {
							return;
						}

						if (currentMovePos && timestamp - currentMovePos.timestamp > 10) {
							lastMovePos = { x: currentMovePos.x, y: currentMovePos.y, timestamp: currentMovePos.timestamp }; // 记录上次touchmove 位置
						}
						currentMovePos = { x: pos.x, y: pos.y, timestamp }; // 记录当前touchmove 位置

						if (op.scrollY) {
							let scrollH = getScrollH();
							let scrollY = -Math.round(pos.dy - currentPos.y);

							if (scrollY > 0) {
								// 滚动超出顶部，平缓降低速度
								scrollY = scrollY / (1 + scrollY / 200);
							} else if (scrollY < -scrollH) {
								// 滚动超出底部，平缓降低速度
								let _endOver = scrollY + scrollH;
								scrollY = _endOver / (1 + Math.abs(_endOver) / 200) - scrollH;
							}

							$main.translateY(scrollY + 'px', 0);

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

						let _speed = $.speed.cal(currentMovePos, lastMovePos);
						if (!_speed.x && !_speed.y) {
							return;
						}

						if (op.touchend) op.touchend.call($main, event, pos);

						if (op.scrollY && Math.abs(pos.dy) > 20) {
							let _dwzLoadMore = $wrap.data('dwz-load-more');
							pos.scrollH = getScrollH();
							if (pos.dy - currentPos.y < 0) {
								// 定位到顶部
								$main.animate({ y: 0 }, op.delayTime, 'cubic-bezier(0.1, 0.57, 0.1, 1)');
							} else if (pos.dy - currentPos.y > pos.scrollH && _dwzLoadMore != 1) {
								//定位到底部, 但是 dwz-load-more == 1 时禁用
								$main.animate({ y: -pos.scrollH }, op.delayTime, 'cubic-bezier(0.1, 0.57, 0.1, 1)');
							} else {
								// 加速度处理
								let speedY = _speed.y;

								if (Math.abs(speedY) > 50) {
									let scrollPos = $main.getComputedPos();
									let scrollLength = speedY; // 滚动长度
									let scrollY = scrollLength + scrollPos.y;

									if (scrollY < -pos.scrollH) {
										let _nextPageH = _dwzLoadMore == 1 ? 80 : 0; // dwz-load-more == 1 时，下一页点位高度
										scrollY = -pos.scrollH - _nextPageH;
									} else if (scrollY > 0) {
										scrollY = 0;
									}

									// 根据加速度计算动画时长
									let dealyRate = Math.abs(scrollLength / 400) + 0.2;
									dealyRate = Math.min(dealyRate, 1);

									$main.animate({ y: scrollY }, op.delayTime * dealyRate, 'cubic-bezier(0.25, 0.3, 0.1, 0.9)'); // ease, linear, cubic-bezier(0.25, 0.46, 0.45, 0.94)
								}
							}
						}
						if (op.scrollX && Math.abs(pos.dx) > 20) {
							pos.scrollW = getScrollW();
							if (pos.dx - currentPos.x < 0) {
								$main.animate({ x: 0 }, op.delayTime, 'cubic-bezier(0.1, 0.57, 0.1, 1)');
							} else if (pos.dx - currentPos.x > pos.scrollW) {
								$main.animate({ x: -pos.scrollW }, op.delayTime, 'cubic-bezier(0.1, 0.57, 0.1, 1)');
							} else {
								// 加速度处理
								let scrollPos = $main.getComputedPos();
								let scrollX = _speed.x + scrollPos.x;

								if (scrollX < -pos.scrollW) scrollX = -pos.scrollW;
								else if (scrollX > 0) scrollX = 0;

								$main.animate({ x: scrollX }, op.delayTime, 'cubic-bezier(0.25, 0.46, 0.45, 0.94)'); // ease, linear
							}
						}
					}
				});
			});
		}
	});
})(dwz);
