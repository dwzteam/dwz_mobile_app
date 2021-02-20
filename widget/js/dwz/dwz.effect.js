/**
 * @author 张慧华 <350863780@qq.com> on 2015/12/18.
 * 这套动画框架是使用Tween算法，目前包括了31种效果。和jQuery中的动画相比，它的体积小，效率高，资源占用少，效果非常丰富。使用上和jquery的animate方法一样。
 * 使用简介
 * $.animate(ele,obj,duration,[effectType],[fnCallback])
 *
 * 参数说明：
 * 参数1、ele:表示做动画效果的那个元素
 * 参数2、obj：是一个JSON对象，表示在ele元素在那几个方向运动。格式如下
 * obj={height:600,width:600,x:0,y:0,opacity:0.1}
 * 参数3：duration，表示完成动画所需要的总毫秒数。
 * 参数4、effectType:可选参数，表示HTML5运动效果，分别为:
 * ease - specifies a transition effect with a slow start, then fast, then end slowly (this is default)
 * linear - specifies a transition effect with the same speed from start to end
 * ease-in - specifies a transition effect with a slow start
 * ease-out - specifies a transition effect with a slow end
 * ease-in-out - specifies a transition effect with a slow start and end
 * cubic-bezier(n,n,n,n) - lets you define your own values in a cubic-bezier function
 *
 * 参数5、fnCallback:可选参数。表示是回调方法
 */
