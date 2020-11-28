module.exports = {
	env: {
		browser: true,
		es2021: true,
	},
	extends: "eslint:recommended",
	parserOptions: {
		ecmaVersion: 12,
		sourceType: "module",
	},
	plugins: ["prettier"], // 这里增加prettier插件。
	rules: {
		"no-console": process.env.NODE_ENV === "production" ? "error" : "off",
        "no-debugger": process.env.NODE_ENV === "production" ? "error" : "off",
        "prettier/prettier": "error", // prettier 检测到的标红展示
        "semi": 1,
        "prefer-promise-reject-errors": 0,
        "space-before-function-paren": 0,
        "max-len": ["error", {"code": 160, "ignoreUrls": true}],
        "no-unused-vars": 0, // 忽略变量 is assigned a value but never used
        "no-undef": 0, // 忽略变量 is not defined
        "no-extend-native": [ // 内建对象String...
          "error",
          {
            "exceptions": [
              "Object"
            ]
          }
        ]
	},
};
