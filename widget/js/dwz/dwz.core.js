/**
 * @author 张慧华 <350863780@qq.com>
 * DWZ Mobile Framework 核心库: 相当于一个专门针对移动端优化的精简版jQuery，代码量只有jQuery 的十分之一左右，使用方式基本同jQuery。
 * http://www.w3schools.com/cssref/css_selectors.asp
 */
const dwz = function (selector, context) {
	return new dwz.prototype.init(selector, context);
};

window.$ = window.$ || dwz;

dwz.version = 'mobile 1.0.0';
dwz.rootNodeRE = /^(?:body|html)$/i;
dwz.config = {
	pageInfo: { pageNum: 'pageNum' },
	statusCode: { ok: 200, error: 300, timeout: 301 },
	keys: { statusCode: 'statusCode', message: 'message' },
	unitBox: 'unitBox',

	rreturn: /\r/g,
	r20: /%20/g,
	rCRLF: /\r?\n/g,
	rsubmitterTypes: /^(?:submit|button|image|reset|file)$/i,
	rsubmittable: /^(?:input|select|textarea|keygen)/i,
	rcheckableType: /^(?:checkbox|radio)$/i,
	rnotwhite: /\S+/g,

	frag: {} // 页面组件html片段
};
dwz.regPlugins = []; //  插件注册：dwz.regPlugins.push(function($p){});

dwz.extend = function () {
	// copy reference to target object
	let target = arguments[0] || {},
		i = 1,
		length = arguments.length,
		options;
	// Handle a deep copy situation
	if (typeof target === 'boolean') {
		target = arguments[1] || {};
		// skip the boolean and the target
		i = 2;
	}
	// Handle case when target is a string or something (possible in deep copy)
	if (typeof target !== 'object' && !target) target = {};
	// extend dwz itself if only one argument is passed
	if (length == i) {
		target = this;
		--i;
	}
	for (; i < length; i++)
		// Only deal with non-null/undefined values
		if ((options = arguments[i]) != null) {
			// Extend the base object
			for (let name in options) {
				let src = target[name],
					copy = options[name];
				// Prevent never-ending loop
				if (target === copy) continue;

				if (copy !== undefined) target[name] = copy;
			}
		}

	// Return the modified object
	return target;
};

dwz.extend({
	/**
	 * function test1(){ alert(1); }
	 * dwz.eavl('test1')();
	 *
	 * dwz.eavl('function test2() {alert(2);}');
	 * test2();
	 *
	 * @param str: js定义的全局函数名；也可以是定义一个函数，但定义函数 dwz.eavl() 返回空值
	 * @returns {null}
	 */
	eavl(str) {
		if (!str) {
			return null;
		}
		return (1, eval)(str);
	},
	// 判断2个function相等
	eqFunction(fn1, fn2) {
		if (dwz.isFunction(fn1) && dwz.isFunction(fn2)) {
			let _regexp = /^(function\s*)(\w*\b)/;
			return fn1 === fn2 || fn1.toString().replace(_regexp, '$1') === fn2.toString().replace(_regexp, '$1');
		}
		return false;
	},
	isFunction(obj) {
		return typeof obj === 'function';
	},
	isArray(arr) {
		return Object.prototype.toString.call(arr) === '[object Array]';
	},

	instanceOf(object) {
		if (!object) return false;

		return object instanceof dwz.prototype.init;
	},

	inArray(elem, arr, i) {
		return arr == null ? -1 : [].indexOf.call(arr, elem, i) != -1;
	},

	// results is for internal usage only
	makeArray(arr, results) {
		let ret = results || [];

		if (arr != null) {
			[].push.call(ret, arr);
		}

		return ret;
	},
	merge(first, second) {
		let len = +second.length,
			j = 0,
			i = first.length;

		for (; j < len; j++) {
			first[i++] = second[j];
		}

		first.length = i;

		return first;
	},
	each(objs, callback, args) {
		if (dwz.isArray(objs)) {
			let results = [];
			for (let i = 0; i < objs.length; i++) {
				let cbResult = callback.call(objs[i], i, objs[i], args);
				if (cbResult !== undefined) results.push(cbResult); //filter Array item
				if (cbResult === false) break;
			}

			return results;
		} else {
			// dwz object
			let elements = [];
			for (let i = 0; i < objs.length; i++) {
				let elem = objs.get(i),
					flag = callback.call(elem, i, elem, args);
				if (flag || flag === undefined) elements.push(elem); //filter dwz object
				if (flag === false) break;
			}

			return dwz(elements);
		}
	},
	get($obj, index) {
		return dwz.instanceOf($obj) ? $obj.get(index) : $obj;
	},
	isSameTag(elem, name) {
		return elem.nodeName && elem.nodeName.toLowerCase() === name.toLowerCase();
	},

	error(msg) {
		throw new Error(msg);
	},

	urlInterceptor: null,
	getUrlInterceptor(url) {
		if (!url) return dwz.urlInterceptor;

		let params = url.getParams();
		if (params.dwz_interceptor) {
			return dwz.eavl(params.dwz_interceptor);
		}
		return dwz.urlInterceptor;
	},
	getUrlCallback(url) {
		if (!url) return null;

		let params = url.getParams();
		if (params.dwz_callback) {
			return dwz.eavl(params.dwz_callback);
		}
		return null;
	},
	eval(funcStr) {
		let _evalFn = '(false || ' + funcStr + ')';
		if (window.execScript) {
			return window.execScript(_evalFn); // 给IE的特殊待遇
		} else {
			return window.eval(_evalFn); // 给其他大部分浏览器用的
		}
	},
	// 在页面render后，判断url参数中有没有helper函数; 或者页面上有script js function，有就执行
	execHelperFn($target, tpl, params) {
		if (params.dwz_helper) {
			let helperFn;
			if (params.dwz_helper == 'script') {
				if (tpl.script) helperFn = dwz.eval(tpl.script);
			} else {
				helperFn = dwz.eavl(params.dwz_helper);
			}
			helperFn && helperFn.call($target, tpl, params);
		}
	},
	/**
	 * 分离页面上的模板 <script id="sc-xxx" type="text/html"></script>
	 * @param html
	 * @returns {{html: (*|string), 'tpl_xxx1': (*|string), 'tpl_xxx2': (*|string)}}
	 */
	templateWrap(html) {
		let ret = { html: html || '', script: '' };
		let regDetectJs = /<script(.|\n)*?>(.|\n|\r\n)*?<\/script>/gi;
		let jsContained = ret.html.match(regDetectJs);
		if (jsContained) {
			// 分段取出js正则
			let regGetJS = /<script(.|\n)*?>((.|\n|\r\n)*)?<\/script>/im;

			// 按顺序分段执行js
			let jsNums = jsContained.length;
			for (let i = 0; i < jsNums; i++) {
				let $script = $(jsContained[i]),
					_type = $script.attr('type'),
					_id = $script.attr('id');
				let jsSection = jsContained[i].match(regGetJS);
				if (_type == 'text/html') {
					ret[_id || 'default'] = jsSection[2];
				} else if (!ret.script) {
					ret.script = jsSection[2];
				}
			}
		}

		ret.html = ret.html.replace(regDetectJs, '');

		return ret;
	}
});

