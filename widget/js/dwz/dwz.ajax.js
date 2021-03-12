/**
 * @author 张慧华 <350863780@qq.com>
 * DWZ Mobile ajax交互封装 & 表单验证
 */
(function ($) {
	$.extend({
		ajaxError(xhr, ajaxOptions, thrownError) {
			if (xhr.status == 401) {
				$.gotoLogin();
				return;
			}
			if ($.alert) {
				$.alert.error(
					`<div>Http status: ${xhr.status} ${xhr.statusText}</div>
					<div>ajaxOptions: ${ajaxOptions}</div>
					<div>thrownError: ${thrownError}</div>
					<div>${xhr.responseText}</div>`
				);
			} else {
				alert(`Http status: ${xhr.status} ${xhr.statusText} \najaxOptions: ${ajaxOptions}\nthrownError: ${thrownError}\n${xhr.responseText}`);
			}
		},
		ajaxDone(json) {
			if (json[dwz.config.keys.statusCode] == dwz.config.statusCode.error) {
				if (json[dwz.config.keys.message]) $.alert.error(json[dwz.config.keys.message]);
			} else if (json[dwz.config.keys.statusCode] == dwz.config.statusCode.ok) {
				if (json[dwz.config.keys.message]) $.alert.success(json[dwz.config.keys.message]);

				if ('redirect' == json.callbackType && json.forwardUrl) {
					setTimeout(() => {
						window.location = json.forwardUrl;
					}, 1500);
				}
			}
		},
		isAjaxStatus(json, status) {
			return json[dwz.config.keys.statusCode] == status;
		},
		isAjaxStatusOk(json) {
			if (!$.checkAjaxLogin(json)) {
				return false;
			}
			return $.isAjaxStatus(json, $.config.statusCode.ok);
		},
		isAjaxStatusError(json) {
			return $.isAjaxStatus(json, $.config.statusCode.error);
		},
		isAjaxStatusTimeout(json) {
			return $.isAjaxStatus(json, $.config.statusCode.timeout);
		},

		gotoLogin() {
			let url = 'tpl/user/login.html?dwz_callback=loginRender';
			if (biz.checkLiveTime && !biz.checkLiveTime()) {
				url = 'tpl/user/login.html?dwz_callback=loginRender&login_no_face=1';
			}

			$.dialog.open({
				url: url,
				pop: 'fullscreen'
			});
		},
		checkAjaxLogin(json) {
			if ($.isAjaxStatusTimeout(json)) {
				$.alert.toast(json[dwz.config.keys.message]);
				$.gotoLogin();

				return false;
			}

			return true;
		},
		/**
		 * 普通ajax表单提交
		 * @param {Object} form
		 * @param {Object} callback
		 */
		validateCallback(form, callback, _data) {
			let $form = $(form);

			if (!$form.valid()) {
				return false;
			}

			let data = $form.serializeArray();
			if (_data) {
				if ($.isFunction(_data)) {
					_data = _data.call(form, $form);

					// 去除__开头字段
					data.forEach(function (item, index) {
						if (!item.name.startsWith('__')) {
							_data.push(item);
						}
					});
					data = _data;
				} else {
					data.push({ name: '_data', value: JSON.stringify(_data) });
				}
			}

			// console.log(JSON.stringify(data));

			// contentType: application/json 方式提交，防止提交json字符转义
			if ($form.attr('enctype') == 'application/json') {
				let dataMap = {};
				data.forEach(function (item) {
					dataMap[item.name] = item.value;
				});

				$.ajax({
					global: true,
					type: form.method || 'POST',
					url: $form.attr('action'),
					data: JSON.stringify(dataMap),
					dataType: 'json',
					contentType: 'application/json; charset=UTF-8',
					cache: false,
					success: callback || dwz.ajaxDone,
					error: dwz.ajaxError
				});
			} else {
				$.ajax({
					global: true,
					type: form.method || 'POST',
					url: $form.attr('action'),
					data: data,
					dataType: 'json',
					cache: false,
					success: callback || dwz.ajaxDone,
					error: dwz.ajaxError
				});
			}

			return false;
		},

		/**
		 * 带文件上传的ajax表单提交
		 * @param {Object} form
		 * @param {Object} callback
		 */
		iframeCallback(form, callback) {
			let $form = $(form),
				$iframe = $('#callbackframe');
			if (!$form.valid()) {
				return false;
			}

			if ($iframe.size() == 0) {
				$('body').append('<iframe id="callbackframe" name="callbackframe" src="about:blank" style="display:none"></iframe>');
				$iframe = $('#callbackframe');
			}

			form.target = 'callbackframe';

			$.iframeResponse($iframe, callback || dwz.ajaxDone);
		},

		iframeResponse($iframe, callback) {
			let iframe = $iframe.get(0),
				$document = $(document);

			$document.trigger('ajaxStart');

			let _onload = function (event) {
				$iframe.off('load', _onload);
				$document.trigger('ajaxStop');

				if (
					iframe.src == "javascript:'%3Chtml%3E%3C/html%3E';" || // For Safari
					iframe.src == "javascript:'<html></html>';"
				) {
					// For FF, IE
					return;
				}

				let doc = iframe.contentDocument || iframe.document;

				// fixing Opera 9.26,10.00
				if (doc.readyState && doc.readyState != 'complete') return;
				// fixing Opera 9.64
				if (doc.body && doc.body.innerHTML == 'false') return;

				let response;

				if (doc.XMLDocument) {
					// response is a xml document Internet Explorer property
					response = doc.XMLDocument;
				} else if (doc.body) {
					try {
						response = iframe.contentDocument.body.innerText;
						response = $.parseJSON(response);
					} catch (e) {
						// response is html document or plain text
						response = doc.body.innerText;
					}
				} else {
					// response is a xml document
					response = doc;
				}

				callback(response);
			};

			$iframe.on('load', _onload);
		}
	});
})(dwz);

