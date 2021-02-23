/**
 * @author 张慧华 <350863780@qq.com>
 */
(function ($) {
	$.amap = {
		/** 计算两经纬度之间的距离，单位是m
		 * approx distance between two points on earth ellipsoid
		 */
		calDistance: ({ lat1, lng1, lat2, lng2 }) => {
			const PI = Math.PI;
			const EARTH_RADIUS = 6378137.0;
			function getRad(d) {
				return (d * PI) / 180.0;
			}
			let f = getRad((lat1 + lat2) / 2);
			let g = getRad((lat1 - lat2) / 2);
			let l = getRad((lng1 - lng2) / 2);
			let sg = Math.sin(g);
			let sl = Math.sin(l);
			let sf = Math.sin(f);

			let s, c, w, r, d, h1, h2;
			let a = EARTH_RADIUS;
			let fl = 1 / 298.257;

			sg = sg * sg;
			sl = sl * sl;
			sf = sf * sf;

			s = sg * (1 - sl) + (1 - sf) * sl;
			c = (1 - sg) * (1 - sl) + sf * sl;

			w = Math.atan(Math.sqrt(s / c));
			r = Math.sqrt(s * c) / w;
			d = 2 * w * a;
			h1 = (3 * r - 1) / 2 / c;
			h2 = (3 * r + 1) / 2 / s;

			return d * (1 + fl * (h1 * sf * (1 - sg) - h2 * (1 - sf) * sg));
		},

		/**
		 * 在每个点的真实步骤中设置小车转动的角度（车载图标）
		 * @param map
		 * @param{AMap.LngLat} startPos 起点
		 * @param{AMap.LngLat} endPos 终点
		 * @return deg 角度值
		 */
		calRotation: function (options) {
			var op = $.extend({ map: null, startPos: null, endPos: null }, options);
			var deg = 0;
			//这个方法安卓api没有,但根据方法名称可以推断出是将经纬度进行一样倍数的放大或缩小,也忘了
			//拿小数位比较多的double来计算对精度影响大不大,所以自己写了一个方法,直接将经纬度放大一百万倍
			var startPos = op.map.lnglatToPixel(op.startPos, op.map.getZoom());
			var endPos = op.map.lnglatToPixel(op.endPos, op.map.getZoom());
			if (endPos.x != startPos.x) {
				var tan = (endPos.y - startPos.y) / (endPos.x - startPos.x),
					atan = Math.atan(tan);
				deg = (atan * 360) / (2 * Math.PI);
				if (endPos.x < startPos.x) {
					deg = -deg + 90 + 90;
				} else {
					deg = -deg;
				}
				deg = -deg;
			} else {
				var disy = endPos.y - startPos.y;
				var bias = 0;
				if (disy > 0) bias = -1;
				else bias = 1;
				deg = -bias * 90;
			}
			return deg;
		},
		/**
		 * 创建图标对象
		 * @param options
		 */
		addMarker: function (options) {
			var op = $.extend(
				{
					map: null,
					position: null,
					offset: new AMap.Pixel(0, 0),
					content: '<div class="dwz-marker icon-md"><img src="./image/icon/marker-end.svg"></div>',
					zIndex: 100
				},
				options
			);

			// 创建标注对象并添加到地图
			var marker = new AMap.Marker(op);

			return marker;
		},

		// 高德地图规划驾车路径
		createDriving(options, callback) {
			const op = $.extend(
				{
					map: null,
					pointStart: { lng: 0, lat: 0 },
					pointEnd: { lng: 0, lat: 0 },
					policy: AMap.DrivingPolicy.REAL_TRAFFIC
				},
				options
			);
			//构造路线导航类
			const driving = new AMap.Driving({
				map: op.map,
				hideMarkers: true,
				policy: op.policy //AMap.DrivingPolicy.LEAST_DISTANCE 最短距离，AMap.DrivingPolicy.REAL_TRAFFIC 实时路况
			});

			// 根据起终点经纬度规划驾车导航路线
			driving.search(new AMap.LngLat(op.pointStart.lng, op.pointStart.lat), new AMap.LngLat(op.pointEnd.lng, op.pointEnd.lat), function (status, result) {
				// result 即是对应的驾车导航信息，相关数据结构文档请参考  https://lbs.amap.com/api/javascript-api/reference/route-search#m_DrivingResult
				let route = {};
				if (result.routes) {
					route = result.routes[0];
				}
				if (status === 'complete') {
					console.log('绘制驾车路线完成');
				} else {
					console.log('获取驾车数据失败：' + result);
				}

				callback && callback(route);
			});

			return driving;
		}
	};
})(dwz);
