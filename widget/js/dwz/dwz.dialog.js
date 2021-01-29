/**
 * @author 张慧华 <350863780@qq.com>
 */
$.dialog = {
	config: {
		box$: '#dialog',
		popClass: ['fullscreen', 'actionSheet', 'pic', 'pop'],
		openClass: 'open',
		frag: `<div id="dialog" class="pop-window unitBox">
				<div class="pop-header"><span class="title">弹出框</span><a class="pop-close" href="javascript:$.dialog.close()"><i class="icon icon-close"></i></a></div>
				<div class="pop-content"></div>
			</div>`,
		bgBox$: '#mask-bg-dialog',
		bgFrag: '<div id="mask-bg-dialog" class="mask-bg"></div>'
	},
	isOpen: false,
	$box: null,
	$bgBox: null,

	init(options) {
		$.extend($.dialog.config, options);

		$('body').append($.dialog.config.frag).append($.dialog.config.bgFrag);
		this.$box = $($.dialog.config.box$);
		this.$bgBox = $($.dialog.config.bgBox$);
	},
	open(options) {
		// default, pic, login
		let op = $.extend(
			{
				type: 'GET',
				url: '',
				pop: 'fullscreen',
				external: false,
				data: {},
				callback: null
			},
			options
		);
		let $box = this.$box,
			$bgBox = this.$bgBox;

		if (!op.interceptor) {
			op.interceptor = dwz.getUrlInterceptor(op.url);
		}
		// 拦截器，用于验证登入跳转和绑定跳转等
		if (op.interceptor && op.interceptor.call($box, op.url) === false) {
			return false;
		}

		$bgBox.addClass($.dialog.config.openClass);
		if ('actionSheet' == op.pop) {
			$bgBox.removeClass('filter-blur');
		} else {
			$bgBox.addClass('filter-blur');
		}

		// pop 类型
		if ($.inArray(op.pop, $.dialog.config.popClass)) {
			$box.addClass(op.pop);
		}
		$box.addClass($.dialog.config.openClass).translateY(document.documentElement.clientHeight + 'px');

		setTimeout(function () {
			$box.animate({ y: 0 }, 300, 'ease');
		}, 20);

		if (op.url) {
			if (op.external) {
				this.loadExternal(op.url);
				return;
			}

			if (!op.callback) {
				op.callback = dwz.getUrlCallback(op.url);
			}

			let params = $.extend(op.url.getParams(), op.data);
			$.ajax({
				global: !op.callback,
				type: 'GET',
				url: op.url,
				data: op.data,
				success: (html) => {
					$box.triggerPageClear();

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
	loadExternal(url) {
		let $box = this.$box.html('<a class="video-close" href="javascript:$.dialog.close()"><i class="icon icon-close-dialog"></i></a><div class="pop-content"></div>');

		let $content = $box.find('.pop-content');
		let ih = $content.get(0).offsetHeight;
		$content.html($.config.frag['external'].replaceAll('{url}', url).replaceAll('{{height}}', ih + 'px'));
	},

	close(options) {
		let op = $.extend({ closeMsg: '' }, options);

		if (!op.closeMsg) {
			$.dialog._closeDirect();
			return;
		}

		$.alert.confirm(op.closeMsg, {
			okCall() {
				$.dialog._closeDirect();
			}
		});
	},
	_closeDirect() {
		let $box = this.$box,
			$bgBox = this.$bgBox;

		$box.animate({ y: document.documentElement.clientHeight }, 300, 'ease', function () {
			$box.html('').removeClass($.dialog.config.popClass.join(' '));
			$box.triggerPageClear();
		});
		$bgBox.removeClass($.dialog.config.openClass);
		this.isOpen = false;
	},
	getBox() {
		return this.$box;
	}
};
