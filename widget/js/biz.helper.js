biz.helper = {
	// 请求 省、市、区 html 片段
	reqRegionHtml(options) {
		const op = $.extend({ code: '', callback: null, tpl: '' }, options);
		$.ajax({
			type: 'GET',
			url: biz.server.getUrl(biz.server.regionList, { code: op.code }),
			dataType: 'json',
			data: {},
			cache: false,
			global: false,
			success: (json) => {
				if ($.isAjaxStatusOk(json)) {
					let html = template.render(op.tpl, { list: json.data });

					op.callback(html);
				}
			},
			error: biz.ajaxError
		});
	},

	// $.dialog.open 选择省、市、区 渲染函数
	selectRegionRender(tpl, params) {
		const op = $.extend({ target: null, callback: null }, params);

		let html = template.render(tpl.html, {
			UserInfo: UserInfo,
			params: params
		});
		this.html(html).initUI();

		const $province = this.find('ul.dwz-province');
		const $city = this.find('ul.dwz-city');
		const $county = this.find('ul.dwz-county');

		// 请求省份
		biz.helper.reqRegionHtml({
			tpl: tpl.tpl_list,
			callback: function (html_1) {
				$province.html(html_1);

				const $items1 = $province.find('li.item').click(function () {
					const $li1 = $(this);
					$county.html('').parentsUnitBox('dwz-scroll').scrollTo({ y: 0, duration: 300 });
					$items1.removeClass('active');
					$li1.addClass('active');

					// 请求城市
					biz.helper.reqRegionHtml({
						code: $li1.attr('data-code'),
						tpl: tpl.tpl_list,
						callback: function (html_2) {
							$city.html(html_2).parentsUnitBox('dwz-scroll').scrollTo({ y: 0, duration: 300 });

							const $items2 = $city.find('li.item').click(function () {
								const $li2 = $(this);
								$items2.removeClass('active');
								$li2.addClass('active');

								// 请求区县
								biz.helper.reqRegionHtml({
									code: $li2.attr('data-code'),
									tpl: tpl.tpl_list,
									callback: function (html_3) {
										$county.html(html_3).parentsUnitBox('dwz-scroll').scrollTo({ y: 0, duration: 300 });

										const $items3 = $county.find('li.item').click(function () {
											const $li3 = $(this);
											$items3.removeClass('active');
											$li3.addClass('active');

											const _data = {
												province: $li1.attr('data-code'),
												city: $li2.attr('data-code'),
												county: $li3.attr('data-code'),
												names: $li1.attr('data-name') + ' ' + $li2.attr('data-name') + ' ' + $li3.attr('data-name')
											};

											op.callback && op.callback.call($(op.target), _data);
										});
									}
								});
							});
						}
					});
				});
			}
		});
	},

	// $.alert.openDialog 多选 渲染函数
	multipleSelectRender(tpl, params) {
		const op = $.extend({ target: null, callback: null }, params);
		let html = template.render(tpl.html, params);
		this.html(html).initUI();

		const $form = this.find('form').on('submit', (event) => {
			const $inputs = $form.find('input[type=checkbox]:checked');
			if (!$inputs.size()) {
				$.alert.error('至少选择一项');
				return false;
			}
			const _data = [];

			$inputs.each(function (index, item) {
				_data.push({
					value: item.value,
					name: $(item).attr('data-name')
				});
			});

			op.callback && op.callback.call($(op.target), _data);

			$.alert.closeDialog();
			return false;
		});
	},

	// $.filterPanel.open 查找带回 渲染函数
	filterSelectRender(tpl, params) {
		const op = $.extend({ target: null, callback: null }, params);

		let html = template.render(tpl.html, params);
		this.html(html).initUI();

		const $form = this.find('form.dwz-list-form'),
			$listBox = $form.find('ul.dwz-list-box');

		$form.requestList = (loadMore) => {
			$.ajax({
				type: params.type || 'GET',
				url: params.searchUrl,
				dataType: 'json',
				data: $form.serializeArray(),
				success: (json) => {
					if ($.isAjaxStatusOk(json)) {
						let _html = template.render(tpl.tpl_list, json.data);

						let $items = $(_html);
						if (loadMore) {
							items.appendTo($listBox).hoverClass();
						} else {
							$listBox.html($items).initUI();
						}

						$items.click(function (event) {
							op.callback && op.callback.call($(op.target), this.dataset);
							$.filterPanel.close();
						});
					}
				},
				error: biz.ajaxError
			});
		};

		$.listForm($form);
	}
};
