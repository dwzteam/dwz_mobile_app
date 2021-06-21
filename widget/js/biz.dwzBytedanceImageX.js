biz.dwzBytedanceImageX = {
	testConvertImgRender(tpl, params) {
		const imageList = [
			// { url: 'http://imagex.dwzteam.site/tos-cn-i-yrjczxapd7/gif-1~tplv-yrjczxapd7-heic.heif' },
			{ url: 'http://imagex.dwzteam.site/tos-cn-i-yrjczxapd7/test-1~tplv-yrjczxapd7-heic.webp' },
			{ url: 'http://imagex.dwzteam.site/tos-cn-i-yrjczxapd7/test-2~tplv-yrjczxapd7-heic.heic' },
			{ url: 'http://imagex.dwzteam.site/tos-cn-i-yrjczxapd7/test-3~tplv-yrjczxapd7-image.heic' },
			{ url: 'http://imagex.dwzteam.site/tos-cn-i-yrjczxapd7/test-4~tplv-yrjczxapd7-image.heic' },
			{ url: 'http://imagex.dwzteam.site/tos-cn-i-yrjczxapd7/test-5~tplv-yrjczxapd7-image.heic' },
			{ url: 'http://imagex.dwzteam.site/tos-cn-i-yrjczxapd7/test-6~tplv-yrjczxapd7-image.heic' }
		];
		let html = template.render(tpl.html, { imageList });

		this.html(html).initUI();

		if (window.api) {
			setTimeout(() => {
				const module = api.require('dwzBytedanceImageX');

				this.find('img[data-src-imagex]').each((index, img) => {
					const $img = $(img);

					module.convertImg(
						{
							debug: 0, // 调试开关(默认:0)：0, 1
							url: $img.attr('data-src-imagex') // 原图url
						},
						(ret) => {
							if (ret.status) {
								img.src = ret.base64str;
							} else {
								console.log(JSON.stringify(ret));
							}
						}
					);
				});
			}, 600);
		}
	}
};
