function renderHome(tpl, params) {
	var $box = this, tplWrap = $.templateWrap(tpl);
	var data = {
		UserInfo: UserInfo
	};
	var html = template.render(tplWrap.tpl, data);
	$box.html(html).initUI();

	var $form = $("#home_form");
	var $listBox = $('#home-announce-box');

	$form.requestList = function (loadMore) {
		var data = $form.serializeArray();

		// 运输单
		$.ajax({
			type: "POST",
			url: biz.server.getUrl(biz.server.transport),
			dataType: "json",
			data: data,
			cache: false,
			global: false,
			success: function (json) {

				if ($.isAjaxOkStatus(json)) {
					var _html = template.render(tplWrap['tpl-transport'], json);
					$box.find('#transport-card-box').html(_html);
				}

			},
			error: ajaxError
		});

		// 通知
		$.ajax({
			type: "POST",
			url: biz.server.getUrl(biz.server.announce),
			dataType: "json",
			data: data,
			cache: false,
			global: false,
			success: function (json) {
				if (!dwz.checkAjaxLogin(json)) {
					return;
				}

				if ($.isAjaxOkStatus(json)) {
					var _html = template.render(tplWrap['tpl-list'], json);
					$listBox.html(_html);
				}

			},
			error: ajaxError
		});
	};

	$.listForm($form);
}

function renderAbout(tpl, params) {
	var $box = this;

	var html = template.render(tpl, {
		version: window.api ? 'v' + api.appVersion : '',
		env: biz.server.ENV
	});
	$box.html(html).initUI();
}

