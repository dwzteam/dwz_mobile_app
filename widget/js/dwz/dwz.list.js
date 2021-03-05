/**
 * @author 张慧华 <350863780@qq.com>
 */
$.fn.extend({
	list(options) {
		let op = $.extend(
			{
				pullDown$: 'div.pullDown',
				pullUp$: 'div.pullUp',
				pullDownLabel$: 'span.pullDownLabel',
				pullUpLabel$: 'span.pullUpLabel',
				scroll$: '.scroll',
				refreshFn: function ($pullDown) {},
				loadMoreFn: function ($pullUp) {}
			},
			options
		);

		return this.each(function () {
			let $wrap = $(this),
				$main = $wrap.find(op.scroll$),
				$form = op.$form, // 无限滚动表单
				$pullDown = $wrap.find(op.pullDown$),
				$pullUp = $wrap.find(op.pullUp$),
				$pullDownLabel = $pullDown ? $pullDown.find(op.pullDownLabel$) : null,
				$pullUpLabel = $pullUp ? $pullUp.find(op.pullUpLabel$) : null;

			let $hideBarCtl = $wrap.parentsUnitBox().find('.hideBarCtl');

			let pullDownMsg = { txt: '', flip: '' },
				pullUpMsg = { txt: '', loading: '', loadMoreTxt: '', noLoadMoreTxt: '' };
			if ($pullDownLabel.size() > 0) {
				pullDownMsg = {
					txt: $pullDownLabel.html(),
					flip: $pullDownLabel.attr('data-flip') || 'Release to Refresh'
				};
			}
			if ($pullUpLabel.size() > 0) {
				pullUpMsg = {
					loadMoreTxt: $pullUpLabel.html() || '加载更多',
					noLoadMoreTxt: $pullUpLabel.attr('data-no-more') || '没有更多了',
					loading: $pullUpLabel.attr('data-loading') || '加载中...'
				};
			}

			$wrap.scroll({
				scrollX: false,
				scrollY: true,
				scroll$: op.scroll$,
				touchstart(event, pos) {
					let _formData = $form.listTotal();
					if (_formData.currentList && $pullUp.size() > 0) {
						$pullUp.removeClass('loading').addClass('data-more');
						// 判断有没有下一页
						if (_formData.currentList.length) {
							$pullUpLabel.html(pullUpMsg.loadMoreTxt);
						} else {
							$pullUpLabel.html(pullUpMsg.noLoadMoreTxt);
						}
					}
				},
				touchmove(event, pos) {
					if ($pullDown.size() > 0) {
						if (pos.scrollY > 60) {
							$pullDown.addClass('flip');
							$pullDownLabel.html(pullDownMsg.flip);
						} else {
							$pullDown.removeClass('flip');
							$pullDownLabel.html(pullDownMsg.txt);
						}
					}

					if ($pullUp.size() > 0) {
						if (pos.scrollY - 200 < -pos.scrollH && pos.scrollH > 20) {
							$pullUp.addClass('loading');
							$pullUpLabel.html(pullUpMsg.loading);
						} else {
							$pullUp.removeClass('loading');
						}
					}

					if ($hideBarCtl.size() > 0) {
						if (pos.scrollY < -50 && pos.scrollH > 5 && pos.endY > pos.y + 3) {
							$hideBarCtl.addClass('hideBar');
						} else if (pos.endY < pos.y - 3) {
							$hideBarCtl.removeClass('hideBar');
						}
					}
				},
				touchend(event, pos) {
					// 列表刷新
					if ($pullDown.size() > 0) {
						if ($pullDown.hasClass('flip')) {
							$pullDown.removeClass('flip').addClass('loading');
							setTimeout(function () {
								$pullDown.removeClass('loading');
							}, 1000);
							op.refreshFn.call($wrap, $pullDown);
						}
					}

					//加载下一页
					if ($pullUp.size() > 0) {
						if ($pullUp.hasClass('loading')) {
							op.loadMoreFn.call($wrap, $pullUp);
						}
					}
				}
			});

			// ajax 加载下一页完成事件
			$form.on('dwz-ajax-done', () => {
				let _formData = $form.listTotal();

				$pullUp.removeClass('loading').addClass('data-more');
				// 判断有没有下一页
				if (_formData.currentList.length < _formData.pagesize) {
					$pullUpLabel.html(pullUpMsg.noLoadMoreTxt);
				} else {
					$pullUpLabel.html(pullUpMsg.loadMoreTxt);
				}
			});
		});
	},
	// 无限滚动form total
	listTotal(total, currentList, pagesize) {
		if (total === undefined) {
			return { total: this.total || 0, ajaxTime: this.ajaxTime, currentList: this.currentList || [], pagesize: this.pagesize || 20 };
		} else {
			this.total = parseInt(total || 0);
			this.currentList = currentList || [];
			this.pagesize = pagesize;
			if (!this.total) this.total = this.currentList.length;
			this.ajaxTime = new Date().getTime();

			this.trigger('dwz-ajax-done');
		}
	}
});

$.extend({
	listForm($form) {
		let $list = $form.find('div.dwz-list');
		let $page = $form.find('input[name="' + dwz.config.pageInfo.pageNum + '"]');
		$form.on('submit', () => {
			if ($page.size()) $page.val(1);
			$form.requestList();
			$list.scrollTo({ y: 0, duration: 800 });
			return false;
		});
		setTimeout(() => {
			$form.trigger('submit');
		}, 300);

		$list.list({
			$form,
			refreshFn() {
				console.log('refreshFn...');
				if ($page.size()) $page.val(1);
				$form.requestList();
			},
			loadMoreFn() {
				console.log('loadMoreFn...');
				if ($page.size() && $form.total && $form.total > $list.find('li.item').size()) {
					$page.val(parseInt($page.val()) + 1);
					$form.requestList(true);
					$list.data('dwz-load-more', 1); // 加载下一页时，禁用scroll复位
				} else {
					$list.data('dwz-load-more', 2); // 已经是最后一页
					$form.listTotal($form.total, []);
				}
			}
		});
	}
});
