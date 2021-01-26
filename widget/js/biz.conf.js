/**
 * @author 张慧华 <350863780@qq.com>
 */
const biz = window.biz || {
	server: {
		ENV: 'DEV', // DEV,TEST,UAT,LIVE
		_flag() {
			return $.inArray(this.ENV, ['TEST', 'UAT', 'LIVE']) ? 'REMOTE' : this.ENV;
		},
		baseUrl: {
			DEV: '',
			TEST: '/app_proxy',
			UAT: 'http://mobile.jui.org',
			LIVE: 'http://mobile.jui.org'
		},
		_verifyImg: {
			DEV: './doc/verify.png',
			REMOTE: '/Public/verify'
		},
		_login: {
			DEV: './doc/json/login.json',
			REMOTE: '/login'
		},
		loginSms: {
			DEV: './doc/json/login.json',
			REMOTE: '/login/verify'
		},

		register: {
			DEV: './doc/json/register.json',
			REMOTE: '/register'
		},
		forgetPwd: {
			DEV: './doc/json/ajaxDone.json',
			REMOTE: '/forget'
		},
		changePwd: {
			DEV: './doc/json/ajaxDone.json',
			REMOTE: '/user/password'
		},
		changeMobile: {
			DEV: './doc/json/ajaxDone.json',
			REMOTE: '/user/phone'
		},
		userProfile: {
			DEV: './doc/json/login.json',
			REMOTE: '/user'
		},
		sendSmsCode: {
			DEV: './doc/json/ajaxDone.json',
			REMOTE: '/code'
		},
		feedback: {
			DEV: './doc/json/ajaxDone.json',
			REMOTE: '/feedback'
		},
		// 公安实名验证
		userRealVerify: {
			DEV: './doc/json/login.json',
			REMOTE: '/user/realVerify'
		},

		// 首页-轮播图
		homeAd: {
			DEV: './doc/json/homeAd.json',
			REMOTE: '/homeAd'
		},
		// 组件列表
		widgetList: {
			DEV: './doc/json/widgetList.json',
			REMOTE: '/widgetList'
		},
		// 省、市、区
		regionList: {
			DEV: './doc/json/region/test_{code}.json',
			REMOTE: '/region/list?token={token}'
		},
		// 通知列表-首页
		announce: {
			DEV: './doc/json/announce.json',
			REMOTE: '/announce/index'
		},
		// 通知列表
		announceList: {
			DEV: './doc/json/announce.json',
			REMOTE: '/announce/list'
		},
		// 通知详情
		announceDetail: {
			DEV: './doc/json/announceDetail_{id}.json',
			REMOTE: '/announce/detail'
		},
		// 运输单-首页
		transport: {
			DEV: './doc/json/transport.json',
			REMOTE: '/transport'
		},
		// 运输单列表
		transportList: {
			DEV: './doc/json/transportList.json',
			REMOTE: '/transport/list'
		},
		// 运输单详情
		transportDetail: {
			DEV: './doc/json/transportDetail.json',
			REMOTE: '/transport/detail'
		},

		// 运输单开始运输
		transportStart: {
			DEV: './doc/json/ajaxDone.json',
			REMOTE: '/transport/start'
		},
		// 运输单 完成
		transportFinish: {
			DEV: './doc/json/ajaxDone.json',
			REMOTE: '/transport/finish'
		},

		// 运输单发货过磅
		transportFirst: {
			DEV: './doc/json/ajaxDone.json',
			REMOTE: '/transport/first'
		},
		// 运输单卸货过磅
		transportLast: {
			DEV: './doc/json/ajaxDone.json',
			REMOTE: '/transport/last'
		},
		// 运输单过磅图图片上传，type: 1 发货过磅 2 卸货过磅 3 电子签名
		transportUpload: {
			DEV: './doc/json/ajaxDone.json',
			REMOTE: '/transport/upload'
		},
		// 运输单位置上报
		transportPoint: {
			DEV: './doc/json/ajaxDone.json',
			REMOTE: '/transport/point'
		},

		messageList: {
			DEV: './doc/json/messageList.json',
			REMOTE: '/notice'
		},
		messageDel: {
			DEV: './doc/json/ajaxDone.json',
			REMOTE: '/notice/delete'
		},

		favoriteList: {
			DEV: './doc/json/favoriteList.json',
			REMOTE: '/RestApi/favoriteList'
		},
		favoriteDel: {
			DEV: './doc/json/ajaxDone.json',
			REMOTE: '/favorite/delete'
		},

		uploadUserIcon: {
			DEV: './doc/json/ajaxDone.json',
			REMOTE: '/upload'
		},
		getUrl(type, params) {
			let _url = this.baseUrl[this.ENV] + type[this._flag()].replace('{token}', UserInfo.token);
			if (params) {
				_url = _url.replaceTm(params);
			}
			return _url;
		},
		getVerifyImgUrl() {
			return this.baseUrl[this.ENV] + this._verifyImg[this._flag()] + '?t=' + new Date().getTime();
		},
		getLoginUrl() {
			return this.baseUrl[this.ENV] + this._login[this._flag()];
		}
	}
};
