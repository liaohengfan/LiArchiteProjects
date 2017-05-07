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

// 检查脚本
gulp.task('lint', function() {
    gulp.src('./alljs/*.js')
        .pipe(jshint())
        .pipe(jshint.reporter('default'));
});
// 合并，压缩文件
gulp.task('scripts', function() {
    gulp.src('./alljs/*.js')
        .pipe(concat('liArchiteAll.js'))
        .pipe(gulp.dest('./build'))
        .pipe(rename({suffix: '.min'}))   //rename压缩后的文件名
        .pipe(uglify())    //压缩
        .pipe(gulp.dest('./build'))
});

// 默认任务
gulp.task('default', function(){
    gulp.run('lint','scripts');

    // 监听文件变化
    gulp.watch('./src/*.js', function(){
        gulp.run('lint','scripts');
    });
});