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
			data: { id: id },
			cache: false,
			global: false,
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

		$form.requestList = (loadMore) => {
			let data = $form.serializeArray();
			console.log(JSON.stringify(data));
			$.ajax({
				type: 'GET',
				url: biz.server.getUrl(biz.server.message.list),
				dataType: 'json',
				data: data,
				cache: false,
				global: false,
				success: (json) => {
					if ($.isAjaxStatusOk(json)) {
						$form.listTotal(json.data.total, json.data.list);
						if ($form.total) {
							$form.find('.empty_box').hide();
						}

						let _html = template.render(tpl.tpl_list, json.data);

						if (loadMore) {
							$(_html).appendTo($listBox).touchOpenRight().hoverClass();
						} else {
							$listBox.html(_html).initUI();
						}
					}
				},
				error: biz.ajaxError
			});
		};

		$.listForm($form);
	}
};
