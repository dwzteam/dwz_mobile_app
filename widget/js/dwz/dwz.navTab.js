/**
 * @author 张慧华 <350863780@qq.com>
 */

$.navTab = {
	config: {
		box$: '#nav-tab',
		items$: '#nav-tab > .tab-bar > [tabid]',
		contents$: '#nav-tab > .tab-panel > .panel-item',
		activeClass: 'active',
		cachedClass: 'cached',
		openIndex: -1
	},
	$box: null,
	_currentIndex: 0,

	init(options) {
		let op = $.extend($.navTab.config, options);

		this.$box = $($.navTab.config.box$);
		this.getTabs().each(function (index) {
			let $tabItem = $(this).hrefFix(),
				href = $tabItem.attr('data-href'),
				url = href && href.startsWith('#') ? '' : href;

			$tabItem.click({ index: index, tabid: $tabItem.attr('tabid'), url: url }, function (event) {
				let args = event.data;
				args.loaded = $tabItem.attr('data-loaded') && $tabItem.attr('data-cache') == 'true'; //navTab页面缓存
				$.navTab.open(args);

				event.preventDefault();
			});
		});

		if (op.openIndex >= 0) {
			$.navTab._open(op.openIndex);

			// 加载openIndex页面
			let hash = location.hash;
			if (!hash || hash.split(';').length === 3) {
				// 没有hash 或者是navView
				let $tabItem = this.getTabs().eq(op.openIndex),
					href = $tabItem.attr('data-href'),
					url = href && href.startsWith('#') ? '' : href;

				$.navTab.open({
					index: op.openIndex,
					tabid: $tabItem.attr('tabid'),
					url: url
				});
			}
		}

		// navTab禁用浏览器历史记录，绑定事件处理空hash时关闭navView
		if (!op.history) {
			$(window).on('hash.empty', function (event) {
				if ($.dialog && $.dialog.isOpen) {
					$.dialog.close();
				} else {
					if ($.navView) $.navView.close(false);
				}
			});
		}
	},
	getBox() {
		return this.getPanels().eq(this._currentIndex);
	},
	_open(index) {
		let op = $.navTab.config,
			$items = this.getTabs(),
			$contents = this.getPanels();

		for (let i = 0; i < $items.size(); i++) {
			if (i == index) {
				$items.eq(i).addClass(op.activeClass).removeClass(op.cachedClass);
				$contents.eq(i).addClass(op.activeClass).removeClass(op.cachedClass);
			} else {
				$items.eq(i).addClass(op.cachedClass).removeClass(op.activeClass);
				$contents.eq(i).addClass(op.cachedClass).removeClass(op.activeClass);
			}
		}

		this._currentIndex = index;
	},
	/**
	 * interceptor：拦截器如果存在，并返回false时open失效
	 * callback：回调函数如果存在，加载完页面执行回调函数，回调函数中$panel.html(html).initUI();
	 * @param args {tabid:'', index:-1, external:false, type:'GET', url:'', data:{}, interceptor: function(){}, callback: function(){}}
	 */
	open(args) {
		let index = args.index >= 0 ? args.index : this._indexTabId(args.tabid);

		if (-1 == index) return;

		if (!args.interceptor) {
			args.interceptor = dwz.getUrlInterceptor(args.url);
		}
		// 拦截器，用于验证登入跳转和绑定跳转等
		if (args.interceptor && args.interceptor.call(this.getPanels(index), args.url) === false) {
			return false;
		}

		if (this._currentIndex != index) {
			this._open(index);
		}

		if (args.url) {
			if (!args.loaded) this.load(args);

			if (args.history && $.history && args.tabid) {
				setTimeout(function () {
					let hash = args.tabid + ';' + args.url;
					$.history.add(
						hash,
						function (args) {
							$.navTab.open(args);
						},
						{ index: index, url: args.url, loaded: true }
					); //tabid这里不能写，否则可能死循环
				}, 10);
			}
		}

		if ($.dialog && $.dialog.isOpen) {
			$.dialog.close();
		} else {
			if ($.navView) $.navView.close(false);
		}
	},
	/**
	 * 加载页面
	 * @param args {tabid:'', index:-1, external:false, type:'GET', url:'', data:{}, callback: function(){}}
	 */
	load(args) {
		let op = $.extend(
				{
					type: 'GET',
					external: false,
					url: '',
					data: {},
					callback: null
				},
				args
			),
			openIndex = op.index >= 0 ? op.index : this._indexTabId(op.tabid),
			$panel = this.getPanels().eq(openIndex),
			$tabItem = this.getTabs().eq(openIndex);

		if (op.external) {
			this.loadExternal(op.url);
			return;
		}

		let params = $.extend(op.url.getParams(), op.data);
		$.ajax({
			type: op.type,
			url: op.url,
			data: op.data,
			success: (html) => {
				$panel.triggerPageClear();

				if (!op.callback) {
					op.callback = dwz.getUrlCallback(op.url);
				}

				const tpl = $.templateWrap(html);
				if (op.callback) {
					op.callback.call($panel, tpl, params);
				} else {
					$panel.html(html).initUI();
					$.execHelperFn($panel, tpl, params);
				}

				$tabItem.attr('data-loaded', 1); //navTab页面缓存
			},
			error: dwz.ajaxError
		});
	},
	/**
	 * 重新加载当前页面
	 * @param {*} url
	 */
	reload(url) {
		if (!url) {
			url = this.getTabs().eq(this._currentIndex).attr('data-href');
		}
		this.load({ index: this._currentIndex, url: url });
	},
	/**
	 * 清除缓存并重新加载页面
	 */
	clearCache() {
		this.getTabs().each((index, item) => $(item).removeAttr('data-loaded'));
		this.reload();
	},
	/**
	 * 加载外部页面
	 * @param {*} $panel
	 * @param {*} url
	 */
	loadExternal($panel, url) {
		$panel.html($.config.frag.external.replaceAll('{url}', url));
	},
	_indexTabId(tabid) {
		if (!tabid) return -1;
		let iOpenIndex = -1;
		this.getTabs().each((index, item) => {
			if ($(item).attr('tabid') == tabid) {
				iOpenIndex = index;
				return;
			}
		});
		return iOpenIndex;
	},
	getTabs() {
		return this.$box.find(this.config.items$);
	},
	getPanels() {
		return this.$box.find(this.config.contents$);
	}
};