(function ($) {
	$.extend({
		_randomColorFactor(maxColor) {
			return Math.round(Math.random() * (maxColor || 255));
		},

		randomColor(opacity, maxRed, maxGreen, maxBlue) {
			return `rgba(${this._randomColorFactor(maxRed)}, 
				${this._randomColorFactor(maxGreen)},
				${this._randomColorFactor(maxBlue)}, 
				${opacity || '.3'}`;
		},
		colorRgba: function (options) {
			let op = $.extend({ color: '#ffffff', opacity: 1 }, options);

			let regHex = /^#([0-9a-fA-f]{3}|[0-9a-fA-f]{6})$/; // 16进制颜色值的正则
			let regRgb = /^(rgb\(|RGB\()/; // rgb颜色值的正则
			let color = op.color.toLowerCase(); // 把颜色值变成小写
			if (regHex.test(color)) {
				// 如果只有三位的值，需变成六位，如：#fff => #ffffff
				if (color.length === 4) {
					let colorNew = '#';
					for (let i = 1; i < 4; i += 1) {
						colorNew += color.slice(i, i + 1).concat(color.slice(i, i + 1));
					}
					color = colorNew;
				}
				// 处理六位的颜色值，转为RGB
				let colorChange = [];
				for (let i = 1; i < 7; i += 2) {
					colorChange.push(parseInt('0x' + color.slice(i, i + 2)));
				}
				return 'rgba(' + colorChange.join(',') + ',' + op.opacity + ')';
			} else if (regRgb.test(color)) {
				// 把RGB的3个数值变成数组
				let colorChange = color.replace(/(?:\(|\)|rgb|RGB)*/g, '').split(',');
				return 'rgba(' + colorChange.join(',') + ',' + op.opacity + ')';
			} else {
				return color;
			}
		},
		animate(ele, obj, duration, effectType, callback) {
			for (let attr in obj) {
				if (attr == 'width' || attr == 'height') {
					$.transition(ele, {
						transitionType: 'all',
						duration: duration,
						effectType: effectType
					});
					ele.style[attr] = obj[attr] + 'px';
				} else {
					let x = obj.x || 0,
						y = obj.y || 0;

					if (obj.x !== undefined || obj.y !== undefined) {
						$(ele).translate({
							x: x + 'px',
							y: y + 'px',
							duration: duration,
							effectType: effectType
						});
					}
				}
			}

			if (callback) {
				setTimeout(function () {
					callback.call(ele);
				}, (duration || 1) + 10);
			}
		},
		// 设置transform偏移
		transition(ele, options) {
			let op = $.extend({ transitionType: 'all', duration: 0, effectType: 'ease' }, options);
			let $box = $(ele);
			if (op.duration) {
				let tranStr = op.transitionType + ' ' + op.duration / 1000.0 + 's ' + (op.effectType || 'ease');
				$box.css({
					'-webkit-transition': '-webkit-' + tranStr,
					transition: tranStr
				});
			} else {
				$box.css({ '-webkit-transition': '', transition: '' });
			}
		}
	});

	$.fn.extend({
		animate(obj, duration, effectType, callback) {
			$.animate(this.get(0), obj, duration, effectType, callback);
			return this;
		},
		fadeOut(duration, animationend) {
			return this.effect(
				[
					{
						className: 'fadeOut animated',
						after() {
							this.hide();
						}
					}
				],
				animationend
			);
		},
		fadeIn(duration, animationend) {
			return this.effect(
				[
					{
						className: 'fadeIn animated',
						before() {
							this.show();
						},
						after() {
							this.show();
						}
					}
				],
				animationend
			);
		},

		// 设置transform偏移
		translate(options) {
			let op = $.extend({ x: '0px', y: '0px', z: '0px', duration: 0, effectType: 'ease' }, options);
			op.transform = 'translate3d(' + op.x + ',' + op.y + ',' + op.z + ')';
			return this.translateCss(op);
		},
		translateCss(options) {
			let op = $.extend({ transform: '', duration: 0, effectType: 'ease' }, options);
			return this.each(function () {
				$.transition(this, {
					transitionType: 'transform',
					duration: op.duration,
					effectType: op.effectType
				});
				$(this).css({
					'-webkit-transform': op.transform,
					transform: op.transform
				});
			});
		},
		translateY(yStr, duration, effectType) {
			return this.translate({
				y: yStr,
				duration: duration,
				effectType: effectType
			});
		},
		translateX(xStr, duration, effectType) {
			return this.translate({
				x: xStr,
				duration: duration,
				effectType: effectType
			});
		},
		rotate(options) {
			let op = $.extend({ deg: '0deg', duration: 0, effectType: 'ease' }, options);
			return this.each(function () {
				let rotateStr = 'rotate(' + op.deg + ')';
				$.transition(this, {
					transitionType: 'transform',
					duration: op.duration,
					effectType: op.effectType
				});
				$(this).css({ '-webkit-transform': rotateStr, transform: rotateStr });
			});
		},
		getComputedPos() {
			let matrix = window.getComputedStyle(this.get(0), null),
				x = 0,
				y = 0,
				scale = 1;

			let transform = matrix['-webkit-transform'] || matrix['transform'];
			if (transform && transform != 'none') {
				matrix = transform.replace('matrix(', '').split(')')[0].split(', ');
				x = +(matrix[12] || matrix[4]);
				y = +(matrix[13] || matrix[5]);
				scale = +matrix[3];
			}

			return { x: x, y: y, scale: scale };
		},

		// 翻牌效果
		flipCard(options) {
			let op = $.extend({}, options);

			return this.each(function () {
				let $box = $(this);
				$box.removeClass('animation-rotate-up').removeClass('animation-rotate-up-back');
				$box.addClass('animation-rotate-up');
				setTimeout(function () {
					$box.addClass('animation-rotate-up-back');
					if (op.callback) {
						op.callback($box);
					}
				}, 500);
			});
		},

		// 文字向上冒泡
		effectBubble(options) {
			let op = $.extend(
				{
					content: '+1',
					y: -100,
					duration: 500,
					effectType: 'ease',
					className: '',
					fontSize: 2
				},
				options
			);

			return this.each(function () {
				let $box = $(this),
					pos = $box.offset(),
					width = $box.width(),
					flyId = 'effect-fly-' + new Date().getTime();

				let tpl = '<span id="#flyId#" class="effect-bubble-fly #class#" style="top:#top#px;left:#left#px;font-size: #fontSize#rem;">#content#</span>';
				let html = tpl
					.replaceAll('#left#', pos.left + width / 2)
					.replaceAll('#top#', pos.top)
					.replaceAll('#flyId#', flyId)
					.replaceAll('#content#', op.content)
					.replaceAll('#class#', op.className)
					.replaceAll('#fontSize#', op.fontSize);

				let $fly = $(html).appendTo($('body'));

				setTimeout(function () {
					$fly.css({ top: pos.top + op.y + 'px' });
				}, 10);

				setTimeout(function () {
					$fly.fadeOut(500, function () {
						$fly.remove();
					});
				}, op.duration || 500);
			});
		},

		/**
		 *
		 * @param eList: [{className:'bounce', styles:'', animationend:null}] 动画列表
		 * @param animationend: 全部动画完成事件
		 * @returns {*}
		 */
		effect(eList, animationend) {
			return this.each(function () {
				let $me = $(this);

				let eventNames = 'webkitAnimationEnd animationend webkitTransitionEnd transitionend';

				function animateStep(isFirst) {
					if (eList && eList.length > 0) {
						let eItem = $.extend(
							{
								className: '', // animate.css 动画 class
								style: '', // css3动画样式
								before: null, // 自定义单个动画执行前回调
								after: null // 自定义单个动画完成回调
							},
							eList.shift()
						);

						// 缓存原始style
						if (isFirst) {
							let orig_style = $me.data('orig_style') || $me.attr('style');
							if (orig_style) $me.data('orig_style', orig_style);

							$me.off(eventNames);
							$me.removeClass($.animateCls.all + ' animated');
						}

						$me.on(eventNames, function () {
							$me.off(eventNames);

							// 动画完成还原原始style
							if (eList.length == 0) {
								let orig_style = $me.data('orig_style');
								if (orig_style) $me.attr('style', orig_style);

								// 全部动画完成animationend事件
								if (animationend) {
									animationend.call($me, eItem);
								}
							}

							if (eItem.className) {
								$me.removeClass(eItem.className + ' animated');
							}

							// 单个动画完成回调
							if (eItem.after) {
								eItem.after.call($me, eItem);
							}

							animateStep();
						});

						setTimeout(function () {
							// 单个动画执行前回调
							if (eItem.before) {
								eItem.before.call($me, eItem);
							}
							if (eItem.style) {
								let orig_style = $me.data('orig_style') || '';
								if (orig_style && !orig_style.endsWith(';')) {
									orig_style += ';';
								}
								$me.attr('style', orig_style + eItem.style);
							}
							if (eItem.className) {
								$me.addClass(eItem.className).addClass('animated');
							}
						}, 50);
					}
				}

				animateStep(true);
			});
		}
	});

	$.animateCls = {
		std_names: 'bounce flash pulse rubberBand shake swing tada wobble jello flip hinge jackInTheBox',
		in_names:
			'bounceIn bounceInDown bounceInLeft bounceInRight bounceInUp ' +
			'fadeIn fadeInDown fadeInDownBig fadeInLeft fadeInLeftBig fadeInRight fadeInRightBig fadeInUp fadeInUpBig ' +
			'flipInX flipInY lightSpeedIn rollIn ' +
			'rotateIn rotateInDownLeft rotateInDownRight rotateInUpLeft rotateInUpRight ' +
			'slideInUp slideInDown slideInLeft slideInRight ' +
			'zoomIn zoomInDown zoomInLeft zoomInRight zoomInUp',
		out_names:
			'bounceOut bounceOutDown bounceOutLeft bounceOutRight bounceOutUp ' +
			'fadeOut fadeOutDown fadeOutDownBig fadeOutLeft fadeOutLeftBig fadeOutRight fadeOutRightBig fadeOutUp fadeOutUpBig ' +
			'flipOutX flipOutY lightSpeedOut rollOut ' +
			'rotateOut rotateOutDownLeft rotateOutDownRight rotateOutUpLeft rotateOutUpRight ' +
			'slideOutUp slideOutDown slideOutLeft slideOutRight ' +
			'zoomOut zoomOutDown zoomOutLeft zoomOutRight zoomOutUp'
	};
	$.animateCls.all_names = $.animateCls.std_names + ' ' + $.animateCls.in_names + ' ' + $.animateCls.out_names;

	$.fn.animateCls = function (animateCls, animationend) {
		let effectItem = { className: animateCls };
		if ($.inArray(animateCls, $.animateCls.in_names.split(' '))) {
			effectItem.before = function () {
				this.show();
			};
			effectItem.after = function () {
				this.show();
			};
		} else if ($.inArray(animateCls, $.animateCls.out_names.split(' '))) {
			effectItem.before = function () {
				this.show();
			};
			effectItem.after = function () {
				this.hide();
			};
		}
		return this.effect([effectItem], animationend);
	};
})(dwz);
