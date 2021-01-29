/**
 * @author 张慧华 <350863780@qq.com>
 */

$.filterPanel = {
	config: {
		box$: '#filter-panel',
		openClass: 'open',
		frag: '<div id="filter-panel" class="unitBox"></div>',
		bgBox$: '#mask-filter-panel',
		bgFrag: '<div id="mask-filter-panel" class="mask-bg"></div>'
	},
	isOpen: false,
	$box: null,
	$bgBox: null,

	init(options) {
		$.extend($.filterPanel.config, options);

		$('body').append($.filterPanel.config.frag).append($.filterPanel.config.bgFrag);
		this.$box = $($.filterPanel.config.box$);
		this.$bgBox = $($.filterPanel.config.bgBox$);

		this.$bgBox.click(function () {
			$.filterPanel.close();
		});
	},
	open(options) {
		// default, pic, login
		let op = $.extend({ type: 'GET', url: '', pop: 'default', data: {}, callback: null }, options);
		let $box = this.$box,
			$bgBox = this.$bgBox;

		$bgBox.addClass($.filterPanel.config.openClass);

		$box.show().translateX($box.get(0).clientWidth + 'px');
		setTimeout(function () {
			$box.animate({ x: 0 }, 400, 'ease');
		}, 10);

		if (op.url) {
			let params = $.extend(op.url.getParams(), op.data);
			$.ajax({
				type: 'GET',
				url: op.url,
				data: op.data,
				success: (html) => {
					$box.triggerPageClear();

					if (!op.callback) {
						op.callback = dwz.getUrlCallback(op.url);
					}

					const tpl = $.templateWrap(html);
					if (op.callback) {
						op.callback.call($box, tpl, params);
					} else {
						$box.html(html).initUI();
						$.execHelperFn($box, tpl, params);
					}
				},
				error: dwz.ajaxError
			});
		}

		this.isOpen = true;
	},
	close() {
		let $box = this.$box,
			$bgBox = this.$bgBox;

		$box.animate({ x: $box.get(0).clientWidth }, 500, 'ease', function () {
			$box.html('').hide();
		});

		$bgBox.removeClass($.filterPanel.config.openClass);

		this.isOpen = false;
	},
	getBox() {
		return this.$box;
	}
};
