/**
 * Created by zhanghuihua on 2016/12/19.
 */

$.navView = {
	config: {
		zIndexStart: 100,
		idStart: 'nav-view-',
		frag: '<div id="#boxId#" class="nav-view view-container pane box-shadow unitBox" style="display: none; z-index:#zIndex#">\
            <header>\
                <div class="toolbar">\
                    <a class="bar-button back-button"><i class="icon icon-back"></i></a>\
                </div>\
            </header>\
            <div class="content"></div>\
        </div>'
	},
	$list: [],

	init: function (options) {
		$.extend($.navView.config, options);
	},

	/**
	 *
	 * interceptor：拦截器如果存在，并返回false时open失效
	 * callback：回调函数如果存在，加载完页面执行回调函数，回调函数中$box.html(html).initUI();
	 *
	 */
	open: function (options) {
		var op = $.extend({boxId: '', rel: '_blank', wipeClose: false, history: true, external: false, type: 'GET', url: '', data: {}, interceptor: null, callback: null}, options),
			boxId = op.boxId || $.navView.config.idStart + op.rel,
			zIndex = $.navView.config.zIndexStart + $.navView.$list.length;
		var $box = $('#' + boxId);

		if (!op.interceptor) {
			op.interceptor = dwz.getUrlInterceptor(op.url);
		}
		// 拦截器，用于验证登入跳转和绑定跳转等
		if (op.interceptor && op.interceptor.call($box, op.url, op.data) === false) {
			return false;
		}

		var isTopBox = false,
			size = this.$list.length;
		if (size > 0 && $box.size() > 0) {
			var $current = this.$list[size - 1];

			isTopBox = $box.get(0) === $current.get(0);
		}

		if ($box.size() == 0) {
			$('body').append($.navView.config.frag.replaceAll('#boxId#', boxId).replaceAll('#zIndex#', zIndex));

			$box = $('#' + boxId).initUI();

			// 支持向右滑动返回
			if (op.wipeClose) {
				$box.touchwipe({
					wipeRight: function (event, pos) {
						$.navView.close(true, true);
					},
					min_move_x: 100
				});
			}

			this.$list.push($box);
		}

		if (!isTopBox) {
			// rel相同放到$list最后面
			var $list = this.$list,
				$last = $list[size - 1];
			if (size > 0 && $box.get(0) !== $list[size - 1].get(0)) {
				for (var index = 0; index < size - 1; index++) {
					if ($box.get(0) === $list[index].get(0)) {
						$list[index] = $last;
						$list[size - 1] = $box;
					}
				}

				//初始化z-index
				for (var index = 0; index < size; index++) {
					$list[index].css({'z-index': $.navView.config.zIndexStart + index});
				}
			}

			$box.show().translateX(document.documentElement.clientWidth + 'px');
			setTimeout(function () {
				$box.translateX('0px', 500, 'ease');
			}, 200);
		}

		if (op.url) {
			// 缓存请求数据，用于reload
			$box.data('dwz-params', {external: op.external, url: op.url, data: op.data, type: op.type});

			var _data = $.extend(op.url.getParams(), op.data);
			// 用于navViewAjaxDone判断页面是否重新加载
			if (_data.ajaxDoneReload) {
				$box.data('ajaxDoneReload', 1);
			}

			if (op.external) {
				this.loadExternal(op.url);
				return;
			}

			$.ajax({
				type: op.type,
				url: op.url,
				data: _data,
				success: function (html) {
					$box.triggerPageClear();

					if (!op.callback) {
						op.callback = dwz.getUrlCallback(op.url);
					}

					if (op.callback) {
						op.callback.call($box, html, _data);
					} else {
						$box.html(html).initUI();
					}
				},
				error: dwz.ajaxError
			});

			var hash = 'navView;' + op.rel + ';' + op.url;
			if ($.history && op.history) $.history.add(hash, function (url) {
				if ($.dialog && $.dialog.isOpen) {
					$.dialog.close({popHistory: false});
				} else {
					$.navView.close(true);
					$.navView.open({url: url, rel: op.rel, history: false});
				}
			}, op.url);
		}

	},
	reload: function (options) {
		var $box = this.$list[this.$list.length - 1];
		var op = $.extend({boxId: $box.attr('id'), history: false}, $box.data('dwz-params'), options);
		this.open(op);
	},
	loadExternal: function (url) {
		var $box = this.$list[this.$list.length - 1];

		var $content = $box.find('.content');
		var ih = $content.get(0).offsetHeight;
		$content.html($.config.frag["external"].replaceAll("{url}", url).replaceAll("{{height}}", ih + "px"));
	},
	close: function (popHistory, local) {
		var size = this.$list.length;
		if (size <= 0) return;

		var $box = this.$list[size - 1];
		this.$list.pop();

		if ($.history && popHistory) {
			$.history.pop(local);
		}

		$box.animate({x: document.documentElement.clientWidth}, 500, 'ease', function () {
			$box.triggerPageClear();
			$box.remove();
		});
	},
	closeByRel: function (rel) {
		var boxData = this._getBoxData(rel);
		if (boxData.$box) {
			$.navView.$list.splice(boxData.index, 1);
			boxData.$box.remove();
		}
	},
	_getBoxData: function (rel) {
		var boxData = {$box: null, index: -1};
		if (this.$list.length && rel) {
			var $box = $('#' + $.navView.config.idStart + rel);
			if ($box.size()) {
				this.$list.forEach(function ($item, index) {
					if ($item.get(0) === $box.get(0)) {
						boxData = {$box: $item, index: index};
						return;
					}
				});
			}
		}
		return boxData;
	},
	getBox: function (rel) {
		if (rel) {
			this._getBoxData(rel).$box;
		}
		return this.$list.length ? this.$list[this.$list.length - 1] : null;
	},
	getBoxs: function (level) {
		level = !level ? 1 : level;
		var $boxs = [];

		for (var index = 1; index <= this.$list.length && index <= level; index++) {
			$boxs.push(this.$list[this.$list.length - index]);
		}
		return $boxs;
	}
};
