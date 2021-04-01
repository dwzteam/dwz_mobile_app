/**
 * @author 张慧华 <350863780@qq.com>
 */
(function ($) {
	// DWZ regional
	$.setRegional('utilDate', {
		MONTH_NAMES: ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月', '1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'],
		DAY_NAMES: ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六', '周日', '周一', '周二', '周三', '周四', '周五', '周六']
	});

	$.setRegional('calendar', {
		dayNames: ['日', '一', '二', '三', '四', '五', '六'],
		monthNames: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'],
		yearName: '年',
		btnTxt: { ok: '确定', cancel: '取消', clean: '清除' }
	});

	$.setRegional('alert', {
		title: {
			info: '提示',
			error: '错误',
			success: '成功',
			confirm: '确认提示'
		},
		btnTxt: { ok: '确定', cancel: '取消' }
	});

	$.setRegional('actionSheet', {
		cancelTxt: '取消'
	});
})(dwz);
