/**
 * @author 张慧华 <350863780@qq.com>
 */
(function ($) {
	$.setRegional('alert', {
		title: {
			info: '提示',
			error: '错误',
			success: '成功',
			confirm: '确认提示'
		},
		btnTxt: { ok: '确定', cancel: '取消' }
	});

	$.alert = {
		config: {
			box$: '#alertMsgBox',
			promptFrag: '<div id="alertPromptBox"><div class="alert-mask"></div><div class="alert-dialog"></div></div>',
			boxFrag:
				'<div id="alertMsgBox">\
					<div class="alert-mask"></div>\
					<div class="alert-dialog">\
						<div class="alert-dialog-hd"><strong class="alert-dialog-title">#title#</strong></div>\
						<div class="alert-dialog-bd">#message#</div>\
						<div class="alert-dialog-ft"><div class="button-group">#butFragment#</div></div>\
					</div>\
				</div>',
			btnFrag: '<button class="dwz-ctl-hover button #class#">#butMsg#</button>'
		},

		/**
		 *
		 * @param String title
		 * @param String msg
		 * @param [String] buttons [button1, button2]
		 * @param callback
		 */
		open({ title = $.regional.alert.title.info, msg = '', theme, buttons = [$.regional.alert.btnTxt.ok] }, callback) {
			$(this.config.box$).remove();
			let butsHtml = '';
			if (buttons) {
				if (theme === undefined) theme = 'is-text';
				for (let i = 0; i < buttons.length; i++) {
					butsHtml += this.config.btnFrag.replace('#butMsg#', buttons[i]).replace('#class#', i == 0 ? `primary ${theme}` : theme);
				}
			}
			let html = this.config.boxFrag.replace('#title#', title).replace('#message#', msg).replace('#butFragment#', butsHtml);
			$('body').append(html).initUI();

			let $btns = $(this.config.box$).find('.button');

			for (let i = 0; i < buttons.length; i++) {
				$btns.eq(i).click(i, (event) => {
					let buttonIndex = event.data + 1;
					callback && callback({ buttonIndex });
					event.preventDefault();
					event.stopPropagation();

					setTimeout(() => {
						$.alert.close();
					}, 100);
				});
			}
		},
		close(type = 'alert') {
			if (type == 'prompt') {
				$('#alertPromptBox').remove();
			} else {
				$(this.config.box$).remove();
			}
		},

		error(msg, callback) {
			this.open({ title: $.regional.alert.title.error, msg }, callback);
		},
		success(msg, callback) {
			this.open({ title: $.regional.alert.title.success, msg }, callback);
		},
		confirm({ title = $.regional.alert.title.confirm, msg = '', theme, buttons = [$.regional.alert.btnTxt.ok, $.regional.alert.btnTxt.cancel] }, callback) {
			this.open({ title, msg, theme, buttons }, callback);
		},

		prompt(url, data) {
			$(this.config.box$).remove();

			let $box = $($.alert.config.promptFrag).appendTo($('body')).find('.alert-dialog');

			if (url) {
				let params = $.extend(url.getParams(), data);
				$.ajax({
					type: 'GET',
					url: url,
					data: data,
					success: (html) => {
						$box.triggerPageClear();

						const callback = dwz.getUrlCallback(url);
						const tpl = $.templateWrap(html);
						if (callback) {
							callback.call($box, tpl, params);
						} else {
							$box.html(html).initUI();
							$.execHelperFn($box, tpl, params);
						}
					},
					error: dwz.ajaxError
				});
			}
		},

		toast(msg, options) {
			if (!msg) return;

			let op = $.extend({ msg: msg, duration: 4000 }, options);

			let clearTimer = () => {
				if (this._timer) {
					clearTimeout(this._timer);
					this._timer = null;
				}
			};

			$('#alert-toast').remove();
			clearTimer();

			let $toast = $('<div id="alert-toast">' + op.msg + '</div>').appendTo($('body'));
			$toast.animateCls('fadeInUp');

			this._timer = setTimeout(() => {
				clearTimer();
				$toast.animateCls('fadeOutDown', () => {
					$toast.remove();
				});
			}, op.duration);
		}
	};
})(dwz);
