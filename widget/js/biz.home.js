function renderHome(tpl, params) {
	let tplWrap = $.templateWrap(tpl);
	let data = {
		UserInfo: UserInfo
	};
	let html = template.render(tplWrap.tpl, data);
	this.html(html).initUI();

	let $form = this.find('form.dwz-list-form');
	let $listBox = $('#home-announce-box');

	$form.requestList = (loadMore) => {
		let data = $form.serializeArray();

		// 轮播图
		$.ajax({
			type: 'POST',
			url: biz.server.getUrl(biz.server.homeAd),
			dataType: 'json',
			data: data,
			cache: false,
			global: false,
			success: (json) => {
				if ($.isAjaxStatusOk(json)) {
					let _html = template.render(tplWrap['tpl-home-ad'], json);
					this.find('#home-ad-box').html(_html).initUI();
				}
			},
			error: biz.ajaxError
		});

		// 运输单
		$.ajax({
			type: 'POST',
			url: biz.server.getUrl(biz.server.transport),
			dataType: 'json',
			data: data,
			cache: false,
			global: false,
			success: (json) => {
				if ($.isAjaxStatusOk(json)) {
					let _html = template.render(tplWrap['tpl-transport'], json);
					this.find('#transport-card-box').html(_html);
				}
			},
			error: biz.ajaxError
		});

		// 通知
		$.ajax({
			type: 'POST',
			url: biz.server.getUrl(biz.server.announce),
			dataType: 'json',
			data: data,
			cache: false,
			global: false,
			success: (json) => {
				if (!dwz.checkAjaxLogin(json)) {
					return;
				}

				if ($.isAjaxStatusOk(json)) {
					let _html = template.render(tplWrap['tpl-list'], json);
					$listBox.html(_html);
				}
			},
			error: biz.ajaxError
		});
	};

	$.listForm($form);
}

function renderAbout(tpl, params) {
	let html = template.render(tpl, {
		version: window.api ? 'v' + api.appVersion : '',
		env: biz.server.ENV
	});
	this.html(html).initUI();
}
