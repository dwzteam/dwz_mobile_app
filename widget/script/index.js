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
		'js/dwz/dwz.regional.zh.js',
		'js/dwz/dwz.ui.js',
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
	};

	document.addEventListener('DOMContentLoaded', function () {
		$.extend($.config, {
			pageInfo: { pageNum: 'pageNum' },
			statusCode: { ok: 1, error: 0, timeout: 301 },
			keys: { statusCode: 'status', message: 'info' }
		});

		$.dialog.init();
		initUserInfo(); // 用户信息初始化

		$.navTab.init({ openIndex: 0 });
		$.navView.init();
		$.filterPanel.init();

		//插件注册
		$.regPlugins.push(function ($p) {
			biz.fixStatusBar($p);

			$('li.item, a.grids-grid, .button, .dwz-ctl-hover', $p).hoverClass('hover');
			$('input[data-checkbox-radio]', $p).checkboxRadio();
			$('a[target=ajaxTodo]', $p).ajaxTodo('active');

			if ($.fn.previewUploadImg)
				$('div.upload-wrap', $p).each(function () {
					var $this = $(this);
					var options = {
						maxW: 70,
						maxH: 70,
						inputName: $this.attr('data-name') || 'pics[]'
					};

					var maxCount = $this.attr('data-max-count');
					if (maxCount) {
						options.maxCount = parseInt(maxCount);
					}
					$this.previewUploadImg(options);
				});

			if ($.fn.previewImg) $('ul.dwz-preview-img, ul.upload-preview', $p).previewImg();

			if ($.fn.dropdown) $('div.dwz-dropdown', $p).dropdown();

			// fix A链接href手机上不能跳转问题
			if ($.fn.redirect) $('a[target=redirect]', $p).redirect();

			// 发送手机验证码
			if ($.fn.sendVerifyMs) $('a[target=sendVerifyMs]', $p).sendVerifyMs();
			if ($.fn.fleshVerifyImg) $('img.fleshVerifyImg', $p).fleshVerifyImg();

			$('div.dwz-scroll', $p).scroll();
			$('div.dwz-scroll-x', $p).scroll({
				scrollX: true,
				scrollY: false,
				scroll$: '.scroll-x'
			});
		});

		//插件初始化
		$(document).initUI();

		var ajaxbg = $('#progressBar').hide();
		$(document)
			.on('ajaxStart', function () {
				ajaxbg.show();
			})
			.on('ajaxStop', function () {
				ajaxbg.hide();
			});

		if ($.history)
			$.history.init(function (hash) {
				//浏览器刷新监测地址栏, 根据hash定位
				if (hash) {
					var args = hash.split(';');
					if (args.length == 2) {
						$.navTab.open({ tabid: args[0], url: args[1] });
					} else if (args.length == 3) {
						$.navView.open({ url: args[2], rel: args[1] });
					}
				}
			});
	});

	document.addEventListener(
		'touchmove',
		function (event) {
			dwz.speed.cal(event); // 计算加速度
			event.preventDefault(); //阻止默认的处理方式(阻止下拉滑动的效果)
		},
		{ passive: false }
	); //passive 参数不能省略，用来兼容ios和android

	// 处理窗口resize适配
	window.onresize = function () {
		$('div.dwz-slide').trigger('slide-resize');
		$('div.nav-view').trigger('window-resize');
	};
}

// 用于gulpfile.js编译js
if (typeof module === 'object' && module.exports) {
	module.exports = js_src;
}