/**
 *
 * {"statusCode":"200", "message":"操作成功", "navTabId":"", "forwardUrl":"", "callbackType":"closeCurrent"}
 * {"statusCode":"300", "message":"操作失败"}
 * {"statusCode":"301", "message":"会话超时"}
 *
 */
function navViewAjaxDone(json) {
	$.ajaxDone(json);

	if ($.isAjaxStatusOk(json)) {
		// 当前页面
		if ('closeCurrent' == json.callbackType) {
			$.navView.close();
		} else if ('forward' == json.callbackType) {
			$.navView.reload({ url: json.forwardUrl });
		}

		if (json.navTabId) {
			$.navTab.open({ tabid: json.navTabId, url: json.forwardUrl });
		} else if (json.navViewId) {
			$.navView.open({ rel: json.navViewId, url: json.forwardUrl });
		}
	}
}

function navViewAjaxDoneReload(json) {
	$.ajaxDone(json);
	if ($.isAjaxStatusOk(json)) {
		// 如果关闭当前页面后，底部是列表页面，就重新加载
		let $boxs = $.navView.getBoxs(3);
		$boxs.forEach(function ($box) {
			let $form = $box.find('form.dwz-list-form').trigger('submit');
			if ($form.size() == 0 && $box.data('ajaxDoneReload')) {
				$.navView.reload();
			}
		});
	}
}

function navViewAjaxDoneClose(json) {
	if ($.isAjaxStatusOk(json)) {
		$.navView.close();
	}
	navViewAjaxDoneReload(json);
}

function dialogAjaxDone(json) {
	$.ajaxDone(json);
	if ($.isAjaxStatusOk(json)) {
		// 当前页面
		if ('closeCurrent' == json.callbackType) {
			$.dialog.close();
		} else if ('forward' == json.callbackType) {
			$.dialog.open({ url: json.forwardUrl });
		}

		if (json.navTabId) {
			$.navTab.open({ tabid: json.navTabId, url: json.forwardUrl });
		} else if (json.navViewId) {
			$.navView.open({ rel: json.navViewId, url: json.forwardUrl });
		}
	}
}

