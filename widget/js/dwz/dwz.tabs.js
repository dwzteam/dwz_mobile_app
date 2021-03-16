/**
 * @author 张慧华 <350863780@qq.com>
 */
$.fn.extend({
	/**
	 * options: currentIndex[default index 0]
	 *            tab$[tabs selector],
	 *            panel$[tab panel selector]
	 *            ajaxClass[ajax load]
	 */
	tabs(options) {
		let op = $.extend(
			{
				currentIndex: 0,
				tab$: ':scope > .tab-bar > .tab-item',
				panel$: ':scope > .tab-panel > .panel-item',
				ajaxClass: 'dwz-ajax'
			},
			options
		);

		return this.each(function () {
			let $box = $(this),
				$tabs = $box.find(op.tab$),
				$panels = $box.find(op.panel$);

			$tabs.each(function (iTabIndex) {
				let $tab = $(this);
				if (op.currentIndex == iTabIndex) $tab.addClass('active');
				else $tab.removeClass('active');

				$tab.each(function () {
					$tab.click(function (event) {
						switchTab($box, $tabs, $panels, iTabIndex);

						event.preventDefault();
					});
				});
			});

			switchTab($box, $tabs, $panels, op.currentIndex);
		});

		function switchTab($box, $tabs, $panels, iTabIndex) {
			let $tab = $tabs.eq(iTabIndex);
			op.currentIndex = iTabIndex;

			$tabs.removeClass('active');
			$tab.addClass('active');

			let $panel = $panels.removeClass('active').eq(op.currentIndex).addClass('active');

			setTimeout(() => {
				$box.trigger(dwz.event.type.activated, { $tab, $panel, $tabs, $panels, currentIndex: op.currentIndex });
			}, 200);

			if ($tab.hasClass(op.ajaxClass)) {
				let url = $tab.attr('data-href');
				if (url && !$panel.attr('loaded')) {
					let _data = url.getParams();
					$.ajax({
						type: 'GET',
						url: url,
						data: _data,
						success: (html) => {
							$panel.triggerPageClear();

							const callback = dwz.getUrlCallback(url);
							const tpl = $.templateWrap(html);
							if (callback) {
								callback.call($panel, tpl, _data);
							} else {
								$panel.html(html).initUI();
								$.execHelperFn($panel, tpl, _data);
							}

							$panel.attr('loaded', true);
						}
					});
				}
			}
		}
	}
});
