biz.transport = {
	indexRender: function (tpl, params) {
		var $box = this;

		var html = template.render(tpl, {params: params});
		$box.html(html).initUI();
	},

	listRender: function (tpl, params) {
		var $box = this, tplWrap = $.templateWrap(tpl);

		var html = template.render(tplWrap.tpl, {
			UserInfo: UserInfo,
			params: params
		});
		$box.html(html).initUI();

		var $form = $box.find("form.dwz-list-form"),
			$listBox = $form.find('ul.dwz-list-box');

		$form.requestList = function (loadMore) {
			$.ajax({
				type: "POST",
				url: biz.server.getUrl(biz.server.transportList),
				dataType: "json",
				data: $form.serializeArray(),
				cache: false,
				global: false,
				success: function (json) {
					if (!dwz.checkAjaxLogin(json)) {
						return;
					}

					if ($.isAjaxOkStatus(json)) {
						$form.total = json.data.total || json.data.list ? json.data.list.length : 0;
						if ($form.total) {
							$form.find('.empty_box').hide();
						}

						var _html = template.render(tplWrap['tpl-list'], json.data);
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
		var $box = this, tplWrap = $.templateWrap(tpl);
		var html = template.render(tplWrap.tpl, {params: params});
		$box.html(html).initUI();

		var $sheetBox = $box.find('.sheet-box');

		var $mapBox = $box.find('.dwz-map-box');
		var map = new AMap.Map($mapBox.get(0), {
			// mapStyle: "amap://styles/grey",
			zoom: biz.location.zoom
		});

		// 创建小车图标
		var markers = {
			car: $.amap.addMarker({
				map: map,
				position: [biz.location.lng, biz.location.lat],
				content: '<div class="center-marker"><img src="./image/icon/marker-car.svg" class="icon-md"></div>'
			}),
			start: null,
			end: null
		};

		$(document).on('location.change', function (event) {
			// console.log(JSON.stringify(event.data));

			var point = new AMap.LngLat(biz.location.lng, biz.location.lat);
			// 创建标注对象并添加到地图

			markers.car.setPosition(point);
			map.setCenter(point);

			if (markers.start && (biz.location.lng || biz.location.lat)) {
				var startPos = markers.start.getPosition();
				var endPos = markers.end.getPosition();
				var gpsPos = new AMap.LngLat(biz.location.lng, biz.location.lat);

				// 设置小车角度
				var deg = $.amap.calRotation({map: map, startPos: gpsPos, endPos: endPos});
				markers.car.setAngle(deg);

				var path = [
					startPos,
					gpsPos,
					endPos
				];
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
						strokeColor: "blue",
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

		var $receiveBox = $box.find('ul.receive-box');
		var $sheetBox = $box.find('div.sheet-box');
		var $form = $box.find('form.dwz-list-form');
		$form.on('submit', function () {

			$.ajax({
				type: "POST",
				url: biz.server.getUrl(biz.server.transportDetail),
				dataType: "json",
				data: {transport_id: params.id},
				cache: false,
				global: false,
				success: function (json) {
					console.log(json);
					if (!dwz.checkAjaxLogin(json)) {
						return;
					}

					var _data = {
						UserInfo: UserInfo,
						vo: json.data,
						receive: json.data.receive || {},
						ship: json.data.ship || {}
					};
					var html = template.render(tplWrap['tpl-sheet-box'], _data);
					$sheetBox.html(html).initUI();

					var html2 = template.render(tplWrap['tpl-receive-box'], _data);
					$receiveBox.html(html2);

					$box.find('.dwz-btn-start').touchwipe({
						wipeRight: function () {
							var $btn = $(this);
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
						wipeRight: function () {
							var $btn = $(this);
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

					var pointStart = new AMap.LngLat(parseFloat(json.data.ship.lng), parseFloat(json.data.ship.lat));
					map.setCenter(pointStart);
					// 创建起点图标
					markers.start = $.amap.addMarker({
						map: map,
						position: pointStart,
						content: '<div class="center-marker"><img src="./image/icon/marker-start.svg" class="icon-md"></div>'
					});
					// 创建终点图标
					markers.end = $.amap.addMarker({
						map: map,
						position: [parseFloat(json.data.receive.lng), parseFloat(json.data.receive.lat)],
						content: '<div class="dwz-marker icon-md"><img src="./image/icon/marker-end.svg"></div>'
					});

					$(document).trigger('location.change', biz.location); // 测试路线
				},
				error: ajaxError
			});

			return false;
		});

		$form.trigger('submit')
	},

	driving: function (tpl, params) {
		var $box = this, tplWrap = $.templateWrap(tpl);
		var html = template.render(tplWrap.tpl, {params: params});
		$box.html(html).initUI();

		var $mapBox = $box.find('.dwz-map-box');
		var map = new AMap.Map($mapBox.get(0), {
			zoom: biz.location.zoom
		});

		var pointStart = new AMap.LngLat(biz.location.lng, biz.location.lat);
		var pointEnd = new AMap.LngLat(parseFloat(params.lng), parseFloat(params.lat));
		map.setCenter(pointStart);

		var markers = {
			// 创建起点图标
			start: $.amap.addMarker({
				map: map,
				position: pointStart,
				content: '<div class="center-marker"><img src="./image/icon/marker-start.svg" class="icon-md"></div>'
			}),
			// 创建终点图标
			end: $.amap.addMarker({
				map: map,
				position: pointEnd,
				content: '<div class="dwz-marker icon-md"><img src="./image/icon/marker-end.svg"></div>'
			})
		};

		// 路线导航
		let driving = biz.createDriving({map: map, pointStart: pointStart, pointEnd: pointEnd}, function (route) {
			var _html = template.render(tplWrap['tpl-nav-info'], route);
			$box.find('.dwz-nav-info').html(_html);
		});

		var $form = $box.find('form.dwz-form');
		var $sheetBox = $form.find('div.sheet-box');
		var $inputEnd = $form.find('input[name=end]');
		var $list = $form.find('ul.dwz-list');
		$form.on('submit', function (event) {
			console.log('search poi...');
			event.preventDefault();

			$sheetBox.removeClass('fold');

			var keywords = $inputEnd.val().trim();
			if (keywords) {
				api.ajax({
					url: $form.attr("action"),
					method: 'get',
					data: {
						values: {
							keywords: keywords
						}
					}
				}, function (json, err) {
					// console.log(JSON.stringify(json));
					if (json.status == 1) {
						var _list = [
							{
								name: params.name,
								address: params.address,
								lng: params.lng,
								lat: params.lat
							}
						];
						json.pois.forEach(function (item) {
							var location = item.location.split(',');
							_list.push({
								name: item.cityname + item.adname + item.name,
								address: item.address,
								lng: parseFloat(location[0]),
								lat: parseFloat(location[1])
							});
						});
						var _html = template.render(tplWrap['tpl-list'], {list: _list});
						$list.html(_html);

						$list.find('li.item').touchwipe({
							touch: function () {
								var $li = $(this);
								$inputEnd.val($li.attr('data-name'));
								$sheetBox.addClass('fold');

								// 路线导航
								driving && driving.clear();
								var _pointEnd = new AMap.LngLat(parseFloat($li.attr('data-lng')), parseFloat($li.attr('data-lat')));
								driving = biz.createDriving({map: map, pointStart: pointStart, pointEnd: _pointEnd}, function (route) {
									var _html = template.render(tplWrap['tpl-nav-info'], route);
									$box.find('.dwz-nav-info').html(_html);
								});
							}
						});
					}
				});
			}
		});

		// 判断中文输入完成或者英文输入，触发事件
		var isInputZh = false;
		$inputEnd.on('compositionstart compositionend input focus', function (event) {
			console.log(event.type, isInputZh);

			switch (event.type) {
				case 'compositionstart':
					isInputZh = true;
					break;
				case 'compositionend':
					isInputZh = false;
				default:
					if (!isInputZh) $form.trigger('submit');
					break;
			}
		});
	},

	// 录入发货过磅信息
	firstRender: function (tpl, params) {
		var $box = this;

		$.ajax({
			type: "POST",
			url: biz.server.getUrl(biz.server.transportDetail),
			dataType: "json",
			data: {transport_id: params.id},
			cache: false,
			global: false,
			success: function (json) {
				if (!dwz.checkAjaxLogin(json)) {
					return;
				}

				var html = template.render(tpl, {
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
	lastRender: function (tpl, params) {
		var $box = this;

		$.ajax({
			type: "POST",
			url: biz.server.getUrl(biz.server.transportDetail),
			dataType: "json",
			data: {transport_id: params.id},
			cache: false,
			global: false,
			success: function (json) {
				if (!dwz.checkAjaxLogin(json)) {
					return;
				}

				var html = template.render(tpl, {
					vo: json.data,
					location: biz.location,
					form_url: biz.server.getUrl(biz.server.transportLast)
				});
				$box.html(html).initUI();

				$box.find('a.old-img-del').click(biz.transport.delPic);
			}
		});
	},

	delPic: function (event) {
		var $link = $(this);
		var $li = $link.parentsUntil(function () {
			return $(this).is('li.thumbnail');
		});

		var transport_id = $link.attr('data-id'), imgUrl = $link.attr('data-img-url'), field = $link.attr('data-field');
		if (imgUrl) {
			$.ajax({
				type: "POST",
				url: biz.server.getUrl(biz.server.transportPicDel),
				dataType: "json",
				data: {id: transport_id, imgUrl: imgUrl, field: field},
				cache: false,
				global: false,
				success: function (json) {
					if (!$.checkAjaxLogin(json)) {
						return;
					}

					$.ajaxDone(json);
					if ($.isAjaxOkStatus(json)) {
						$li.remove();
					}
				},
				error: ajaxError
			});
		} else {
			$li.remove();
		}

		event.stopPropagation();
	},

	// 弹出发货过磅确认
	confirmFirst: function (vo) {
		$.alert.confirm('出发前先录入发货过磅信息', {
			okCall: function (event) {
				$.navView.open({url: 'tpl/transport/first.html?dwz_callback=biz.transport.firstRender', data: vo, rel: 'transportFirst'});
			}
		});
		return false;
	},
	// 运输单开始运输
	transportStart: function (vo) {
		if (!vo.chemicals_weigh_first_commit) {
			return biz.transport.confirmFirst(vo);
		}

		$.ajax({
			type: "POST",
			url: biz.server.getUrl(biz.server.transportStart),
			dataType: "json",
			data: {transport_id: vo.id},
			cache: false,
			global: false,
			success: function (json) {
				if (!$.checkAjaxLogin(json)) {
					return;
				}

				navViewAjaxDoneReload(json);
				biz.location.updTransport();
			},
			error: ajaxError
		});
	},
	// 弹出收货过磅确认
	confirmFinish: function (vo) {
		$.alert.confirm('完成前先录入卸货过磅信息', {
			okCall: function (event) {
				$.navView.open({url: 'tpl/transport/last.html?dwz_callback=biz.transport.lastRender', data: vo, rel: 'transportFinish'});
			}
		});
		return false;
	},
	// 运输单完成运输
	transportFinish: function (vo) {
		if (!vo.chemicals_weigh_last_commit) {
			return biz.transport.confirmFinish(vo);
		}

		$.ajax({
			type: "POST",
			url: biz.server.getUrl(biz.server.transportFinish),
			dataType: "json",
			data: {transport_id: vo.id},
			cache: false,
			global: false,
			success: function (json) {
				if (!dwz.checkAjaxLogin(json)) {
					return;
				}

				navViewAjaxDoneReload(json);
				biz.location.updTransport();
			},
			error: ajaxError
		});
	},

	formSubmitWeigh: function (form) {
		console.log('formSubmitWeigh()....')
		var $form = $(form);
		var $pic = $('#upload-weigh_pic');
		var $sitePic = $('#upload-weigh_site_pic');

		if ($pic.size() && $pic.find('.thumbnail').size() == 0) {
			$.alert.error('请选择上传磅单图片');
			return false;
		}
		if ($sitePic.size() && $sitePic('.thumbnail').size() == 0) {
			$.alert.error('请选择上传现场图片');
			return false;
		}

		// 电子签名
		var $sign_url = $form.find('input.dwz-sign-input');
		if ($sign_url.size()) {
			if (!$sign_url.val() && $form.find('.dwz-sign-box').size()) {
				$.alert.error('您还没有完成签字！');
				return false;
			}
		}

		return validateCallback(form, function (json) {
			console.log(JSON.stringify(json));

			if ($.isAjaxOkStatus(json)) {
				navViewAjaxDoneClose(json);
			} else {
				$.ajaxDone(json);
			}
		});
	},

	mapNav: function () {
		var vo = biz.transport.vo;
		if (!vo) {
			return;
		}

		$.navView.close(true, true);

		// var startPos = $.gps.bd_decrypt(biz.location.lat, biz.location.lng);
		// var endPos = $.gps.bd_decrypt(vo.receive.lat, vo.receive.lng);
		var startPos = biz.location;
		var endPos = vo.receive;
		var aMapNavigation = api.require('aMapNavigation');
		aMapNavigation.start({
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
		}, function (ret, err) {
			if (ret) {
				console.log(JSON.stringify(ret));
			} else {
				console.log(JSON.stringify(err));
			}
		});
	}
};
