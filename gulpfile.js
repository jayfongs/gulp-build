const gulp = require('gulp');
const browserSync = require('browser-sync').create();
const minimist = require('minimist');
const reload = browserSync.reload;
const $ = require('gulp-load-plugins')();

/**
 * 用于判断是什么环境开发（开发环境和生产环境）
 * 默认为开发环境
 */
const knowOptions = {
    string: 'env',
    default: {
        env: process.env.NODE_ENV || 'development'
    }
}

const options = minimist(process.argv.slice(2), knowOptions);

// 源文件路径
const baseDir = 'resources/';

// 生成文件路径
const outputDir = 'build/';


/**
 * 清除public文件夹
 */
gulp.task('clean', () => {
	return gulp.src(outputDir)
        .pipe($.clean());
});

/**
 * 复制HTML
 */
gulp.task('html', () => {
    return gulp.src(baseDir + 'views/*.html')
        .pipe(gulp.dest(outputDir));
});

/**
 * scss 编译
 */
gulp.task('scss', () => {
	return gulp.src(baseDir + 'scss/pages/*.scss')
		.pipe($.sass({ outputStyle: 'expanded' }).on('error', $.sass.logError))
        .pipe($.if(options.env === 'production', $.sass({ outputStyle: 'compressed' }).on('error', $.sass.logError)))
		.pipe($.autoprefixer({
            browsers: ['> 1%', 'last 2 versions', 'Firefox ESR'],
            cascade: false
        }))
		.pipe(gulp.dest(outputDir + 'css/'))
        .pipe(reload({ stream: true }));
});

/**
 * 抽取 Bower里的字体
 */
gulp.task('fonts', () => {
   return gulp.src(baseDir + 'bower/font-awesome/fonts/*')
       .pipe(gulp.dest(outputDir + 'fonts/'));
});

/**
 * 压缩图片
 */
gulp.task('images', () => {
	return gulp.src(baseDir + 'images/**/*')
        .pipe($.cache($.imagemin({
            progressive: true,      //类型：Boolean 默认：false 无损压缩jpg图片
            interlaced: true        //类型：Boolean 默认：false 隔行扫描gif进行渲染
        })))
        .pipe(gulp.dest(outputDir + 'images/'));
});

/**
 * 检测JS代码
 */
gulp.task('jshint', () => {
    return gulp.src(baseDir + 'js/**/*.js')
        .pipe($.jshint())
        .pipe($.jshint.reporter('jshint-stylish'))
        .pipe($.jshint.reporter('fail'));
});

/**
 * 压缩js
 */
gulp.task('scripts', ['jshint'], () => {
    return gulp.src(baseDir + 'js/*.js')
        .pipe($.if(options.env === 'production', $.uglify()))
        .pipe(gulp.dest(outputDir + 'js/'))
        .pipe(reload({ stream: true }));
});

/**
 * 抽取Bower里的JS
 * 压缩
 */
gulp.task('bower-scripts', () => {
   gulp.src(baseDir + 'bower/select2/dist/js/select2.js')
       .pipe($.uglify())
       .pipe($.rename('select2.min.js'))
       .pipe(gulp.dest(outputDir + 'js/vendors/'));
   gulp.src(baseDir + 'bower/jquery/dist/jquery.min.js')
       .pipe(gulp.dest(outputDir + 'js/'));
});

/**
 * 浏览器同步测试工具
 */
gulp.task('serve', ['html', 'scss', 'images', 'scripts', 'fonts', 'bower-scripts'], () => {
	browserSync.init({
        server: {
            baseDir: outputDir
        }
    });

    gulp.watch(baseDir + 'views/*', ['html']);
    gulp.watch(baseDir + 'scss/**/*.scss', ['scss']);
    gulp.watch(baseDir + 'images/**/*', ['images']);
    gulp.watch(baseDir + 'js/*.js', ['scripts']);
    gulp.watch(baseDir + 'views/*.html').on('change', reload);
});


/**
 * 默认执行
 */
gulp.task('default', ['clean'], () => {
    gulp.start(['html', 'scss', 'images', 'fonts', 'scripts', 'bower-scripts']);
});