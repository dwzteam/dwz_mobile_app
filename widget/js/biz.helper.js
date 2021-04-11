biz.helper = {
	/**
	 * 通用无限滚动列表页面渲染函数
	 */
	listRender({ tpl, params, url, type = 'GET', $form, $listBox, callback }) {
		$form.requestList = (loadMore) => {
			let data = $form.serializeArray();
			$.ajax({
				type,
				url,
				dataType: 'json',
				data,
				success: (json) => {
					if ($.isAjaxStatusOk(json)) {
						let list = json.data.list || json.data || [];
						if ($.isObject(list)) list = Object.values(list);

						let total = json.data.total || json.total || list.length;
						$form.listTotal(total, list);
						if ($form.total) {
							$form.find('.empty_box').hide();
						}

						let _html = template.render(tpl.tpl_list || tpl, { list, total, params: $.isFunction(params) ? params() : params });

						if (loadMore) {
							$(_html).appendTo($listBox).initUI();
						} else {
							$listBox.html(_html).initUI();
						}

						callback && callback();
					}
				},
				error: biz.ajaxError
			});
		};

		$.listForm($form);
	},

	// json data数据 转换成 object 对像数组
	jsonDataList(json) {
		let list = json.data ? json.data.list || json.data : [];

		// 兼容对象，把对象转换成数组
		if (!$.isArray(list)) {
			let _data = [];
			for (let [id, obj] of Object.entries(list)) {
				// console.log(id + ':' + obj);
				_data.push({ id, code: obj.code || obj.id, name: obj.name || obj.title || obj });
			}
			list = _data;
		}
		return list;
	},
	// 请求 省、市、区 html 片段
	reqRegionHtml(options) {
		const op = $.extend({ url: '', code: '', valueName: '', labelName: '', callback: null, tpl: '' }, options);
		$.ajax({
			type: 'GET',
			url: op.url || biz.server.getUrl(biz.server.regionList, { code: op.code }),
			dataType: 'json',
			data: { code: op.code },
			success: (json) => {
				if ($.isAjaxStatusOk(json)) {
					let list = biz.helper.jsonDataList(json);
					let html = template.render(op.tpl, { valueName: op.valueName, labelName: op.labelName, list });

					op.callback(html);
				}
			},
			error: biz.ajaxError
		});
	},
	// $.dialog.open 选择省、市、区 渲染函数
	selectRegionRender(tpl, params) {
		const op = $.extend({ target: null, level: 3, url: '', code: '', valueName: 'code', labelName: 'name', callback: null }, params);

		let html = template.render(tpl.html, {
			UserInfo,
			params,
			colList: new Array(op.level)
		});
		this.html(html).initUI();

		const $ulList = this.find('ul.dwz-field');
		function genUlHtml({ index = 0, code = '' }) {
			const $ul = $ulList.eq(index);
			biz.helper.reqRegionHtml({
				url: op.url,
				labelName: op.labelName,
				valueName: op.valueName,
				code,
				tpl: tpl.tpl_list,
				callback: (_html) => {
					$ul.html(_html);

					const $items = $ul.find('li.item').click(function () {
						const $li = $(this),
							code = $li.attr('data-code');

						$items.removeClass('active');
						$li.addClass('active');

						$ul.attr('data-code', code);
						$ul.attr('data-name', $li.attr('data-name'));

						if (index < op.level - 1) {
							const $nextUl = $ulList.eq(index + 1);
							$nextUl.html('').parentsUnitBox('dwz-scroll').scrollTo({ y: 0, duration: 300 });
							genUlHtml({ index: index + 1, code }); // 递归调用
						} else {
							const _data = [];

							let _names = '';
							$ulList.each((_index, _ul) => {
								const _$ul = $(_ul);
								const _item = { code: _$ul.attr('data-code'), name: _$ul.attr('data-name') };
								_names += (_index == 0 ? '' : ' ') + _item.name;
								_item.names = _names;
								_data.push(_item);
							});
							op.callback && op.callback.call($(op.target), _data);
						}
					});
				}
			});
		}

		genUlHtml({ index: 0, code: op.code });
	},

	// $.alert.prompt 多选 渲染函数
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

			$.alert.close('prompt');
			return false;
		});
	},

	// $.filterPanel.open 查找带回 渲染函数
	filterPanelRender(tpl, params) {
		const op = $.extend({ target: null, filterItems: [], callback: null }, params);

		let html = template.render(tpl.html, params);
		this.html(html).initUI();

		const $form = this.find('form.dwz-list-form'),
			$listBox = $form.find('ul.dwz-list-box');
		const $selectBtn = $form.find('.dwz-btn-select');

		$form.requestList = (loadMore) => {
			$.ajax({
				type: params.searchMethod || 'GET',
				url: params.searchUrl,
				dataType: 'json',
				data: $form.serializeArray(),
				success: (json) => {
					if ($.isAjaxStatusOk(json)) {
						let list = biz.helper.jsonDataList(json);
						let _html = template.render(tpl.tpl_list, { list });

						let $items = $(_html);
						if (loadMore) {
							items.appendTo($listBox).hoverClass();
						} else {
							$listBox.html($items).initUI();
						}

						if ($selectBtn.size()) {
							$selectBtn.click((event) => {
								let _list = [];

								const $inputs = $form.find('input[type=checkbox]:checked, input[type=radio]:checked');
								if (!$inputs.size()) {
									if (params.selectSearchField && params.searchField) {
										let _val = $form
											.find('input[name=' + params.searchField + ']')
											.val()
											.trim();
										if (_val) {
											let _item = { searchField: params.searchField, name: _val };
											_item[params.searchField] = _val;
											_list.push(_item);
										}
									}

									if (!_list.length) {
										$.alert.error('至少选择一项');
										return false;
									}
								}

								$inputs.each((index, input) => {
									_list.push(input.dataset);
								});

								op.callback && op.callback.call($(op.target), _list);
								$.filterPanel.close();
							});
						} else {
							$items.click(function (event) {
								op.callback && op.callback.call($(op.target), this.dataset);
								$.filterPanel.close();
							});
						}
					}
				},
				error: biz.ajaxError
			});
		};

		$.listForm($form);
	},

	// 主从表 删除子表元素
	removeUnitBox(target, delId) {
		const $target = $(target),
			$scrollBox = $target.parentsUnitBox('scroll-content'),
			$form = $target.parentsByTag('form');

		$target.parentsUnitBox().remove();
		$scrollBox.scrollTo({ y: 'end', duration: 800 });

		if ($form.size() && delId) {
			const delItem = $form.data('delItem') || [];
			delItem.push(delId);
			$form.data('delItem', delItem);
		}
	},

	// 主从表 新增子表元素 dwz_callback=biz.pageRender?dwz_helper=biz.helper.itemDetailHelper
	itemDetailHelper(tpl, params) {
		const $itemDetailBox = this.find('.dwz-item-detail-box');
		this.find('.dwz-item-detail-btn').click(() => {
			$(tpl.tpl_item_detail).appendTo($itemDetailBox).initUI();
			$itemDetailBox.parentsUnitBox('scroll-content').scrollTo({ y: 'end', duration: 800 });
		});
	},

	// 侧滑面板高级搜索
	searchFilterHelper(tpl, params) {
		const $form = params.$form;
		const $filterForm = this.find('form');
		const $inputs = $form.find(':hidden');

		const setUlVal = ($ul, val) => {
			$ul.find('li').removeClass('active');
			const $li = $ul.find('li[data-value="' + val + '"]').addClass('active');
			if ($li.size()) {
				$ul.data('value', val);
			}
		};
		$inputs.each((index, input) => {
			const $ul = $filterForm.find('ul[data-name=' + input.name + ']');
			if ($ul.size()) {
				setUlVal($ul, input.value);

				$ul.find('li[data-value]').click(function () {
					var $li = $(this);
					if (!$li.hasClass('active')) {
						setUlVal($ul, $li.attr('data-value'));
					}
				});
			}
		});

		$filterForm.on('reset', (event) => {
			$filterForm.find('ul[data-name').each((index, ul) => {
				setUlVal($(ul), '');
			});
		});

		$filterForm.on('submit', (event) => {
			$filterForm.find('ul[data-name').each((index, ul) => {
				const $ul = $(ul);
				const $input = $form.find('input[name=' + $ul.attr('data-name') + ']');
				if ($input.size()) {
					$input.val($ul.data('value'));
				}
			});

			$filterForm.find('input').each((index, input) => {
				const $input = $form.find('input[name=' + input.name + ']');
				if ($input.size()) {
					$input.val(input.value);
				}
			});

			$form.trigger('submit');
			$.filterPanel.close();
		});
	}
};
