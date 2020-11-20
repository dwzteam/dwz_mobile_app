/**
 * @author 张慧华 z@j-ui.com
 */
(function ($) {
	$.setRegional("alert", {
		title: {error: "错误", info: "提示", warn: "警告", success: "成功", confirm: "确认提示"},
		btnMsg: {ok: "确定", yes: "是", no: "否", cancel: "取消"}
	});

	$.alert = {
		config: {
			box$: "#alertMsgBox",

			types: {error: "error", info: "info", warn: "warn", success: "success", confirm: "confirm"},
			dialogFrag: '<div id="alertDialogBox"><div class="alert-mask"></div><div class="alert-dialog"></div></div>',
			boxFrag:
				'<div id="alertMsgBox" class="alert-dialog-#type#">\
					<div class="alert-mask"></div>\
					<div class="alert-dialog">\
						<div class="alert-dialog-hd"><strong class="alert-dialog-title">#title#</strong></div>\
						<div class="alert-dialog-bd">#message#</div>\
						<div class="alert-dialog-ft">#butFragment#</div>\
					</div>\
				</div>',
			btnFrag: '<a href="javascript:" class="alert_btn_dialog #class#">#butMsg#</a>'
		},

		/**
		 *
		 * @param {Object} type
		 * @param {Object} msg
		 * @param {Object} buttons [button1, button2]
		 */
		_open: function (type, msg, buttons) {
			$(this.config.box$).remove();
			var butsHtml = "";
			if (buttons) {
				for (var i = 0; i < buttons.length; i++) {
					butsHtml += this.config.btnFrag.replace("#butMsg#", buttons[i].name)
						.replace("#class#", buttons[i].sn == 'ok' ? "primary" : "default");
				}
			}
			var html = this.config.boxFrag.replace("#type#", type).replace("#title#", $.regional.alert.title[type]).replace("#message#", msg).replace("#butFragment#", butsHtml);
			$('body').append(html);

			var $btns = $(this.config.box$).find("a.alert_btn_dialog");

			for (var i = 0; i < buttons.length; i++) {

				$btns.eq(i).on($.event.hasTouch ? 'touchstart' : 'click', i, function (event) {
					var index = event.data,
						callback = buttons[index].call;
					if (callback) {
						callback(event);
					}
					$.alert.close();

					event.preventDefault();
					event.stopPropagation();
				});

			}
		},
		close: function () {
			$(this.config.box$).remove();
		},
		error: function (msg, options) {
			this._alert(this.config.types.error, msg, options);
		},
		warn: function (msg, options) {
			this._alert(this.config.types.warn, msg, options);
		},
		success: function (msg, options) {
			this._alert(this.config.types.success, msg, options);
		},
		toast: function (msg, options) {
			var op = $.extend({msg: msg, duration: 4000}, options);
			if (window.api) {
				api.toast(op);
				return;
			}

			$('#alert-toast').remove();
			if (this._timer) {
				clearTimeout(this._timer);
				this._timer = null;
			}

			var $toast = $('<div id="alert-toast">'+op.msg+'</div>').appendTo($('body'));
			$toast.animateCls('fadeInDown');

			var me = this;
			me._timer = setTimeout(function() {
				clearTimeout(this._timer);
				me._timer = null;
				$toast.animateCls('fadeOutUp', function() {
					$toast.remove();
				});
			}, op.duration);
		},
		_alert: function (type, msg, options) {
			var op = $.extend({okName: $.regional.alert.btnMsg.ok, okCall: null}, options);
			var buttons = [
				{sn: 'ok', name: op.okName, call: op.okCall}
			];
			this._open(type, msg, buttons);
		},
		/**
		 *
		 * @param {Object} msg
		 * @param {Object} options {okName, okCall, cancelName, cancelCall}
		 */
		confirm: function (msg, options) {
			var op = $.extend({
				okName: $.regional.alert.btnMsg.ok,
				okCall: null,
				cancelName: $.regional.alert.btnMsg.cancel,
				cancelCall: null
			}, options);
			var buttons = [
				{sn: 'cancel', name: op.cancelName, call: op.cancelCall},
				{sn: 'ok', name: op.okName, call: op.okCall}
			];
			this._open(this.config.types.confirm, msg, buttons);
		},

		openDialog: function (url) {
			$(this.config.box$).remove();

			var $box = $($.alert.config.dialogFrag).appendTo($('body').get(0)).find('.alert-dialog');

			if (url) {

				var params = url.getParams();
				$.ajax({
					type: 'GET', url: url, data: params, success: function (html) {
						$box.triggerPageClear();

						var callback = dwz.getUrlCallback(url);

						if (callback) {
							callback.call($box, html, params);
						} else {
							$box.html(html).initUI();
						}
					}, error: dwz.ajaxError
				});

			}
		},
		closeDialog: function () {
			$('#alertDialogBox').remove();
		}
	};
})(dwz);
