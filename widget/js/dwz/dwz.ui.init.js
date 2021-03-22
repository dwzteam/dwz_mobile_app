/**
 * @author 张慧华 <350863780@qq.com>
 * DWZ Mobile Framework: UI plugins
 */

(function ($) {
	$.ui = {
		/**
		 *  media 定义html根节点font-size, 用于rem
		 */
		screenChange() {
			let op = {
				width: document.documentElement.clientWidth,
				height: document.documentElement.clientHeight
			};
			let $body = $('body');
			let firstSize = $body.data('screen-size');
			if (!firstSize) {
				$body.data('screen-size', op);
			}

			// 处理安卓键盘弹出触发resize时，界面字体变小问题
			if (!window.api || !firstSize || firstSize.width + firstSize.height == op.width + op.height) {
				let landscape = op.width > op.height;
				let width = landscape ? op.width : op.height;
				document.documentElement.style.fontSize = (width * 75) / 750 + 'px';

				if (landscape) {
					$body.addClass('landscape');
				} else {
					$body.removeClass('landscape');
				}
			}
		},
		/**
		 * document 加载完成调用
		 */
		init() {
			$.ui.screenChange();
			window.addEventListener(
				'resize',
				() => {
					$.ui.screenChange();

					// 处理窗口 resize、横竖屏切换 适配
					$('div.dwz-slide, div.slide').trigger('slide-resize');
					$('div.nav-view').trigger('window-resize');
				},
				false
			);

			let ajaxbg = $('#progressBar').hide();
			$(document)
				.on('ajaxStart', () => {
					ajaxbg.show();
				})
				.on('ajaxStop', () => {
					ajaxbg.hide();
				});
		}
	};

	$.regPlugins.push(($p) => {
		if ($.fn.slide)
			$('div.dwz-slide', $p).each(function () {
				let $box = $(this);
				$box.slide({
					currentIndex: parseInt($box.attr('data-open-index')) || 0,
					autoCss: false,
					autoPlay: $box.attr('data-auto-play') == 'false' ? false : true,
					loop: $box.attr('data-loop') == 'false' ? false : true,
					zoom: $box.attr('data-zoom') == 'true' ? true : false
				});
			});

		if ($.navTab) {
			$('a[target=navTab]', $p)
				.touchwipe({
					touch(event) {
						let $link = $(this),
							url = $link.attr('data-href');
						$.navTab.open({
							tabid: $link.attr('rel'),
							url: url
						});
						event.preventDefault();
					}
				})
				.hrefFix();
		}

		if ($.navView) {
			$('a[target=navView], li[target=navView]', $p)
				.touchwipe({
					touch(event) {
						let $link = $(this),
							url = $link.attr('data-href');
						$.navView.open({
							url: url,
							rel: $link.attr('rel') || '_blank',
							external: $link.attr('data-external') || false,
							title: $link.attr('title') || ''
						});
						event.stopPropagation();
					}
				})
				.hrefFix();

			$('div.nav-view .back-button', $p).click(function (event) {
				$.navView.close();
				// event.stopPropagation();
			});
		}

		if ($.dialog) {
			$('a[target=dialog], li[target=dialog]', $p)
				.click(function (event) {
					let $link = $(this);
					$.dialog.open({
						url: $link.attr('data-href'),
						pop: $link.attr('data-pop') || 'fullscreen',
						external: $link.attr('data-external') || false
					});
					event.stopPropagation();
				})
				.hrefFix();

			$('img[target=dialog], a[target=dialog-pic]', $p).click(function (event) {
				let $img = $(this);
				$.dialog.open({
					url: $img.attr('data-href'),
					pop: 'pic',
					data: { src: $img.attr('data-src') || $img.attr('src') }
				});
				event.stopPropagation();
			});

			$('#dialog .pop-down-close, #dialog .back-button', $p).click(function (event) {
				$.dialog.close();
				event.stopPropagation();
			});
		}

		if ($.alert) {
			$('a[target=alertDialog]', $p)
				.click(function (event) {
					let $link = $(this);
					$.alert.prompt($link.attr('data-href'));
					event.stopPropagation();
				})
				.hrefFix();

			$('#alertMsgBox .close', $p).click(function (event) {
				$.alert.close();
				event.preventDefault();
			});

			$('#alertPromptBox .close', $p).click(function (event) {
				$.alert.close('prompt');
				event.preventDefault();
			});
		}

		if ($.fn.tabs) {
			$('div.dwz-tabs', $p).each(function () {
				let $this = $(this);
				$this.tabs({ currentIndex: $this.attr('data-open-index') || 0 });
			});
		}

		if ($.fn.panel) {
			$('div.dwz-panel.dwz-collapse', $p).panel();
		}

		if ($.fn.toggleSelectRef) {
			$('select.toggleSelectRef', $p).each(function () {
				let $this = $(this).toggleSelectRef();
			});
		}

		// 列表页面左滑出现删除按钮
		$('.dwz-open-right', $p).touchOpenRight();

		$('input.dwz-disable-autofocus', $p).disableAutofocus();

		// 长按粘贴
		if ($.fn.clipboardTip) {
			$('input.dwz-clipboard, textarea.dwz-clipboard', $p).clipboardTip();
		}

		// 日期选择器
		if ($.fn.calendar) {
			$('input.dwz-calendar', $p).calendar();
		}

		// 处理必填元素label加红色星号
		$('input.required, select.required, textarea.required, ul.upload-preview.required', $p).each((index, elem) => {
			$(elem).parentsUnitBox('form-item').find(':scope > label, :scope > .item-content > label').addClass('required');
		});

		// 密码显示隐藏
		$('div.dwz-ctl-eye', $p).each(function () {
			let $me = $(this),
				$input = $me.find('input[type=text], input[type=password]'),
				$icon = $me.find('.icon-eye');

			$icon.click(() => {
				if ($icon.hasClass('eye-open')) {
					$icon.removeClass('eye-open');
					$input.attr('type', 'password');
				} else {
					$icon.addClass('eye-open');
					$input.attr('type', 'text');
				}
			});
		});

		$('.dwz-ctl-hover, header .bar-button, .button, .item-right', $p).hoverClass('hover');
		$('input[data-checkbox-radio]', $p).checkboxRadio();
		$('a[target=ajaxTodo]', $p).ajaxTodo('active');

		if ($.fn.previewUploadImg)
			$('div.upload-wrap', $p).each(function () {
				let $this = $(this);
				let options = {
					maxW: 70,
					maxH: 70,
					inputName: $this.attr('data-name') || 'pics[]'
				};

				let maxCount = $this.attr('data-max-count');
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
})(dwz);
