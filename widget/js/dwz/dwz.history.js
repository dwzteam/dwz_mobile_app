/**
 * @author 张慧华 <350863780@qq.com>
 * DWZ Mobile Framework: ajax history plugins
 */
(function ($) {
	$.extend({
		history: {
			_hash: new Array(),
			_currentHash: '',
			_isPop: false,
			_isHis: true,
			init(callback, hash) {
				let current_hash = hash || location.hash;

				if (current_hash) {
					$.history._currentHash = current_hash.skipChar('#').replace('?', '|');

					if ($.isFunction(callback)) {
						setTimeout(function () {
							callback(current_hash.skipChar('#').replace('|', '?'));
						}, 200);
					}
				}

				window.onhashchange = $.history._check;
			},
			_check() {
				let current_hash = location.hash.skipChar('#').replace('?', '|');
				if (!current_hash) $(window).trigger('hash.empty');

				if (!$.history._isHis && $.history._isPop) {
					$.history._isHis = true;
					return;
				}
				if (current_hash && current_hash != $.history._currentHash) {
					$.history._currentHash = current_hash;
					$.history.load(current_hash);
				}
				$.history._isHis = true;
			},
			add(hash, fun, args) {
				hash = hash.replace('?', '|').replace(/\?.*$/, '');

				$.history._isPop = false;
				$.history._currentHash = hash;
				$.history._hash.push([hash, fun, args]);
				location.hash = hash;
			},
			pop(local) {
				if (local) {
					$.history._isPop = true;
					$.history._isHis = false;
				} else {
					$.history._isPop = false;
					$.history._isHis = true;
				}
				if ($.history._hash.length > 0) {
					$.history._hash.pop();
					// location.hash = $.history._hash[$.history._hash.length -1][0];

					if (local) {
						history.back(); // 处理点击页面返回按钮，再点击android返回按键问题
					}
				} else {
					$(window).trigger('hash.empty.pop');
				}
			},
			load(hash) {
				for (let i = 0; i < $.history._hash.length; i += 1) {
					let fun = $.history._hash[i][1];
					if ($.history._hash[i][0] == hash && fun) {
						fun($.history._hash[i][2]);
						return;
					}
				}
			}
		}
	});
})(dwz);
