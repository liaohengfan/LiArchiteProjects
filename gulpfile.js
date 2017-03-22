/**
 * Created by liaohengfan on 2017/3/7.
 */
// 引入 gulp
var gulp = require('gulp');

// 引入组件
var jshint = require('gulp-jshint');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var rename = require('gulp-rename');

/*// 开发
// 检查脚本
gulp.task('lint', function() {
    gulp.src('./src/!*.js')
        .pipe(jshint())
        .pipe(jshint.reporter('default'));
});
// 合并，压缩文件
gulp.task('scripts', function() {
    gulp.src('./src/!*.js')
        .pipe(concat('liArchite.js'))
        .pipe(gulp.dest('./build'))
        .pipe(rename('liArchite.min.js'))
        .pipe(uglify())
        .pipe(gulp.dest('./build'));
});

// 默认任务
gulp.task('default', function(){
    gulp.run('lint','scripts');

    // 监听文件变化
    gulp.watch('./src/!*.js', function(){
        gulp.run('lint','scripts');
    });
});*/


//打包
// 合并，压缩文件
gulp.task('scripts', function() {
    gulp.src('./all/*.js')
        .pipe(concat('liArchiteAll.js'))
        .pipe(gulp.dest('./build'))
        .pipe(rename('liArchiteAll.min.js'))
        .pipe(uglify())
        .pipe(gulp.dest('./build'));
});

// 默认任务
gulp.task('default', function(){
    gulp.run('scripts');
});