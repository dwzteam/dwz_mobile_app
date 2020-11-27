biz.my = {
	render: function(tpl, params){
		var $box = this;

		var html = template.render(tpl, {UserInfo: UserInfo});
		$box.html(html).initUI();
	},
	settingRender: function(tpl, params){
		var $box = this;

		var html = template.render(tpl, {UserInfo: UserInfo});
		$box.html(html).initUI();

		$('#exitSystemButton').touchwipe({
			touch: function () {
				$.alert.confirm('确定要退出登录吗？', {
					okCall:function(){
						UserInfoUtil.clear();
						$.gotoLogin();
					},
					cancelCall:function(){

					}
				});
			}
		});

		$box.find('.dwz-user-icon').touchwipe({
			touch:function(){
				dwz.plus.chooseImage({
					title:'修改用户头像', maximum:1,
					callback: function(imgPath){
						if (!imgPath) {return;}

						$.navView.open({
							url: 'tpl/my/settingsIcon.html',
							rel: 'mySettingsIcon',
							data: {imgPath: imgPath},
							callback: biz.my.settingIconRender
						});

					}
				});

				// $.navView.open({
				// 	url: 'tpl/test_croppic.html?dwz_callback=biz.my.settingIconRender',
				// 	rel: 'test'
				// });
			}
		});
	},
	settingIconRender: function(tpl, params) {
		var $box = this;

		var html = template.render(tpl, {UserInfo: UserInfo});
		$box.html(html).initUI();

		// var $croppic = $box.find('.croppic');
		// $.croppic.render($croppic);
		// $croppic.find('.btn-item').touchwipe({
		// 	touch: function(){
		// 		var imgCropData = $.croppic.imgCropData($croppic);
		// 		console.log(imgCropData);
		// 	}
		// });

		var headerH = biz.safeAreaTop + 44;
		FNImageClip = api.require('FNImageClip');
		FNImageClip.open({
			rect: {
				x: 0,
				y: headerH,
				w: api.winWidth,
				h: api.winHeight-headerH
			},
			srcPath: params.imgPath,
			highDefinition: false,
			isHideGrid: true,
			style: {
				mask: 'rgba(0,0,0,0.6)',
				clip: {
					w: 300,
					h: 300,
					x: (api.winWidth-300) / 2,
					y: (api.winHeight-300) / 2,
					borderColor: '#0f0',
					borderWidth: 3,
					//appearance: 'circular',
					appearance: 'rectangle'
				}
			},
			mode: "image", // image, clip, all
			fixedOn: api.frameName
		}, function(ret, err) {
			if (ret) {
				console.log(JSON.stringify(ret));
			} else {
				alert(JSON.stringify(err));
			}
		});

		$box.find('header .back-btn').touchwipe({
			touch: function () {
				$.navView.close(true, true);
				FNImageClip.close();
			}
		});
		$box.find('header .txt-button').touchwipe({
			touch: function () {
				FNImageClip.save({
					destPath: 'fs://image/croppic_'+new Date().getTime()+'.jpg',
					copyToAlbum: false,
					quality: 1
				}, function(ret, err) {
					if (ret) {
						console.log(JSON.stringify(ret));

						FNImageClip.close();
						$.navView.close(true, true);

						dwz.plus.getBase64Image({
							destinationType: 'url',
							imgPath: ret.destPath,
							maxWidth: 300,
							maxHeight: 300,
							callback: function (strBase64) {
								console.log(strBase64);
								if ($.isFunction(params.callbackFn)) {
									params.callbackFn(strBase64);
								} else {
									$.ajax({
										type: 'POST',
										dataType: 'json',
										global: true,
										url: biz.server.getUrl(biz.server.uploadUserIcon),
										data: {type: 4, imgUrl: strBase64},
										success: function (json) {
											if (json.info) $.alert.toast(json.info);

											var $myUserIcon = $('#my_user_icon_img');
											if ($myUserIcon.size() > 0) {
												$myUserIcon.attr('src', strBase64);
											}
											var $settomgUserIcon = $('#setting_user_icon_img');
											if ($settomgUserIcon.size() > 0) {
												$settomgUserIcon.attr('src', strBase64);
											}

											UserInfoUtil.update({
												photo: strBase64
											});
										}
									});
								}

							}
						});
					} else {
						alert(JSON.stringify(err));
					}
				});
			}
		});
	}
};
