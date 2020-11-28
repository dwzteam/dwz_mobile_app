/**
 * Created by zhanghuihua on 2016/12/19.
 */

$.filterPanel = {
	config: {
		box$: '#filter-panel',
		openClass: 'open',
		frag: '<div id="filter-panel" class="unitBox"></div>',
		bgBox$: '#mask-filter-panel',
		bgFrag: '<div id="mask-filter-panel" class="mask-background"></div>'
	},
	isOpen: false,
	$box: null,
	$bgBox: null,

	init: function (options) {
		$.extend($.filterPanel.config, options);

		$('body')
			.append($.filterPanel.config.frag)
			.append($.filterPanel.config.bgFrag);
		this.$box = $($.filterPanel.config.box$);
		this.$bgBox = $($.filterPanel.config.bgBox$);

		this.$bgBox.click(function () {
			$.filterPanel.close();
		});
	},
	open: function (options) {
		// default, pic, login
		let op = $.extend(
			{ type: 'GET', url: '', pop: 'default', data: {}, callback: null },
			options
		);
		let $box = this.$box,
			$bgBox = this.$bgBox;

		$bgBox.addClass($.filterPanel.config.openClass);

		$box.show().translateX($box.get(0).clientWidth + 'px');
		setTimeout(function () {
			$box.animate({ x: 0 }, 400, 'ease');
		}, 10);

		if (op.url) {
			let params = op.url.getParams();
			$.ajax({
				type: 'GET',
				url: op.url,
				data: params,
				success: (html) => {
					$box.triggerPageClear();

					if (!op.callback) {
						op.callback = dwz.getUrlCallback(op.url);
					}

					if (op.callback) {
						op.callback.call($box, html, $.extend(params, op.data));
					} else {
						$box.html(html).initUI();
					}
				},
				error: dwz.ajaxError
			});
		}

		this.isOpen = true;
	},
	close: function () {
		let $box = this.$box,
			$bgBox = this.$bgBox;

		$box.animate({ x: $box.get(0).clientWidth }, 500, 'ease', function () {
			$box.html('').hide();
		});

		$bgBox.removeClass($.filterPanel.config.openClass);

		this.isOpen = false;
	},
	getBox: function () {
		return this.$box;
	}
};
