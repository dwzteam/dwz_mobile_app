var js_src = {
	public: ['script/template-web.js'],
	dev: [
		'js/dwz/dwz.core.js',
		'js/dwz/dwz.md5.js',
		'js/dwz/dwz.util.date.js',
		'js/dwz/dwz.apicloud.js',
		'js/dwz/dwz.history.js',
		'js/dwz/dwz.touchwipe.js',
		'js/dwz/dwz.effect.js',
		'js/dwz/dwz.ajax.js',
		'js/dwz/dwz.alert.js',
		'js/dwz/dwz.actionSheet.js',
		'js/dwz/dwz.inputTip.js',
		'js/dwz/dwz.calendar.js',
		'js/dwz/dwz.scroll.js',
		'js/dwz/dwz.list.js',
		'js/dwz/dwz.navTab.js',
		'js/dwz/dwz.navView.js',
		'js/dwz/dwz.dialog.js',
		'js/dwz/dwz.panel.js',
		'js/dwz/dwz.tabs.js',
		'js/dwz/dwz.slide.js',
		'js/dwz/dwz.slideTab.js',
		'js/dwz/dwz.filterSelect.js',
		'js/dwz/dwz.filterPanel.js',
		'js/dwz/dwz.croppic.js',
		'js/dwz/dwz.gps.js',
		// 'js/dwz/dwz.amap.js',
		'js/dwz/dwz.bmap.js',
		'js/dwz/dwz.brush.js',
		'js/dwz/dwz.widget.js',
		'js/dwz/dwz.widget.chart.js',
		'js/dwz/dwz.regional.zh.js',
		'js/dwz/dwz.ui.js',
		'js/dwz/dwz.ui.init.js',
		'js/biz.conf.js',
		'js/biz.store.js',
		'js/biz.common.js',
		'js/biz.helper.js',
		'js/biz.user.js',
		'js/biz.home.js',
		'js/biz.announce.js',
		'js/biz.transport.js',
		'js/biz.message.js',
		'js/biz.favorite.js',
		'js/biz.my.js',
		'js/biz.baiduFace.js'
	],
	build: ['script/all.min.js']
};

function loadScripts(options) {
	var BASE_URL = (options && options.BASE_URL) || './';
	var op = {
		env: (options && options.env) || 'dev', // env: dev, build
		iframe: (options && options.iframe) || false // 是否iframe嵌入的页面
	};

	js_src['public'].forEach(function (path) {
		document.write('<script type="text/javascript" src="' + BASE_URL + path + '"></script>');
	});

	js_src[op.env].forEach(function (path) {
		document.write('<script type="text/javascript" src="' + BASE_URL + path + '"></script>');
	});

	apiready = function () {
		biz.safeAreaTop = api.safeArea.top;
		biz.fixStatusBar($(document));

		api.setStatusBarStyle({
			style: 'dark'
		});

		// config.xml index.html 加载方式使用
		$(window).on('hash.empty.pop', function () {
			api.confirm(
				{
					title: '退出提示',
					msg: '确定要退出程序吗？',
					buttons: ['确定', '取消']
				},
				function (ret, err) {
					if (ret.buttonIndex == 1) {
						api.closeWidget({
							id: 'A6044188768662', //填写自己的id
							retData: { name: 'closeWidget' },
							silent: true
						});
					}
				}
			);
		});

		biz.checkUpdate();

		// 默认打开权限 ['camera','contacts','microphone','photos','location','notification','calendar-r','phone-call','phone-r','sms-r','storage-r','starage-w'];
		if (api.systemType == 'android') {
			biz.initPermission(['camera', 'photos', 'location', 'storage']);
		}

		// 开启gps
		biz.startLocation();

		setTimeout(() => {
			$('body').addClass(api.systemType);
		}, 2000);
	};

	document.addEventListener('DOMContentLoaded', function () {
		$.extend($.config, {
			pageInfo: { pageNum: 'pageNum' },
			statusCode: { ok: 1, error: 0, timeout: 301 },
			keys: { statusCode: 'status', message: 'info' }
		});

		//插件注册
		$.regPlugins.push(function ($p) {
			biz.fixStatusBar($p);
		});

		$.ui.init();
		$.dialog.init();

		// 用户信息初始化
		initUserInfo(function () {
			$.navTab.init({ openIndex: 0 });
			$.navView.init();
			$.filterPanel.init();

			//插件初始化
			$(document).initUI();

			if ($.history)
				$.history.init(function (hash) {
					//浏览器刷新监测地址栏, 根据hash定位
					if (hash) {
						setTimeout(function () {
							var args = hash.split(';');
							if (args.length == 2) {
								$.navTab.open({ tabid: args[0], url: args[1] });
							} else if (args.length == 3) {
								$.navView.open({ url: args[2], rel: args[1] });
							}
						}, 2000);
					}
				});
		});
	});
}

// 用于gulpfile.js编译js
if (typeof module === 'object' && module.exports) {
	module.exports = js_src;
}
