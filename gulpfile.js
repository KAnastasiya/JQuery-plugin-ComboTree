const gulp = require('gulp');
const browserSync = require('browser-sync');
const gulpsync = require('gulp-sync')(gulp);
const webpack = require('webpack-stream');
const named = require('vinyl-named');
const plugins = require('gulp-load-plugins')();

const publicDir = './public';


gulp.task('browserSync', () => {
  browserSync({
    server: {
      baseDir: publicDir,
      index: 'index.html'
    },
    notify: false
  });
});


gulp.task('pug', () => {
  gulp
  .src(['./src/*.pug'])
  .pipe(plugins.plumber({ errorHandler: plugins.notify.onError() }))
  .pipe(plugins.pug())
  .pipe(gulp.dest(publicDir));
});


gulp.task('styl', () => {
  gulp
    .src('./src/*.styl')
    .pipe(plugins.plumber({ errorHandler: plugins.notify.onError() }))
    .pipe(plugins.stylus({ compress: true }))
    .pipe(plugins.autoprefixer([
      'last 3 Chrome versions',
      'last 3 Firefox versions',
      'last 3 Opera versions',
      'last 3 Safari versions',
      'Explorer >= 9',
      'last 3 Edge versions',
    ], { cascade: false }
    ))
    .pipe(plugins.rename({suffix: '.min'}))
    .pipe(gulp.dest(publicDir));
});


gulp.task('js', () => {
  gulp
  .src(['./src/jquery.combotree.js'])
  .pipe(plugins.plumber({
    errorHandler: plugins.notify.onError(err => ({
      title: 'Webpack',
      message: err.message
    }))
  }))
  .pipe(named())
  .pipe(webpack(require('./webpack.config.js')))
  .pipe(plugins.rename({suffix: '.min'}))
  .pipe(gulp.dest(publicDir));
});


gulp.task('default', gulpsync.sync(['pug', 'styl', 'browserSync']), () => {
  gulp.watch(['./src/*.pug'], gulpsync.sync(['pug', browserSync.reload]));
  gulp.watch('./src/*.styl', gulpsync.sync(['styl', browserSync.reload]));
  gulp.watch(['./src/*.js'], gulpsync.sync(['js', browserSync.reload]));
});
