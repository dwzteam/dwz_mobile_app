/**
 * @author 张慧华 <350863780@qq.com>
 */
$.filterSelect = {
	config: {
		box$: '#filter-select',
		openClass: 'open',
		frag: '<div id="filter-select" class="unitBox"></div>',
		bgBox$: '#mask-filter-select',
		bgFrag: '<div id="mask-filter-select" class="mask-bg"></div>'
	},
	isOpen: false,
	$box: null,
	$bgBox: null,

	init(options) {
		if (!this.$box) {
			$.extend($.filterSelect.config, options);

			$('body').append($.filterSelect.config.frag);
			$('body').append($.filterSelect.config.bgFrag);
			this.$box = $($.filterSelect.config.box$);
			this.$bgBox = $($.filterSelect.config.bgBox$);

			this.$bgBox.on($.event.hasTouch ? 'touchstart' : 'click', function () {
				$.filterSelect.close();
			});
		}
	},
	open(options) {
		this.init(options);

		// default, fullscreen
		let op = $.extend(
			{
				type: 'GET',
				url: '',
				data: {},
				callback: null,
				pop: 'default',
				top: 0
			},
			options
		);
		let $box = this.$box,
			$bgBox = this.$bgBox;

		let boxH = document.documentElement.clientHeight - op.top;
		if (op.pop != 'fullscreen') {
			boxH = boxH * 0.7;
		}

		$bgBox.addClass($.filterSelect.config.openClass);
		$box.addClass($.filterSelect.config.openClass);
		setTimeout(function () {
			$box.css({ top: op.top + 'px', height: boxH + 'px' });
			$bgBox.css({ top: op.top + 'px' });
		}, 20);

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
						op.callback.call($box, tpl);
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
		let $box = $.filterSelect.$box,
			$bgBox = $.filterSelect.$bgBox;

		if ($bgBox) {
			$bgBox.removeClass($.filterSelect.config.openClass);
		}
		if ($box) {
			$box.css({ height: '0px' });
			setTimeout(function () {
				$box.removeClass($.filterSelect.config.openClass);
			}, 500);
		}

		this.isOpen = false;
	},
	getBox() {
		return this.$box;
	}
};
