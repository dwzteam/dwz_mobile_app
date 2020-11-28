biz.message = {
	removeItem: function (params) {
		const op = $.extend({ id: 0 }, params);
		$.ajax({
			type: 'POST',
			url: biz.server.getUrl(biz.server.messageDel),
			dataType: 'json',
			data: { id: op.id },
			cache: false,
			global: false,
			success: (json) => {
				console.log(json);

				if ($.isAjaxStatusOk(json)) {
					$.navTab
						.getBox()
						.find('ul.list li[data-id="' + op.id + '"]')
						.remove();
				}
			},
			error: ajaxError
		});
	},
	listRender: function (tpl, params) {
		let tplWrap = $.templateWrap(tpl);
		let html = template.render(tplWrap.tpl, { UserInfo: UserInfo });
		this.html(html).initUI();

		let $form = this.find('form.dwz-list-form'),
			$listBox = $form.find('ul.list');

		$form.requestList = function (loadMore) {
			let data = $form.serializeArray();
			console.log(JSON.stringify(data));
			$.ajax({
				type: 'GET',
				url: biz.server.getUrl(biz.server.messageList),
				dataType: 'json',
				data: data,
				cache: false,
				global: false,
				success: (json) => {
					if (!dwz.checkAjaxLogin(json)) {
						return;
					}

					if ($.isAjaxStatusOk(json)) {
						$form.total = json.data.total || json.data.length;
						if ($form.total) {
							$form.find('.empty_box').hide();
						}

						let _html = template.render(tplWrap['tpl-list'], json.data);

						if (loadMore) {
							$listBox = $(_html).appendTo($listBox).touchOpenRight();
						} else {
							$listBox.html(_html).find('.dwz-open-right').touchOpenRight();
						}
					}
				},
				error: ajaxError
			});
		};

		$.listForm($form);
	}
};
