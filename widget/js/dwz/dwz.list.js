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
				pullUpMsg = { txt: '', loading: '', more: '', noMore: '' };
			if ($pullDownLabel.size() > 0) {
				pullDownMsg = {
					txt: $pullDownLabel.html(),
					flip: $pullDownLabel.attr('data-flip') || 'Release to Refresh'
				};
			}
			if ($pullUpLabel.size() > 0) {
				pullUpMsg = {
					loadMoreTxt: $pullUpLabel.html(),
					noMoreRecordsTxt: '',
					loading: $pullUpLabel.attr('data-loading') || 'Loading...',
					more: $pullUpLabel.attr('data-more') || '向下滑动加载更多',
					noMore: $pullUpLabel.attr('data-no-more') || '没有更多'
				};
			}

			$wrap.scroll({
				scrollX: false,
				scrollY: true,
				scroll$: op.scroll$,
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
						if (pos.scrollY - 200 < -pos.scrollH) {
							$pullUp.addClass('loading');
							$pullUpLabel.html(pullUpMsg.loading);
						} else {
							$pullUp.removeClass('loading data-more');
							$pullUpLabel.html(pullUpMsg.loadMoreTxt);
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

				$pullUp.removeClass('loading data-more');
				// 判断有没有下一页
				if (_formData.currentList.length) {
					$pullUpLabel.html(pullUpMsg.more);
					$pullUp.addClass('data-more');
				} else {
					$pullUpLabel.html(pullUpMsg.noMore);
					$pullUp.addClass('data-more');
				}
			});
		});
	},
	// 无限滚动form total
	listTotal(total, currentList) {
		if (total === undefined) {
			return { total: this.total || 0, ajaxTime: this.ajaxTime, currentList: this.currentList };
		} else {
			this.total = parseInt(total || 0);
			this.currentList = currentList || [];
			if (!this.total) this.total = this.currentList.length;
			this.ajaxTime = new Date().getTime();

			this.trigger('dwz-ajax-done');
		}
	}
});

$.extend({
	listForm($form) {
		let $list = $form.find('div.dwz-list');
		$form.on('submit', function () {
			$form.requestList();
			$list.scrollTo({ y: 0, duration: 800 });
			return false;
		});
		setTimeout(() => {
			$form.trigger('submit');
		}, 300);

		let $page = $form.find('input[name="' + dwz.config.pageInfo.pageNum + '"]');
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
