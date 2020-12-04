/**
 * Created by zhanghuihua on 2018/4/22.
 */
biz.favorite = {
	removeItem: function ({ id = null }) {
		$.alert.confirm('确认删除吗？', {
			okCall: function (event) {
				$.ajax({
					type: 'POST',
					url: biz.server.getUrl(biz.server.favoriteDel),
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
	listRender: function (tpl, params) {
		let tplWrap = $.templateWrap(tpl);
		let html = template.render(tplWrap.tpl, { UserInfo: UserInfo });
		this.html(html).initUI();

		let $form = this.find('form.dwz-list-form'),
			$listBox = $form.find('ul.dwz-list-box');

		$form.requestList = function (loadMore) {
			let data = $form.serializeArray();
			console.log(JSON.stringify(data));
			$.ajax({
				type: 'POST',
				url: biz.server.getUrl(biz.server.favoriteList),
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
							$(_html).appendTo($listBox).touchOpenRight();
						} else {
							$listBox.html(_html).find('.dwz-open-right').touchOpenRight();
						}
					}
				},
				error: biz.ajaxError
			});
		};

		$.listForm($form);
	}
};
