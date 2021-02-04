/**
 * @author 张慧华 <350863780@qq.com>
 * DWZ Mobile Framework: UI plugins
 */

(function ($) {
	$.config.frag.external = '<iframe src="{url}" class="iframe-pages" frameborder="no" scrolling="auto" border="0" marginwidth="0" marginheight="0" allowfullscreen="true"></iframe>';

	dwz.regPlugins.push(function ($p) {
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
				.touchwipe({
					touch(event) {
						let $link = $(this);
						$.dialog.open({
							url: $link.attr('data-href'),
							pop: $link.attr('data-pop') || 'fullscreen'
						});
						event.stopPropagation();
					}
				})
				.hrefFix();

			$('img[target=dialog], a[target=dialog-pic]', $p).touchwipe({
				touch(event) {
					let $img = $(this);
					$.dialog.open({
						url: $img.attr('data-href'),
						pop: 'pic',
						data: { src: $img.attr('data-src') || $img.attr('src') }
					});
					event.stopPropagation();
				}
			});

			$('#dialog .pop-down-close, #dialog .back-button', $p).click(function (event) {
				$.dialog.close();
				event.stopPropagation();
			});
		}

		if ($.alert) {
			$('a[target=alertDialog]', $p)
				.touchwipe({
					touch(event) {
						let $link = $(this);
						$.alert.prompt($link.attr('data-href'));
						event.stopPropagation();
					}
				})
				.hrefFix();

			$('#alertMsgBox .close', $p).click(function (event) {
				$.alert.close();
				event.preventDefault();
			});

			$('#alertDialogBox .close', $p).click(function (event) {
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

		// 处理必填元素label加红色星号
		$('input.required, select.required, textarea.required', $p).each((index, elem) => {
			$(elem).parentsUnitBox('form-item').find(':scope > label, :scope > .item-content > label').addClass('required');
		});
	});

	$.fn.extend({
		disableAutofocus() {
			return this.each(function () {
				let $input = $(this);
				$input.attr('readonly', 'readonly');
				setTimeout(function () {
					$input.removeAttr('readonly');
				}, 600);
			});
		},
		redirect() {
			return this.each(function () {
				$(this).touchwipe({
					touch(event) {
						let href = $(this).attr('href');
						if (href) window.location = href;
						event.preventDefault();
					}
				});
			});
		},
		hoverClass(className = 'hover') {
			return this.each(function () {
				let $this = $(this);

				if ($.event.hasTouch) {
					$this.attr('ontouchstart', `$(this).addClass('${className}')`);
					$this.attr('ontouchend', `$(this).removeClass('${className}')`);
				} else {
					$this.attr('onmousedown', `$(this).addClass('${className}')`);
					$this.attr('onmouseup', `$(this).removeClass('${className}')`);
					$this.attr('onmouseout', `$(this).removeClass('${className}')`);
				}
			});
		},
		touchOpenRight(option) {
			let op = $.extend({
				ctlClass: 'dwz-open-right',
				openClass: 'open-right'
			});

			return this.each(function () {
				let $this = $(this),
					$parent = $this.parent();

				$this.touchwipe({
					wipeLeft() {
						$parent.find('.' + op.ctlClass).removeClass(op.openClass);
						$this.addClass(op.openClass);
					},
					wipeRight() {
						$this.removeClass(op.openClass);
					}
				});

				if (!$parent.attr('data-' + op.openClass)) {
					$parent.attr('data-' + op.openClass, 1).touchwipe({
						touch: () => {
							setTimeout(() => {
								$parent.find('.' + op.ctlClass).removeClass(op.openClass);
							}, 500);
						}
					});
				}
			});
		},

		checkboxRadio() {
			return this.each(function () {
				let $this = $(this),
					parent$ = $this.attr('data-checkbox-radio') || 'form',
					name = $this.attr('name');

				$this.on('change', function (event) {
					if (this.checked) {
						let $parent = $this.parentsUntil(function () {
							return $(this).is(parent$);
						});

						$parent.find('input[name=' + name + ']').each(function () {
							if (event.target !== this) this.checked = false;
						});
					}
				});
			});
		},

		/**
		 * ref: 控制多个box使用|分隔
		 * refVal: 控制多个box使用"|"分隔；每个box控制多个value使用","分隔
		 * ctrShow: 默认false控制隐藏，为true时控制显示
		 * @param options
		 * @returns {*}
		 */
		toggleSelectRef(options) {
			let op = $.extend(
				{
					ref: 'data-ref-box',
					refVal: 'data-ref-val',
					ctrHide: 'data-ctr-hide'
				},
				options
			);
			return this.each(function () {
				let $select = $(this);

				function _checkRefHide(refVal, ctrHide) {
					let val = $select.val();

					if (!ctrHide) {
						if (val == refVal) return false;
						if (refVal) {
							let aTmp = refVal.split(',');
							for (let i = 0; i < aTmp.length; i++) {
								if (val == aTmp[i]) return false;
							}
						}

						return true;
					} else {
						if (!val || val == refVal) return true;
						if (refVal) {
							let aTmp = refVal.split(',');
							for (let i = 0; i < aTmp.length; i++) {
								if (val == aTmp[i]) return true;
							}
						}

						return false;
					}
				}
				function _toggle($ref, refVal, ctrHide, ignoreOnly) {
					if (_checkRefHide(refVal, ctrHide)) {
						let bParentRef = false;

						$ref
							.find(':input')
							.filter(function () {
								let type = this.type;

								// Use .is( ":disabled" ) so that fieldset[disabled] works
								return this.name && !dwz(this).is(':disabled') && dwz.config.rsubmittable.test(this.nodeName) && !dwz.config.rsubmitterTypes.test(type);
							})
							.each(function () {
								let $input = $(this);
								if ($input.get(0) == $select.get(0)) {
									bParentRef = true;
								} else {
									if ($input.is(':checkbox')) $input.attr('checked', false);
								}
							});

						if (!bParentRef) {
							if (!ignoreOnly) {
								$ref.hide();
							}
							$ref.addClass('ignoreRequired').find(':input').addClass('ignore');
						}
					} else {
						$ref.show().removeClass('ignoreRequired').find(':input').removeClass('ignore');
					}
				}

				function _toggleAll() {
					let refList = $select.attr(op.ref).split('|');
					let refValList = $select.attr(op.refVal).split('|');
					let ctrHide = $select.attr(op.ctrHide) || false;
					let ignoreOnly = $select.hasClass('ignoreOnly');

					for (let i = 0; i < refList.length; i++) {
						let $ref = $(refList[i]),
							refVal = refValList[i];
						_toggle($ref, refVal, ctrHide, ignoreOnly);
					}
				}
				_toggleAll();
				$select.change(_toggleAll);
			});
		}
	});
})(dwz);
