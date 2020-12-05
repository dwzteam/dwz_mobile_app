/**
 * @author 张慧华 <350863780@qq.com>
 */

(function ($) {
	$.fn.extend({
		dropdown(options) {
			let op = $.extend(
				{
					toggle$: '.dropdown-toggle > span',
					menu$: 'ul.dropdown-menu > li',
					toggleClass: 'open'
				},
				options
			);
			return this.each(function () {
				let $self = $(this),
					$toggle = $self.find(op.toggle$),
					$menus = $self.find(op.menu$);

				$self.touchwipe({
					touch() {
						$self.toggleClass(op.toggleClass);
					}
				});

				$menus.touchwipe({
					touch() {
						let $menu = $(this);
						let value = $menu.attr('data-value'),
							name = $menu.text();
						$self.data('value', value);
						$toggle.text(name);

						$self.trigger('change', { value: value, name: name });
					}
				});
			});
		}
	});
})(dwz);
