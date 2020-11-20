/**
 * Created by zhanghuihua on 2018/4/22.
 */

biz.favorite = {
	removeItem: function (params) {
		var op = $.extend({id: 0}, params);
		$.ajax({
			type: "POST",
			url: biz.server.getUrl(biz.server.favoriteDel),
			dataType: "json",
			data: {id: op.id},
			cache: false,
			global: false,
			success: function (json) {
				console.log(json);

				if ($.isAjaxOkStatus(json)) {
					$.navTab.getBox().find('ul.list li[data-id="' + op.id + '"]').remove();
				}
			},
			error: ajaxError
		});
	},
	listRender: function(tpl, params){
		var $box = this, tplWrap = $.templateWrap(tpl);

		var html = template.render(tplWrap.tpl, {UserInfo: UserInfo});
		$box.html(html).initUI();

		var $form = $box.find('form.dwz-list-form'), $listBox = $form.find('ul.list');

		$form.requestList = function (loadMore) {
			var data = $form.serializeArray();
			console.log(JSON.stringify(data));
			$.ajax({
				type: "GET",
				url:biz.server.getUrl(biz.server.favoriteList),
				dataType:"json",
				data:data,
				cache: false,
				global: false,
				success: function(json) {
					if (!dwz.checkAjaxLogin(json)) { return; }

					if ($.isAjaxOkStatus(json)) {
						$form.total = json.data.total || json.data.length;
						if ($form.total) {
							$form.find('.empty_box').hide();
						}

						var _html = template.render(tplWrap['tpl-list'], json.data);

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