dwz.config.selector = {
	':input': 'input, select, textarea, button',
	':text': 'input:not([type=radio]):not([type=checkbox]):not([type=submit]):not([type=reset]):not([type=button]):not([type=file]):not([type=hidden]):not([type=image])',
	':password': 'input[type=password]',
	':radio': 'input[type=radio]',
	':checkbox': 'input[type=checkbox]',
	':submit': 'input[type=submit], button[type=submit]',
	':reset': 'input[type=reset], button[type=reset]',
	':button': 'input[type=button], input[type=submit], input[type=reset], input[type=image], button',
	':file': 'input[type=file]',
	':image': 'input[type=image]',
	':hidden': 'input[type=hidden]'
};
dwz.prototype.init = function (selector, context) {
	this.selector = selector;
	this.context = context;
	this.elements = []; //Take an array of elements and push it onto the stack
	this.length;

	if (!selector) {
		return this;
	}

	let contextSize = 1; // 标记context.elements是否多个

	// Handle HTML strings
	if (typeof selector === 'string') {
		selector = selector.trim(); // 字符类型选择器，去除空格

		if (selector.startsWith('>')) {
			selector = ':scope' + selector;
		}
		if (context) {
			if (typeof context === 'string') {
				context = document.querySelector(context);
			} else if (dwz.instanceOf(context)) {
				contextSize = context.elements.length;
				context = contextSize > 1 ? context.elements : context.elements[0];
			}
		}

		this.context = context || document;

		if (contextSize > 1) {
			for (let i = 0; i < this.context.length; i++) {
				let elements = [];
				if (selector) this.context[i].querySelectorAll(dwz.config.selector[selector] || selector);

				Array.prototype.push.apply(this.elements, elements);
			}
		} else {
			if (selector.indexOf('<') >= 0 && selector.indexOf('>') >= 0) {
				this.elements = dwz.parseHTML(selector, true); // html字符串转dom
			} else {
				if (selector) this.elements = this.context.querySelectorAll(dwz.config.selector[selector] || selector);
			}
		}
	} else if (dwz.instanceOf(selector)) {
		return selector;
	} else if (selector instanceof Element || selector === document || selector === window) {
		this.elements = [selector];
	} else if (selector instanceof NodeList || dwz.isArray(selector)) {
		this.elements = selector;
	} else if (dwz.isFunction(selector)) {
		document.addEventListener('DOMContentLoaded', selector);
		return window.onload;
	}

	if (!this.context) this.context = document;

	this.length = this.elements.length;

	return this;
};

dwz.fn = dwz.extend(dwz.prototype.init.prototype, {
	extend(obj) {
		dwz.extend(dwz.fn, obj);
	},
	toArray() {
		return this.elements;
	},
	size() {
		return this.length;
	},
	eq(index) {
		return dwz(this.elements[index]);
	},
	get(index) {
		return index === undefined ? this.elements : this.elements[index];
	},
	first() {
		return this.eq(0);
	},
	last() {
		return this.eq(this.elements.length - 1);
	},
	parentNode() {
		return this.get(0).parentNode;
	},
	parent() {
		return $(this.parentNode());
	},
	parentsUntil(fn) {
		let elem = this.get(0),
			body = document.getElementsByTagName('body'),
			depth = 0;

		while (depth < 100) {
			elem = elem.parentNode;
			if (fn.call(elem, depth)) {
				return dwz(elem);
			}
			if (elem == body || elem == document) {
				break;
			}
			depth++;
		}

		// 没有找到匹配父容器，返回dwz空对象
		return dwz();
	},
	parentsUnitBox(className) {
		return this.parentsUntil(function () {
			return dwz.hasClass(this, className || dwz.config.unitBox);
		});
	},
	parentsByTag(tagName) {
		return this.parentsUntil(function () {
			return dwz.isSameTag(this, tagName);
		});
	},
	children(selector) {
		return this.find(':scope > ' + (selector || '*'));
	},
	find(selector) {
		return this.size() == 0 ? this : dwz(selector, this);
	},
	filter(fn) {
		let elements = [];
		for (let i = 0; i < this.length; i++) {
			let elem = this.get(i),
				flag = fn.call(elem, i, elem);
			if (flag) elements.push(elem);
		}

		return dwz(elements);
	},
	each(callback, args) {
		return dwz.each(this, callback, args);
	},
	is(selector) {
		let flag = false,
			elem = this.get(0);
		$(selector, this.parentNode()).each(function () {
			if (this == elem) {
				flag = true;
				return;
			}
		});
		return flag;
	}
});

