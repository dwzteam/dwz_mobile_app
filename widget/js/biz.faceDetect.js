biz.faceDetect = {
	liveFaceDetect({ debug = 0 }, callback) {
		const module = api.require('DwzBaiduFaceLive');
		module.liveFaceDetect({ debug: debug }, function (ret, err) {
			if (!ret.status && ret.message) {
				$.alert.toast(ret.message);
			}

			callback && callback(ret);
		});
	},

	/**
	 * 人脸识别测试
	 * @param {*} tpl
	 * @param {*} params
	 */
	testFaceRender(tpl, params) {
		let html = template.render(tpl, params);
		this.html(html).initUI();

		let $imgBox = this.find('div.dwz-img-box');
		this.find('button.form-submit').click((event) => {
			biz.faceDetect.liveFaceDetect({ debug: 1 }, (ret) => {
				if (ret.status) {
					$imgBox.append(`<img src="data:image/jpeg;base64,${ret.crop}">`);
				}
			});
		});
	},

	/**
	 * 人脸识别登录系统
	 */
	loginFaceDetect() {
		biz.faceDetect.liveFaceDetect({ debug: 1 }, (ret) => {
			if (ret.status) {
				$.ajax({
					type: 'POST',
					url: biz.server.getUrl(biz.server.getLoginUrl()),
					dataType: 'json',
					data: { faceBase64: ret.crop },
					cache: false,
					global: false,
					success: loginAjaxDone,
					error: biz.ajaxError
				});
			}
		});
	}
};
