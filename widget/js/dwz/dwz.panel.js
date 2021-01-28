/**
 * @author 张慧华 <350863780@qq.com>
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
})(dwz);