/////////////////////////

dwz.extend({
	getStorage(key) {
		let str = localStorage.getItem(key);
		if (str) {
			return JSON.parse(str);
		}
	},
	setStorage(key, data) {
		localStorage.setItem(key, JSON.stringify(data));
	},
	removeStorage(key) {
		localStorage.removeItem(key);
	},
	clientX(event) {
		return event.pageX || event.clientX || (event.targetTouches ? event.targetTouches[0].clientX : 0);
	},
	clientY(event) {
		return event.pageY || event.clientY || (event.targetTouches ? event.targetTouches[0].clientY : 0);
	},
	speed: {
		/**
		 * 计算移动数度，单位xx像素/每秒
		 * @param event
		 * @return {x: 0, y: 0}
		 */
		cal(pos, prePos) {
			const _speed = { x: 0, y: 0 };
			if (!pos || !prePos) return _speed;
			let t = pos.timestamp - prePos.timestamp,
				distX = pos.x - prePos.x,
				distY = pos.y - prePos.y;

			_speed.x = t > 0 ? (distX / t) * 1000 : distX; // 速度每秒n像素
			_speed.y = t > 0 ? (distY / t) * 1000 : distY;
			return _speed;
		}
	},
	event: {
		hasTouch: 'ontouchstart' in window,
		type: {
			pageClear: 'pageClear', // 用于重新ajaxLoad时，去除iscroll等需要特殊处理的资源
			activated: 'activated'
		},
		add(elem, types, data, fn) {
			let _events = dwz.data(elem, '_events') || {}; // 初始化{touchstart:[], touchend[]...}

			if (!fn) {
				fn = data;
				data = undefined;
			}

			dwz.each(types.split(/\s+/), function (index) {
				let type = this;

				let handler = function (event) {
					if (data !== undefined) event.data = data; // 自定义传参
					if (fn.call(elem, event) === false) {
						event.stopPropagation();
						event.preventDefault();
					}
				};

				_events[type] = _events[type] || [];

				// 判断重复事件
				let _isEventBind = false;
				for (let i = 0; i < _events[type].length; i++) {
					if (dwz.eqFunction(fn, _events[type][i].fn)) {
						_isEventBind = true;
						break;
					}
				}
				if (!_isEventBind) {
					_events[type].push({ handler: handler, fn: fn });
					elem.addEventListener(type, handler, { passive: false }); //passive 参数不能省略，用来兼容ios和android
				}
			});

			dwz.data(elem, '_events', _events);
		},
		remove(elem, types, fn) {
			let _events = dwz.data(elem, '_events') || {}; // 初始化{touchstart:[], touchend[]...}

			dwz.each(types.split(/\s+/), function (index) {
				let type = this;

				if (!_events[type]) {
					return;
				}

				for (let i = 0; i < _events[type].length; i++) {
					if (!fn) {
						// 解绑全部相同类型的事件
						elem.removeEventListener(type, _events[type][i].handler, false);
					} else if (dwz.eqFunction(fn, _events[type][i].fn)) {
						elem.removeEventListener(type, _events[type][i].handler, false);
						_events[type].splice(i, 1); // 清理dwz_data._events
						break;
					}
				}

				if (fn === undefined) {
					// 清理dwz_data._events
					_events[type] = [];
				}
			});

			dwz.data(elem, '_events', _events);
		},
		trigger(elem, type, data) {
			let event = new Event(type);
			if (data !== undefined) event.data = data;
			elem.dispatchEvent(event);
		},
		isBind(elem, type, fn) {
			let _events = dwz.data(elem, '_events') || {}; // 初始化{touchstart:[], touchend[]...}

			if (_events[type] && _events[type].length > 0) {
				if (fn !== undefined) {
					for (let i = 0; i < _events[type].length; i++) {
						if (fn === _events[type][i].fn) {
							return true;
						}
					}
				} else {
					return true;
				}
			}

			return false;
		},
		getDistance(x1, y1, x2, y2) {
			let dx = Math.abs(x2 - x1),
				dy = Math.abs(y2 - y1),
				distance = Math.sqrt(dx * dx + dy * dy);

			return distance;
		},
		getCenterPos(x1, y1, x2, y2) {
			let tmp = {
				minX: Math.min(x1, x2),
				maxX: Math.max(x1, x2),
				minY: Math.min(y1, y2),
				maxY: Math.max(y1, y2)
			};
			let pos = {
				x: tmp.minX + (tmp.maxX - tmp.minX) / 2,
				y: tmp.minY + (tmp.maxY - tmp.minY) / 2
			};

			return pos;
		}
	},

	contains: document.documentElement.contains
		? function (parent, node) {
				return parent !== node && parent.contains(node);
		  }
		: function (parent, node) {
				while (node && (node = node.parentNode)) if (node === parent) return true;
				return false;
		  },
	offset(elem) {
		let obj = elem.getBoundingClientRect();
		return {
			left: obj.left + window.pageXOffset,
			top: obj.top + window.pageYOffset,
			width: Math.round(obj.width),
			height: Math.round(obj.height)
		};
	},
	position(elem) {
		if (!elem) return;

		// Get *real* offsetParent
		let offsetParent = dwz.offsetParent(elem),
			// Get correct offsets
			offset = dwz.offset(elem),
			parentOffset = dwz.rootNodeRE.test(offsetParent.nodeName) ? { top: 0, left: 0 } : dwz.offset(offsetParent);

		// Subtract element margins
		// note: when an element has margin: auto the offsetLeft and marginLeft
		// are the same in Safari causing offset.left to incorrectly be 0
		offset.top -= parseFloat(elem.style.marginTop) || 0;
		offset.left -= parseFloat(elem.style.marginLeft) || 0;

		// Add offsetParent borders
		parentOffset.top += parseFloat(offsetParent.style.borderTopWidth) || 0;
		parentOffset.left += parseFloat(offsetParent.style.borderLeftWidth) || 0;

		// Subtract the two offsets
		return {
			top: offset.top - parentOffset.top,
			left: offset.left - parentOffset.left
		};
	},
	offsetParent(elem) {
		let parent = elem.offsetParent || document.body;
		while (parent && !dwz.rootNodeRE.test(parent.nodeName) && parent.style.position == 'static') parent = parent.offsetParent;
		return parent;
	},
	hasClass(elem, className) {
		return new RegExp(' ' + className + ' ').test(' ' + elem.className + ' ');
	},
	addClass(elem, classNames) {
		let newClass = elem.className.replace(/[\t\r\n]/g, ' ');
		dwz.each(classNames.split(/\s+/), function () {
			if (!dwz.hasClass(elem, this)) {
				newClass += ' ' + this;
			}
		});
		elem.className = newClass.replace(/^\s+|\s+$/g, '');
		return elem;
	},
	removeClass(elem, classNames) {
		let newClass = ' ' + elem.className.replace(/[\t\r\n]/g, ' ') + ' ';

		dwz.each(classNames.split(/\s+/), function () {
			while (newClass.indexOf(' ' + this + ' ') >= 0) {
				newClass = newClass.replace(' ' + this + ' ', ' ');
			}
		});

		elem.className = newClass.replace(/^\s+|\s+$/g, '');
		return elem;
	},
	toggleClass(elem, className) {
		if (this.hasClass(elem, className)) {
			this.removeClass(elem, className);
		} else {
			this.addClass(elem, className);
		}

		return elem;
	},
	attr(elem, name, value) {
		if (elem === document || elem === window) return false;

		if (value === undefined) {
			return elem.getAttribute(name);
		} else {
			if (value === null) {
				elem.removeAttribute(name);
			} else {
				elem.setAttribute(name, value);
			}
		}
	},
	prop(elem, name, value) {
		if (!$.inArray(name, ['checked', 'selected', 'disabled'])) return false;

		if (value === undefined) {
			return elem[name];
		} else {
			elem[name] = value && true;
		}
	},
	css(elem, key, value) {
		if (value !== undefined) {
			elem.style[key] = value;
		} else {
			if (typeof key === 'string') {
				if (elem.currentStyle) {
					return elem.currentStyle[key]; //IE
				} else {
					return document.defaultView.getComputedStyle(elem, null)[key]; //标准浏览器
				}
			} else {
				for (let k in key) {
					elem.style[k] = key[k];
				}
			}
		}
	},
	data(elem, name, value) {
		elem.dwz_data = elem.dwz_data || {}; // 初始化

		// 获取全部data
		if (name === undefined) {
			return elem.dwz_data;
		}

		if (typeof name === 'string') {
			let dataName = dwz.camelCase(name);
			if (value === undefined) {
				return elem.dwz_data[dataName];
			} else {
				elem.dwz_data[dataName] = value;
			}
		} else if (typeof name === 'object') {
			for (let key in name) {
				let dataName = dwz.camelCase(key);
				elem.dwz_data[dataName] = name[key];
			}
		}
	},
	removeData(elem, name) {
		if (!elem.dwz_data) return;
		delete elem.dwz_data[name];
	},
	cacheCss(elem, name, excludeVal) {
		let _css = dwz.data(elem, '_css') || {};
		let styleCss = dwz.css(elem, name);
		if (excludeVal && styleCss != excludeVal) {
			_css[name] = styleCss;
			dwz.data(elem, '_css', _css);
		}
		return _css[name];
	},
	camelCase(string) {
		return string.replace(/-([\da-z])/gi, function (all, letter) {
			return letter.toUpperCase();
		});
	},
	html(elem, content) {
		if (content === undefined) {
			return elem.innerHTML;
		} else {
			if (typeof content == 'string') {
				let regDetectJs = /<script(.|\n)*?>(.|\n|\r\n)*?<\/script>/gi;
				elem.innerHTML = content.replace(regDetectJs, ''); // 插入页面时，删除script标签
			} else if (dwz.instanceOf(content)) {
				elem.innerHTML = '';
				content.each(function () {
					elem.appendChild(this);
				});
			} else {
				elem.innerHTML = content;
			}
		}
	},
	text(elem, content) {
		if (content === undefined) {
			let text = elem.innerText || elem.textContent;
			return text ? text.trim() : '';
		} else {
			if (elem.innerText !== undefined) {
				elem.innerText = content;
			} else {
				elem.textContent = content;
			}
		}
	},
	// 获取光标位置
	selectionPos(textDom) {
		const cursorPos = $.extend({ top: 0, left: 0, width: 0, heigth: 0, start: 0, paddingLeft: 0 }, dwz.offset(textDom));
		cursorPos.paddingLeft = parseInt(dwz.css(textDom, 'padding-left'));
		if (document.selection) {
			// IE Support
			textDom.focus();
			const selectRange = document.selection.createRange();
			selectRange.moveStart('character', -textDom.value.length);
			cursorPos.start = selectRange.text.length;
		} else if (textDom.selectionStart || textDom.selectionStart == '0') {
			// Firefox support
			cursorPos.cursorStart = textDom.selectionStart;
		}
		return cursorPos;
	},
	param(data) {
		let params = '';
		if (dwz.isArray(data)) {
			// [{name:"", value:""},{name:"", value:""}]
			for (let i = 0; i < data.length; i++) {
				params += (params ? '&' : '') + data[i].name + '=' + (data[i].value + '').encodeParam();
			}
		} else {
			// {name1:value1, name2:value2}
			for (let key in data) {
				params += (params ? '&' : '') + key + '=' + (data[key] + '').encodeParam();
			}
		}

		return params;
	},
	parseJSON(data) {
		return JSON.parse(data + '');
	},
	parseXML(data) {
		let xml, tmp;
		if (!data || typeof data !== 'string') {
			return null;
		}

		// Support: IE9
		try {
			tmp = new DOMParser();
			xml = tmp.parseFromString(data, 'text/xml');
		} catch (error) {
			xml = undefined;
		}

		if (!xml || xml.getElementsByTagName('parsererror').length) {
			dwz.error('Invalid XML: ' + data);
		}
		return xml;
	},
	parseHTML(content, more) {
		let div = document.createElement(content.startsWith('<tr') ? 'tbody' : 'div');
		div.innerHTML = content;

		if (more) {
			return div.querySelectorAll(':scope > *');
		}
		return div.querySelector('*');
	}
});

