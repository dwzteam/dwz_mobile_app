/**
 * Created by zhanghuihua on 2016/12/26.
 */

// 用户登入信息
var UserInfo = {
	token: '',
	mobile: '',
	realname: '',
	sex: 1,
	address: '',
	user_type: '',
	headimgurl: ''
};
var UserInfoUtil = {
	update: function (data) {
		console.log(JSON.stringify(data));

		if (data.uid != undefined) UserInfo.uid = data.uid;
		if (data.realname != undefined) UserInfo.realname = data.realname;
		if (data.mobile != undefined) UserInfo.mobile = data.mobile;
		if (data.token != undefined) UserInfo.token = data.token;
		if (data.user_type != undefined) {
			UserInfo.user_type = data.user_type;
		}
		if (data.sex != undefined) {
			UserInfo.sex = data.sex == 1 ? 1 : 2;
		}

		if (data.headimgurl != undefined) UserInfo.headimgurl = data.headimgurl;
		if (data.address != undefined) UserInfo.address = data.address;

		$.setStorage('APP_USER_INFO', UserInfo);
	},
	clear: function () {
		UserInfo = {};
		$.setStorage('APP_USER_INFO', UserInfo);
	}
};

function initUserInfo() {
	// 获取localStorage中用户信息
	if (!UserInfo.token) {
		UserInfo = $.getStorage('APP_USER_INFO') || {};
	}
	console.log(JSON.stringify(UserInfo));
	// 检测用户数据
	if (UserInfo.token) {
		$.ajax({
			type: 'POST',
			url: biz.server.getUrl(biz.server.userProfile),
			dataType: 'json',
			data: {},
			cache: false,
			global: false,
			success: function (json) {
				console.log(JSON.stringify(json));

				if (json[dwz.config.keys.statusCode] == dwz.config.statusCode.ok) {
					UserInfoUtil.update(json.data);
					// initDict();
				} else {
					$.alert.toast(json[dwz.config.keys.message]);
					UserInfoUtil.clear();
				}

				dwz.checkAjaxLogin(json);
			},
			error: ajaxError
		});
	}
}

$.fn.extend({
	fleshVerifyImg: function () {
		return this.each(function () {
			$(this).touchwipe({
				touch: function () {
					$(this).attr('src', biz.server.getVerifyImgUrl());
				}
			});
		});
	},
	sendVerifyMs: function () {
		return this.each(function () {
			$(this).click(function () {
				var $link = $(this),
					rel = $link.attr('rel'),
					op = $link.attr('data-op');

				var mobile = $link.parentsUnitBox().find(rel).val();

				if (!mobile || !mobile.isMobile()) {
					$.alert.error('请输入您的11位手机号码');
					return;
				}

				var sec = 60;
				var $altMsg = $(
					'<span class="count">重发(' + sec + 's)</span>'
				).appendTo(this.parentNode);
				$link.hide();
				var timer = setInterval(function () {
					$altMsg.text('重发(' + sec + 's)');
					sec--;

					if (sec <= 1) {
						clearInterval(timer);
						$altMsg.remove();
						$link.show();
					}
				}, 1000);

				$.ajax({
					type: 'POST',
					dataType: 'json',
					url: $link.attr('data-href'),
					data: {
						mobile: mobile,
						sign: md5(mobile + 'ln-#*UR0QsgY51^2Bz'),
						type: op
					},
					success: function (json) {
						console.log(JSON.stringify(json));
						var info = json[dwz.config.keys.message] || json.info;
						if (
							json[dwz.config.keys.statusCode] == dwz.config.statusCode.error
						) {
							$.alert.error(info);
							clearInterval(timer);
							$altMsg.remove();
							$link.show();
						} else {
							info && $.alert.success(info);
						}
					}
				});
			});
		});
	}
});

// 检测用户登入状态
dwz.urlInterceptor = function (url) {
	var pass = UserInfo.token ? true : false;

	if (!pass) {
		var uris = [
			'tpl/user/login.html',
			'tpl/user/forgetPwd.html',
			'tpl/user/register.html'
		];

		// 判断request URI 是否需要登入
		if (dwz.inArray(url.getRequestURI(), uris)) {
			pass = true;
		}
	}

	if (!pass) {
		$.gotoLogin();
		return false;
	}

	return authCheck(url);
};

// 检测是否实名认证
function authCheck(url) {
	if (!UserInfo.isauth) {
		var uris = ['tpl/driver.html'];

		// 判断request URI 是否需要绑定
		if (!dwz.inArray(url.getRequestURI(), uris)) {
			return true;
		}

		$.dialog.open({ url: 'tpl/my/authCheck.html' });
		return false;
	}

	return true;
}

// 登入页面
function loginRender(tpl, params) {
	var $box = this;

	var json = {
		form_url: biz.server.getLoginUrl(),
		sms_code_url: biz.server.getUrl(biz.server.sendSmsCode),
		login_sms_url: biz.server.getUrl(biz.server.loginSms)
	};

	var html = template.render(tpl, json);
	$box.html(html).initUI();
}

function forgetPwdRender(tpl, params) {
	var $box = this;

	var json = {
		form_url: biz.server.getUrl(biz.server.forgetPwd),
		sms_code_url: biz.server.getUrl(biz.server.sendSmsCode)
	};

	var html = template.render(tpl, json);
	$box.html(html).initUI();
}

