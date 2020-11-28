/**
 * Created by zhanghuihua on 2016/12/19.
 */

$.dialog = {
	config: {
		box$: '#dialog',
		fullscreenClass: 'fullscreen',
		openClass: 'open',
		frag: `<div id="dialog" class="pop-window unitBox">
				<div class="pop-header"><span class="title">弹出框</span><a class="pop-close" href="javascript:$.dialog.close()"><i class="icon icon-close"></i></a></div>
				<div class="pop-content"></div>
			</div>`,
		bgBox$: '#mask-background',
		bgFrag: '<div id="mask-background" class="mask-background"></div>'
	},
	isOpen: false,
	$box: null,
	$bgBox: null,

	init: function (options) {
		$.extend($.dialog.config, options);

		$('body').append($.dialog.config.frag).append($.dialog.config.bgFrag);
		this.$box = $($.dialog.config.box$);
		this.$bgBox = $($.dialog.config.bgBox$);
	},
	open: function (options) {
		// default, pic, login
		let op = $.extend(
			{
				type: 'GET',
				url: '',
				pop: 'default',
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
		if (op.pop == 'pic' || op.pop == 'login' || op.pop == 'fullscreen') {
			$box.addClass($.dialog.config.fullscreenClass);
		}
		$box
			.addClass($.dialog.config.openClass)
			.translateY(document.documentElement.clientHeight + 'px');

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

			let params = op.url.getParams();
			$.ajax({
				global: !op.callback,
				type: 'GET',
				url: op.url,
				data: params,
				success: function (html) {
					$box.triggerPageClear();

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
	loadExternal: function (url) {
		let $box = this.$box.html(
			'<a class="video-close" href="javascript:$.dialog.close()"><i class="icon icon-close-dialog"></i></a><div class="pop-content"></div>'
		);

		let $content = $box.find('.pop-content');
		let ih = $content.get(0).offsetHeight;
		$content.html(
			$.config.frag['external']
				.replaceAll('{url}', url)
				.replaceAll('{{height}}', ih + 'px')
		);
	},

	close: function (options) {
		let op = $.extend({ closeMsg: '' }, options);

		if (!op.closeMsg) {
			$.dialog._closeDirect();
			return;
		}

		$.alert.confirm(op.closeMsg, {
			okCall: function () {
				$.dialog._closeDirect();
			}
		});
	},
	_closeDirect: function () {
		let $box = this.$box,
			$bgBox = this.$bgBox;

		$box.animate(
			{ y: document.documentElement.clientHeight },
			300,
			'ease',
			function () {
				$box
					.html('')
					.removeClass(
						$.dialog.config.fullscreenClass + ' ' + $.dialog.config.openClass
					);
				$box.triggerPageClear();
			}
		);

		$bgBox.removeClass($.dialog.config.openClass);

		this.isOpen = false;
	},
	getBox: function () {
		return this.$box;
	}
};
