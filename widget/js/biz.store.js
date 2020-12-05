/**
 * @author 张慧华 z@j-ui.com
 */

// Store 基类
const CommonStore = {
	data: [],
	getData(params) {
		const op = $.extend({ selectedId: '' }, params);
		const data = [];
		for (let i = 0; i < this.data.length; i++) {
			data.push(this.data[i]);
			data[i].selected = data[i].id == op.selectedId;
		}
		return data;
	},
	getItem(id) {
		for (let i = 0; i < this.data.length; i++) {
			if (this.data[i].id == id) {
				return this.data[i];
			}
		}
		return {};
	}
};

// 性别
const SexStore = $.extend({}, CommonStore, {
	data: [
		{ id: 1, name: '男' },
		{ id: 2, name: '女' }
	]
});

// 运输单状态
const TransportStatus = $.extend({}, CommonStore, {
	data: [
		{ id: '0', icon: 'status-pending', name: '待出发' },
		{ id: '1', icon: 'status-fail', name: '运输中' },
		{ id: '2', icon: 'status-pass', name: '已完成' }
	]
});
