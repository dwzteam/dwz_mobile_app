biz.helper = {
	reqRegionHtml: function (options) {
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
	popRegionRender: function (tpl, params) {
		const $box = this,
			tplWrap = $.templateWrap(tpl);

		let html = template.render(tplWrap.tpl, {
			UserInfo: UserInfo,
			params: params
		});
		$box.html(html).initUI();

		const $province = $box.find('ul.dwz-province');
		const $city = $box.find('ul.dwz-city');
		const $county = $box.find('ul.dwz-county');

		const inputs = $.extend({ province: 'province', city: 'city', county: 'county', labelField: 'area_names' }, params);

		// 请求省份
		biz.helper.reqRegionHtml({
			tpl: tplWrap['tpl-list'],
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
						tpl: tplWrap['tpl-list'],
						callback: function (html_2) {
							$city.html(html_2).parentsUnitBox('dwz-scroll').scrollTo({ y: 0, duration: 300 });

							const $items2 = $city.find('li.item').click(function () {
								const $li2 = $(this);
								$items2.removeClass('active');
								$li2.addClass('active');

								// 请求区县
								biz.helper.reqRegionHtml({
									code: $li2.attr('data-code'),
									tpl: tplWrap['tpl-list'],
									callback: function (html_3) {
										$county.html(html_3).parentsUnitBox('dwz-scroll').scrollTo({ y: 0, duration: 300 });

										const $items3 = $county.find('li.item').click(function () {
											const $li3 = $(this);
											$items3.removeClass('active');
											$li3.addClass('active');

											// console.log($li1.attr('data-name'), $li2.attr('data-name'), $li3.attr('data-name'), inputs);
											const $rel = inputs.$box || $.navView.getBox();

											const _data = {};
											_data[inputs.province] = $li1.attr('data-code');
											_data[inputs.city] = $li2.attr('data-code');
											_data[inputs.county] = $li3.attr('data-code');
											_data[inputs.labelField] = $li1.attr('data-name') + ' ' + $li2.attr('data-name') + ' ' + $li3.attr('data-name');

											for (let key in _data) {
												const $input = $rel.find('input[name=' + key + ']');
												$input.size() && $input.val(_data[key]);
											}
										});
									}
								});
							});
						}
					});
				});
			}
		});
	}
};
