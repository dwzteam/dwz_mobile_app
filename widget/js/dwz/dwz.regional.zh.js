/**
 * @author 张慧华 <350863780@qq.com>
 */
(function ($) {
	// DWZ regional
	$.setRegional('calendar', {
		dayNames: ['日', '一', '二', '三', '四', '五', '六'],
		monthNames: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'],
		yearName: '年'
	});

	$.setRegional('alert', {
		title: {
			error: '错误',
			success: '成功',
			confirm: '确认提示'
		},
		btnMsg: { ok: '确定', cancel: '取消' }
	});

	$.setRegional('actionSheet', {
		cancelTxt: '取消'
	});
})(dwz);