(function ($) {
	$.fn.extend({
		/**
		 * 表单验证
		 * @returns {boolean}
		 */
		valid: function (disableAlert) {
			let result = true,
				$form = this;

			$form
				.find(':input')
				.filter(function () {
					let type = this.type;

					// Use .is( ":disabled" ) so that fieldset[disabled] works
					return this.name && !dwz(this).is(':disabled') && dwz.config.rsubmittable.test(this.nodeName) && !dwz.config.rsubmitterTypes.test(type);
				})
				.each(function () {
					let $input = $(this),
						val = $input.val(),
						required = this.required || $input.hasClass('required'),
						pattern = $input.attr('pattern') || $input.attr('data-pattern'),
						errorMsg = $input.attr('data-error') || $input.attr('placeholder'),
						dataMin = $input.attr('min'),
						dataMax = $input.attr('max');

					if (!$input.hasClass('ignore')) {
						if (dwz.config.rcheckableType.test(this.type)) {
							if (!this.checked && required) {
								result = false;
							}
						} else if (!val && required) {
							result = false;
						} else if (val && pattern && !new RegExp(pattern).test(val)) {
							result = false;
						} else if (val && dataMin) {
							result = parseFloat(dataMin) <= parseFloat(val);
							if (!result) {
								errorMsg = $input.attr('data-error-min') || errorMsg;
							}
						} else if (val && dataMax) {
							result = parseFloat(dataMax) >= parseFloat(val);
							if (!result) {
								errorMsg = $input.attr('data-error-max') || errorMsg;
							}
						} else if ($input.hasClass('valid-change') && this.onchange) {
							this.onchange();
							result = $input.data('valid-change') !== false;
						}
					}

					if (!disableAlert && !result && errorMsg && $.alert) {
						$.alert.error(errorMsg);
						return false;
					}
				});

			// 图片上传 required 验证
			$form.find('ul.upload-preview.required').each((index, elem) => {
				let $elem = $(elem);
				if (!$elem.hasClass('ignore') && 0 == $elem.find('.thumbnail').size()) {
					let errorMsg = $elem.attr('data-error');
					if (errorMsg) $.alert.error(errorMsg);
					return false;
				}
			});

			return result;
		},

		ajaxTodo: function ({ className = 'active', disabledInvert$ = 'disabled-invert', relCount$ = 'data-rel-count' }) {
			return this.each(function () {
				let $this = $(this).hrefFix(),
					$dataRel = $($this.attr(relCount$)),
					disabledInvert = $this.hasClass(disabledInvert$);

				let changeRelCount = function (count) {
					if ($dataRel.size() > 0) {
						let oldCount = parseInt($dataRel.text());
						if (oldCount + count >= 0) {
							$dataRel.text(oldCount + count);
						}
					}
				};

				$this.click((event) => {
					let url = $this.attr('data-href'),
						relCount = parseInt($this.attr('data-count') || 1);

					let beforeActive = $this.hasClass(className);

					if (url && url != 'javascript:') {
						$.ajax({
							type: 'POST',
							url: url,
							data: { active: beforeActive ? 0 : 1 },
							dataType: 'json',
							cache: false,
							success: (json) => {
								$.ajaxDone(json);

								if ($.isAjaxStatusOk(json)) {
									if (beforeActive && !disabledInvert) {
										$this.removeClass(className);
										changeRelCount(-relCount);
									} else {
										$this.addClass(className);
										changeRelCount(+relCount);
									}
								}
							},
							error: dwz.ajaxError
						});
					} else {
						if (beforeActive && !disabledInvert) {
							$this.removeClass(className);
							changeRelCount(-relCount);
						} else {
							$this.addClass(className);
							changeRelCount(+relCount);
						}
					}

					event.preventDefault();
					event.stopPropagation();
				});
			});
		},

		/**
		 * 查找带回
		 * @param {*} args
		 */
		bringBack: function (args) {
			return this.each(function () {
				const $form = $(this);
				$form.find(':input').each(function () {
					let $input = $(this),
						inputName = $input.attr('name');

					for (let key in args) {
						if (key == inputName) {
							$input.val(args[key]);
							break;
						}
					}
				});
			});
		}
	});
})(dwz);
