/**
 * @author 张慧华 <350863780@qq.com>
 */
biz.message = {
	removeItem({ id = null }, event) {
		if (event) {
			event.stopPropagation();
		}
		$.ajax({
			type: 'POST',
			url: biz.server.getUrl(biz.server.message.del),
			dataType: 'json',
			data: { id },
			success: (json) => {
				if ($.isAjaxStatusOk(json)) {
					$(event.target)
						.parentsUnitBox()
						.find('ul.list li[data-id="' + id + '"]')
						.remove();
				}
			},
			error: biz.ajaxError
		});
	},
	listRender(tpl, params) {
		let html = template.render(tpl.html, { UserInfo: UserInfo });
		this.html(html).initUI();

		let $form = this.find('form.dwz-list-form'),
			$listBox = $form.find('ul.dwz-list-box');
		let url = biz.server.getUrl(biz.server.message.list);

		biz.helper.listRender({ tpl, params, url, type: 'GET', $form, $listBox });
	}
};
