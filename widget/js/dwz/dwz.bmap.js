/**
 * Created by zhanghuihua on 2016/12/15.
 */

(function ($) {
	$.bmap = {
		config: {
			addMarker: {
				map: null,
				point: null,
				iconUrl: './image/icon/markers.png',
				iconWidth: 25,
				iconHeight: 40,
				imageOffsetLeft: 0,
				imageOffsetTop: 0,
				anchor: null,
				imageSize: null
			}
		},
		/**
		 * 在每个点的真实步骤中设置小车转动的角度（车载图标）
		 * @param map
		 * @param{BMap.Point} startPos 起点
		 * @param{BMap.Point} endPos 终点
		 * @return deg 角度值
		 */
		calRotation: function (options) {
			let op = $.extend({ map: null, startPos: null, endPos: null }, options);
			let deg = 0;
			//这个方法安卓api没有,但根据方法名称可以推断出是将经纬度进行一样倍数的放大或缩小,也忘了
			//拿小数位比较多的double来计算对精度影响大不大,所以自己写了一个方法,直接将经纬度放大一百万倍
			let startPos = op.map.pointToPixel(op.startPos);
			let endPos = op.map.pointToPixel(op.endPos);
			if (endPos.x != startPos.x) {
				let tan = (endPos.y - startPos.y) / (endPos.x - startPos.x),
					atan = Math.atan(tan);
				deg = (atan * 360) / (2 * Math.PI);
				if (endPos.x < startPos.x) {
					deg = -deg + 90 + 90;
				} else {
					deg = -deg;
				}
				deg = -deg;
			} else {
				let disy = endPos.y - startPos.y;
				let bias = 0;
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
		addMarker: function (options, callback) {
			let op = $.extend({}, $.bmap.config.addMarker, options);

			let myIcon = new BMap.Icon(op.iconUrl, new BMap.Size(op.iconWidth, op.iconHeight), {
				// 指定定位位置。图标中央下端的尖角位置。
				anchor: op.anchor || new BMap.Size(op.iconWidth / 2, op.iconHeight),
				// 图标所用的图片的大小，此功能的作用等同于CSS中的background-size属性。可用于实现高清屏的高清效果
				imageSize: op.imageSize || new BMap.Size(op.iconWidth, op.iconHeight),
				// 设置图片偏移。当您需要从一幅较大的图片中截取某部分作为标注图标时，您需要指定大图的偏移位置，此做法与css sprites技术类似。
				imageOffset: new BMap.Size(op.imageOffsetLeft, op.imageOffsetTop)
			});

			// 创建标注对象并添加到地图
			let marker = new BMap.Marker(op.point, { icon: myIcon });
			op.map.addOverlay(marker);

			if (callback) {
				callback(marker);
			}

			return marker;
		},

		apInfoWindow: function (marker, item, options) {
			let op = $.extend(
				{
					frag: '<div class="InfoWindow">' + '<p>#address#</p>' + '<p>经度：#lng# &nbsp;&nbsp; 纬度：#lat#</p>' + '</div>',
					showStatus: true,
					showCount: true,
					showTime: false
				},
				options
			);

			let content = op.frag
				.replaceAll('#address#', item.address ? '地址：' + item.address : '')
				.replaceAll('#lng#', item.lng)
				.replaceAll('#lat#', item.lat);

			let infoOpt = {
				title: '<h2 class="InfoWindowTitle">名称：' + item.name + '</h2>'
			};
			let infoWindow = new BMap.InfoWindow("<div class='InfoWindow'>" + content + '</div>', infoOpt);
			marker.addEventListener('click', function () {
				this.openInfoWindow(infoWindow);
			});
		}
	};
})(dwz);

$.fn.extend({
	suggestMap: function (options) {
		let op = $.extend({ location: '金华市', lng: 'lng', lat: 'lat' }, options);

		return this.each(function () {
			let $input = $(this),
				defaultVal = $input.val(),
				$form = $input.parentsUntil(function () {
					return $(this).is('form');
				}),
				form = $form.get(0);

			//建立一个自动完成的对象
			let ac = new BMap.Autocomplete({
				input: this,
				location: op.location,
				onSearchComplete: function (e) {
					console.log(e);
				}
			});

			if (defaultVal) {
				ac.setInputValue(defaultVal);
			}

			let localSearch = new BMap.LocalSearch(op.location);
			localSearch.setSearchCompleteCallback(function (searchResult) {
				if (searchResult) {
					let poi = searchResult.getPoi(0);

					//alert("经度：" + poi.point.lng + "\n纬度：" + poi.point.lat);

					if (poi) {
						$input.attr('data-keyword', searchResult.keyword);
						form[op.lng].value = poi.point.lng;
						form[op.lat].value = poi.point.lat;

						ac.hide(); // 隐藏地址列表
					}
				}
			});

			// ac.addEventListener("onhighlight", function(e) {});

			ac.addEventListener('onconfirm', function (e) {
				//鼠标点击下拉列表后的事件
				let _value = e.item.value,
					// myValue = _value.district +  _value.street +  _value.business;
					myValue = _value.street + _value.business;

				$input.val(myValue);
				localSearch.search(myValue);
			});

			$input.on('keyup', function () {
				let keyword = $input.attr('data-keyword');
				if (keyword && $input.val().indexOf(keyword) < 0) {
					form[op.lng].value = '';
					form[op.lat].value = '';
				}
			});
		});
	}
});
