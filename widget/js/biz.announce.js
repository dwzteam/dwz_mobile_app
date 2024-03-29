/**
 * @author 张慧华 <350863780@qq.com>
 */
biz.announce = {
	listRender(tpl, params) {
		let html = template.render(tpl.html, {
			UserInfo,
			params
		});
		this.html(html).initUI();

		let $form = this.find('form.dwz-list-form'),
			$listBox = $form.find('ul.dwz-list-box');
		let url = biz.server.getUrl(biz.server.announce.list);

		biz.helper.listRender({ tpl, params, url, type: 'POST', $form, $listBox });
	},
	detailRender(tpl, params) {
		$.ajax({
			type: 'POST',
			url: biz.server.getUrl(biz.server.announce.detail, params),
			dataType: 'json',
			data: { announce_id: params.id },
			success: (json) => {
				console.log(json);

				let html = template.render(tpl.html, {
					UserInfo,
					vo: json.data
				});
				this.html(html).initUI();
			},
			error: biz.ajaxError
		});
	}
};
