/**
 * @author 张慧华 <350863780@qq.com>
 */
(function ($) {
	$.inputTip = {
		config: {
			openClass: 'open',
			frag: `<ul id="input-tip" class="unitBox"></ul>`
		},
		$box: null,

		_init() {
			if (!this.$box) {
				this.$box = $($.inputTip.config.frag).appendTo($('body').get(0));
			}
		},
		open(pos, options) {
			this._init();

			const _tpl = `{{each list as item}}<li class="item">{{item.text}}</li>{{/each}}`;
			const _html = template.render(_tpl, { list: options });
			this.$box.addClass($.inputTip.config.openClass).html(_html);

			let boxHeight = this.$box.height() + 5;
			let top = pos.top > boxHeight + 30 ? pos.top - boxHeight : pos.top + pos.height + 5;
			this.$box.css({ left: pos.left + pos.paddingLeft + 'px', top: top + 'px' });
			this.$box.find('li.item').each((index, elem) => {
				$(elem).click(() => {
					options[index].fn && options[index].fn.call(elem);
				});
			});

			$('body').off('click touchstart', this._close).on('click touchstart', this._close);
		},
		_close() {
			$.inputTip.$box.html('').removeClass($.inputTip.config.openClass);
		}
	};

	// apicloud config.xml 不能配制allowEdit, 所以安卓手机input不能粘贴，需要使用clipBoard模块配合
	$.fn.clipboardTip = function (options) {
		const op = $.extend({ text: '粘贴' }, options);
		return this.each(function () {
			$(this).touchwipe({
				longpress: function () {
					const $input = $(this);
					if (window.api && api.systemType == 'android') {
						const clipBoard = api.require('clipBoard');

						if (clipBoard) {
							clipBoard.get((ret, err) => {
								if (ret && ret.value) {
									$.inputTip.open($input.selectionPos(), [
										{
											text: op.text,
											fn: () => {
												$input.val(ret.value).get(0).select();
											}
										}
									]);
								}
							});
						}
					}
				}
			});
		});
	};
})(dwz);