function changePwdRender(tpl, params) {
	var $box = this;

	var json = {
		form_url: biz.server.getUrl(biz.server.changePwd),
		sms_code_url: biz.server.getUrl(biz.server.sendSmsCode),
		UserInfo: UserInfo
	};

	var html = template.render(tpl, json);
	$box.html(html).initUI();
}
function changeMobileRender(tpl, params) {
	var $box = this;

	var json = {
		form_url: biz.server.getUrl(biz.server.changeMobile),
		sms_code_url: biz.server.getUrl(biz.server.sendSmsCode),
		UserInfo: UserInfo
	};

	var html = template.render(tpl, json);
	$box.html(html).initUI();
}

// 用户注册页面
function registerRender(tpl, params) {
	var $box = this;

	var json = {
		form_url: biz.server.getUrl(biz.server.register),
		sms_code_url: biz.server.getUrl(biz.server.sendSmsCode)
	};

	var html = template.render(tpl, json);
	$box.html(html).initUI();
}

// 用户注册表单提交回调函数
function loginAjaxDone(json) {
	console.log(JSON.stringify(json));
	if ($.isAjaxOkStatus(json)) {
		UserInfoUtil.update(json.data);
		// initDict();

		$.dialog.close();
		$.navTab.open({
			url: 'tpl/home.html?dwz_callback=renderHome',
			tabid: 'home'
		});
	} else {
		$.alert.error(json.info);
	}
}

function forgetAjaxDone(json) {
	console.log(JSON.stringify(json));
	if ($.isAjaxOkStatus(json)) {
		$.gotoLogin();
		$.alert.success(json.info);
	} else {
		$.alert.error(json.info);
	}
}

function authAjaxDone(json) {
	console.log(JSON.stringify(json));

	$.navView.close(true, true); // 关闭认证页面

	if ($.isAjaxOkStatus(json)) {
		UserInfoUtil.update(json.data);

		$.dialog.open({ url: 'tpl/my/authOk.html' });
	} else {
		json.info && $.alert.error(json.info);
		$.dialog.open({ url: 'tpl/my/authError.html' });
	}
}

// function userRealInfoAjaxDone(json) {
// 	console.log(JSON.stringify(json));
// 	if (json[dwz.config.keys.statusCode] == dwz.config.statusCode.ok) {
// 		bizUtil.userRealVerify(json.data);
// 	} else {
// 		json.info && $.alert.error(json.info);
// 	}
// }

function submitUserRealInfo(form) {
	var $form = $(form);

	if (!$form.valid()) {
		return false;
	}

	var data = $form.serializeMap();

	// $.ajax({
	// 	global: true,
	// 	type: form.method || 'POST',
	// 	url: $form.attr("action"),
	// 	data: data,
	// 	dataType: "json",
	// 	cache: false,
	// 	success: function (json) {
	// 		if (!dwz.checkAjaxLogin(json)) { return; }
	// 		if (!json.data) json.data = data;
	// 		userRealInfoAjaxDone(json);
	// 	},
	// 	error: dwz.ajaxError
	// });

	bizUtil.userRealVerify(data); // 实名认证成功后保存用户信息

	return false;
}

var bizUtil = {
	userRealVerify: function (params, success) {
		if (!biz.checkPermission('camera', '摄像头')) {
			return;
		}

		var baiduFace = api.require('baiduFaceLive');
		baiduFace.closeFaceDetectView(function (ret, err) {
			// console.log(JSON.stringify(ret));
		});

		var safeTop = api.safeArea.top;
		baiduFace.openFaceDetectView(
			{
				rect: {
					x: 0,
					y: safeTop > 20 ? safeTop : 0,
					w: api.frameWidth,
					h: window.screen.availHeight
				},
				fixedOn: api.frameName,
				fixed: true,
				soundType: 0, // 0中文, 1英文, 2马来文
				isSound: true
			},
			function (ret, err) {
				console.log(JSON.stringify(ret));
				console.log(JSON.stringify(err));
				if (ret.evenType == 'success') {
					//由于base64数据量大，请不要用JSON.stringify(ret)调试
					// console.log('最佳图片: '+ret.data.bestImage);
					// console.log('眨眼睛: '+ret.data.liveEye);
					// console.log('张张嘴: '+ret.data.liveMouth);
					// console.log('向右转头: '+ret.data.yawRight);
					// console.log('向左转头: '+ret.data.yawLeft);
					// console.log('轻微抬头: '+ret.data.pitchUp);
					// console.log('轻微低头: '+ret.data.pitchDown);
					// console.log('摇摇头: '+ret.data.headLeftOrRight);
					// console.log(JSON.stringify(ret.data.bestImage));

					baiduFace.closeFaceDetectView(function (ret, err) {
						// console.log(JSON.stringify(ret));
					});

					if (success) {
						success(ret, err);
						return;
					}

					api.showProgress({
						title: '正在上传图片...',
						text: '先喝杯茶...',
						modal: true
					});

					if (!params.idcard) {
						$.alert.error('身份证号必须');
					}
					if (!params.realname) {
						$.alert.error('真实姓名必须');
					}

					api.ajax(
						{
							url: biz.server.getUrl(biz.server.userRealVerify),
							method: 'post',
							data: {
								values: {
									img: ret.data.bestImage,
									idcard: params.idcard,
									name: params.realname,
									token: UserInfo.token
								}
							}
						},
						function (json, err) {
							console.log(JSON.stringify(json));

							api.hideProgress();
							if (json) {
								authAjaxDone(json);
							} else {
								console.log(JSON.stringify(err));
							}
						}
					);
				} else {
					if (ret.message) $.alert.toast(ret.message);
				}
			}
		);
	}
};
