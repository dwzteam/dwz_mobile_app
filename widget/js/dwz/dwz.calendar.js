/**
 * reference dwz.util.date.js
 * @author ZhangHuihua@msn.com
 *
 */
(function ($) {
	$.setRegional('calendar', {
		dayNames: ['日', '一', '二', '三', '四', '五', '六'],
		monthNames: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'],
		yearName: '年',
		btnTxt: { ok: '确定', cancel: '取消', clean: '清除' }
	});

	$.fn.calendar = function (options) {
		const op = $.extend(
			{
				miscBtn: null, //自定义按钮
				miscBtnFn: null, //自定义按钮点击事件
				changeDayFn: null, //选择日期点击事件
				refreshDayFn: null, //刷新日期列表完成事件
				viewType: 'month', // month, week
				frag: `<div class="calendar">
					<div class="dt">
						<div class="pr dwz-ctl-hover"><a href="javascript:"><i class="dwz-icon-d-arrow-left"></i></a></div>
						<div class="ym dwz-ctl-hover"><a href="javascript:"><span>Year Month</span><i class="dwz-icon-arrow-down"></i></a></div>
						<div class="ne dwz-ctl-hover"><a href="javascript:"><i class="dwz-icon-d-arrow-right"></i></a></div>
					</div>
					<div class="bd">
						<div class="slide-wrap"></div>
					</div>
					<div class="df">
						<button class="button is-mini cleanBtn dwz-ctl-hover">${$.regional.calendar.btnTxt.clean}</button>
						<div class="flex-1"></div>
						<button class="button is-mini cancelBtn dwz-ctl-hover">${$.regional.calendar.btnTxt.cancel}</button>
						<button class="button is-mini primary okBtn dwz-ctl-hover">${$.regional.calendar.btnTxt.ok}</button>
					</div>
					<div class="ympop">
						<div class="ym">
							<div class="yy">
								<div class="yt">
									<div class="pr dwz-ctl-hover"><a href="javascript:;"><i class="dwz-icon-d-arrow-left"></i></a></div>
									<div class="ne dwz-ctl-hover"><a href="javascript:;"><i class="dwz-icon-d-arrow-right"></i></a></div>
								</div>
								<ul class="clearfix"></ul>
							</div>
							<div class="mm">
								<ul class="clearfix"></ul>
							</div>
						</div>
						<div class="ympop-ft">
							<button class="button primary ympopOkBtn dwz-ctl-hover">${$.regional.calendar.btnTxt.ok}</button>
							<button class="button ympopCalcelBtn dwz-ctl-hover">${$.regional.calendar.btnTxt.cancel}</button>
						</div>
					</div>
				</div>`
			},
			options
		);

		const setting = {
			ymdt$: '.dt',
			ympop$: '.ympop',
			ympopOkBtn$: '.ympopOkBtn',
			ympopCalcelBtn$: '.ympopCalcelBtn',
			bd$: '.bd',
			df$: '.df', // footer
			main$: '.bd .slide-wrap'
		};

		function _init({ $this, $frag, dp, isInput = false }) {
			let $bd = $frag.find(setting.bd$),
				$main = $frag.find(setting.main$),
				$ymdt = $frag.find(setting.ymdt$),
				wrapW = $bd.width();

			$frag.find('.dwz-ctl-hover').hoverClass('hover');
			if (op.viewType == 'week') {
				$this.find('.dt .pr, .dt .ne').hide(); // 隐藏last, next按钮
			}

			// 切换月份/星期回调
			function switchMonthOrWeekFn(year, month) {
				let monthNames = $.regional.calendar.monthNames;
				let $ympop = $frag.find(setting.ympop$);

				generateCalendar(dp);

				$ymdt.find('.ym span').text(year + $.regional.calendar.yearName + monthNames[month - 1]);
				// 选择年月回调
				if (op.changeYearMonthFn) {
					op.changeYearMonthFn.call($ympop, { year: year, month: month });
				}
			}

			$main.touchwipe({
				// stopPropagationEvents:true,
				direction: 'horizontal',
				touchstart: function (event, pos) {},
				touchmove: function (event, pos) {
					$main.translateX(-wrapW - pos.dx + 'px');
				},
				touchend: function (event, pos) {
					if (pos.dx < -40) {
						// 切换到last
						$main.animate({ x: 0 }, 300, 'ease', function () {
							if (op.viewType == 'week') {
								dp.dayWeek({ type: 'last', callback: switchMonthOrWeekFn });
							} else {
								dp.lastMonthFn(switchMonthOrWeekFn);
							}
						});
					} else if (pos.dx > 40) {
						// 切换到next
						$main.animate({ x: -2 * wrapW }, 300, 'ease', function () {
							if (op.viewType == 'week') {
								dp.dayWeek({ type: 'next', callback: switchMonthOrWeekFn });
							} else {
								dp.nextMonthFn(switchMonthOrWeekFn);
							}
						});
					} else {
						// 还原到当前月份
						$main.animate({ x: -wrapW }, 300, 'ease');
					}
				}
			});

			/*
			 * generate popup year month box
			 */
			function generateYmPop(dp, bShow) {
				let dw = dp.getDateWrap();
				let $ymdt = $frag.find(setting.ymdt$);
				let $ympop = $frag.find(setting.ympop$);
				let $year = $ympop.find('.yy ul.clearfix');
				let $month = $ympop.find('.mm ul.clearfix');
				let yearstart = dp.getMinDate().getFullYear();
				let yearend = dp.getMaxDate().getFullYear();
				let yearFrag = '',
					monthFrag = '';

				for (let y = dw.year - 4; y < dw.year + 6; y++) {
					let _className = dw.year == y ? 'selected ' : '';
					if (y < yearstart || y > yearend) _className += 'disabled';
					yearFrag += `<li value="${y}" class="${_className}"><a href="javascript:">${y}</a></li>`;
				}
				$year.html(yearFrag);

				$.each($.regional.calendar.monthNames, function (i) {
					let m = i + 1;
					monthFrag += `<li value="${m}" ${dw.month == m ? ' class="selected"' : ''}><a href="javascript:">${this}</a></li>`;
				});
				$month.html(monthFrag);

				$year.find('li').click(function () {
					let $li = $(this);
					if (!$li.hasClass('disabled')) {
						$li.parent().find('li.selected').removeClass('selected');
						$li.addClass('selected');
					}
				});
				$month.find('li').click(function () {
					let $li = $(this);
					$li.parent().find('li.selected').removeClass('selected');
					$li.addClass('selected');
				});

				if (!$ympop.attr('event-ympop')) {
					$ympop.attr('event-ympop', 1);

					$frag.find(setting.ympopOkBtn$).click(function () {
						let $yearLi = $year.find('li.selected'),
							$monthLi = $month.find('li.selected');
						if ($yearLi.hasClass('disabled') || $monthLi.hasClass('disabled')) return false;
						$ymdt.find('.ym span').text($yearLi.find('a').text() + $.regional.calendar.yearName + $monthLi.find('a').text());

						let year = parseInt($yearLi.attr('value')),
							month = parseInt($monthLi.attr('value'));
						dp.changeDate(year, month);
						generateCalendar(dp);
						$ympop.removeClass('open');

						if (!dp.hasDay()) {
							$main.find('td.selected').trigger('click');
						} //只有年月没有日期
					});
					$frag.find(setting.ympopCalcelBtn$).click(function () {
						$ympop.removeClass('open');
					});

					// last month
					$ymdt.find('.pr a').click(function () {
						dp.lastMonthFn(switchMonthOrWeekFn);
					});

					// next month
					$ymdt.find('.ne a').click(function () {
						dp.nextMonthFn(switchMonthOrWeekFn);
					});

					// 选择年月 last year
					$ympop.find('.yy .pr a').click(function () {
						$year.find(':scope>li').each(function (i) {
							let $li = $(this);
							let year = parseInt($li.attr('value')) - 10;

							if (year < yearstart || year > yearend) $li.addClass('disabled');
							else $li.removeClass('disabled');
							if (i == 0) $li.addClass('selected');
							else $li.removeClass('selected');

							$li.attr('value', year).find(':scope>a').text(year);
						});
					});

					// 选择年月 next year
					$ympop.find('.yy .ne a').click(function () {
						$year.find(':scope>li').each(function (i) {
							let $li = $(this);
							let year = parseInt($li.attr('value')) + 10;

							if (year > yearend) $li.addClass('disabled');
							else $li.removeClass('disabled');
							if (i == 0) $li.addClass('selected');
							else $li.removeClass('selected');

							$li.attr('value', year).find(':scope>a').text(year);
						});
					});
				}

				$ymdt.find('.ym span').text($year.find('li.selected').text() + $.regional.calendar.yearName + $month.find('li.selected').text());
				if (bShow) $ympop.addClass('open');
			}

			function _monthBdHtml(dp, options) {
				let _op = $.extend({ type: 'current' }, options); // current, last, next

				if (_op.type == 'last') {
					dp = dp.clone();
					dp.lastMonthFn();
				} else if (_op.type == 'next') {
					dp = dp.clone();
					dp.nextMonthFn();
				}

				let dw = dp.getDateWrap();
				let minDate = dp.getMinDate();
				let maxDate = dp.getMaxDate();

				let monthStart = new Date(dw.year, dw.month - 1, 1);
				let startDay = monthStart.getDay(); // 获取周几0~6
				let aDay = new Array();

				if (startDay > 0) {
					monthStart.setMonth(monthStart.getMonth() - 1);
					let prevDateWrap = dp.getDateWrap(monthStart);
					for (let t = prevDateWrap.days - startDay + 1; t <= prevDateWrap.days; t++) {
						let _date = new Date(dw.year, dw.month - 2, t);
						let _ctrClass = _date >= minDate && _date <= maxDate ? '' : 'disabled';
						aDay.push(`<td class="inactive ${_ctrClass}" align="center" data-day="${t}" data-value="${dp.formatDate(dp.changeDay(t, -1))}"><a href="javascript:">${t}</a></td>`);
					}
				}
				let value = $this.attr('data-value');
				for (let t = 1; t <= dw.days; t++) {
					let _date = new Date(dw.year, dw.month - 1, t);
					let _ctrClass = _date >= minDate && _date <= maxDate ? '' : 'disabled';
					if (value == dp.formatDate(_date)) {
						_ctrClass += (_ctrClass ? ' ' : '') + 'selected';
					}
					aDay.push(`<td align="center" class="${_ctrClass}" data-day="${t}" data-value="${dp.formatDate(dp.changeDay(t))}"><a href="javascript:">${t}</a></td>`);
				}

				for (let t = 1; t <= 42 - startDay - dw.days; t++) {
					let _date = new Date(dw.year, dw.month, t);
					let _ctrClass = _date >= minDate && _date <= maxDate ? '' : 'disabled';
					aDay.push(`<td class="inactive ${_ctrClass}" align="center" data-day="${t}" data-value="${dp.formatDate(dp.changeDay(t, 1))}"><a href="javascript:">${t}</a></td>`);
				}

				let dayThStr = '',
					dayStr = '';
				$.each($.regional.calendar.dayNames, function (i) {
					dayThStr += `<th><span>${this}</span></th>`;
				});
				dayThStr = `<tr>${dayThStr}</tr>`;

				$.each(aDay, function (i) {
					if (i % 7 == 0) dayStr += '<tr>';
					dayStr += this;
					if (i % 7 == 6) dayStr += '</tr>';
				});
				let _html = `<table class="di ${_op.type}">${dayThStr + dayStr}</table>`;

				return _html;
			}

			function _weekBdHtml(dp, options) {
				let _op = $.extend({ type: 'current' }, options); // current, last, next

				if (_op.type == 'last') {
					dp = dp.clone();
					dp.dayWeek({ type: 'last' });
				} else if (_op.type == 'next') {
					dp = dp.clone();
					dp.dayWeek({ type: 'next' });
				}

				let dw = dp.getDateWrap();
				let minDate = dp.getMinDate();
				let maxDate = dp.getMaxDate();

				let aDay = new Array();
				let value = $this.attr('data-value');
				for (let t = 0; t <= 6; t++) {
					let _dp = dp.clone();
					let _dw = _dp.dayWeek({ dayInWeek: t }); // 获取周日~周六时间
					let _date = _dw.date;
					let _ctrClass = _date >= minDate && _date <= maxDate ? '' : 'disabled';

					if (value == _dp.formatDate(_date)) {
						_ctrClass += (_ctrClass ? ' ' : '') + 'selected';
					}
					aDay.push(`<td align="center" class="${_ctrClass}" data-day="${_dw.day}" data-value="${dp.formatDate(dp.changeDay(_dw.day, _dw.month - dw.month))}"><a href="javascript:">${_dw.day}</a></td>`);
				}

				let dayThStr = '',
					dayStr = '';
				$.each($.regional.calendar.dayNames, function (i) {
					dayThStr += `<th><span>${this}</span></th>`;
				});
				dayThStr = `<tr>${dayThStr}</tr>`;

				$.each(aDay, function (i) {
					if (i % 7 == 0) dayStr += '<tr>';
					dayStr += this;
					if (i % 7 == 6) dayStr += '</tr>';
				});
				let _html = `<table class="di ${_op.type}">${dayThStr + dayStr}</table>`;

				return _html;
			}

			function generateBdHtml(dp, options) {
				if (op.viewType == 'week') {
					return _weekBdHtml(dp, options);
				} else {
					return _monthBdHtml(dp, options);
				}
			}

			function generateCalendar(dp) {
				let currentHtml = generateBdHtml(dp, { type: 'current' });
				let $days = $main.html(currentHtml).find('td');
				$days = $days
					.filter(function () {
						return !$(this).hasClass('disabled');
					})
					.click(function (event) {
						let $day = $(this);
						let value = $day.attr('data-value');
						dp.sDate = value; // 修改选中日期
						$days.removeClass('selected');
						$day.addClass('selected');

						// 选择日期回调
						if (op.changeDayFn) {
							op.changeDayFn($day, value);
						}
					});

				// 切换时选中状态调整
				$days.each(function () {
					let $day = $(this);
					if ($day.attr('data-value') == dp.sDate) {
						$day.trigger('click');
					}
				});

				// 刷新日期列表完成事件
				if (op.refreshDayFn) {
					op.refreshDayFn($days, dp.getDateWrap());
				}

				// 选择日期回调
				if (op.changeDayFn) {
					let $daySelected = $days.filter(function () {
						return $(this).hasClass('selected');
					});
					if ($daySelected.size() > 0) {
						let value = $this.attr('data-value');
						op.changeDayFn($daySelected.eq(0), value);
					} else {
						op.changeDayFn($daySelected, '');
					}
				}

				// last view
				let lastHtml = generateBdHtml(dp, { type: 'last' });
				$main.prepend(lastHtml);
				// next view
				let nextHtml = generateBdHtml(dp, { type: 'next' });
				$main.append(nextHtml);

				// 移动到current view
				$main.translateX(-wrapW + 'px');
			}

			generateCalendar(dp);
			generateYmPop(dp);

			if (op.viewType == 'month') {
				// 选择年月
				$ymdt.find('.ym').click(function () {
					generateYmPop(dp, true);
				});
			}

			// 自定义按钮
			if (op.miscBtn) {
				let $miscBtn = $(op.miscBtn).appendTo($ymdt).addClass('miscBtn');
				$miscBtn.click(() => {
					// 自定义按钮回调
					if (op.miscBtnFn) {
						let value = '';
						let $daySelected = $frag.find('table.current td.selected');
						if ($daySelected.size()) {
							value = $daySelected.attr('data-value');
						}
						op.miscBtnFn.call($miscBtn, value);
					}
				});
			}
		}

		return this.each(function () {
			let $this = $(this),
				isInput = $this.is('input'),
				opts = { $box: $this };
			if ($this.attr('dateFmt')) opts.pattern = $this.attr('dateFmt');
			if ($this.attr('minDate')) opts.minDate = $this.attr('minDate');
			if ($this.attr('maxDate')) opts.maxDate = $this.attr('maxDate');

			let dp = new Datepicker($this.val() || $this.attr('data-value'), opts);

			// input日期选择器
			if (isInput) {
				$this.click((event) => {
					let $frag = $(op.frag).addClass('view-' + op.viewType);
					let $calendarBox = $('#dwz-calendar');
					if ($calendarBox.size() == 0) {
						$calendarBox = $(`<div id="dwz-calendar"></div>`).appendTo($('body'));
						$calendarBox.click((event) => {
							$('#dwz-calendar').remove();
						});
					}
					// 禁止事件向上冒泡
					$frag.appendTo($calendarBox).click((event) => {
						event.stopPropagation();
						event.preventDefault();
					});
					let $df = $frag.find(setting.df$);
					$df.find('.cleanBtn').click((event) => {
						$this.val('').trigger('change', '');
						$calendarBox.remove();
					});
					$df.find('.cancelBtn').click((event) => {
						$calendarBox.remove();
					});
					$df.find('.okBtn').click((event) => {
						let $daySelected = $calendarBox.find('table.current td.selected');
						if ($daySelected.size()) {
							let _val = $daySelected.attr('data-value');
							$this.val(_val).trigger('change', _val);
						}
						$calendarBox.remove();
					});

					_init({ $this, $frag, dp, isInput });
				});
			} else {
				//月日历、周日历
				let $frag = $(op.frag).addClass('view-' + op.viewType);
				$frag.appendTo($this);
				_init({ $this, $frag, dp, isInput });
			}
		});
	};

	let Datepicker = function (sDate, opts) {
		this.opts = $.extend(
			{
				pattern: 'yyyy-MM-dd',
				minDate: '1900-01-01',
				maxDate: '2099-12-31',
				$box: null
			},
			opts
		);
		//动态minDate、maxDate
		let now = new Date();
		this.opts.minDate = now.formatDateTm(this.opts.minDate);
		this.opts.maxDate = now.formatDateTm(this.opts.maxDate);

		if (sDate) {
			this.sDate = sDate.trim();
		} else {
			this.sDate = new Date().formatDate(this.opts.pattern);
			this.opts.$box.attr('data-value', this.sDate);
		}
	};

	$.extend(Datepicker.prototype, {
		clone: function () {
			return new Datepicker(this.sDate, this.opts);
		},
		get: function (name) {
			return this.opts[name];
		},
		_getDays: function (y, m) {
			//获取某年某月的天数
			return m == 2 ? (y % 4 || (!(y % 100) && y % 400) ? 28 : 29) : /4|6|9|11/.test(m) ? 30 : 31;
		},

		_minMaxDate: function (sDate) {
			let _count = sDate.split('-').length - 1;
			let _format = 'y-M-d';
			if (_count == 1) _format = 'y-M';
			else if (_count == 0) _format = 'y';

			return sDate.parseDate(_format);
		},
		getMinDate: function () {
			return this._minMaxDate(this.opts.minDate);
		},
		getMaxDate: function () {
			let _sDate = this.opts.maxDate;
			let _count = _sDate.split('-').length - 1;
			let _date = this._minMaxDate(_sDate);

			if (_count < 2) {
				//format:y-M、y
				let _day = this._getDays(_date.getFullYear(), _date.getMonth() + 1);
				_date.setDate(_day);
				if (_count == 0) {
					//format:y
					_date.setMonth(11);
				}
			}

			return _date;
		},
		getDateWrap: function (date) {
			//得到年,月,日
			if (!date) date = this.parseDate(this.sDate) || new Date();
			let y = date.getFullYear();
			let m = date.getMonth() + 1;
			let days = this._getDays(y, m);
			return {
				year: y,
				month: m,
				day: date.getDate(),
				hour: date.getHours(),
				minute: date.getMinutes(),
				second: date.getSeconds(),
				days: days,
				date: date
			};
		},
		/**
		 * @param {year:2010, month:05, day:24}
		 */
		changeDate: function (y, m, d) {
			let date = new Date(y, m - 1, d || 1);
			this.sDate = this.formatDate(date);
			return date;
		},
		changeDay: function (day, chMonth) {
			if (!chMonth) chMonth = 0;
			let dw = this.getDateWrap();
			return new Date(dw.year, dw.month + parseInt(chMonth) - 1, day);
		},
		lastMonthFn: function (callback) {
			let dw = this.getDateWrap();
			let yearstart = this.getMinDate().getFullYear();

			if (dw.month > 1 || dw.year > yearstart) {
				let year = dw.year,
					month = dw.month - 1;
				if (dw.month == 1) {
					year--;
					month = 12;
				}
				let days = this._getDays(year, month);
				this.changeDate(year, month, dw.day > days ? days : dw.day);

				callback && callback(year, month);
			}
		},
		nextMonthFn: function (callback) {
			let dw = this.getDateWrap();
			let yearend = this.getMaxDate().getFullYear();
			if (dw.month < 12 || dw.year < yearend) {
				let year = dw.year,
					month = dw.month + 1;
				if (dw.month == 12) {
					year++;
					month = 1;
				}
				let days = this._getDays(year, month);
				this.changeDate(year, month, dw.day > days ? days : dw.day);

				callback && callback(year, month);
			}
		},
		/**
		 *
		 * @param options: dayInWeek: 周日~周六（0~6）, type: current, last, next
		 * @param callback
		 */
		dayWeek: function (options, callback) {
			let _op = $.extend({ dayInWeek: 0, type: 'current' }, options);
			let dw = this.getDateWrap();
			let _dayLongTime = 24 * 60 * 60 * 1000;
			let _week = dw.date.getDay(); // 当前是周几

			let _day = _op.dayInWeek - _week;
			if (_op.type == 'last') {
				_day = -7;
			} else if (_op.type == 'next') {
				_day = 7;
			}
			let _time = dw.date.getTime() + _day * _dayLongTime; //获取目标时间距离现在还有多少毫秒

			let _date = new Date(_time); // 将毫秒数转为date对象
			let _dw = this.getDateWrap(_date);
			this.sDate = this.formatDate(_date);

			_op.callback && _op.callback(_dw.year, _dw.month);

			return _dw;
		},
		parseDate: function (sDate) {
			return (sDate || this.sDate).parseDate(this.opts.pattern);
		},
		formatDate: function (date) {
			return date.formatDate(this.opts.pattern);
		},
		hasDay: function () {
			return this.opts.pattern.indexOf('d') != -1;
		},
		hasHour: function () {
			return this.opts.pattern.indexOf('H') != -1;
		},
		hasMinute: function () {
			return this.opts.pattern.indexOf('m') != -1;
		},
		hasSecond: function () {
			return this.opts.pattern.indexOf('s') != -1;
		},
		hasTime: function () {
			return this.hasHour() || this.hasMinute() || this.hasSecond();
		},
		hasDate: function () {
			let _dateKeys = ['y', 'M', 'd', 'E'];
			for (let i = 0; i < _dateKeys.length; i++) {
				if (this.opts.pattern.indexOf(_dateKeys[i]) != -1) return true;
			}

			return false;
		}
	});

	$.Datepicker = Datepicker;
})(dwz);
