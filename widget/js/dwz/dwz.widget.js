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
	constructor({ $el = null, cls = 'marquee', itemCls = 'marquee-item', duration = 10 * 1000, delay = 10, selectIndex = 0, pageSize = 1 }) {
		//调用实现父类的构造函数,相当于获得父类的this指向
		super(arguments[0]);
		this.cls = cls;
		this.itemCls = itemCls;
		this.selectIndex = selectIndex;
		this.pageSize = pageSize;
		this.duration = duration;
		this.delay = delay;

		// 用于控制鼠标悬停
		this.isOver = false;
		this.isLastPlay = true;

		setTimeout(() => {
			this.play();
			this._triggerActive();
		}, 200);

		this.$el.on('mouseover', () => {
			this.isOver = true;
		});
		this.$el.on('mouseout', () => {
			this.isOver = false;
		});
	}

	_triggerActive() {
		let $items = this.findByCls(this.itemCls);
		let _length = $items.size();
		let selectIndex = _length > this.selectIndex ? this.selectIndex : 0;
		if (_length <= 0) {
			selectIndex = -1;
		}
		this.trigger($.event.type.activated, {
			$item: selectIndex >= 0 ? $items.eq(selectIndex) : null,
			$items,
			selectIndex
		});
	}

	_animationEvent() {
		let $marquee = this.findByCls(this.cls);
		let $items = this.findByCls(this.itemCls);
		const _size = $items.size();
		if (_size == 0 || (_size > 1 && _size <= this.pageSize)) {
			return;
		}

		let itemHeight = $items.eq(0).height();

		$marquee.translate({ y: 0 });
		$marquee.off($.animationendNames).on($.animationendNames, (event) => {
			$marquee.off($.animationendNames);
			$marquee.translate({ y: 0 });

			$items = this.findByCls(this.itemCls); // 防止removeItem后又被加回来的情况
			if (this.isLastPlay && $items.size()) {
				$marquee.append($items.eq(0));
			}

			this._triggerActive();
			this._timer = setTimeout(() => {
				this._animationEvent();
			}, this.delay || 10);
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
		this.isOver = false;
		let $marquee = this.findByCls(this.cls);
		if ($marquee.size() == 0) {
			this.$el.html(`<div class="${this.cls}">${this.$el.html()}</div>`);
			$marquee = this.findByCls(this.cls);
		}

		let $items = this.findByCls(this.itemCls);
		if (this.pageSize == 1 && $items.size() > 0 && $marquee.height() > this.$el.height()) {
			$marquee.append($items.eq(0).clone(true));
			$items = this.findByCls(this.itemCls);
		}

		if ($items.size() > 1) {
			this.resize($items);
			setTimeout(() => {
				this._animationEvent();
			}, this.delay);
		}
	}

	resize($items) {
		if (!$items) {
			$items = this.findByCls(this.itemCls);
		}
		if (this.pageSize > 1) {
			this.$el.css({ height: $items.eq(0).height() * this.pageSize + 'px' });
		}
	}
	_stop() {
		this.isOver = true;
		if (this._timer) {
			clearTimeout(this._timer);
			this._timer = null;
		}
	}
	html(html) {
		this._stop();
		this.$el.html(html).find('.dwz-ctl-hover').hoverClass('hover');
		this.play();
		this._triggerActive();
	}

	appendItem(elem) {
		if (this.pageSize > 1) {
			this._stop();
			let $marquee = this.findByCls(this.cls);
			$marquee.append(elem);
			this.play();
			this._triggerActive();
		}
	}

	removeItem(index) {
		this.updateItem(index);
	}

	updateItem(index, elem, appendIfNone = false) {
		let $items = this.findByCls(this.itemCls);
		this._stop();
		if ($.isFunction(index)) {
			let _count = 0; // 满足匹配条件的数量
			$items.each((i, el) => {
				if (index(i, el)) {
					_count++;
					elem ? $(el).after(elem).remove() : $(el).remove();
				}
			});

			if (!_count && appendIfNone) {
				// 如果没有匹配数据就插入一条
				this.findByCls(this.cls).append(elem);
			}
		} else if (index >= 0 && index < $items.size()) {
			let $el = $items.eq(index);
			elem ? $el.after(elem).remove() : $el.remove();
		}
		this.play();
		this._triggerActive();
	}
}

/**
 * 滚动显示组件
 * @author 张慧华
 */
class DwzFlyPop extends DwzWidget {
	constructor({ $el = null, cls, delay = 3 * 1000 }) {
		//调用实现父类的构造函数,相当于获得父类的this指向
		super({ $el: $el || $('body') });
		this.$items = [];
		this.cls = cls;
		this.delay = delay;
	}

	_triggerActive() {
		this.trigger($.event.type.activated, this.$items.length > 0 ? this.$items[this.$items.length - 1] : null);
	}

	fly({ html = '', left = 0, top = 0 }) {
		const $elem = $(html).appendTo(this.$el);
		// const startPos = $elem.offset();
		setTimeout(() => {
			$elem.css({ left: left + 'px', top: top + 'px' }).addClass(this.cls);

			$elem.animationend((event) => {
				this._triggerActive();
			});
		}, this.delay);
		this.$items.push($elem);
	}

	remove(index) {
		if ($.isFunction(index)) {
			this.$items.forEach((el, i) => {
				if (index(i, el)) {
					$(el).remove();
				}
			});
		} else if (index >= 0 && index < this.$items.length) {
			$items[index].remove();
		}
	}

	clear() {
		this.$items.forEach((elem) => {
			$(elem).remove();
		});
	}
}

$.extend({ DwzMarquee, DwzFlyPop });
