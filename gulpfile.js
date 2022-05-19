const gulp = require('gulp');
const concat = require('gulp-concat');

function task() {
    return gulp.src([
        './Matrix.js',
        './Poly.js',
        './Primitive.js',
        './MultiPoly.js',
        './Camera.js',
        './World.js',
        './DrawObject.js',
        './Drawer.js',
        './index.js'
    ])
        .pipe(concat('index.min.js'))
        .pipe(gulp.dest('./dist'));
}

exports.task = task;