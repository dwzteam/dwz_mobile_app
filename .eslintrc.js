module.exports = {
	env: {
		browser: true,
		es2021: true
	},
	extends: 'eslint:recommended',
	parserOptions: {
		ecmaVersion: 12,
		sourceType: 'module'
	},
	plugins: ['prettier'], // 这里增加prettier插件。

	// https://cloud.tencent.com/developer/section/1135779
	rules: {
		'no-console': process.env.NODE_ENV === 'production' ? 'error' : 'off',
		'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off',
		'prettier/prettier': 'error', // prettier 检测到的标红展示
		'prefer-promise-reject-errors': 0, // 只将内置Error对象的实例传递给reject()为了Promises中的用户定义错误的函数是一种很好的做法
		'space-before-function-paren': 0, // function开始参数之间允许有空格
		// "max-len": ["error", { "code": 240, "ignoreUrls": true }],
		'no-unused-vars': 0, // 忽略变量 is assigned a value but never used
		'no-undef': 0, // 忽略变量 is not defined
		'no-mixed-spaces-and-tabs': ['error', 'smart-tabs'], // 不允许使用混合空格和制表符进行缩进
		'no-useless-escape': 0, // 不必要的转义通知
		'no-extend-native': 0 // 允许修改native对象，ex：String.prototype.tirm
	}
};
