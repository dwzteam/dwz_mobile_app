/**
 * @author 张慧华 <350863780@qq.com>
 */
(function ($) {
	// DWZ regional
	$.setRegional('calendar', {
		dayNames: ['日', '一', '二', '三', '四', '五', '六'],
		monthNames: ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月']
	});

	$.setRegional('alert', {
		title: {
			error: '错误',
			success: '成功',
			confirm: '确认提示'
		},
		btnMsg: { ok: '确定', cancel: '取消' }
	});
})(dwz);
