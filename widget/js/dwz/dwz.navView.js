/**
 * @author 张慧华 <350863780@qq.com>
 */

$.navView = {
	config: {
		zIndexStart: 100,
		idStart: 'nav-view-',
		frag: `<div id="#boxId#" class="nav-view view-container box-shadow unitBox" style="display: none; z-index:#zIndex#">
			<main>
				<header>
					<div class="toolbar">
						<a class="bar-button back-button"><i class="dwz-icon-arrow-left"></i></a>
						<div class="header-title">#page_title#</div>
					</div>
				</header>
				<section></section>
			</main>
        </div>`
	},
	$list: [],

	init(options) {
		$.extend($.navView.config, options);
	},

	/**
	 *
	 * interceptor：拦截器如果存在，并返回false时open失效
	 * callback：回调函数如果存在，加载完页面执行回调函数，回调函数中$box.html(html).initUI();
	 *
	 */
	open(options) {
		let op = $.extend(
				{
					boxId: '',
					rel: '_blank',
					wipeClose: false,
					history: true,
					page_title: '', // 配制external使用
					external: false,
					type: 'GET',
					url: '',
					data: {},
					interceptor: null,
					callback: null
				},
				options
			),
			boxId = op.boxId || $.navView.config.idStart + op.rel,
			zIndex = $.navView.config.zIndexStart + $.navView.$list.length;
		let $box = $('#' + boxId);

		if (!op.interceptor) {
			op.interceptor = dwz.getUrlInterceptor(op.url);
		}
		// 拦截器，用于验证登入跳转和绑定跳转等
		if (op.interceptor && op.interceptor.call($box, op.url, op.data) === false) {
			return false;
		}

		let isTopBox = false,
			size = this.$list.length;
		if (size > 0 && $box.size() > 0) {
			let $current = this.$list[size - 1];

			isTopBox = $box.get(0) === $current.get(0);
		}

		if ($box.size() == 0) {
			let page_title = op.page_title ? decodeURI(op.page_title) : '';
			$('body').append($.navView.config.frag.replaceAll('#boxId#', boxId).replaceAll('#zIndex#', zIndex).replaceAll('#page_title#', page_title));

			$box = $('#' + boxId).initUI();

			// 支持向右滑动返回
			if (op.wipeClose) {
				$box.touchwipe({
					wipeRight(event, pos) {
						$.navView.close();
					},
					min_move_x: 100
				});
			}

			this.$list.push($box);
		}

		if (!isTopBox) {
			// rel相同放到$list最后面
			let $list = this.$list,
				$last = $list[size - 1];
			if (size > 0 && $box.get(0) !== $list[size - 1].get(0)) {
				for (let index = 0; index < size - 1; index++) {
					if ($box.get(0) === $list[index].get(0)) {
						$list[index] = $last;
						$list[size - 1] = $box;
					}
				}

				//初始化z-index
				for (let index = 0; index < size; index++) {
					$list[index].css({ 'z-index': $.navView.config.zIndexStart + index });
				}
			}

			$box.show().translateX(document.documentElement.clientWidth + 'px');
			setTimeout(function () {
				$box.translateX('0px', 500, 'ease');
			}, 200);
		}

		if (op.url) {
			// 缓存请求数据，用于reload
			$box.data('dwz-params', {
				external: op.external,
				url: op.url,
				data: op.data,
				type: op.type
			});

			let _data = $.extend(op.url.getParams(), op.data);
			// 用于navViewAjaxDone判断页面是否重新加载
			if (_data.ajaxDoneReload) {
				$box.data('ajaxDoneReload', 1);
			}

			if (op.external || op.url.isUrl()) {
				op.url = decodeURI(op.url);
				this.loadExternal(op.url);
			} else {
				$.ajax({
					type: op.type,
					url: op.url,
					data: op.data,
					success: (html) => {
						$box.triggerPageClear();

						if (!op.callback) {
							op.callback = dwz.getUrlCallback(op.url);
						}

						const tpl = $.templateWrap(html);
						if (op.callback) {
							op.callback.call($box, tpl, _data);
						} else {
							$box.html(html).initUI();
							$.execHelperFn($box, tpl, _data);
						}
					},
					error: dwz.ajaxError
				});
			}

			let hash = 'navView;' + op.rel + ';' + op.url;
			if ($.history && op.history)
				$.history.add(
					hash,
					function (url) {
						if ($.dialog && $.dialog.isOpen) {
							$.dialog.close({ popHistory: false });
						} else {
							$.navView.close(true, false);
							// $.navView.open({ url: url, rel: op.rel, history: false });
						}
					},
					op.url
				);
		}
	},
	reload(options) {
		let $box = this.$list[this.$list.length - 1];
		let op = $.extend({ boxId: $box.attr('id'), history: false }, $box.data('dwz-params'), options);
		this.open(op);
	},
	loadExternal(url) {
		let $box = this.$list[this.$list.length - 1];
		let $content = $box.find('main>section');
		$content.html($.config.frag.external.replaceAll('{url}', url));
	},
	close(popHistory = true, local = true) {
		let size = this.$list.length;
		if (size <= 0) return;

		let $box = this.$list[size - 1];
		this.$list.pop();

		if ($.history && popHistory) {
			$.history.pop(local);
		}

		$box.animate({ x: document.documentElement.clientWidth }, 500, 'ease', function () {
			$box.triggerPageClear();
			$box.remove();
		});
	},
	closeByRel(rel) {
		let boxData = this._getBoxData(rel);
		if (boxData.$box) {
			$.navView.$list.splice(boxData.index, 1);
			boxData.$box.remove();
		}
	},
	_getBoxData(rel) {
		let boxData = { $box: null, index: -1 };
		if (this.$list.length && rel) {
			let $box = $('#' + $.navView.config.idStart + rel);
			if ($box.size()) {
				this.$list.forEach(function ($item, index) {
					if ($item.get(0) === $box.get(0)) {
						boxData = { $box: $item, index: index };
						return;
					}
				});
			}
		}
		return boxData;
	},
	getBox(rel) {
		if (rel) {
			this._getBoxData(rel).$box;
		}
		return this.$list.length ? this.$list[this.$list.length - 1] : null;
	},
	getBoxs(level) {
		level = !level ? 1 : level;
		let $boxs = [];

		for (let index = 1; index <= this.$list.length && index <= level; index++) {
			$boxs.push(this.$list[this.$list.length - index]);
		}
		return $boxs;
	}
};
