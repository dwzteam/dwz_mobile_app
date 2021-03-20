/**
 * 图表组件库
 * @author 张慧华
 */
class DwzChartBase extends DwzWidget {
	constructor({ $el, decimals = 0, animationStep = 5, animationInterval = 30, startColor = '#0099DD', endColor = '#7ED7FF', textColor = '#aaa', textSize = '30px', infoText = '', infoTextColor = '#aaa', infoTextSize = '14px' }) {
		//调用实现父类的构造函数,相当于获得父类的this指向
		super(arguments[0]);
		this.decimals = decimals;
		this.animationStep = animationStep;
		this.animationInterval = animationInterval;
		this.textColor = textColor;
		this.textSize = textSize;
		this.infoText = infoText;
		this.infoTextColor = infoTextColor;
		this.infoTextSize = infoTextSize;

		this.startRgba = $.colorRgba({ color: startColor });
		this.endRgba = $.colorRgba({ color: endColor });
	}

	midRgbaColor(rate = 0.5) {
		const reg = /(?:\(|\)|rgba|RGBA)*/g;
		const startArr = this.startRgba.replace(reg, '').split(',');
		const endArr = this.endRgba.replace(reg, '').split(',');

		const colorChange = [];
		if (startArr.length == 4 && endArr.length == 4) {
			for (let i = 0; i < startArr.length; i++) {
				const start = parseInt(startArr[i]);
				const end = parseInt(endArr[i]);

				let mid = Math.abs(start + (end - start) * rate);
				if (i < 3) {
					mid = parseInt(mid);
				}
				colorChange.push(mid);
			}

			return 'rgba(' + colorChange.join(',') + ')';
		}

		return this.startRgba || this.endRgba;
	}
}

/**
 * 百分比环形图
 */
class DwzChartPercent extends DwzChartBase {
	/**
	 *
	 * @param $el
	 * @param data: 0~100
	 * @param strokeLinecap: round|butt
	 * @param rateColor: 渐变颜色中间色比率
	 * @param bgColor: 背景圈颜色
	 * @param fgWidth: default 15
	 * @param bgWidth: default 15
	 * @param sideType: onside|inside|outside
	 */
	constructor({ $el, data = 0, infoText = '', strokeLinecap = 'round', rateColor = 0.7, bgColor = 'rgba(200, 200, 200, .5)', fgWidth = 10, bgWidth = 10, sideType = 'onside' }) {
		super(
			$.extend(
				{
					textColor: '#aaa',
					textSize: '30px',
					infoText: '',
					infoTextColor: 'rgba(0,0,0,0.3)',
					infoTextSize: '14px',
					startColor: '#0099DD',
					endColor: '#7ED7FF',
					rateColor: 0.7
				},
				arguments[0]
			)
		);

		this.midRgba = this.midRgbaColor(rateColor);
		this.strokeLinecap = strokeLinecap;
		this.circleRadius = 360;
		this.data = data;
		this.randomKey = Math.ceil(Math.random() * 100000);

		let bgRadius = 57;
		if (sideType == 'inside') bgRadius = 57 - fgWidth;
		else if (sideType == 'outside') bgRadius = 57 + fgWidth;
		const template = `<svg xmlns="http://www.w3.org/2000/svg" version="1.1" viewBox="0 0 150 150" class="dwz-chart-percent">
			<defs>
				<linearGradient x1="0%" y1="0%" x2="100%" y2="0%" id="lg-${this.randomKey}-1">
					<stop stop-color="${this.strokeLinecap == 'round' ? this.midRgba : this.startRgba}" offset="0%"></stop>
					<stop stop-color="${this.endRgba}" offset="100%"></stop>
				</linearGradient>
				<linearGradient x1="0%" y1="0%" x2="100%" y2="0%" id="lg-${this.randomKey}-2">
					<stop stop-color="${this.startRgba}" offset="0%"></stop>
					<stop stop-color="${this.midRgba}" offset="100%"></stop>
				</linearGradient>
			</defs>
			<circle class="svg-border" cx="75" cy="75" r="${bgRadius}" fill="none" stroke="${bgColor}" stroke-width="${bgWidth}" stroke-dasharray="460" transform="rotate(-90,75,75)"></circle>
			<circle class="svg-circle-1" cx="75" cy="75" r="57" fill="none" stroke="url(#lg-${this.randomKey}-1)" stroke-width="${fgWidth}" stroke-dasharray="0, 20000" transform="rotate(-90,75,75)" stroke-linecap="${strokeLinecap}"></circle>
			<circle class="svg-circle-2" style="display: none" cx="75" cy="75" r="57" fill="none" stroke="url(#lg-${
				this.randomKey
			}-2)" stroke-width="${fgWidth}" stroke-dasharray="0, 20000" transform="rotate(90,75,75)" stroke-linecap="${strokeLinecap}"></circle>
			<text class="timer" text-anchor="middle" x="80" y="${this.infoText ? 80 : 85}" style="font-size: ${this.textSize};" fill="${this.textColor}">
				<tspan class="number">--</tspan><tspan class="percent" style="font-size:.5em">%</tspan>	
			</text>
			<text class="infoText" text-anchor="middle" x="75" y="100" style="font-size: ${this.infoTextSize};" fill="rgba(0,0,0,0.4)">${this.infoText || ''}</text>
		</svg>`;

		this.$el.html(template);
		this.$circle1 = this.$el.find('circle.svg-circle-1');
		this.$circle2 = this.$el.find('circle.svg-circle-2');
		this.$number = this.$el.find('tspan.number');
		this.$infoText = this.$el.find('text.infoText');

		this.render();
	}

