// include gulp
var gulp = require('gulp');

// include plugins
var jshint = require('gulp-jshint');
var changed = require('gulp-changed');
var sourcemaps = require('gulp-sourcemaps'),
    babel = require('gulp-babel'),
    concat = require('gulp-concat'),
    stripDebug = require('gulp-strip-debug'),
    uglify = require('gulp-uglify');
var minifyHTML = require('gulp-minify-html');
var autoprefix = require('gulp-autoprefixer'),
    minifyCSS = require('gulp-minify-css');

function swallowError (error) {
    //If you want details of the error in the console
    console.log(error.toString());
    this.emit('end');
}

// JS hint task
gulp.task('jshint', function() {
    return gulp.src('./src/scripts/*.js')
        .pipe(jshint({esnext: true}))
        .on('error', swallowError)
        .pipe(jshint.reporter('default'));
});

// minify new or changed HTML pages
gulp.task('htmlpage', function() {
  var htmlSrc = './src/*.html',
      htmlDst = './build';
 
  return gulp.src(htmlSrc)
    .pipe(changed(htmlDst))
    .pipe(minifyHTML())
    .pipe(gulp.dest(htmlDst));
});

// JS concat, ES6 -> ES5, strip debug, uglify, write sourcemap
gulp.task('scripts', ['jshint'], function() {
    return gulp.src(['src/scripts/lib.js', 'src/scripts/*.js'])
        // .pipe(sourcemaps.init())
        .pipe(babel())
        .on('error', swallowError)
        .pipe(concat('script.js'))
        // .pipe(sourcemaps.write('.'))
        // .pipe(stripDebug())
        // .pipe(uglify())
        .pipe(gulp.dest('./build/scripts/'));
});

// CSS concat, auto-prefix and minify
gulp.task('styles', function() {
  return gulp.src(['./src/styles/*.css'])
    .pipe(concat('styles.css'))
    .pipe(autoprefix('last 2 versions'))
    .pipe(minifyCSS())
    .pipe(gulp.dest('./build/styles/'));
});

gulp.task('default', ['htmlpage', 'scripts', 'styles'], function () {
    // watch for HTML changes
    gulp.watch('./src/*.html', ['htmlpage']);

    // watch for JS changes
    gulp.watch('./src/scripts/*.js', ['scripts']);

    // watch for CSS changes
    gulp.watch('./src/styles/*.css', ['styles']);
});