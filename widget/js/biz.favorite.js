/**
 * @author 张慧华 <350863780@qq.com>
 */
biz.favorite = {
	removeItem({ id = null }) {
		$.alert.confirm({ msg: '确认删除吗？' }, (ret) => {
			if (ret.buttonIndex == 1) {
				$.ajax({
					type: 'POST',
					url: biz.server.getUrl(biz.server.favorite.del),
					dataType: 'json',
					data: { id: id },
					cache: false,
					global: false,
					success: (json) => {
						if ($.isAjaxStatusOk(json)) {
							$.navTab
								.getBox()
								.find('ul.list li[data-id="' + id + '"]')
								.remove();
						}
					},
					error: biz.ajaxError
				});
			}
		});
	},
	listRender(tpl, params) {
		let html = template.render(tpl.html, { UserInfo: UserInfo });
		this.html(html).initUI();

		let $form = this.find('form.dwz-list-form'),
			$listBox = $form.find('ul.dwz-list-box');
		let url = biz.server.getUrl(biz.server.favorite.list);

		biz.helper.listRender({ tpl, params, url, type: 'POST', $form, $listBox });
	}
};
