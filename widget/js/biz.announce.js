/**
 * @author 张慧华 350863780@qq.com
 */
biz.announce = {
	listRender(tpl, params) {
		let $box = this,
			tplWrap = $.templateWrap(tpl);

		let html = template.render(tplWrap.tpl, {
			UserInfo: UserInfo,
			params: params
		});
		$box.html(html).initUI();

		let $form = $box.find('form.dwz-list-form'),
			$listBox = $form.find('ul.dwz-list-box');

		$form.requestList = (loadMore) => {
			$.ajax({
				type: 'POST',
				url: biz.server.getUrl(biz.server.announceList),
				dataType: 'json',
				data: $form.serializeArray(),
				cache: false,
				global: false,
				success: (json) => {
					if (!dwz.checkAjaxLogin(json)) {
						return;
					}

					if ($.isAjaxStatusOk(json)) {
						$form.total = json.total || json.data.length;
						if ($form.total) {
							$form.find('.empty_box').hide();
						}

						let _html = template.render(tplWrap['tpl-list'], json);
						if (loadMore) {
							$listBox.append(_html);
						} else {
							$listBox.html(_html);
						}
					}
				},
				error: biz.ajaxError
			});
		};

		$.listForm($form);
	},
	detailRender(tpl, params) {
		let $box = this;

		$.ajax({
			type: 'POST',
			url: biz.server.getUrl(biz.server.announceDetail),
			dataType: 'json',
			data: { announce_id: params.id },
			cache: false,
			global: false,
			success: (json) => {
				console.log(json);

				let html = template.render(tpl, {
					UserInfo: UserInfo,
					vo: json.data
				});
				$box.html(html).initUI();
			},
			error: biz.ajaxError
		});
	}
};
