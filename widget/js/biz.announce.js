biz.announce = {
	listRender: function (tpl, params) {
		var $box = this,
			tplWrap = $.templateWrap(tpl);

		var html = template.render(tplWrap.tpl, {
			UserInfo: UserInfo,
			params: params
		});
		$box.html(html).initUI();

		var $form = $box.find('form.dwz-list-form'),
			$listBox = $form.find('ul.dwz-list-box');

		$form.requestList = function (loadMore) {
			$.ajax({
				type: 'POST',
				url: biz.server.getUrl(biz.server.announceList),
				dataType: 'json',
				data: $form.serializeArray(),
				cache: false,
				global: false,
				success: function (json) {
					if (!dwz.checkAjaxLogin(json)) {
						return;
					}

					if ($.isAjaxOkStatus(json)) {
						$form.total = json.total || json.data.length;
						if ($form.total) {
							$form.find('.empty_box').hide();
						}

						var _html = template.render(tplWrap['tpl-list'], json);
						if (loadMore) {
							$listBox.append(_html);
						} else {
							$listBox.html(_html);
						}
					}
				},
				error: ajaxError
			});
		};

		$.listForm($form);
	},
	detailRender: function (tpl, params) {
		var $box = this;

		$.ajax({
			type: 'POST',
			url: biz.server.getUrl(biz.server.announceDetail),
			dataType: 'json',
			data: { announce_id: params.id },
			cache: false,
			global: false,
			success: function (json) {
				console.log(json);

				var html = template.render(tpl, {
					UserInfo: UserInfo,
					vo: json.data
				});
				$box.html(html).initUI();
			},
			error: ajaxError
		});
	}
};
