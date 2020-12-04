const gulp = require('gulp'),
	babel = require('gulp-babel'), // 用于ES6转化ES5
	uglify = require('gulp-uglify'), // 用于压缩 JS
	changed = require('gulp-changed'),
	browserSync = require('browser-sync').create(),
	del = require('del'),
	concat = require('gulp-concat'), //合并文件
	rename = require('gulp-rename'), //文件重命名
	cache = require('gulp-cache'), //图片缓存
	errors = require('gulp-util'),
	plumber = require('gulp-plumber');

const less = require('gulp-less'),
	sourcemaps = require('gulp-sourcemaps'),
	cssmin = require('gulp-clean-css'), // 用于压缩 CSS
	// px2rem = require('gulp-px2rem-plugin'),
	// px2rem_opts = {
	// 	width_design: 750,	// 设计稿宽度。默认值640
	// 	pieces: 10,	// 将整屏切份（750/75=10）。默认为10，相当于10rem = width_design(设计稿宽度)
	// 	valid_num: 6,	// 生成rem后的小数位数。默认值4
	// 	ignore_px: [],	// 让部分px不在转换成rem。默认为空数组
	// 	ignore_selector: []	// 让部分选择器不在转换为rem。默认为空数组
	// },
	autoprefixer = require('gulp-autoprefixer'),
	autoprefixer_opts = {
		overrideBrowserslist: ['last 2 versions', 'Android >= 4.0', 'ios >= 6'],
		cascade: true, //是否美化属性值 默认：true 像这样：
		//-webkit-transform: rotate(45deg);
		//        transform: rotate(45deg);
		remove: true //是否去掉不必要的前缀 默认：true
	};

const js_src = require('./widget/script/index');

/* less */
gulp.task('less-dev', () => {
	return (
		gulp
			.src(['widget/less/ui.less']) //多个文件以数组形式传入
			.pipe(
				changed('widget/css', {
					hasChanged: changed.compareSha1Digest
				})
			)
			// .pipe(plumber())
			.pipe(sourcemaps.init())
			.pipe(
				less({
					dumpLineNumbers: 'comments',
					env: 'development',
					relativeUrls: true
				})
			)
			// .pipe(px2rem(px2rem_opts))
			.pipe(autoprefixer(autoprefixer_opts))
			.pipe(sourcemaps.write())
			.on('error', function (err) {
				errors.log(errors.colors.red('[Error]'), err.toString());
			})
			.pipe(gulp.dest('widget/css'))
			.pipe(
				browserSync.reload({
					stream: true
				})
			)
	);
});

gulp.task('less-prod', () => {
	return (
		gulp
			.src(['widget/less/ui.less']) //多个文件以数组形式传入
			.pipe(
				changed('widget/css', {
					hasChanged: changed.compareSha1Digest
				})
			)
			.pipe(plumber())
			.pipe(less({ env: 'production', relativeUrls: true }))
			// .pipe(px2rem(px2rem_opts))
			.pipe(autoprefixer(autoprefixer_opts))
			.on('error', function (err) {
				errors.log(errors.colors.red('[Error]'), err.toString());
			})
			.pipe(cssmin({ keepSpecialComments: '*' })) //保留所有特殊前缀 当你用autoprefixer生成的浏览器前缀
			.pipe(gulp.dest('widget/css'))
	);
});

gulp.task('script-min', () => {
	return gulp
		.src(
			js_src.dev.map((item) => {
				return 'widget/' + item;
			})
		)
		.pipe(babel())
		.pipe(concat('all.min.js'))
		.pipe(uglify())
		.on('error', function (err) {
			errors.log(errors.colors.red('[Error]'), err.toString());
		})
		.pipe(gulp.dest('widget/script'));
});

/* del */
gulp.task('clean-build', (cb) => {
	return del(['widget/script/all.min.js', 'widget/css/ui.css'], cb);
});

/* serve */
gulp.task('serve-dev', () => {
	browserSync.init({
		port: 2020,
		server: {
			baseDir: ['./widget'],
			index: 'index.html'
		}
	});
	gulp.watch('widget/less/**/*', gulp.series('less-dev'));
});

/* dev */
gulp.task('dev', gulp.series('less-dev', 'serve-dev'));

/* prod */
gulp.task('build', gulp.series('less-prod', 'script-min'));
