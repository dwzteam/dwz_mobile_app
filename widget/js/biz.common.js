$._ajax = $.ajax;
$.extend({
	ajax: function (options) {
		// token统一放到header中，可以根据后台接口要求定义
		const header = { token: UserInfo.token || "" };
		const op = $.extend({ data: {}, header: header }, options);

		// DEV开发模型（json静态文件模拟接口），静态文件访问：POST请求统一改成GET
		if (biz.server.ENV == "DEV") {
			op.type = "GET";
		}

		$._ajax(op);
	},
	// 配合离线缓存serviceWorker，实现断网访问展示类接口
	fetchAjax: function (options) {
		const op = $.extend(
			{ key: "", url: "", data: {}, type: "GET", success: null },
			options
		);
		const cache_key = "dwz_json_" + op.key;

		if (!op.key || !op.url) {
			throw new Error("fetchAjax: key and url is required");
		}

		$.ajax({
			type: op.type,
			url: op.url,
			dataType: "json",
			data: op.data,
			cache: false,
			global: false,
			success: function (json) {
				// console.log(json);

				// 缓存json
				$.setStorage(cache_key, json);
				op.success && op.success(json);
			},
			error: function () {
				// 网络请求失败，从缓存中取数据
				const json = $.getStorage(cache_key);
				if (json) {
					op.success && op.success(json);
				}
			},
		});
	},
});

function ajaxError(xhr, ajaxOptions, thrownError) {
	if (xhr.status == 401) {
		$.gotoLogin();
		return;
	}
	$.alert.toast("网络异常，请稍后再试！");
}

