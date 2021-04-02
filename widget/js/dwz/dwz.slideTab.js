/**
 * @author 张慧华 <350863780@qq.com>
 */
(function ($) {
	$.fn.extend({
		slideTab(options) {
			let op = $.extend(
				{
					activeClass: 'on', // 导航指示圆点活跃class name
					header$: '.hd', // tab header
					content$: '.bd', // tab content
					currentIndex: 0, // 默认的当前位置索引。0是第一个; currentIndex:1 时，相当于从第2个开始执行
					delayTime: 400, // 效果持续时间
					onSwitchSlide: null
				},
				options
			);

			return this.each(function () {
				let slideId = Math.round(Math.random() * 10000000),
					$box = $(this).attr('data-slide-tab-id', slideId),
					$content = $box.find(op.content$),
					$contentUl = $content.children('ul'),
					$header = $box.find(op.header$),
					$headerUl = $header.children('ul');

				let $tabs = $headerUl.children(),
					tabW = 0, // sildeTab .hd li 单个宽度
					headerUlW = 0; // header ul width

				let calTabW = () => {
					tabW = 0;
					headerUlW = 0;
					$tabs.each(function (index) {
						let _tabW = $(this).width(true);
						if (tabW < _tabW) tabW = _tabW;
						headerUlW += _tabW;
					});
					$headerUl.css({ width: headerUlW + 'px' });
				};

				calTabW();

				let $slides = $contentUl.children();

				let currentIndex = op.currentIndex,
					count = $tabs.size();
				if ($slides.size() == 0) {
					let slidesHtml = '';

					$tabs.each(function (index) {
						slidesHtml += '<li></li>';
					});

					$contentUl.html(slidesHtml);
					$slides = $contentUl.children();
				}

				let contentW = $content.width() || $('body').width(), // sildeTab .bd 容器宽度
					// slideW = $slides.width(true); // sildeTab .bd li 单个面板宽度
					slideW = contentW;
				$slides.each(function (index) {
					let _slideW = $(this).width(true);
					if (slideW < _slideW) slideW = _slideW;
				});

				function switchTab(scollCurrent) {
					let $tab = $tabs.removeClass(op.activeClass).eq(currentIndex).addClass(op.activeClass);

					if (scollCurrent) {
						let leftPos = -currentIndex * tabW,
							headerW = $header.width(),
							centerPos = (headerW - tabW + (tabW - $tab.width())) / 2;
						if (centerPos > 0) {
							leftPos += centerPos;

							if (leftPos > 0) leftPos = 0;
							else if (leftPos < headerW - headerUlW) leftPos = headerW - headerUlW;
						}
						$headerUl.animate({ x: leftPos }, op.delayTime, 'ease');
					}
				}

				function switchSlide() {
					let $slide = $slides.eq(currentIndex);
					let leftPos = -currentIndex * slideW,
						centerPos = ($header.width() - slideW + (slideW - $slide.width())) / 2;
					if (centerPos > 0) {
						leftPos += centerPos;
					}
					$contentUl.animate({ x: leftPos }, op.delayTime, 'ease');

					// 添加当前activeClass
					$slides.removeClass(op.activeClass).eq(currentIndex).addClass(op.activeClass);

					let $tab = $tabs.eq(currentIndex),
						_href = $tab.attr('data-href');
					if (op.onSwitchSlide && _href) {
						let _params = _href.getParams();
						if (!$tab.attr('data-loaded')) {
							$.ajax({
								type: 'GET',
								url: _href,
								data: _params,
								success: (_tpl) => {
									$tab.attr('data-loaded', 1);
									let $img = $tab.find('img');
									if ($img.size() > 0) {
										_params.img_src = $img.attr('src');
									}
									op.onSwitchSlide($slide, _tpl, _params);
								},
								error: dwz.ajaxError
							});
						}
					}
				}

				if (count > 0) {
					$header.scroll({
						scrollX: true,
						scrollY: false,
						scroll$: ':scope > ul',
						stopPropagationEvents: true,
						touchstart: calTabW
					});
					switchTab();
					switchSlide();

					// tabs touch 事件
					$tabs.each(function (index) {
						let $tab = $(this);
						$tab.touchwipe({
							data: index,
							touch(event, pos) {
								currentIndex = event.data;
								switchTab(true);
								switchSlide();
							}
						});
					});

					$contentUl.touchwipe({
						stopPropagationEvents: true,
						direction: 'horizontal',

						touchstart(event, pos) {},
						touchmove(event, pos) {
							let index = op.loop ? 1 : 0;
							$contentUl.translateX(-currentIndex * slideW - pos.dx + 'px');
						},
						touchend(event, pos) {
							if (pos.dx > 40) {
								if (currentIndex < count - 1) {
									currentIndex++;
									switchTab(true);
									if ($.slideMedia) {
										$.slideMedia.play();
									}
								}
							} else if (pos.dx < -40) {
								if (currentIndex > 0) {
									currentIndex--;
									switchTab(true);
									if ($.slideMedia) {
										$.slideMedia.play();
									}
								}
							}

							switchSlide();
						}
					});
				}
			});
		}
	});
})(dwz);
