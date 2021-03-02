/**
 * @author 张慧华 <350863780@qq.com>
 */
biz.announce = {
	listRender(tpl, params) {
		let html = template.render(tpl.html, {
			UserInfo: UserInfo,
			params: params
		});
		this.html(html).initUI();

		let $form = this.find('form.dwz-list-form'),
			$listBox = $form.find('ul.dwz-list-box');

		$form.requestList = (loadMore) => {
			$.ajax({
				type: 'POST',
				url: biz.server.getUrl(biz.server.announce.list),
				dataType: 'json',
				data: $form.serializeArray(),
				cache: false,
				global: false,
				success: (json) => {
					if ($.isAjaxStatusOk(json)) {
						$form.listTotal(json.total, json.data);
						if ($form.total) {
							$form.find('.empty_box').hide();
						}

						let _html = template.render(tpl.tpl_list, json);
						if (loadMore) {
							$(_html).appendTo($listBox).hoverClass();
						} else {
							$listBox.html(_html).initUI();
						}
					}
				},
				error: biz.ajaxError
			});
		};

		$.listForm($form);
	},
	detailRender(tpl, params) {
		$.ajax({
			type: 'POST',
			url: biz.server.getUrl(biz.server.announce.detail, params),
			dataType: 'json',
			data: { announce_id: params.id },
			cache: false,
			global: false,
			success: (json) => {
				console.log(json);

				let html = template.render(tpl.html, {
					UserInfo: UserInfo,
					vo: json.data
				});
				this.html(html).initUI();
			},
			error: biz.ajaxError
		});
	}
};
