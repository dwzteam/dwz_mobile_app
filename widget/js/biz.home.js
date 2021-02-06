biz.home = {
	render(tpl, params) {
		let html = template.render(tpl.html, {
			UserInfo,
			params
		});
		this.html(html).initUI();

		let $form = this.find('form.dwz-list-form');
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
						let _html = template.render(tpl.tpl_home_ad, json);
						this.find('#home-ad-box').html(_html).initUI();
					}
				},
				error: biz.ajaxError
			});

			// 组件列表
			$.ajax({
				type: 'POST',
				url: biz.server.getUrl(biz.server.widgetList),
				dataType: 'json',
				data: data,
				cache: false,
				global: false,
				success: (json) => {
					if ($.isAjaxStatusOk(json)) {
						json.data.map((item) => {
							if (!item.url) {
								item.url = `tpl/widget/${item.name}/index.html?dwz_script=function`;
							}
							return item;
						});
						let _html = template.render(tpl.tpl_home_widget, { widgetList: json.data });
						this.find('#home-widget-box').html(_html).initUI();
					}
				},
				error: biz.ajaxError
			});
		};

		$.listForm($form);
	},
	aboutRender(tpl, params) {
		let html = template.render(tpl.html, {
			version: window.api ? 'v' + api.appVersion : '',
			env: biz.server.ENV
		});
		this.html(html).initUI();
	}
};
