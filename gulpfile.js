var gulp = require('gulp');
var $ = require('gulp-load-plugins')();
var mainBowerFiles = require('main-bower-files');

var sassFilesOrdered = [
	'./static/scss/partials/_reset.scss',
	'./static/scss/partials/_grid.scss',
	'./static/scss/partials/_bootstrap.scss',
	'./static/scss/partials/_bootstrap-theme.scss',
	'./static/scss/partials/_settings.scss',
	'./static/scss/partials/_fancybox.scss',
	'./static/scss/partials/_typography.scss',
	'./static/scss/lib/**/*.scss',
	'./static/scss/partials/**/*.scss'
];
var jsFilesOrdered = [
	'!./static/js/lib/svg4everybody/dist/svg4everybody.legacy.js',
	'./static/js/lib/jquery/dist/jquery.js',
	'./static/js/lib/jquery/dist/bootstrap.js',
	'./static/js/lib/jquery-validation/dist/jquery.validate.js',
	'./static/js/lib/**/*.js',
	'./static/js/partials/**/*.js'
];
var autoprefixerOptions = {
	browsers: ['last 2 versions'],
	cascade: false
};
var jsFilter = $.filter('**/*.js', {restore: true});
var cssFilter = $.filter('**/*.css');

gulp.task('bower', function () {
	return $.bower();
});

gulp.task('bowercopy', ['bower'], function () {
	return gulp.src(mainBowerFiles(), {base: './bower_components'})
			.pipe(jsFilter)
			.pipe(gulp.dest('./static/js/lib'))
			.pipe(jsFilter.restore)
			.pipe(cssFilter)
			.pipe($.rename({extname: '.scss'}))
			.pipe(gulp.dest('./static/scss/lib'));
});

var sassDev = function () {
	return gulp.src(sassFilesOrdered)
			.pipe($.sourcemaps.init())
			.pipe($.concat('styles.css'))
			.pipe($.sass({outputStyle: 'expanded'}))
			.pipe($.autoprefixer(autoprefixerOptions))
			.pipe($.sourcemaps.write('.'))
			.pipe(gulp.dest('./static/css'))
			.pipe($.livereload());
};
gulp.task('sass:dev', ['bowercopy'], sassDev);
gulp.task('sass:dev:watch', sassDev);

gulp.task('sass:prod', ['bowercopy'], function () {
	return gulp.src(sassFilesOrdered)
			.pipe($.sourcemaps.init())
			.pipe($.concat('styles.min.css'))
			.pipe($.sass({outputStyle: 'compressed'}))
			.pipe($.autoprefixer(autoprefixerOptions))
			.pipe($.sourcemaps.write('.'))
			.pipe(gulp.dest('./static/css'));
});

var jsDev = function () {
	return gulp.src(jsFilesOrdered)
			.pipe($.concat('scripts.js'))
			.pipe(gulp.dest('./static/js'))
			.pipe($.livereload());
};
gulp.task('js:dev', ['bowercopy'], jsDev);
gulp.task('js:dev:watch', jsDev);

gulp.task('js:prod', ['bowercopy'], function () {
	return gulp.src(jsFilesOrdered)
			.pipe($.sourcemaps.init())
			.pipe($.concat('scripts.min.js'))
			.pipe($.uglify())
			.pipe($.sourcemaps.write('.'))
			.pipe(gulp.dest('./static/js'));
});

gulp.task('html:dev:watch', function () {
	return gulp.src(['./*.html'])
			.pipe($.livereload());
});

gulp.task('watch', ['sass:dev', 'js:dev'], function () {
	$.livereload.listen();
	gulp.watch(['*.html'], ['html:dev:watch']);
	gulp.watch(['static/scss/partials/*.scss'], ['sass:dev:watch']);
	gulp.watch(['static/js/partials/*.js'], ['js:dev:watch']);
});

gulp.task('dev', ['watch', 'sass:dev', 'js:dev']);
gulp.task('prod', ['sass:dev', 'js:dev', 'sass:prod', 'js:prod']);
gulp.task('default', ['dev']);
