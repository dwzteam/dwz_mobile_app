biz.baiduFace = {
	faceLiveness({ debug = 0, cropType = 1, cropHeight = 300, quality = 70, mouth = false, headRight = false, headLeft = false, headUp = false, headDown = false, headLeftOrRight = false }, callback) {
		const module = api.require('dwzBaiduFaceLive');
		module.faceLiveness(
			{
				debug: debug, // 调试开关(默认:0)：0, 1
				cropType: cropType, // 抠图类型(默认:1)：1:脸部, 2:大头照, 3:头像+肩膀
				cropHeight: cropHeight, // 抠图高的设定，为了保证好的抠图效果，要求高宽比是4:3，所以会在内部进行计算，只需要传入高即可，取值范围50 ~ 1200，默认480
				quality: quality, // 抠图压缩质量，取值范围 20 ~ 100，默认100不压缩
				eye: eye, // 活体动作，眨眼(默认:false)
				mouth: mouth, // 活体动作，张嘴(默认:false)
				headRight: headRight, // 活体动作，向右转头(默认:false)
				headLeft: headLeft, // 活体动作，向左转头(默认:false)
				headUp: headUp, // 活体动作，向上抬头(默认:false)
				headDown: headDown, // 活体动作，向下低头(默认:false)
				headLeftOrRight: headLeftOrRight // 活体动作，摇头(默认:false)
			},
			function (ret, err) {
				if (!ret.status && ret.message) {
					$.alert.toast(ret.message);
				}

				callback && callback(ret);
			}
		);
	},

	faceDetect({ debug = 0, cropType = 1, cropHeight = 300, quality = 70 }, callback) {
		const module = api.require('dwzBaiduFaceLive');
		module.faceDetect(
			{
				debug: debug, // 调试开关(默认:0)：0, 1
				cropType: cropType, // 抠图类型(默认:1)：1:脸部, 2:大头照, 3:头像+肩膀
				cropHeight: cropHeight, // 抠图高的设定，为了保证好的抠图效果，要求高宽比是4:3，所以会在内部进行计算，只需要传入高即可，取值范围50 ~ 1200，默认480
				quality: quality // 抠图压缩质量，取值范围 20 ~ 100，默认100不压缩
			},
			function (ret, err) {
				if (!ret.status && ret.message) {
					$.alert.toast(ret.message);
				}

				callback && callback(ret);
			}
		);
	},

	/**
	 * 人脸识别测试
	 * @param {*} tpl
	 * @param {*} params
	 */
	testFaceRender(tpl, params) {
		const tplWrap = $.templateWrap(tpl);

		let html = template.render(tplWrap.tpl, params);
		this.html(html).initUI();

		let $imgBox = this.find('div.dwz-img-box');
		this.find('button.form-submit').click((event) => {
			if (params.isLiveness == 1) {
				// 人脸采集（包含活体动作），默认就眨眼一下动作，其它动作通过参数配制
				biz.baiduFace.faceLiveness(
					{
						debug: 1, // 调试开关(默认:0)：0, 1
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
					(ret) => {
						if (ret.status) {
							let imgHtml = template.render(tplWrap['tpl-img'], ret);
							$imgBox.append(imgHtml);
						}
					}
				);
			} else {
				// 人脸采集（不包含活体动作）
				biz.baiduFace.faceDetect(
					{
						debug: 0, // 调试开关(默认:0)：0, 1
						cropType: 2, // 抠图类型(默认:1)：1:脸部, 2:大头照, 3:头像+肩膀
						cropHeight: 300, // 抠图高的设定，为了保证好的抠图效果，要求高宽比是4:3，所以会在内部进行计算，只需要传入高即可，取值范围50 ~ 1200，默认480
						quality: 70 // 抠图压缩质量，取值范围 20 ~ 100，默认100不压缩
					},
					(ret) => {
						if (ret.status) {
							let imgHtml = template.render(tplWrap['tpl-img'], ret);
							$imgBox.append(imgHtml);
						}
					}
				);
			}
		});
	},

	/**
	 * 人脸识别登录系统
	 */
	faceLogin() {
		biz.baiduFace.faceLiveness({ debug: 1 }, (ret) => {
			if (ret.status) {
				$.ajax({
					type: 'POST',
					url: biz.server.getLoginUrl(),
					dataType: 'json',
					data: { faceBase64: ret.face },
					cache: false,
					global: false,
					success: loginAjaxDone,
					error: biz.ajaxError
				});
			}
		});
	}
};
