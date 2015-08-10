
'use strict';

var babel = require('gulp-babel'),
  gulp = require('gulp');

gulp.task('babel', function () {
  return gulp.src('src/*.js')
    .pipe(babel())
    .pipe(gulp.dest('dist/'));
});

gulp.task('watch', function () {
  gulp.watch('src/*.js', ['babel']);
});
