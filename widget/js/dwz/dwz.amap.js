/**
 * Created by zhanghuihua on 2020/10/24.
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
					content:
						'<div class="dwz-marker icon-md"><img src="./image/icon/marker-end.svg"></div>',
					zIndex: 100
				},
				options
			);

			// 创建标注对象并添加到地图
			var marker = new AMap.Marker(op);

			return marker;
		}
	};
})(dwz);
