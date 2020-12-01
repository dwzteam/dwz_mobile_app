/**
 * Created by zhanghuihua on 2017/6/14.
 */
(function ($) {
	let _config = {
		panelCentent$: '.panel-content',
		collapseBtn$: '.panel-title-right',
		iconUpClass: 'icon-list-u'
	};

	$.fn.extend({
		panel(options) {
			let op = $.extend(_config, options);

			return this.each(function () {
				let $this = $(this);
				let $btn = $this.find(op.collapseBtn$);
				let $icon = $btn.find('i');
				$btn.touchwipe({
					touch(event) {
						if ($icon.hasClass(op.iconUpClass)) {
							$this.panelCollapse(op);
						} else {
							$this.panelExpand(op);
						}
						event.stopPropagation();
					}
				});
			});
		},

		// 展开
		panelExpand(options) {
			let op = $.extend(_config, options);

			return this.each(function () {
				let $this = $(this);
				let $btn = $this.find(op.collapseBtn$);
				let $icon = $btn.find('i');
				$this.find(op.panelCentent$).show();
				$icon.addClass(op.iconUpClass);
			});
		},
		// 折叠
		panelCollapse(options) {
			let op = $.extend(_config, options);

			return this.each(function () {
				let $this = $(this);
				let $btn = $this.find(op.collapseBtn$);
				let $icon = $btn.find('i');
				$this.find(op.panelCentent$).hide();
				$icon.removeClass(op.iconUpClass);
			});
		}
	});

	// 提示面板
	$.altPanel = {
		config: {
			box$: '#alt-panel',
			openClass: 'open',
			frag: '<div id="alt-panel" class="unitBox pop-up"></div>',
			bgBox$: '#alt-panel-mask-bg',
			bgFrag: '<div id="alt-panel-mask-bg"></div>'
		},
		isOpen: false,
		$box: null,
		$bgBox: null,

		init(options) {
			$.extend($.dialog.config, options);

			$('body').append($.altPanel.config.frag);
			$('body').append($.altPanel.config.bgFrag);
			this.$box = $($.altPanel.config.box$);
			this.$bgBox = $($.altPanel.config.bgBox$);

			this.$bgBox.click(function () {
				$.altPanel.close();
			});
		},
		open(options) {
			// default, pic, login
			let op = $.extend(
				{ type: 'GET', url: '', data: {}, callback: null, pos: null },
				options
			);
			let $box = this.$box,
				$bgBox = this.$bgBox;

			$bgBox.addClass($.altPanel.config.openClass);
			$box.addClass($.altPanel.config.openClass);

			if (op.pos) {
				let screenH = document.documentElement.clientHeight;
				if (op.pos.y < screenH / 2) {
					$box
						.css({
							top: op.pos.y + 5 + 'px',
							bottom: 'auto'
						})
						.removeClass('pop-up');
				} else {
					$box
						.css({
							top: 'auto',
							bottom: screenH - op.pos.y + 5 + 'px'
						})
						.addClass('pop-up');
				}
			}

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
							$box.html(html);
							$box.initUI();
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

			$box.removeClass($.altPanel.config.openClass);
			$bgBox.removeClass($.altPanel.config.openClass);

			this.isOpen = false;
		}
	};
})(dwz);