$.extend(biz, {
	safeAreaTop: 0,
	fixStatusBar: function ($p) {
		$p.find("header, dwz-fix-status-bar").css({ "padding-top": biz.safeAreaTop + "px" });
	},
	hasPermission: function (perms) {
		const ret = api.hasPermission({
			list: perms,
		});
		console.log(JSON.stringify(ret));
		return ret;
	},
	requestPermission: function (perms, callback) {
		api.requestPermission(
			{
				list: perms,
				code: 100001,
			},
			function (ret, err) {
				console.log(JSON.stringify(ret));
				if (callback) {
					callback(ret);
				}
			}
		);
	},
	initPermission: function (premsMap) {
		$.each(Object.keys(premsMap), function (index, permName) {
			const has = biz.hasPermission([permName]);
			if (!has || !has[0] || !has[0].granted) {
				biz.requestPermission([permName]);
			}
		});
	},
	checkPermission: function (permName, msg) {
		const has = biz.hasPermission([permName]);
		if (!has || !has[0] || !has[0].granted) {
			api.confirm(
				{
					title: "提醒",
					msg:
						"没有获得 " +
						(msg || permName) +
						" 权限\n是否前往设置？",
					buttons: ["去设置", "取消"],
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
	updateApp: function (result) {
		if (api.systemType == "android") {
			api.download(
				{
					url: result.source,
					report: true,
				},
				function (ret, err) {
					if (ret && 0 == ret.state) {
						/* 下载进度 */
						api.toast({
							msg: "正在下载应用" + ret.percent + "%",
							duration: 2000,
						});
					}
					if (ret && 1 == ret.state) {
						/* 下载完成 */
						const savePath = ret.savePath;
						api.installApp({
							appUri: savePath,
						});
					}
				}
			);
		}
		if (api.systemType == "ios") {
			api.installApp({
				appUri: result.source,
			});
		}
	},
	checkUpdate: function () {
		const mam = api.require("mam");
		mam.checkUpdate(function (ret, err) {
			if (ret) {
				const result = ret.result;
				if (result.update == true && result.closed == false) {
					const str =
						"新版本型号:" +
						result.version +
						";更新提示语:" +
						result.updateTip +
						";发布时间:" +
						result.time;

					if (result.closed) {
						// 强制更新
						api.alert(
							{
								title: "有新的版本,是否下载并安装 ",
								msg: str,
								buttons: ["确定"],
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
								title: "有新的版本,是否下载并安装 ",
								msg: str,
								buttons: ["确定", "取消"],
							},
							function (ret, err) {
								if (ret.buttonIndex == 1) {
									biz.updateApp(result);
								}
							}
						);
					}
				} else if (ret.buttonIndex == 2) {
					api.closeWidget({ silent: true });
				}
			} else {
				$.alert.toast(err.msg);
			}
		});
	},

	// 高德地图规划驾车路径
	createDriving: function (options, callback) {
		const op = $.extend(
			{
				map: null,
				pointStart: { lng: 0, lat: 0 },
				pointEnd: { lng: 0, lat: 0 },
				policy: AMap.DrivingPolicy.REAL_TRAFFIC,
			},
			options
		);
		//构造路线导航类
		const driving = new AMap.Driving({
			map: op.map,
			hideMarkers: true,
			policy: op.policy, //AMap.DrivingPolicy.LEAST_DISTANCE 最短距离，AMap.DrivingPolicy.REAL_TRAFFIC 实时路况
		});

		// 根据起终点经纬度规划驾车导航路线
		driving.search(
			new AMap.LngLat(op.pointStart.lng, op.pointStart.lat),
			new AMap.LngLat(op.pointEnd.lng, op.pointEnd.lat),
			function (status, result) {
				// result 即是对应的驾车导航信息，相关数据结构文档请参考  https://lbs.amap.com/api/javascript-api/reference/route-search#m_DrivingResult
				let route = {};
				if (result.routes) {
					route = result.routes[0];
				}
				if (status === "complete") {
					console.log("绘制驾车路线完成");
				} else {
					console.log("获取驾车数据失败：" + result);
				}

				callback && callback(route);
			}
		);

		return driving;
	},
	location: {
		lastTime: 0, // 上次ajax数据同步时间戳
		timestamp: 0, // gps定位时间戳
		truck_id: "", // 车牌ID
		transport_id: "", // 运输单ID
		lng: 120,
		lat: 30,
		zoom: 8,
		updTransport: function () {
			$.ajax({
				type: "POST",
				url: biz.server.getUrl(biz.server.transportList),
				dataType: "json",
				data: { pageNum: 1, status: 1 },
				cache: false,
				global: false,
				success: function (json) {
					if ($.isAjaxOkStatus(json)) {
						// alert(JSON.stringify(json.data.list));
						if (json.data.list && json.data.list.length) {
							biz.location.truck_id = json.data.list[0].truck_id;
							biz.location.transport_id = json.data.list[0].id;
						}
					}
				},
				error: ajaxError,
			});
		},
	},
	// 开启gps
	startLocation: function () {
		if (biz.location.lastTime) {
			return;
		}
		biz.location.updTransport();

		const $box = $(document);

		// 播放无声音乐
		if (api.systemType == "android") {
			const audioStreamer = api.require("audioStreamer");
			audioStreamer.openPlayer(
				{
					// path: 'http://7xisq1.com1.z0.glb.clouddn.com/apicloud/0d0b81b8bd5ab81bda9ca54267eb9b98.mp3'
					path: "http://www.7788sc.com/ui/mp3/1.mp3",
				},
				function (ret) {
					console.log(JSON.stringify(ret));
				}
			);
			audioStreamer.setLoop({ loop: true });
		}

		// 定位
		const bmLocation = api.require("bmLocation");
		bmLocation.configManager({
			accuracy: "battery_saving", // battery_saving, device_sensors, hight_accuracy
			filter: 1,
			activityType: "automotiveNavigation",
			locationTimeout: 10,
			reGeocodeTimeout: 10,
			coordinateType: "BMK09LL", // BMK09LL, BMK09MC, WGS84, GCJ02
		});

		bmLocation.start(
			{
				locatingWithReGeocode: true,
				backgroundLocation: true,
			},
			function (ret) {
				// console.log(JSON.stringify(ret));
				const sta = ret.status;
				if (sta) {
					biz.location.lat = ret.location.latitude;
					biz.location.lng = ret.location.longitude;
					biz.location.timestamp = Math.round(new Date().getTime());

					$box.trigger("location.change", biz.location);

					if (
						biz.location.lastTime + 10 * 1000 <
						biz.location.timestamp
					) {
						const _url = biz.server.getUrl(biz.server.transportPoint);
						const _data = {
							transport_id: biz.location.transport_id,
							truck_id: biz.location.truck_id,
							gathertime: Math.round(
								biz.location.timestamp / 1000
							),
							lng: biz.location.lng,
							lat: biz.location.lat,
						};
						$.alert.toast(_url + '\n' + JSON.stringify(_data));

						biz.location.lastTime = biz.location.timestamp;

						if (biz.location.transport_id) {
							$.ajax({
								type: "POST",
								url: _url,
								dataType: "json",
								data: _data,
								cache: false,
								global: false,
								success: function (json) {
									console.log(JSON.stringify(json));
								},
								error: ajaxError,
							});
						}
					}
				}
			}
		);
	},
});

function pageRender(tpl, param) {
	const $box = this;

	const html = template.render(tpl, param);
	$box.html(html).initUI();
}

// Store 基类
const CommonStore = {
	data: [],
	getData: function (params) {
		const op = $.extend({ selectedId: "" }, params);
		const data = [];
		for (let i = 0; i < this.data.length; i++) {
			data.push(this.data[i]);
			data[i].selected = data[i].id == op.selectedId;
		}
		return data;
	},
	getItem: function (id) {
		for (let i = 0; i < this.data.length; i++) {
			if (this.data[i].id == id) {
				return this.data[i];
			}
		}
		return {};
	},
};

const SexStore = $.extend({}, CommonStore, {
	data: [
		{ id: 1, name: "男" },
		{ id: 2, name: "女" },
	],
});

// 运输单状态
const TransportStatus = $.extend({}, CommonStore, {
	data: [
		{ id: "0", icon: "status-pending", name: "待出发" },
		{ id: "1", icon: "status-fail", name: "运输中" },
		{ id: "2", icon: "status-pass", name: "已完成" },
	],
});



biz.format = {
	formatDateTime: function (timestamp, format) {
		if (!timestamp) return "";
		const date = new Date(timestamp);
		return date.formatDate(format || "yyyy-MM-dd HH:mm:ss");
	},
	formatTime: function (second) {
		if (!second) return '--';
		else if (second<60) return second + '秒';
		else if (second<3600) return (second/60).roundFloat(0) + '分钟';

		var hour = (second/3600).roundFloat(0);
		var minute = ((second%3600)/60).roundFloat(0);
		return hour + '小时' + minute + '分钟'
	},
	formatDistance: function (m) {
		if (!m) return '--';
		if (m < 1000) {
			return parseInt(m) + '米';
		}
		return (m/1000).toFixed(1) + '公里';
	},
	percent: function (num, fractionDigits) {
		var percentNum = num * 100;
		return percentNum.toFixed(fractionDigits);
	}
};
$.extend(template.defaults.imports, {
	filterInputNum: function(value) {
		return value ? value : '';
	},
	showSex: function (value) {
		var item = SexStore.getItem(value);
		return item.name;
	},
	showTransportStatus: function (value, fieldName) {
		var item = TransportStatus.getItem(value);
		return item[fieldName || 'name'];
	},
	showImg: function (url, defaultImg) {
		return url || defaultImg || 'image/browse-empty-bg.svg';
	},
	showUserIcon: function (url) {
		return url || 'image/dwz-logo.svg';
	}
}, biz.format);

