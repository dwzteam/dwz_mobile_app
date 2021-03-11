/**
 * @author 张慧华 <350863780@qq.com>
 * 画笔签字
 */
(function ($) {
	// http://www.qianmoqi.com/home/test/0929/maobizhi/
	let Brush = function (options) {
		this.$el = options.$el;
		this.canvas = this.$el.get(0);
		this.ctx = this.canvas.getContext('2d');
		if (options.width) this.canvas.width = options.width;
		if (options.height) this.canvas.height = options.height;
		this.ctx.fillStyle = options.fillStyle || '#ffffff';

		this.p = 0;
		this.l = 10;
		this.arr = [];
		//鼠标场景--电脑端.
		this.canvas.onmousedown = this.downEvent.bind(this);
		this.canvas.onmousemove = this.moveEvent.bind(this);
		this.canvas.onmouseup = this.upEvent.bind(this);
		//触摸场景--手机端/触摸屏机
		this.canvas.addEventListener('touchstart', this.downEvent.bind(this), false);
		this.canvas.addEventListener('touchmove', this.moveEvent.bind(this), false);
		this.canvas.addEventListener('touchend', this.upEvent.bind(this), false);
		this.canvas.addEventListener(
			'contextmenu',
			function (e) {
				e.preventDefault();
			},
			false
		);
		this.moveFlag = false;
		this.upof = {};
		this.radius = 0;
		this.has = [];
		this.lineMax = 10; // 画笔最大宽度
		this.lineMin = 5; // 画笔最小宽度
		this.linePressure = 1;
		this.smoothness = 80;

		this.img = new Image();
		this.img.src = options.brushUrl || 'image/drawingBoard/pen1.png';
	};
	Brush.prototype.clear = function () {
		this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
	};
	Brush.prototype.toDataURL = function () {
		// 将canvas的透明背景设置成白色
		let imageData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
		for (let i = 0; i < imageData.data.length; i += 4) {
			// 当该像素是透明的，则设置成白色
			if (imageData.data[i + 3] == 0) {
				imageData.data[i] = 255;
				imageData.data[i + 1] = 255;
				imageData.data[i + 2] = 255;
				imageData.data[i + 3] = 255;
			}
		}
		this.ctx.putImageData(imageData, 0, 0);

		return this.canvas.toDataURL('image/jpeg', 1);
	};
	Brush.prototype.clickEvent = function (e) {
		this.cli = this.getXY(e);
	};
	Brush.prototype.downEvent = function (e) {
		window.console.log('点击');
		this.moveFlag = true;
		this.has = [];
		this.upof = this.getXY(e);
		// this.ctx.drawImage(this.img,(this.upof.x - this.big/2),(this.upof.y - this.big/2),this.big,this.big);
		let x1 = this.upof.x;
		let y1 = this.upof.y;
		this.arr.unshift({ x1, y1 });
	};
	Brush.prototype.moveEvent = function (e) {
		if (!this.moveFlag) return;
		e.preventDefault();
		let of = this.getXY(e); //move
		let up = this.upof; //down
		let ur = this.radius; //banjing
		let b = 0;
		this.has.unshift({
			time: new Date().getTime(),
			dis: this.distance(up, of)
		});
		let dis = 0;
		let time = 0;
		for (let n = 0; n < this.has.length - 1; n++) {
			dis += this.has[n].dis;
			time += this.has[n].time - this.has[n + 1].time;
			if (dis > this.smoothness) break;
		}
		let or = Math.min((time / dis) * this.linePressure + this.lineMin, this.lineMax) / 2;
		this.radius = or;
		this.upof = of;
		let len = Math.round(this.has[0].dis / 2) + 1;
		for (let i = 0; i < len; i++) {
			let x = up.x + ((of.x - up.x) / len) * i;
			let y = up.y + ((of.y - up.y) / len) * i;
			let r = ur + ((or - ur) / len) * i;
			this.ctx.beginPath();
			// this.ctx.arc(x,y,r,0.2*Math.PI,1.5*Math.PI,true);
			// this.ctx.fill();
			// let r_r = r * 2;

			x = x - this.l / 2;
			y = y - this.l / 2;
			this.arr.unshift({ x, y });
			this.ctx.drawImage(this.img, x, y, this.l, this.l);
			this.l = this.l - 0.2;
			if (this.l < this.lineMin) this.l = this.lineMin;
			this.p++;
		}
	};
	Brush.prototype.upEvent = function (e) {
		this.moveFlag = false;
		this.l = this.lineMax;
		if (this.arr.length > 100) {
			for (let j = 0; j < 60; j++) {
				// arr[j].x = arr[j].x - 2;
				// arr[j].y = arr[j].y - 1;
				this.arr[j].x = this.arr[j].x - this.l / 4;
				this.arr[j].y = this.arr[j].y - this.l / 4;
				this.ctx.drawImage(this.img, this.arr[j].x, this.arr[j].y, this.l, this.l);

				this.l = this.l - 0.3;
				if (this.l < 5) this.l = 5;
			}
			this.l = this.lineMax;
			this.arr = [];
		}
		if (this.arr.length == 1) {
			// this.arr[0].x =
			this.ctx.drawImage(this.img, this.arr[0].x1 - this.l / 2, this.arr[0].y1 - this.l / 2, this.l, this.l);
			this.arr = [];
		}
	};
	Brush.prototype.getXY = function (e) {
		let x = e.clientX || e.touches[0].clientX;
		let y = e.clientY || e.touches[0].clientY;
		let offset = this.$el.offset();

		// // return {
		//     x : e.clientX - this.canvas.offsetLeft + (document.body.scrollLeft || document.documentElement.scrollLeft),
		//     y : e.clientY - this.canvas.offsetTop  + (document.body.scrollTop || document.documentElement.scrollTop)
		// }

		return {
			x: x - offset.left + (document.body.scrollLeft || document.documentElement.scrollLeft),
			y: y - offset.top + (document.body.scrollTop || document.documentElement.scrollTop)
		};
	};
	Brush.prototype.distance = function (a, b) {
		let x = b.x - a.x,
			y = b.y - a.y;
		return Math.sqrt(x * x + y * y);
	};

	$.extend({
		Brush: Brush,
		drawingBoardRender: function (tpl, params) {
			let $box = this;

			let html = template.render(tpl.html, { params: params });
			$box.html(html).initUI();

			setTimeout(() => {
				let $canvas = $box.find('canvas');
				let brush = new Brush({
					$el: $box.find('canvas'), //canvas 选择器
					width: $canvas.width(),
					height: $canvas.height(),
					brushUrl: 'image/drawingBoard/pen1.png' //选择笔刷
				});

				$box.find('button.dwz-btn-reset').click(function () {
					brush.clear();
				});
				$box.find('button.dwz-btn-submit').click(function () {
					let strBase64 = brush.toDataURL();
					// console.log(strBase64);

					let $form = $.navView.getBox();
					let $signInput = $form.find('input.dwz-sign-input').val(strBase64.replace('data:image/jpeg;base64,', ''));
					let imgHtml = '<img src="' + strBase64 + '"><a class="btn-txt">重新签名</a>';
					let $signBox = $form.find('.dwz-sign-box');
					if (!$signBox.data('btn_html')) {
						$signBox.data('btn_html', $signBox.html());
					}
					$signBox.html(imgHtml);

					// 重签按钮
					$signBox.find('.btn-txt').click((event) => {
						setTimeout(() => {
							$signBox.html($signBox.data('btn_html'));
							$signInput.val('');
						}, 200);
					});

					$.dialog.close();
				});
			}, 500);
		}
	});
})(dwz);