/**
 * 扩展String方法
 */
dwz.extend(String.prototype, {
	// 转为unicode 编码
	encodeUnicode() {
		const res = [];
		for (let i = 0; i < this.length; i++) {
			res[i] = ('00' + this.charCodeAt(i).toString(16)).slice(-4);
		}
		return '\\u' + res.join('\\u');
	},
	// 解码
	decodeUnicode() {
		let str = this.replace(/\\/g, '%');
		return unescape(str);
	},

	trim() {
		return this.replace(/(^\s*)|(\s*$)|\r|\n/g, '');
	},
	startsWith(pattern) {
		return this.indexOf(pattern) === 0;
	},
	endsWith(pattern) {
		let d = this.length - pattern.length;
		return d >= 0 && this.lastIndexOf(pattern) === d;
	},
	replaceSuffix(index) {
		return this.replace(/\[[0-9]+\]/, '[' + index + ']').replace('#index#', index);
	},
	getRequestURI() {
		let indexOf = this.indexOf('?');
		let uri = indexOf == -1 ? this + '' : this.substr(0, indexOf);
		return uri;
	},
	getParams(encode) {
		let params = {},
			indexOf = this.indexOf('?');
		if (indexOf != -1) {
			let str = this.substr(indexOf + 1),
				strs = str.split('&');
			for (let i = 0; i < strs.length; i++) {
				let item = strs[i].split('=');
				let val = encode ? item[1].encodeParam() : item[1];
				params[item[0]] = item.length > 1 ? val : '';
			}
		}
		return params;
	},
	encodeParam() {
		return encodeURIComponent(this).replace(dwz.config.rCRLF, '\r\n').replace(dwz.config.r20, '+');
	},
	replaceAll(os, ns) {
		return this.replace(new RegExp(os, 'gm'), ns);
	},
	replaceTm: function (params) {
		if (!params) return this;
		return this.replace(RegExp('({[A-Za-z_]+[A-Za-z0-9_]*})', 'g'), function ($1) {
			return params[$1.replace(/[{}]+/g, '')];
		});
	},
	skipChar(ch) {
		if (!this || this.length === 0) {
			return '';
		}
		if (this.charAt(0) === ch) {
			return this.substring(1).skipChar(ch);
		}
		return this;
	},
	isPositiveInteger() {
		return new RegExp(/^[1-9]\d*$/).test(this);
	},
	isInteger() {
		return new RegExp(/^\d+$/).test(this);
	},
	isNumber(value, element) {
		return new RegExp(/^-?(?:\d+|\d{1,3}(?:,\d{3})+)(?:\.\d+)?$/).test(this);
	},
	isValidPwd() {
		return new RegExp(/^([_]|[a-zA-Z0-9]){6,32}$/).test(this);
	},
	isValidMail() {
		return new RegExp(/^\w+((-\w+)|(\.\w+))*\@[A-Za-z0-9]+((\.|-)[A-Za-z0-9]+)*\.[A-Za-z0-9]+$/).test(this.trim());
	},
	isMobile() {
		return new RegExp(/(^[0-9]{11,11}$)/).test(this);
	},
	isUrl() {
		return new RegExp(/^[a-zA-z]+:\/\/([a-zA-Z0-9\-\.]+)([-\w .\/?%#&=:]*)$/).test(this);
	},
	parseCurrency(num) {
		let numberValue = parseFloat(this);
		return parseFloat(numberValue.toFixed(num || 2));
	}
});

/**
 * 扩展Number方法
 */
dwz.extend(Number.prototype, {
	roundFloat(n = 3) {
		return Math.round(this * Math.pow(10, n)) / Math.pow(10, n);
	},
	formatCurrency(useComma, useCent = true) {
		let num = this;

		num = num.toString().replace(/\$|\,/g, '');
		if (isNaN(num)) {
			num = '0';
		}

		let sign = num == (num = Math.abs(num));
		num = Math.floor(num * 100 + 0.50000000001);
		let cents = num % 100;
		num = Math.floor(num / 100).toString();

		if (cents < 10) {
			cents = '0' + cents;
		}

		if (useComma) {
			for (var i = 0; i < Math.floor((num.length - (1 + i)) / 3); i++) {
				num = num.substring(0, num.length - (4 * i + 3)) + ',' + num.substring(num.length - (4 * i + 3));
			}
		}

		return (sign ? '' : '-') + num + (useCent ? '.' + cents : '');
	},
	parseCurrency(num) {
		return parseFloat(this.toFixed(num || 2));
	}
});

/**
 * 扩展dwz对象方法
 */
dwz.fn.extend({
	initUI() {
		return this.each(function () {
			let $this = $(this);
			$.each(dwz.regPlugins, function (index) {
				this($this);
			});
		});
	},
	/**
	 * 合并2个dwz对象
	 * @param {*} selector
	 * @param {*} context
	 */
	add(selector, context) {
		let newObj = $(selector, context);
		let elements = [...this.elements, ...newObj.elements];
		return $(elements);
	},
	/**
	 * $box.on('touchstart', {test:123}, function(event){
	 * 		console.log(event, event.data);
	 * }, 'myData');
	 *
	 * @param types: 可以是空格分隔的多个事件名称
	 * @param data
	 * @param fn
	 * @returns dwz object
	 */
	on(types, data, fn) {
		return this.each(function () {
			dwz.event.add(this, types, data, fn);
		});
	},
	off(types, fn) {
		return this.each(function () {
			dwz.event.remove(this, types, fn);
		});
	},
	/**
	 * $box.on('custom.event', function(event){
	 * 		console.log(event, event.data);
	 * });
	 * $box.trigger('custom.event', {test1:'a1', test2:'b1'});
	 * @param type
	 * @returns dwz object
	 */
	trigger(type, data) {
		return this.each(function () {
			dwz.event.trigger(this, type, data);
		});
	},
	isBind(type, fn) {
		return dwz.event.isBind(this.get(0), type, fn);
	},

	onPageClear(fn, data) {
		return this.on(dwz.event.type.pageClear, fn, data);
	},
	offPageClear(fn, data) {
		return this.off(dwz.event.type.pageClear, fn, data);
	},
	onActivated(fn, data) {
		return this.on(dwz.event.type.activated, fn, data);
	},
	offActivated(fn, data) {
		return this.off(dwz.event.type.activated, fn, data);
	},
	/**
	 * 关闭页面时回收页面内存
	 * 例如：
	 *    myScroll.destroy();
	 *    myScroll = null;
	 *
	 * @param data
	 * @returns {*|dwz}
	 */
	triggerPageClear(data) {
		return this.trigger(dwz.event.type.pageClear, data);
	},
	click(data, fn) {
		// if ($.event.hasTouch && $.fn.touchwipe) {
		// 	return this.touchwipe({
		// 		touch: fn || data,
		// 		data: fn ? data : undefined
		// 	});
		// }
		// return this.on($.event.hasTouch ? 'touchend' : 'click', data, fn);

		// this.on('touchstart', (event) => event.stopPropagation()); // 禁止事件冒泡, 打开这行会影响父容器scroll
		return this.on('click', data, fn);
	},
	change(data, fn) {
		return this.on('change', data, fn);
	},
	offset() {
		return dwz.offset(this.get(0));
	},
	position() {
		return dwz.position(this.get(0));
	},
	offsetParent() {
		return dwz.offsetParent(this.get(0));
	},
	show() {
		return this.each(function () {
			let defaultCss = dwz.cacheCss(this, 'display', 'none') || 'block';
			this.style['display'] = defaultCss;
		});
	},
	hide() {
		return this.each(function () {
			dwz.cacheCss(this, 'display', 'none');
			this.style['display'] = 'none';
		});
	},
	toggle() {
		return this.each(function () {
			let defaultCss = dwz.cacheCss(this, 'display', 'none') || 'block';
			this.style['display'] = this.style['display'] == 'none' ? defaultCss : 'none';
		});
	},
	hasClass(className) {
		return this.size() !== 0 && dwz.hasClass(this.get(0), className);
	},
	addClass(classNames) {
		return this.each(function () {
			dwz.addClass(this, classNames);
		});
	},
	removeClass(classNames) {
		return this.each(function () {
			dwz.removeClass(this, classNames);
		});
	},
	toggleClass(className) {
		return this.each(function () {
			dwz.toggleClass(this, className);
		});
	},
	attr(name, value) {
		if (value === undefined) {
			return dwz.attr(this.get(0), name);
		}

		return this.each(function () {
			dwz.attr(this, name, value);
		});
	},
	removeAttr(name) {
		return this.each(function () {
			dwz.attr(this, name, null);
		});
	},
	prop(name, value) {
		if (value === undefined) {
			return dwz.prop(this.get(0), name);
		}

		return this.each(function () {
			dwz.prop(this, name, value);
		});
	},
	data(name, value) {
		if (typeof name === 'string' && value === undefined) {
			return dwz.data(this.get(0), name);
		}

		return this.each(function () {
			dwz.data(this, name, value);
		});
	},
	dataset() {
		return this.size() === 0 ? {} : this.get(0).dataset;
	},
	css(key, value) {
		if (value !== undefined) {
			return this.each(function () {
				this.style[key] = value;
			});
		}
		if (key === undefined) {
			return this.get(0).style;
		} else {
			if (typeof key === 'string') {
				return dwz.css(this.get(0), key);
			} else {
				return this.each(function () {
					for (let k in key) {
						this.style[k] = key[k];
					}
				});
			}
		}
	},
	width(margin) {
		let width = parseFloat(this.css('width'));
		if (margin) {
			width += parseFloat(this.css('marginLeft'));
			width += parseFloat(this.css('marginRight'));
		}
		return width;
	},
	height(margin) {
		let height = parseFloat(this.css('height'));
		if (margin) {
			height += parseFloat(this.css('marginTop'));
			height += parseFloat(this.css('marginBottom'));
		}
		return height;
	},
	outerWidth(margin) {
		let width = this.width(margin) + parseFloat(this.css('borderLeft')) + parseFloat(this.css('borderRight'));
		return width;
	},
	outerHeight(margin) {
		let height = this.height(margin) + parseFloat(this.css('borderTop')) + parseFloat(this.css('borderTop'));
		return height;
	},
	html(content) {
		let result = dwz.html(this.get(0), content);
		return content === undefined ? result : this;
	},
	text(content) {
		let result = dwz.text(this.get(0), content);
		return content === undefined ? result : this;
	},
	prepend(content) {
		let elem = this.get(0);
		$(content).each((i, el) => {
			elem.insertBefore(el, elem.firstChild);
		});
		return this;
	},
	append(content) {
		let elem = this.get(0);
		$(content).each((i, el) => {
			elem.appendChild(el);
		});
		return this;
	},
	before(content) {
		let pNode = this.parentNode();
		$(content).each((i, el) => {
			pNode.insertBefore(el, this.get(0));
		});
		return this;
	},
	after(content) {
		let pNode = this.parentNode();
		$(content).each((i, el) => {
			pNode.insertBefore(el, this.get(0).nextSibling);
		});
		return this;
	},
	prependTo(dest) {
		if (dwz.instanceOf(dest)) dest = dest.get(0);
		this.each(function (index) {
			dest.insertBefore(this, dest.firstChild);
		});
		return this;
	},
	appendTo(dest) {
		if (dwz.instanceOf(dest)) dest = dest.get(0);
		this.each(function (index) {
			dest.appendChild(this);
		});
		return this;
	},
	afterTo(dest) {
		if (dwz.instanceOf(dest)) dest = dest.get(0);
		return this.appendTo(dest.parentNode);
	},
	remove() {
		return this.each(function (index) {
			this.parentNode.removeChild(this);
		});
	},
	wrap(html) {
		let isFunction = dwz.isFunction(html);

		return this.each(function (i) {
			let parentElement = dwz.parseHTML(isFunction ? html.call(this, i) : html);
			this.parentNode.appendChild(parentElement);
			parentElement.appendChild(this);
		});
	},
	clone(deep) {
		return dwz(this.get(0).cloneNode(true));
	},
	selectionPos() {
		return dwz.selectionPos(this.get(0));
	},
	serialize() {
		return dwz.param(this.serializeArray());
	},
	serializeArray() {
		const arr = [];
		if (this.is('form')) {
			this.find(':input')
				.filter(function () {
					const type = this.type;

					// Use .is( ":disabled" ) so that fieldset[disabled] works
					return this.name && !dwz(this).is(':disabled') && dwz.config.rsubmittable.test(this.nodeName) && !dwz.config.rsubmitterTypes.test(type) && (this.checked || !dwz.config.rcheckableType.test(type));
				})
				.each(function () {
					const $input = $(this),
						val = $input.val() || '',
						name = this.name;

					arr.push({
						name: name,
						value: val
					});
				});
		}
		return arr;
	},
	serializeMap() {
		const arr = {};
		if (this.is('form')) {
			this.find(':input')
				.filter(function () {
					const type = this.type;
					return this.name && !dwz(this).is(':disabled') && dwz.config.rsubmittable.test(this.nodeName) && !dwz.config.rsubmitterTypes.test(type) && (this.checked || !dwz.config.rcheckableType.test(type));
				})
				.each(function () {
					const $input = $(this),
						val = $input.val() || '';
					arr[this.name] = this.type == 'number' || this.type == 'range' ? parseFloat(val) || 0 : val;
				});
		}
		return arr;
	},

	val(value) {
		let hooks,
			ret,
			isFunction,
			elem = this.get(0);

		if (!arguments.length) {
			if (elem) {
				hooks = dwz.valHooks[elem.type] || dwz.valHooks[elem.nodeName.toLowerCase()];

				if (hooks && 'get' in hooks && (ret = hooks.get(elem, 'value')) !== undefined) {
					return ret;
				}

				ret = elem.value;

				return typeof ret === 'string'
					? // Handle most common string cases
					  ret.replace(dwz.config.rreturn, '')
					: // Handle cases where value is null/undef or number
					ret == null
					? ''
					: ret;
			}

			return;
		}

		isFunction = dwz.isFunction(value);

		return this.each(function (i) {
			let val;

			if (this.nodeType !== 1) {
				return;
			}

			if (isFunction) {
				val = value.call(this, i, dwz(this).val());
			} else {
				val = value;
			}

			// Treat null/undefined as ""; convert numbers to string
			if (val == null) {
				val = '';
			} else if (typeof val === 'number') {
				val += '';
			} else if (dwz.isArray(val)) {
				val = dwz.each(val, function () {
					return this == null ? '' : this + '';
				});
			}

			hooks = dwz.valHooks[this.type] || dwz.valHooks[this.nodeName.toLowerCase()];

			// If set returns undefined, fall back to normal setting
			if (!hooks || !('set' in hooks) || hooks.set(this, val, 'value') === undefined) {
				this.value = val;
			}
		});
	},
	hrefFix() {
		return this.each(function () {
			const $this = $(this),
				href = $this.attr('href');
			if (href && href != 'javascript:') {
				$this.attr('data-href', href).attr('href', 'javascript:');
			}
		});
	}
});

dwz.extend({
	valHooks: {
		option: {
			get(elem) {
				let val = dwz.attr(elem, 'value');
				return val != null ? val : dwz.text(elem);
			}
		},
		select: {
			get(elem) {
				let value,
					option,
					options = elem.options,
					index = elem.selectedIndex,
					one = elem.type === 'select-one' || index < 0,
					values = one ? null : [],
					max = one ? index + 1 : options.length,
					i = index < 0 ? max : one ? index : 0;

				// Loop through all the selected options
				for (; i < max; i++) {
					option = options[i];

					if (
						(option.selected || i === index) &&
						// Don't return options that are disabled or in a disabled optgroup
						!option.disabled &&
						(!option.parentNode.disabled || !dwz.nodeName(option.parentNode, 'optgroup'))
					) {
						// Get the specific value for the option
						value = dwz(option).val();

						// We don't need an array for one selects
						if (one) {
							return value;
						}

						// Multi-Selects return an array
						values.push(value);
					}
				}

				return values;
			},

			set(elem, value) {
				let optionSet,
					option,
					options = elem.options,
					values = dwz.makeArray(value),
					i = options.length;

				while (i--) {
					option = options[i];
					if ((option.selected = dwz.inArray(option.value, values))) {
						optionSet = true;
					}
				}

				// Force browsers to behave consistently when non-matching value is set
				if (!optionSet) {
					elem.selectedIndex = -1;
				}
				return values;
			}
		}
	}
});

// Radios and checkboxes getter/setter
dwz.each(['radio', 'checkbox'], function () {
	dwz.valHooks[this] = {
		get(elem) {
			return elem.getAttribute('value') === null ? '1' : elem.value;
		},
		set(elem, value) {
			if (dwz.isArray(value)) {
				return (elem.checked = dwz.inArray(dwz(elem).val(), value));
			}
		}
	};
});

dwz.extend({
	// Counter for holding the number of active queries
	active: 0,

	ajaxSettings: {
		type: 'POST',
		global: false,
		cache: false,
		async: true, // 默认异步加载
		contentType: 'application/x-www-form-urlencoded; charset=UTF-8',
		dataType: '*',
		headers: {
			'X-Requested-With': 'XMLHttpRequest'
		},

		accepts: {
			'*': '*/'.concat('*'),
			text: 'text/plain',
			html: 'text/html',
			xml: 'application/xml, text/xml',
			json: 'application/json, text/javascript'
		},

		responseFields: {
			xml: 'responseXML',
			text: 'responseText',
			json: 'responseJSON'
		},

		// Data converters
		converters: {
			// Evaluate text as a json expression
			json: dwz.parseJSON,

			// Parse text as xml
			xml: dwz.parseXML
		}
	},

	ajaxSetup(settings) {
		return dwz.extend(dwz.ajaxSettings, settings);
	},
	/**
	 * ajax 请求返回结果转换
	 * @param dwzXHR
	 * @param options {dataType:'', converters{}}
	 */
	dataFilter(dwzXHR, options) {
		let responseField = options.responseFields[options.dataType] || 'responseText';
		let result = dwzXHR[responseField] || dwzXHR.responseText,
			converters = options.converters[options.dataType];

		if (converters) {
			result = converters.call(dwzXHR, result);
		}

		return result;
	},
	/**
	 *
	 * dwz.ajax({type:'POST', url:'data.html', dataType:'html', data: {name:'test', value:'aaa'},
	 * 	success: (result, textStatus, XMLHttpRequest) => {},
	 * 	error: (XMLHttpRequest, textStatus, errorThrown) => {},
	 * 	complete: (XMLHttpRequest, textStatus) => {}
	 * });
	 *
	 */
	ajax(options) {
		const op = dwz.extend({}, dwz.ajaxSettings, options);
		op.type = op.type.toUpperCase();

		if (op.header) {
			dwz.extend(op.headers, op.header);
		}

		if (op.global && dwz.active++ === 0) {
			dwz.event.trigger(document, 'ajaxStart');
		}

		function createXMLHttp() {
			return window.XMLHttpRequest ? new XMLHttpRequest() : new ActiveXObject('Microsoft.XMLHttp');
		}

		let dwzXHR = createXMLHttp(),
			url = op.url,
			postData = '';

		if (!op.cache) {
			url = op.url + (op.url.indexOf('?') == -1 ? '?' : '&') + 't=' + new Date().getTime();
		}

		// 获取get参数
		if (op.type == 'GET' && op.data) {
			let strParams = typeof op.data === 'string' ? op.data : dwz.param(op.data);
			if (strParams) url += (url.indexOf('?') == -1 ? '?' : '&') + strParams;
		}

		// 处理 debuggap.js 不能加载本地html文件问题
		if (window.debuggap && url.indexOf('http') !== 0) {
			url = window.location.origin + '/' + url;
		}

		dwzXHR.open(op.type, url, op.async);

		// Set the Accepts header for the server, depending on the dataType
		let accept = op.accepts[op.dataType];
		accept = accept ? accept + ', ' + op.accepts['*'] + '; q=0.01' : op.accepts['*'];
		dwzXHR.setRequestHeader('Accept', accept);

		// Check for headers option
		for (let key in op.headers) {
			dwzXHR.setRequestHeader(key, op.headers[key]);
		}

		if (op.type == 'POST' && op.data) {
			//Set the correct header, if data is being sent
			if (op.contentType) dwzXHR.setRequestHeader('content-type', op.contentType); //post提交

			if (op.contentType.indexOf('application/json') >= 0) {
				postData = typeof op.data === 'string' ? op.data : JSON.stringify(op.data);
			} else {
				postData = typeof op.data === 'string' ? op.data : dwz.param(op.data);
			}
		}

		dwzXHR.onreadystatechange = function () {
			if (dwzXHR.readyState == 4) {
				let protocol = /^([\w-]+:)\/\//.test(op.url) ? RegExp.$1 : window.location.protocol;
				let isSuccess = (dwzXHR.status >= 200 && dwzXHR.status < 300) || dwzXHR.status === 304 || (dwzXHR.status == 0 && protocol == 'file:');

				if (isSuccess) {
					let result = dwz.dataFilter(dwzXHR, op);

					if (op.success) op.success(result, dwzXHR.status, dwzXHR);
				} else if (op.error) {
					op.error(dwzXHR, dwzXHR.status);
				}

				if (op.complete) {
					op.complete(dwzXHR, dwzXHR.status);
				}

				if (op.global && !--dwz.active) {
					dwz.event.trigger(document, 'ajaxStop');
				}
			}
		};

		dwzXHR.send(postData);
	},

	setRegional(key, value) {
		if (!dwz.regional) dwz.regional = {};
		dwz.regional[key] = value;
	}
});
