/**
 * 3D页面中的平面组件库
 * @author 张慧华
 */
class DwzWidget {
	/**
	 * 构造函数，里面写上对象的属性
	 * @param $el
	 */
	constructor({ $el = null }) {
		this.$el = $el;
		try {
			if (!($el instanceof $)) {
				this.$el = $($el);
			}
		} catch (err) {
			// console.error(err);
		}

		this.eventNames = { show: 'show', hide: 'hide' };
	}

	find(selecter) {
		return this.$el.find(selecter);
	}

	findByCls(claName) {
		return this.$el.find('.' + claName);
	}

	on(events, data, handler) {
		return this.$el.on(events, data, handler);
	}

	off(events, handler) {
		return this.$el.off(events, handler);
	}

	trigger(eventType, extraParameters) {
		return this.$el.trigger(eventType, extraParameters);
	}

	show() {
		this.$el.show();
		return this.trigger(this.eventNames.show);
	}

	hide() {
		this.$el.hide();
		return this.trigger(this.eventNames.hide);
	}

	isEventTarget(event) {
		return this.$el.get(0) == event.target;
	}
}

/**
 * 滚动显示组件
 * @author 张慧华
 */
class DwzMarquee extends DwzWidget {
	constructor({ $el = null, cls = 'marquee', itemCls = 'marquee-item', duration = 10 * 1000, pageSize = 1 }) {
		//调用实现父类的构造函数,相当于获得父类的this指向
		super(arguments[0]);
		this.cls = cls;
		this.itemCls = itemCls;
		this.pageSize = pageSize;
		this.duration = duration;
		this.animationend = 'webkitAnimationEnd animationend webkitTransitionEnd transitionend';

		// 用于控制鼠标悬停
		this.isOver = false;
		this.isLastPlay = true;

		setTimeout(() => {
			this.play();
		}, 1000);

		this.$el.on('mouseover', () => {
			this.isOver = true;
		});
		this.$el.on('mouseout', () => {
			this.isOver = false;
		});
	}

	_animationEvent() {
		var $marquee = this.findByCls(this.cls);
		var $items = this.findByCls(this.itemCls);
		var $first = $items.eq(0);
		var itemHeight = $first.height();

		$marquee.translate({ y: 0 });
		$marquee.off(this.animationend).on(this.animationend, (event) => {
			$marquee.off(this.animationend);
			$marquee.translate({ y: 0 });
			if (this.isLastPlay) {
				$marquee.append($first);
			}

			setTimeout(
				() => {
					this._animationEvent();
				},
				this.pageSize > 1 ? 1000 : 10
			);
		});

		setTimeout(() => {
			if (this.isOver && this.pageSize > 1) {
				this.isLastPlay = false;
				$marquee.translateY(0.1 + 'px', this.duration, 'linear');
			} else {
				this.isLastPlay = true;
				$marquee.translateY(-itemHeight + 'px', this.duration, 'linear');
			}
		}, 50);
	}

	play() {
		if (this.$el.size() == 0) {
			return;
		}

		var $marquee = this.findByCls(this.cls);
		if ($marquee.size() == 0) {
			this.$el.html(`<div class="${this.cls}">${this.$el.html()}</div>`);
			$marquee = this.findByCls(this.cls);
		}

		var $items = this.findByCls(this.itemCls);
		if (this.pageSize == 1 && $items.size() > 0 && $marquee.height() > this.$el.height()) {
			$marquee.append($items.eq(0).clone(true));
			$items = this.findByCls(this.itemCls);
		}

		if ($items.size() > 1) {
			if (this.pageSize > 1) {
				this.$el.css({ height: $items.eq(0).height() * this.pageSize + 'px' });
			}
			setTimeout(() => {
				this._animationEvent();
			}, 500);
		}
	}

	html(html) {
		this.$el.html(html);
		this.play();
	}
}

$.extend({ DwzMarquee });
