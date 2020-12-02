biz.transport = {
	/**
	 * 运输单首页tab切换回调
	 * @param {*} tpl
	 * @param {*} params
	 */
	listRender(tpl, params) {
		const $box = this,
			tplWrap = $.templateWrap(tpl);

		let html = template.render(tplWrap.tpl, {
			UserInfo: UserInfo,
			params: params
		});
		$box.html(html).initUI();

		const $form = $box.find('form.dwz-list-form'),
			$listBox = $form.find('ul.dwz-list-box');

		$form.requestList = (loadMore) => {
			$.ajax({
				type: 'POST',
				url: biz.server.getUrl(biz.server.transportList),
				dataType: 'json',
				data: $form.serializeArray(),
				cache: false,
				global: false,
				success: (json) => {
					if (!$.checkAjaxLogin(json)) {
						return;
					}

					if ($.isAjaxStatusOk(json)) {
						$form.total =
							json.data.total || json.data.list ? json.data.list.length : 0;
						if ($form.total) {
							$form.find('.empty_box').hide();
						}

						let _html = template.render(tplWrap['tpl-list'], json.data);
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

	// 运输单详情回调
	detailRender(tpl, params) {
		const $box = this,
			tplWrap = $.templateWrap(tpl);
		let html = template.render(tplWrap.tpl, { params: params });
		$box.html(html).initUI();

		const $sheetBox = $box.find('.sheet-box');

		const $mapBox = $box.find('.dwz-map-box');
		const map = new AMap.Map($mapBox.get(0), {
			// mapStyle: "amap://styles/grey",
			zoom: biz.location.zoom
		});

		// 创建小车图标
		const markers = {
			car: $.amap.addMarker({
				map: map,
				position: [biz.location.lng, biz.location.lat],
				content:
					'<div class="center-marker"><img src="./image/icon/marker-car.svg" class="icon-md"></div>'
			}),
			start: null,
			end: null
		};

		$(document).on('location.change', function (event) {
			// console.log(JSON.stringify(event.data));

			const gpsPos = new AMap.LngLat(biz.location.lng, biz.location.lat);
			// 创建标注对象并添加到地图

			markers.car.setPosition(gpsPos);
			if (!markers._inited) {
				markers._inited = true;
				setTimeout(() => {
					map.setCenter(gpsPos);
				}, 500);
			}

			if (markers.start && (biz.location.lng || biz.location.lat)) {
				const startPos = markers.start.getPosition();
				const endPos = markers.end.getPosition();

				// 设置小车角度
				let deg = $.amap.calRotation({
					map: map,
					startPos: gpsPos,
					endPos: endPos
				});
				markers.car.setAngle(deg);

				const path = [startPos, gpsPos, endPos];
				if (markers.polyline) {
					markers.polyline.setPath(path);
				} else {
					//创建折线
					markers.polyline = new AMap.Polyline({
						map: map,
						path: path,
						lineCap: 'round',
						isOutline: true,
						outlineColor: 'white',
						showDir: true,
						strokeColor: 'blue',
						strokeWeight: 4,
						borderWeight: 2,
						strokeOpacity: 0.5
					});
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
				url: biz.server.getUrl(biz.server.transportDetail),
				dataType: 'json',
				data: { transport_id: params.id },
				cache: false,
				global: false,
				success: (json) => {
					console.log(json);
					if (!dwz.checkAjaxLogin(json)) {
						return;
					}

					const _data = {
						UserInfo: UserInfo,
						vo: json.data,
						receive: json.data.receive || {},
						ship: json.data.ship || {}
					};
					let html = template.render(tplWrap['tpl-sheet-box'], _data);
					$sheetBox.html(html).initUI();

					let html2 = template.render(tplWrap['tpl-receive-box'], _data);
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

					const pointStart = new AMap.LngLat(
						json.data.ship.lng,
						json.data.ship.lat
					);

					// 创建起点图标
					markers.start = $.amap.addMarker({
						map: map,
						position: pointStart,
						content:
							'<div class="center-marker"><img src="./image/icon/marker-start.svg" class="icon-md"></div>'
					});
					// 创建终点图标
					markers.end = $.amap.addMarker({
						map: map,
						position: [json.data.receive.lng, json.data.receive.lat],
						content:
							'<div class="dwz-marker icon-md"><img src="./image/icon/marker-end.svg"></div>'
					});

					// 缩放地图到合适的视野级别
					map.setFitView([markers.start, markers.end]);

					$(document).trigger('location.change', biz.location); // 测试路线
				},
				error: biz.ajaxError
			});

			return false;
		});

		$form.trigger('submit');
	},

	driving(tpl, params) {
		const $box = this,
			tplWrap = $.templateWrap(tpl);
		const html = template.render(tplWrap.tpl, { params: params });
		$box.html(html).initUI();

		const $mapBox = $box.find('.dwz-map-box');
		const map = new AMap.Map($mapBox.get(0), {
			zoom: biz.location.zoom
		});

		const pointStart = new AMap.LngLat(biz.location.lng, biz.location.lat);
		const pointEnd = new AMap.LngLat(
			parseFloat(params.lng),
			parseFloat(params.lat)
		);
		map.setCenter(pointStart);

		const markers = {
			// 创建起点图标
			start: $.amap.addMarker({
				map: map,
				position: pointStart,
				content:
					'<div class="center-marker"><img src="./image/icon/marker-start.svg" class="icon-md"></div>'
			}),
			// 创建终点图标
			end: $.amap.addMarker({
				map: map,
				position: pointEnd,
				content:
					'<div class="dwz-marker icon-md"><img src="./image/icon/marker-end.svg"></div>'
			})
		};

		// 路线导航
		let driving = biz.createDriving(
			{ map: map, pointStart: pointStart, pointEnd: pointEnd },
			function (route) {
				let _html = template.render(tplWrap['tpl-nav-info'], route);
				$box.find('.dwz-nav-info').html(_html);
			}
		);

		const $form = $box.find('form.dwz-form');
		const $sheetBox = $form.find('div.sheet-box');
		const $inputEnd = $form.find('input[name=end]');
		const $list = $form.find('ul.dwz-list');
		$form.on('submit', function (event) {
			console.log('search poi...');
			event.preventDefault();

			$sheetBox.removeClass('fold');

			let keywords = $inputEnd.val().trim();
			if (keywords) {
				api.ajax(
					{
						url: $form.attr('action'),
						method: 'get',
						data: {
							values: {
								keywords: keywords
							}
						}
					},
					function (json, err) {
						// console.log(JSON.stringify(json));
						if (json.status == 1) {
							let _list = [
								{
									name: params.name,
									address: params.address,
									lng: params.lng,
									lat: params.lat
								}
							];
							json.pois.forEach(function (item) {
								let location = item.location.split(',');
								_list.push({
									name: item.cityname + item.adname + item.name,
									address: item.address,
									lng: parseFloat(location[0]),
									lat: parseFloat(location[1])
								});
							});
							let _html = template.render(tplWrap['tpl-list'], {
								list: _list
							});
							$list.html(_html);

							$list.find('li.item').touchwipe({
								touch() {
									let $li = $(this);
									$inputEnd.val($li.attr('data-name'));
									$sheetBox.addClass('fold');

									// 路线导航
									driving && driving.clear();
									let _pointEnd = new AMap.LngLat(
										parseFloat($li.attr('data-lng')),
										parseFloat($li.attr('data-lat'))
									);
									driving = biz.createDriving(
										{
											map: map,
											pointStart: pointStart,
											pointEnd: _pointEnd
										},
										function (route) {
											let _html = template.render(
												tplWrap['tpl-nav-info'],
												route
											);
											$box.find('.dwz-nav-info').html(_html);
										}
									);
								}
							});
						}
					}
				);
			}
		});

		// 判断中文输入完成或者英文输入，触发事件
		let isInputZh = false;
		$inputEnd.on(
			'compositionstart compositionend input focus',
			function (event) {
				console.log(event.type, isInputZh);

				switch (event.type) {
					case 'compositionstart':
						isInputZh = true;
						break;
					case 'compositionend':
						isInputZh = false;
						break;
					default:
						if (!isInputZh) $form.trigger('submit');
						break;
				}
			}
		);
	},

	// 录入发货过磅信息
	firstRender(tpl, params) {
		const $box = this;

		$.ajax({
			type: 'POST',
			url: biz.server.getUrl(biz.server.transportDetail),
			dataType: 'json',
			data: { transport_id: params.id },
			cache: false,
			global: false,
			success: (json) => {
				if (!dwz.checkAjaxLogin(json)) {
					return;
				}

				let html = template.render(tpl, {
					vo: json.data,
					location: biz.location,
					form_url: biz.server.getUrl(biz.server.transportFirst)
				});
				$box.html(html).initUI();

				$box.find('a.old-img-del').click(biz.transport.delPic);
			}
		});
	},

	// 录入卸货过磅信息
	lastRender(tpl, params) {
		const $box = this;

		$.ajax({
			type: 'POST',
			url: biz.server.getUrl(biz.server.transportDetail),
			dataType: 'json',
			data: { transport_id: params.id },
			cache: false,
			global: false,
			success: (json) => {
				if (!dwz.checkAjaxLogin(json)) {
					return;
				}

				let html = template.render(tpl, {
					vo: json.data,
					location: biz.location,
					form_url: biz.server.getUrl(biz.server.transportLast)
				});
				$box.html(html).initUI();

				$box.find('a.old-img-del').click(biz.transport.delPic);
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
				url: biz.server.getUrl(biz.server.transportPicDel),
				dataType: 'json',
				data: { id: transport_id, imgUrl: imgUrl, field: field },
				cache: false,
				global: false,
				success: (json) => {
					if (!$.checkAjaxLogin(json)) {
						return;
					}

					$.ajaxDone(json);
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
		$.alert.confirm('出发前先录入发货过磅信息', {
			okCall(event) {
				$.navView.open({
					url:
						'tpl/transport/first.html?dwz_callback=biz.transport.firstRender',
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
			url: biz.server.getUrl(biz.server.transportStart),
			dataType: 'json',
			data: { transport_id: vo.id },
			cache: false,
			global: false,
			success: (json) => {
				if (!$.checkAjaxLogin(json)) {
					return;
				}

				navViewAjaxDoneReload(json);
				biz.location.updTransport();
			},
			error: biz.ajaxError
		});
	},
	// 弹出收货过磅确认
	confirmFinish(vo) {
		$.alert.confirm('完成前先录入卸货过磅信息', {
			okCall(event) {
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
			url: biz.server.getUrl(biz.server.transportFinish),
			dataType: 'json',
			data: { transport_id: vo.id },
			cache: false,
			global: false,
			success: (json) => {
				if (!dwz.checkAjaxLogin(json)) {
					return;
				}

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
			$.alert.error('请选择上传磅单图片');
			return false;
		}
		if ($sitePic.size() && $sitePic('.thumbnail').size() == 0) {
			$.alert.error('请选择上传现场图片');
			return false;
		}

		// 电子签名
		const $sign_url = $form.find('input.dwz-sign-input');
		if ($sign_url.size()) {
			if (!$sign_url.val() && $form.find('.dwz-sign-box').size()) {
				$.alert.error('您还没有完成签字！');
				return false;
			}
		}

		return validateCallback(form, function (json) {
			console.log(JSON.stringify(json));

			if ($.isAjaxStatusOk(json)) {
				navViewAjaxDoneClose(json);
			} else {
				$.ajaxDone(json);
			}
		});
	},

	mapNav() {
		const vo = biz.transport.vo;
		if (!vo) {
			return;
		}

		$.navView.close(true, true);

		// let startPos = $.gps.bd_decrypt(biz.location.lat, biz.location.lng);
		// let endPos = $.gps.bd_decrypt(vo.receive.lat, vo.receive.lng);
		let startPos = biz.location;
		let endPos = vo.receive;
		let aMapNavigation = api.require('aMapNavigation');
		aMapNavigation.start(
			{
				start: {
					lon: startPos.lng,
					lat: startPos.lat
				},
				end: {
					lon: endPos.lng,
					lat: endPos.lat
				},
				type: 'drive',
				strategy: 'fast',
				mode: 'GPS',
				styles: {
					preference: {
						night: false,
						compass: false,
						crossImg: false,
						degree: 30,
						yawReCal: false,
						jamReCal: false,
						alwaysBright: false
					}
				}
			},
			function (ret, err) {
				if (ret) {
					console.log(JSON.stringify(ret));
				} else {
					console.log(JSON.stringify(err));
				}
			}
		);
	}
};
