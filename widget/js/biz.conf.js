var biz = window.biz || {

    ajaxError: function () {
        $.alert.toast('操作失败，请稍后再试！');
    },

    server: {
        ENV:"DEV", // DEV,TEST,UAT,LIVE
        _flag: function(){
            return $.inArray(this.ENV, ['TEST','UAT','LIVE']) ? 'REMOTE' : this.ENV;
        },
        baseUrl: {
            DEV:"",
			TEST: "/app_proxy",
            // UAT:"http://ui.7788sc.com/_dw_baianinfo/app",
			UAT:"http://47.96.239.247/easy_durg/public",
			LIVE:"http://47.96.239.247/easy_durg/public"
        },
        _verifyImg:{
            DEV:"./doc/verify.png",
            REMOTE:"/Public/verify"
        },
        _login:{
            DEV:"./doc/json/login.json",
            REMOTE:"/company/driver/login"
        },
		loginSms:{
            DEV:"./doc/json/login.json",
            REMOTE:"/company/driver/login/verify"
        },

		register: {
			DEV: "./doc/json/register.json",
			REMOTE: "/company/driver/register"
		},
		forgetPwd: {
			DEV: "./doc/json/ajaxDone.json",
			REMOTE: "/company/driver/forget"
		},
		changePwd: {
			DEV: "./doc/json/ajaxDone.json",
			REMOTE: "/company/driver/user/password"
		},
		changeMobile: {
			DEV: "./doc/json/ajaxDone.json",
			REMOTE: "/company/driver/user/phone"
		},
		userProfile: {
			DEV: "./doc/json/login.json",
			REMOTE: "/company/driver/user"
		},
		sendSmsCode:{
			DEV:"./doc/json/ajaxDone.json",
			REMOTE:"/company/driver/code"
		},
		// 公安实名验证
		userRealVerify: {
			DEV: "./doc/json/login.json",
			REMOTE: "/user/realVerify"
		},

		// 通知列表-首页
		announce:{
            DEV:"./doc/json/announce.json",
            REMOTE:"/company/driver/announce"
        },
		// 通知列表
		announceList:{
            DEV:"./doc/json/announce.json",
            REMOTE:"/company/driver/announce/list"
        },
		// 通知详情
		announceDetail:{
            DEV:"./doc/json/announceDetail.json",
            REMOTE:"/company/driver/announce/detail"
        },
		// 运输单-首页
		transport:{
            DEV:"./doc/json/transport.json",
            REMOTE:"/company/driver/transport"
        },
		// 运输单列表
		transportList:{
            DEV:"./doc/json/transportList.json",
            REMOTE:"/company/driver/transport/list"
        },
		// 运输单详情
		transportDetail:{
            DEV:"./doc/json/transportDetail.json",
            REMOTE:"/company/driver/transport/detail"
        },

		// 运输单开始运输
		transportStart:{
            DEV:"./doc/json/ajaxDone.json",
            REMOTE:"/company/driver/transport/start"
        },
		// 运输单 完成
		transportFinish:{
            DEV:"./doc/json/ajaxDone.json",
            REMOTE:"/company/driver/transport/finish"
        },

		// 运输单发货过磅
		transportFirst:{
            DEV:"./doc/json/ajaxDone.json",
            REMOTE:"/company/driver/transport/first"
        },
		// 运输单卸货过磅
		transportLast:{
            DEV:"./doc/json/ajaxDone.json",
            REMOTE:"/company/driver/transport/last"
        },
		// 运输单过磅图图片上传，type: 1 发货过磅 2 卸货过磅 3 电子签名
		transportUpload:{
            DEV:"./doc/json/ajaxDone.json",
            REMOTE:"/company/driver/transport/upload"
        },
		// 运输单位置上报
		transportPoint:{
            DEV:"./doc/json/ajaxDone.json",
            REMOTE:"/company/driver/transport/point"
        },

        messageList:{
            DEV:"./doc/json/messageList.json",
            REMOTE:"/notice"
        },
        messageDel:{
            DEV:"./doc/json/ajaxDone.json",
            REMOTE:"/notice/delete"
        },

		favoriteList:{
			DEV:"./doc/json/favoriteList.json",
			REMOTE:"/RestApi/favoriteList"
		},
		favoriteDel:{
			DEV:"./doc/json/ajaxDone.json",
			REMOTE:"/favorite/delete"
		},

		// type: 图片类别 1 身份证正面，2 身份证反面 3 人脸识别 4 个人照片， 5 运输许可证
		uploadUserIcon: {
			DEV: "./doc/json/ajaxDone.json",
			REMOTE: "/company/driver/upload"
		},
        getUrl:function(type){
            return this.baseUrl[this.ENV] + type[this._flag()].replace('{token}', UserInfo.token);
        },
        getVerifyImgUrl: function(){
            return this.baseUrl[this.ENV] + this._verifyImg[this._flag()] + '?t=' + new Date().getTime();
        },
        getLoginUrl: function(){
            return this.baseUrl[this.ENV] + this._login[this._flag()];
        }
    }
};
