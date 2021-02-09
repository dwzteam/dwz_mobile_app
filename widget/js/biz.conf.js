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
			REMOTE: '/region/list'
		},
		// 人员列表
		persionList: {
			DEV: './doc/json/persionList.json',
			REMOTE: '/persion/list'
		},

		calendar: {
			dayDetail: {
				DEV: './doc/json/calendar/dayDetail.json',
				REMOTE: '/calendar/dayDetail'
			},
			monthStatistics: {
				DEV: './doc/json/calendar/monthStatistics.json',
				REMOTE: '/calendar/monthStatistics'
			}
		},
		announce: {
			// 通知列表-推荐
			recommend: {
				DEV: './doc/json/announce/list.json',
				REMOTE: '/announce/recommend'
			},
			// 通知列表
			list: {
				DEV: './doc/json/announce/list.json',
				REMOTE: '/announce/list'
			},
			// 通知详情
			detail: {
				DEV: './doc/json/announce/detail_{id}.json',
				REMOTE: '/announce/detail'
			}
		},

		transport: {
			// 运输单-任务
			task: {
				DEV: './doc/json/transport/task.json',
				REMOTE: '/transport'
			},

			// 运输单列表
			list: {
				DEV: './doc/json/transport/list.json',
				REMOTE: '/transport/list'
			},
			// 运输单详情
			detail: {
				DEV: './doc/json/transport/detail.json',
				REMOTE: '/transport/detail'
			},

			// 运输单开始运输
			start: {
				DEV: './doc/json/ajaxDone.json',
				REMOTE: '/transport/start'
			},
			// 运输单 完成
			finish: {
				DEV: './doc/json/ajaxDone.json',
				REMOTE: '/transport/finish'
			},

			// 运输单发货过磅
			first: {
				DEV: './doc/json/ajaxDone.json',
				REMOTE: '/transport/first'
			},
			// 运输单卸货过磅
			last: {
				DEV: './doc/json/ajaxDone.json',
				REMOTE: '/transport/last'
			},
			// 运输单过磅图图片上传，type: 1 发货过磅 2 卸货过磅 3 电子签名
			picUpload: {
				DEV: './doc/json/ajaxDone.json',
				REMOTE: '/transport/upload'
			},
			// 删除图片
			picDel: {
				DEV: './doc/json/ajaxDone.json',
				REMOTE: '/transport/picDel'
			},
			// 运输单位置上报
			gpsUpload: {
				DEV: './doc/json/ajaxDone.json',
				REMOTE: '/transport/point'
			}
		},

		message: {
			list: {
				DEV: './doc/json/messageList.json',
				REMOTE: '/notice'
			},
			del: {
				DEV: './doc/json/ajaxDone.json',
				REMOTE: '/notice/delete'
			}
		},

		favorite: {
			list: {
				DEV: './doc/json/favoriteList.json',
				REMOTE: '/RestApi/favoriteList'
			},
			del: {
				DEV: './doc/json/ajaxDone.json',
				REMOTE: '/favorite/delete'
			}
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
