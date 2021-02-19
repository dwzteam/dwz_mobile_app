/**
 * @author 张慧华 <350863780@qq.com>
 */
// 用户登入信息
let UserInfo = {
	token: '',
	mobile: '',
	realname: '',
	sex: 1,
	address: '',
	user_type: '',
	headimgurl: ''
};
let UserInfoUtil = {
	update(data) {
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
	clear() {
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
			success: (json) => {
				console.log(JSON.stringify(json));

				if (json[dwz.config.keys.statusCode] == dwz.config.statusCode.ok) {
					UserInfoUtil.update(json.data);
				} else {
					$.alert.toast(json[dwz.config.keys.message]);
					UserInfoUtil.clear();
				}

				dwz.checkAjaxLogin(json);
			},
			error: biz.ajaxError
		});
	}
}

$.fn.extend({
	fleshVerifyImg() {
		return this.each(function () {
			$(this).touchwipe({
				touch() {
					$(this).attr('src', biz.server.getVerifyImgUrl());
				}
			});
		});
	},
	sendVerifyMs() {
		return this.each(function () {
			$(this).click(function () {
				let $link = $(this),
					rel = $link.attr('rel'),
					op = $link.attr('data-op');

				let mobile = $link.parentsUnitBox().find(rel).val();

				if (!mobile || !mobile.isMobile()) {
					$.alert.error('请输入您的11位手机号码');
					return;
				}

				let sec = 60;
				let $altMsg = $('<span class="count">重发(' + sec + 's)</span>').appendTo(this.parentNode);
				$link.hide();
				let timer = setInterval(function () {
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
						sign: $.md5(mobile + 'dwz_mobile'),
						type: op
					},
					success: (json) => {
						console.log(JSON.stringify(json));
						let info = json[dwz.config.keys.message] || json.info;
						if (isAjaxStatusError(json)) {
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

// 登入页面
function loginRender(tpl, params) {
	let json = {
		form_url: biz.server.getLoginUrl(),
		sms_code_url: biz.server.getUrl(biz.server.sendSmsCode),
		login_sms_url: biz.server.getUrl(biz.server.loginSms),
		login_no_face: params.login_no_face
	};

	let html = template.render(tpl.html, json);
	this.html(html).initUI();

	this.find('form').each((index, form) => {
		let $form = $(form);
		let checkFormValid = () => {
			let $btn = $form.find('button.primary');
			if ($form.valid(true)) {
				$btn.removeAttr('disabled').removeClass('disabled');
			} else {
				$btn.attr('disabled', 'disabled').addClass('disabled');
			}
		};

		checkFormValid();

		$form.find(':input').on('change keyup', checkFormValid);
	});
}

function forgetPwdRender(tpl, params) {
	let json = {
		form_url: biz.server.getUrl(biz.server.forgetPwd),
		sms_code_url: biz.server.getUrl(biz.server.sendSmsCode)
	};

	let html = template.render(tpl.html, json);
	this.html(html).initUI();
}

// 用户注册页面
function registerRender(tpl, params) {
	let json = {
		form_url: biz.server.getUrl(biz.server.register),
		sms_code_url: biz.server.getUrl(biz.server.sendSmsCode)
	};

	let html = template.render(tpl.html, json);
	this.html(html).initUI();
}

// 用户注册表单提交回调函数
function loginAjaxDone(json) {
	console.log(JSON.stringify(json));
	if ($.isAjaxStatusOk(json)) {
		UserInfoUtil.update(json.data);

		$.dialog.close();
		$.navTab.open({
			url: 'tpl/home.html?dwz_callback=biz.home.render',
			tabid: 'home'
		});
	} else {
		$.alert.error(json.info);
	}
}

function forgetAjaxDone(json) {
	console.log(JSON.stringify(json));
	if ($.isAjaxStatusOk(json)) {
		$.gotoLogin();
		$.alert.success(json.info);
	} else {
		$.alert.error(json.info);
	}
}

function authAjaxDone(json) {
	console.log(JSON.stringify(json));
	$.navView.close(); // 关闭认证页面

	if ($.isAjaxStatusOk(json)) {
		UserInfoUtil.update(json.data);
		$.alert.success('实名认证成功');
	} else {
		$.alert.success('实名认证失败');
	}
}

function submitUserRealInfo(form) {
	let $form = $(form);

	if (!$form.valid()) {
		return false;
	}

	let data = $form.serializeMap();
	window.api && bizUtil.userRealVerify(data);

	return false;
}

let bizUtil = {
	userRealVerify(params, callback) {
		if (!biz.checkPermission('camera', '摄像头')) {
			return;
		}

		const requestUserRealVerify = (base64img) => {
			if (callback) {
				callback(base64img);
				return;
			}
			api.showProgress({
				title: '正在上传图片...',
				text: '先喝杯茶...',
				modal: true
			});
			$.ajax({
				type: 'POST',
				url: biz.server.getUrl(biz.server.userRealVerify),
				dataType: 'json',
				data: {
					img: base64img,
					mobile: params.mobile,
					realname: params.realname,
					token: UserInfo.token
				},
				success: (json) => {
					if ($.isAjaxStatusOk(json)) {
						authAjaxDone(json);
					}
				},
				error: biz.ajaxError,
				complete: () => {
					api.hideProgress();
				}
			});
		};

		const module = api.require('dwzBaiduFaceLive');
		module.faceLiveness(
			{
				debug: 0, // 调试开关(默认:0)：0, 1
				cropType: 1, // 抠图类型(默认:1)：1:脸部, 2:大头照, 3:头像+肩膀
				cropHeight: 300, // 抠图高的设定，为了保证好的抠图效果，要求高宽比是4:3，所以会在内部进行计算，只需要传入高即可，取值范围50 ~ 1200，默认480
				quality: 70, // 抠图压缩质量，取值范围 20 ~ 100，默认100不压缩
				eye: false, // 活体动作，眨眼(默认:false)
				mouth: true, // 活体动作，张嘴(默认:false)
				headRight: false, // 活体动作，向右转头(默认:false)
				headLeft: false, // 活体动作，向左转头(默认:false)
				headUp: false, // 活体动作，向上抬头(默认:false)
				headDown: false, // 活体动作，向下低头(默认:false)
				headLeftOrRight: false // 活体动作，摇头(默认:false)
			},
			function (ret, err) {
				if (ret.status) {
					requestUserRealVerify(ret.face);
				} else {
					if (ret.message) $.alert.toast(ret.message);
				}
			}
		);
	}
};
