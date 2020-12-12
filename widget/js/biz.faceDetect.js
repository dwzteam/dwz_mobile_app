biz.faceDetect = {
	liveFaceDetect({ debug = 0 }, callback) {
		const module = api.require('DwzBaiduFaceLive');
		module.liveFaceDetect({ debug: debug }, function (ret, err) {
			if (ret.status) {
				callback && callback(ret.crop);
			} else if (ret.message) {
				$.alert.toast(ret.message);
			}
		});
	},

	testFaceRender(tpl, params) {
		let html = template.render(tpl, params);
		this.html(html).initUI();

		let $imgBox = this.find('div.dwz-img-box');
		this.find('button.form-submit').click((event) => {
			liveFaceDetect({ debug: 1 }, (strBase64) => {
				$imgBox.append(`<img src="data:image/jpeg;base64,${strBase64}">`);
			});
		});
	}
};
