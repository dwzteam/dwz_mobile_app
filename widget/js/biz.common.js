/**
 * @author 张慧华 <350863780@qq.com>
 */

// 检测用户登入状态
$.urlInterceptor = function (url) {
	let pass = UserInfo.token ? true : false;

	if (!pass) {
		// 配制无需登录的uri
		let uris = ['tpl/user/', 'tpl/home.html'];

		// 判断request URI 是否需要登入
		let requestUri = url.getRequestURI();
		for (let i = 0; i < uris.length; i++) {
			if (requestUri.startsWith(uris[i])) {
				pass = true;
				break;
			}
		}
	}

	if (!pass) {
		$.gotoLogin();
		return false;
	}

	return true;
};

$._ajax = $.ajax;
$.extend({
	ajax(options) {
		// token统一放到header中，可以根据后台接口要求定义
		const header = { token: UserInfo.token || '' };
		const op = $.extend({ data: {}, header: header }, options);

		// DEV开发模型（json静态文件模拟接口），静态文件访问：POST请求统一改成GET
		if (biz.server.ENV == 'DEV') {
			op.type = 'GET';
		}

		$._ajax(op);
	},
	// 配合离线缓存serviceWorker，实现断网访问展示类接口
	fetchAjax(options) {
		const op = $.extend({ key: '', url: '', data: {}, type: 'GET', success: null }, options);
		const cache_key = 'dwz_json_' + op.key;

		if (!op.key || !op.url) {
			throw new Error('fetchAjax: key and url is required');
		}

		$.ajax({
			type: op.type,
			url: op.url,
			dataType: 'json',
			data: op.data,
			success: (json) => {
				// console.log(json);

				// 缓存json
				$.setStorage(cache_key, json);
				op.success && op.success(json);
			},
			error() {
				// 网络请求失败，从缓存中取数据
				const json = $.getStorage(cache_key);
				if (json) {
					op.success && op.success(json);
				}
			}
		});
	}
});