	_angleCal(data) {
		return (this.circleRadius * data) / 100;
	}

	setData(data, infoText) {
		if (data >= 0 && data <= 100) {
			this.data = data;
			if (infoText !== undefined) {
				this.infoText = infoText;
				this.$infoText.text(infoText);
			}
			this.render();
		}
	}

	render() {
		const angleEnd = this._angleCal(this.data);
		let angle = 0;

		if (this.timer) window.clearInterval(this.timer);
		this.timer = window.setInterval(() => {
			if (angle >= angleEnd) {
				if (this.timer) window.clearInterval(this.timer);
				this.timer = null;
			} else {
				angle += this.animationStep;
			}

			let text = parseFloat((angle / this.circleRadius) * 100);
			if (text >= this.data) {
				angle = angleEnd;
				text = this.data;
			}
			text = text.toFixed(this.decimals);

			// 修正圆角角度
			if (this.strokeLinecap == 'round') {
				let _angle = angle;
				_angle = angle - 1;
				if (_angle < 0) _angle = 0;

				if (_angle > 180) {
					this.$circle2.css({ display: 'block' });
					this.$circle2.attr('stroke-dasharray', _angle - 180 + ', 20000');
				} else {
					this.$circle2.css({ display: 'none' });
					this.$circle1.attr('stroke-dasharray', _angle + ', 20000');
				}
			} else {
				this.$circle1.attr('stroke-dasharray', angle + ', 20000');
			}
			this.$number.text(text);
		}, this.animationInterval);
	}
}

/**
 * 环形堆叠图表
 */
class DwzChartCircle extends DwzChartBase {
	/**
	 *
	 * @param $el
	 * @param data: 0~100
	 * @param strokeLinecap: round|butt
	 * @param rateColor: 渐变颜色中间色比率
	 * @param bgColor: 背景圈颜色
	 * @param fgWidth: default 15
	 * @param bgWidth: default 15
	 * @param sideType: onside|inside|outside
	 */
	constructor({ $el, data = [], bgColor = 'rgba(200, 200, 200, .5)', fgWidth = 10, bgWidth = 3, sideType = 'onside', color = [], axis = [], img = '', space = 1 }) {
		super(
			$.extend(
				{
					textColor: '#aaa',
					textSize: '20px'
				},
				arguments[0]
			)
		);

		this.color = color;
		if (!color || color.length < axis.length) {
			this.color = [];
			for (let i = 0; i < axis.length; i++) {
				this.color.push($.randomColor(0.7));
			}
		}

		this.circleRadius = 360;
		this.data = data;
		this.space = space;
		this.angleRadius = this._angleCal(data);

		let bgRadius = 57;
		if (sideType == 'inside') bgRadius = 57 + fgWidth;
		else if (sideType == 'outside') bgRadius = 57 - fgWidth;

		const template = `<svg xmlns="http://www.w3.org/2000/svg" version="1.1" viewBox="0 0 150 150" class="dwz-chart-percent">
				<circle class="svg-border" cx="75" cy="75" r="${bgRadius}" fill="none" stroke="${bgColor}" stroke-width="${bgWidth}" stroke-dasharray="460" transform="rotate(-90,75,75)"></circle>
				${this._genCircle(fgWidth)}	
				${img ? `<image id="chart-SVGIMG" xlink:href="${img}" height="40%" width="40%" x="44" y="43"/>` : ''}
			</svg>`;

		this.$el.html(template);

		this.$circlelist = this.$el.find('circle.svg-circle');

		this.render();
	}

	_genCircle(fgWidth) {
		let circleStr = '';
		for (let i = 0; i < this.color.length; i++) {
			circleStr += `<circle class="svg-circle" cx="75" cy="75" r="57" fill="none" stroke="${this.color[i]}" stroke-width="${fgWidth}" stroke-dasharray="0, 20000" transform="rotate(${this.angleRadius[i].start},75,75)" stroke-linecap="butt"></circle>`;
		}
		// console.log(circleStr)
		return circleStr;
	}

	_angleCal(data) {
		let angleRadius = [];
		for (let i = 0; i < data.length; i++) {
			let item = { start: -90, angle: 0 };
			if (i > 0) {
				item.start = angleRadius[i - 1].start + angleRadius[i - 1].angle + this.space;
			}
			item.angle = (data[i] / 100) * (this.circleRadius - this.space * data.length);
			angleRadius.push(item);
		}
		return angleRadius;
	}

	setData(data) {
		if ($.isArray(data) && data.length == this.data.length) {
			this.data = data;
			this.render();
		}
	}

	render() {
		let renderIndex = 0,
			renderAngle = 0;
		this.$circlelist.attr('stroke-dasharray', '0, 20000');

		if (this.timer) window.clearInterval(this.timer);
		this.timer = window.setInterval(() => {
			if (renderIndex > this.angleRadius.length - 1) {
				if (this.timer) window.clearInterval(this.timer);
				this.timer = null;
				return;
			}

			renderAngle += this.animationStep;

			let renderNext = false;
			if (renderAngle >= this.angleRadius[renderIndex].angle) {
				renderAngle = this.angleRadius[renderIndex].angle;
				renderNext = true;
			}

			this.$circlelist.eq(renderIndex).attr('stroke-dasharray', renderAngle + ', 20000');
			if (renderNext) {
				renderIndex++;
				renderAngle = 0;
			}
		}, this.animationInterval);
	}
}
