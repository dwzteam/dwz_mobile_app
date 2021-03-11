/**
 * @author 张慧华 <350863780@qq.com>
 */
biz.transport = {
	/**
	 * 运输单首页tab切换回调
	 * @param {*} tpl
	 * @param {*} params
	 */
	listRender(tpl, params) {
		let html = template.render(tpl.html, {
			UserInfo: UserInfo,
			params: params
		});
		this.html(html).initUI();

		const $form = this.find('form.dwz-list-form'),
			$listBox = $form.find('ul.dwz-list-box');

		$form.requestList = (loadMore) => {
			$.ajax({
				type: 'POST',
				url: biz.server.getUrl(biz.server.transport.list),
				dataType: 'json',
				data: $form.serializeArray(),
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

	// 运输单详情回调
	detailRender(tpl, params) {
		const $box = this;
		let html = template.render(tpl.html, { params: params });
		$box.html(html).initUI();

		const $sheetBox = $box.find('.sheet-box');
		const $mapBox = $box.find('.dwz-map-box');

		// 高德地图和gps定位持续上报模块有冲突，换成百度地图
		const map = new BMap.Map($mapBox.get(0));
		const bdPos = $.gps.bd_encrypt(biz.location.lat, biz.location.lng);
		map.centerAndZoom(new BMap.Point(bdPos.lng, bdPos.lat), biz.location.zoom);

		// 创建小车图标
		const markers = {
			car: $.bmap.addMarker({
				map: map,
				iconUrl: './image/icon/marker-car.svg',
				point: new BMap.Point(bdPos.lng, bdPos.lat),
				iconWidth: 42,
				iconHeight: 42,
				anchor: new BMap.Size(21, 21)
			}),
			start: null,
			end: [], // 多个卸货点
			status: 0 // 发货状态
		};

		$(document).on('location.change', function (event) {
			const gpsPos = new BMap.Point(bdPos.lng, bdPos.lat);
			// 创建标注对象并添加到地图
			markers.car.setPosition(gpsPos);
			if (biz.location.lat || biz.location.lng) {
				map.setCenter(gpsPos);
			}

			if (markers.start && (biz.location.lng || biz.location.lat)) {
				const startPos = markers.start.getPosition();
				const endPos = markers.end.getPosition();

				// 设置小车角度
				let deg = $.bmap.calRotation({
					map: map,
					startPos: gpsPos,
					endPos: endPos
				});
				markers.car.setRotation(deg);

				const path = [gpsPos, endPos];
				if (markers.polyline) {
					markers.polyline.setPath(path);
				} else {
					//创建折线
					markers.polyline = new BMap.Polyline(path, {
						strokeColor: 'blue',
						strokeWeight: 2,
						strokeOpacity: 0.5
					});
					map.addOverlay(markers.polyline); //增加折线
				}
			}
		});

		$box.on(dwz.event.type.pageClear, function () {
			$(document).off('location.change');
		});

		const $receiveBox = $box.find('ul.receive-box');
		const $form = $box.find('form.dwz-list-form');
		$form.on('submit', function () {
			$.ajax({
				type: 'POST',
				url: biz.server.getUrl(biz.server.transport.detail),
				dataType: 'json',
				data: { transport_id: params.id },
				cache: false,
				global: false,
				success: (json) => {
					// console.log(json);
					if (!dwz.checkAjaxLogin(json)) {
						return;
					}

					const _data = {
						UserInfo: UserInfo,
						vo: json.data,
						receive: json.data.receive || {},
						ship: json.data.ship || {}
					};
					let html = template.render(tpl.tpl_sheet_box, _data);
					$sheetBox.html(html).initUI();

					let html2 = template.render(tpl.tpl_receive_box, _data);
					$receiveBox.html(html2);

					$box.find('.dwz-btn-start').touchwipe({
						wipeRight() {
							const $btn = $(this);
							if (!$btn.hasClass('wipe-hover')) {
								$btn.addClass('wipe-hover');
								setTimeout(function () {
									$btn.removeClass('wipe-hover');
								}, 3000);

								biz.transport.transportStart(json.data);
							}
						}
					});
					$box.find('.dwz-btn-finish').touchwipe({
						wipeRight() {
							const $btn = $(this);
							if (!$btn.hasClass('wipe-hover')) {
								$btn.addClass('wipe-hover');
								setTimeout(function () {
									$btn.removeClass('wipe-hover');
								}, 3000);

								biz.transport.transportFinish(json.data);
							}
						}
					});

					// 缓存当前运输单
					biz.transport.vo = json.data;

					const pointStart = new BMap.Point(parseFloat(json.data.ship.lng), parseFloat(json.data.ship.lat));
					setTimeout(() => {
						if (!biz.location.lat || !biz.location.lng) {
							map.setCenter(pointStart);
						}
					}, 500);
					// 创建起点图标
					markers.start = $.bmap.addMarker({
						map: map,
						iconUrl: './image/icon/marker-start.svg',
						point: pointStart,
						iconWidth: 42,
						iconHeight: 42,
						anchor: new BMap.Size(21, 21)
					});

					// 创建终点图标
					let pointEnd = $.gps.bd_encrypt(parseFloat(json.data.receive.lat), parseFloat(json.data.receive.lng));
					markers.end = $.bmap.addMarker({
						map: map,
						iconUrl: './image/icon/marker-end.svg',
						point: new BMap.Point(pointEnd.lng, pointEnd.lat),
						iconWidth: 28,
						iconHeight: 42
					});

					setTimeout(() => {
						$(document).trigger('location.change', biz.location);
					}, 800);
				},
				error: biz.ajaxError
			});

			return false;
		});

		$form.trigger('submit');
	},

	// 录入发货过磅信息
	firstRender(tpl, params) {
		$.ajax({
			type: 'POST',
			url: biz.server.getUrl(biz.server.transport.detail),
			dataType: 'json',
			data: { transport_id: params.id },
			cache: false,
			global: false,
			success: (json) => {
				if (!dwz.checkAjaxLogin(json)) {
					return;
				}

				let html = template.render(tpl.html, {
					vo: json.data,
					location: biz.location,
					form_url: biz.server.getUrl(biz.server.transport.first)
				});
				this.html(html).initUI();

				this.find('a.old-img-del').click(biz.transport.delPic);
			}
		});
	},

	// 录入卸货过磅信息
	lastRender(tpl, params) {
		$.ajax({
			type: 'POST',
			url: biz.server.getUrl(biz.server.transport.detail),
			dataType: 'json',
			data: { transport_id: params.id },
			cache: false,
			global: false,
			success: (json) => {
				if (!dwz.checkAjaxLogin(json)) {
					return;
				}

				let html = template.render(tpl.html, {
					vo: json.data,
					location: biz.location,
					form_url: biz.server.getUrl(biz.server.transport.last)
				});
				this.html(html).initUI();

				this.find('a.old-img-del').click(biz.transport.delPic);
			}
		});
	},

	delPic(event) {
		const $link = $(this);
		const $li = $link.parentsUntil(function () {
			return $(this).is('li.thumbnail');
		});

		let transport_id = $link.attr('data-id'),
			imgUrl = $link.attr('data-img-url'),
			field = $link.attr('data-field');
		if (imgUrl) {
			$.ajax({
				type: 'POST',
				url: biz.server.getUrl(biz.server.transport.picDel),
				dataType: 'json',
				data: { id: transport_id, imgUrl: imgUrl, field: field },
				cache: false,
				global: false,
				success: (json) => {
					if ($.isAjaxStatusOk(json)) {
						$li.remove();
					}
				},
				error: biz.ajaxError
			});
		} else {
			$li.remove();
		}

		event.stopPropagation();
	},

	// 弹出发货过磅确认
	confirmFirst(vo) {
		$.alert.confirm({ msg: '出发前先录入发货过磅信息' }, (ret) => {
			if (ret.buttonIndex == 1) {
				$.navView.open({
					url: 'tpl/transport/first.html?dwz_callback=biz.transport.firstRender',
					data: vo,
					rel: 'transportFirst'
				});
			}
		});
		return false;
	},
	// 运输单开始运输
	transportStart(vo) {
		if (!vo.weigh_first_commit) {
			return biz.transport.confirmFirst(vo);
		}

		$.ajax({
			type: 'POST',
			url: biz.server.getUrl(biz.server.transport.start),
			dataType: 'json',
			data: { transport_id: vo.id },
			cache: false,
			global: false,
			success: (json) => {
				navViewAjaxDoneReload(json);
				biz.location.updTransport();
			},
			error: biz.ajaxError
		});
	},
	// 弹出收货过磅确认
	confirmFinish(vo) {
		$.alert.confirm({ msg: '完成前先录入卸货过磅信息' }, (ret) => {
			if (ret.buttonIndex == 1) {
				$.navView.open({
					url: 'tpl/transport/last.html?dwz_callback=biz.transport.lastRender',
					data: vo,
					rel: 'transportFinish'
				});
			}
		});
		return false;
	},
	// 运输单完成运输
	transportFinish(vo) {
		if (!vo.weigh_last_commit) {
			return biz.transport.confirmFinish(vo);
		}

		$.ajax({
			type: 'POST',
			url: biz.server.getUrl(biz.server.transport.finish),
			dataType: 'json',
			data: { transport_id: vo.id },
			cache: false,
			global: false,
			success: (json) => {
				navViewAjaxDoneReload(json);
				biz.location.updTransport();
			},
			error: biz.ajaxError
		});
	},

	formSubmitWeigh(form) {
		console.log('formSubmitWeigh()....');
		const $form = $(form);
		const $pic = $('#upload-weigh_pic');
		const $sitePic = $('#upload-weigh_site_pic');

		if ($pic.size() && $pic.find('.thumbnail').size() == 0) {
			$.alert.open({ msg: '请选择上传磅单图片' });
			return false;
		}
		if ($sitePic.size() && $sitePic('.thumbnail').size() == 0) {
			$.alert.open({ msg: '请选择上传现场图片' });
			return false;
		}

		// 电子签名
		const $sign_url = $form.find('input.dwz-sign-input');
		if ($sign_url.size()) {
			if (!$sign_url.val() && $form.find('.dwz-sign-box').size()) {
				$.alert.open({ msg: '您还没有完成签字！' });
				return false;
			}
		}

		return $.validateCallback(form, function (json) {
			console.log(JSON.stringify(json));

			if ($.isAjaxStatusOk(json)) {
				navViewAjaxDoneClose(json);
			} else {
				$.ajaxDone(json);
			}
		});
	}
};