$.extend(biz, {
	ajaxError(xhr, ajaxOptions, thrownError) {
		if (xhr.status == 401) {
			$.gotoLogin();
			return;
		}
		$.alert.toast('操作失败，请稍后再试！');
	},
	safeAreaTop: 0,
	fixStatusBar($p) {
		$p.find('header, dwz-fix-status-bar').css({
			'padding-top': biz.safeAreaTop + 'px'
		});
	},
	getAppVersion() {
		return window.api ? api.appVersion : 'dev';
	},
	getSystemType() {
		return window.api ? api.systemType : 'web';
	},
	// 功能限制时间：人脸登录、安卓数据采集、App更新（用于配合上线app）
	checkLiveTime() {
		let limitTime = new Date('2021/02/05').getTime();
		let now = new Date().getTime();

		return limitTime <= now;
	},
	hasPermission(perms) {
		const ret = api.hasPermission({
			list: perms
		});
		console.log(JSON.stringify(ret));
		return ret;
	},
	requestPermission(perms, callback) {
		api.requestPermission(
			{
				list: perms,
				code: 100001
			},
			function (ret, err) {
				console.log(JSON.stringify(ret));
				if (callback) {
					callback(ret);
				}
			}
		);
	},
	initPermission(premsList) {
		api.requestPermission(
			{
				list: premsList
			},
			function (res) {
				console.log(JSON.stringify(res));
			}
		);
	},
	checkPermission(permName, msg) {
		const has = biz.hasPermission([permName]);
		if (!has || !has[0] || !has[0].granted) {
			api.confirm(
				{
					title: '提醒',
					msg: '没有获得 ' + (msg || permName) + ' 权限\n是否前往设置？',
					buttons: ['去设置', '取消']
				},
				function (ret, err) {
					if (1 == ret.buttonIndex) {
						biz.requestPermission([permName]);
					}
				}
			);
			return false;
		}
		return true;
	},
	updateApp(result) {
		if (api.systemType == 'android') {
			api.download(
				{
					url: result.source,
					report: true
				},
				function (ret, err) {
					if (ret && !ret.state) {
						/* 下载进度 */
						$.alert.toast('正在下载应用' + ret.percent + '%');
					}
					if (ret && ret.state) {
						/* 下载完成 */
						const savePath = ret.savePath;
						api.installApp({
							appUri: savePath
						});
					}
				}
			);
		} else if (api.systemType == 'ios') {
			api.installApp({
				appUri: result.source
			});
		}
	},
	checkUpdate() {
		const mam = api.require('mam');
		mam.checkUpdate(function (ret, err) {
			if (ret && ret.status) {
				const result = ret.result;
				if (result.update) {
					const msg = `新版本型号:${result.version};更新提示语:${result.updateTip};发布时间:${result.time}`;

					if (result.closed) {
						api.alert(
							{
								title: '有新的版本，请下载并安装',
								msg,
								buttons: ['确定']
							},
							function (ret, err) {
								if (ret.buttonIndex == 1) {
									biz.updateApp(result);
								}
							}
						);
					} else {
						api.confirm(
							{
								title: '有新的版本，是否下载并安装',
								msg,
								buttons: ['确定', '取消']
							},
							function (ret, err) {
								if (ret.buttonIndex == 1) {
									biz.updateApp(result);
								}
							}
						);
					}
				}
			} else {
				$.alert.toast(err.msg);
			}
		});
	},

	/**
	 * 默认页面渲染回调函数
	 * @param {*} tpl
	 * @param {*} params
	 */
	pageRender(tpl, params) {
		if (!params.UserInfo) {
			params.UserInfo = UserInfo;
		}
		const html = template.render(tpl.html, params);
		this.html(html).initUI();

		$.execHelperFn(this, tpl, params);
	},
	/**
	 * ifarme 加载外部页面回调函数
	 * @param {*} tpl
	 * @param {*} params
	 */
	iframeRender(tpl, params) {
		const html = template.render(tpl.html, {
			page_title: decodeURI(params.page_title || 'iframe外部页面'),
			page_url: decodeURI(params.page_url)
		});
		this.html(html).initUI();
	},

	location: {
		lastTime: 0, // 上次ajax数据同步时间戳
		timestamp: 0, // gps定位时间戳
		truck_id: '', // 车牌ID
		transport_id: '', // 运输单ID
		lng: 120,
		lat: 30,
		zoom: 8,
		updTransport() {
			$.ajax({
				type: 'POST',
				url: biz.server.getUrl(biz.server.transport.list),
				dataType: 'json',
				data: { pageNum: 1, status: 1 },
				cache: false,
				global: false,
				success: (json) => {
					if ($.isAjaxStatusOk(json)) {
						// alert(JSON.stringify(json.data.list));
						if (json.data.list && json.data.list.length) {
							biz.location.truck_id = json.data.list[0].truck_id;
							biz.location.transport_id = json.data.list[0].id;
						}
					}
				},
				error: biz.ajaxError
			});
		}
	},
	// 开启gps
	startLocation() {
		if (biz.location.lastTime) {
			return;
		}
		biz.location.updTransport();

		const $box = $(document);

		// 定位
		const bmLocation = api.require('bmLocation');
		bmLocation.configManager({
			accuracy: 'battery_saving', // battery_saving, device_sensors, hight_accuracy
			filter: 1,
			activityType: 'automotiveNavigation',
			locationTimeout: 10,
			reGeocodeTimeout: 10,
			coordinateType: 'BMK09LL' // BMK09LL, BMK09MC, WGS84, GCJ02
		});

		bmLocation.start(
			{
				locatingWithReGeocode: true,
				backgroundLocation: true
			},
			function (ret) {
				// console.log(JSON.stringify(ret));
				const sta = ret.status;
				if (sta) {
					biz.location.lat = ret.location.latitude;
					biz.location.lng = ret.location.longitude;
					biz.location.timestamp = Math.round(new Date().getTime());

					$box.trigger('location.change', biz.location);

					if (biz.location.lastTime + 10 * 1000 < biz.location.timestamp) {
						const _url = biz.server.getUrl(biz.server.transport.gpsUpload);
						const _data = {
							transport_id: biz.location.transport_id,
							truck_id: biz.location.truck_id,
							gathertime: Math.round(biz.location.timestamp / 1000),
							lng: biz.location.lng,
							lat: biz.location.lat
						};
						// $.alert.toast(_url + '\n' + JSON.stringify(_data));

						biz.location.lastTime = biz.location.timestamp;

						if (biz.location.transport_id) {
							$.ajax({
								type: 'POST',
								url: _url,
								dataType: 'json',
								data: _data,
								cache: false,
								global: false,
								success: (json) => {
									console.log(JSON.stringify(json));
								},
								error: biz.ajaxError
							});
						}
					}
				}
			}
		);
	},
	getGPS: function (geolocationSuccess, geolocationError) {
		if (!biz.checkPermission('location', 'gps定位')) {
			geolocationError && geolocationError();
			return;
		}

		if (window.api) {
			const bmLocation = api.require('bmLocation');
			bmLocation.singleLocation(
				{
					reGeocode: false,
					netWorkState: false
				},
				function (ret, err) {
					if (ret.status) {
						const gpsPos = { lat: ret.location.latitude, lng: ret.location.longitude };
						geolocationSuccess && geolocationSuccess(gpsPos);
					} else {
						geolocationError && geolocationError();
					}
				}
			);
		} else {
			const geolocation = new BMap.Geolocation();
			geolocation.getCurrentPosition(
				function (result) {
					if (this.getStatus() == BMAP_STATUS_SUCCESS) {
						const point = result.point;
						const gpsPos = $.gps.bd_encrypt(point.lat, point.lng);
						geolocationSuccess && geolocationSuccess(gpsPos, result);
					} else {
						geolocationError && geolocationError();
					}
				},
				{
					enableHighAccuracy: true
				}
			);
		}
	},

	/**
	 * 打开PDF
	 * @param {*} url
	 */
	openPdf(url) {
		const pdfReader = api.require('pdfReader');
		pdfReader.open({
			path: url,
			hidden: {
				print: true,
				export: true,
				bookmark: true,
				email: true
			},
			androidHidden: {
				topBackButton: true, //布尔类型；返回按钮；默认：true
				topListButton: true, //布尔类型；是否显示列表按钮；默认：true
				topSearchButton: true, //布尔类型；搜索按钮；默认：true
				bottomProgress: true //布尔类型；是否显示书签按钮；默认：true
			},
			backBtn: {
				size: {
					//JSON对象；左上角按钮的大小配置
					w: 60, //数字类型；左上角按钮的宽；默认：60
					h: 40 //数字类型；左上角按钮的高；默认：40
				},
				bg: {
					//JSON 对象；按钮背景配置
					normal: 'rgba(0,0,0,0)', //字符串类型；常态背景，支持rgb、rgba、#、img（本地图片）；默认：rgba(0,0,0,0)
					highlight: 'rgba(0,0,0,0)' //字符串类型；高亮背景，支持rgb、rgba、#、img（本地图片）；默认：同normal
				},
				title: {
					//JSON对象；按钮标题配置
					text: '关闭', //字符串类型；标题文本；默认：‘’
					size: 13, //数字类型；标题文字大小；默认：13
					color: api.systemType == 'ios' ? '#000' : '#fff', //字符串类型；标题颜色；默认：#000
					alignment: 'center' //字符串类型；标题位置，取值范围：left、center、right；默认：center
				},
				corner: 5 //数字类型；左上角按钮圆角大小；默认值：5.0
			}
		});
	},

	/**
	 * 打开高德导航App
	 */
	openMapNav({ lng, lat, name = '' }) {
		const bmapinstalled = api.appInstalled({
			sync: true,
			appBundle: 'com.baidu.BaiduMap'
		});
		const amapinstalled = api.appInstalled({
			sync: true,
			appBundle: 'com.autonavi.minimap'
		});
		api.hideProgress();
		const btns = [];
		//按钮
		const params = [];
		if (bmapinstalled) {
			const latlng = $.gps.bd_encrypt(lat, lng); // BD-09 to GCJ-02 高德地图坐标转百度地图坐标
			params.push({
				androidPkg: 'android.intent.action.VIEW',
				appParam: {
					destination: latlng.lat + ',' + latlng.lng,
					mode: 'driving',
					sourceApplication: api.appName
				},
				uri: `intent://map/direction?destination=latlng:${latlng.lat},${latlng.lng}|name:${name}&mode=driving&src=${api.appName}#Intent;scheme=bdapp;package=com.baidu.BaiduMap;end`,
				// uri: `baidumap://map/direction?destination=name:${name}|latlng:${latlng.lat},${latlng.lng}&mode=driving&src=${api.appName}`,
				iosUrl: 'baidumap://map/direction'
			});
			btns.push('百度地图');
		}
		if (amapinstalled) {
			params.push({
				androidPkg: 'android.intent.action.VIEW',
				appParam: {
					lat: lat,
					lon: lng,
					dev: '0',
					style: '1',
					sourceApplication: api.appName
				},
				uri: `androidamap://navi?sourceApplication=${api.appName}&poiname=${name}&lat=${lat}&lon=${lng}&dev=0&style=1`,
				iosUrl: 'iosamap://navi'
			});
			btns.push('高德地图');
		}
		if (btns.Length == 0) {
			$.alert.open({ msg: '手机未安装百度地图或者高德地图，请保证手机有其中一个导航软件。' });
		} else {
			//console.log(bmapinstalled+"-"+amapinstalled);
			$.actionSheet.open(
				{
					title: '请选择需要跳转的导航软件',
					buttons: btns
				},
				(ret) => {
					const index = ret.buttonIndex;
					if (params[index - 1]) {
						api.openApp(params[index - 1], (_ret, _err) => {
							console.log(JSON.stringify(_ret));
						});
					}
				}
			);
		}
	},
	format: {
		formatDateTime(timestamp, format) {
			if (!timestamp) return '';
			const date = new Date(timestamp);
			return date.formatDate(format || 'yyyy-MM-dd HH:mm:ss');
		},
		formatTime(second) {
			if (!second) return '--';
			else if (second < 60) return second + '秒';
			else if (second < 3600) return (second / 60).roundFloat(0) + '分钟';

			var hour = (second / 3600).roundFloat(0);
			var minute = ((second % 3600) / 60).roundFloat(0);
			return hour + '小时' + minute + '分钟';
		},
		formatDistance(m) {
			if (!m) return '--';
			if (m < 1000) {
				return parseInt(m) + '米';
			}
			return (m / 1000).toFixed(1) + '公里';
		},
		percent(num, fractionDigits) {
			var percentNum = num * 100;
			return percentNum.toFixed(fractionDigits);
		}
	}
});

$.extend(
	template.defaults.imports,
	{
		filterInputNum(value) {
			return value ? value : '';
		},
		showSex(value) {
			var item = SexStore.getItem(value);
			return item.name;
		},
		showTransportStatus(value, fieldName) {
			var item = TransportStatus.getItem(value);
			return item[fieldName || 'name'];
		},
		showImg(url, defaultImg) {
			return url || defaultImg || 'image/browse-empty-bg.svg';
		},
		showUserIcon(url) {
			return url || 'image/dwz-logo.svg';
		}
	},
	biz.format
);
