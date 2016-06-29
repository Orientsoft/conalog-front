var gulp = require('gulp'),
  gUtil = require('gulp-util'),
  babel = require('gulp-babel'),
  source = require('vinyl-source-stream'),
  buffer = require('vinyl-buffer'),
  sourcemaps = require('gulp-sourcemaps'),
  rename = require('gulp-rename'),
  browserify = require('browserify'),
  babelify = require('babelify'),
  watchify = require('watchify'),
  path = require('path'),
  fs = require('fs-extra'),
  exec = require('child_process').exec;

function printErrorStack(err) {
  if (err)
    console.log(err.stack || err);
};

gulp.task('watch', function() {
  var bundler = browserify({
    entries: ['./reflux-app/entry.js'],
    transform: [babelify],
    debug: true,
    cache: {},
    packageCache: {}
  });

  gUtil.log('Watching: Compiling ./reflux-app/entry.js to ./public/js/app/');

  var watcher = watchify(bundler);

  function build() {
    gUtil.log('Building');
    watcher.bundle()
      .on('error', printErrorStack)
      .pipe(source('./reflux-app/entry.js'))
      .pipe(buffer())
      .pipe(sourcemaps.init({loadMaps: true}))
      .pipe(rename({dirname: ''}))
      .pipe(sourcemaps.write('./'))
      .pipe(gulp.dest('./public/js/app/'));
  }

  watcher.on('update', build)
    .on('time', (time) => {
      gUtil.log('Building time: ', time, 'ms');
    });

  build();
});

gulp.task('compile', function() {
  var bundler = browserify({
    entries: ['./reflux-app/entry.js'],
    transform: [babelify],
    debug: false,
    cache: {},
    packageCache: {}
  });

  gUtil.log('Compiling ./reflux-app/entry.js to ./public/js/app/');

  function build() {
    bundler.bundle()
      .on('error', printErrorStack)
      .pipe(source('./reflux-app/entry.js'))
      .pipe(rename({dirname: ''}))
      .pipe(gulp.dest('./public/js/app/'));
  }

  build();
})

gulp.task('install', function() {
  /*
   gulp.src(['./node_modules/bootstrap/dist/**'])
     .pipe(gulp.dest('./public/vendor/bootstrap/'))
  gulp.src(['./node_modules/jquery/dist/**'])
    .pipe(gulp.dest('./public/vendor/jquery/'))
  gulp.src(['./config/default.json'])
    .pipe(rename('config.json'))
    .pipe(gulp.dest('./config/'))
  */

  console.log(process.cwd() + '/node_modules/conalog-node-red')

  exec('cnpm i', {cwd: process.cwd() + '/node_modules/conalog-node-red'}, (err, stdout, stderr) => {
      if (err === null) {
        console.log('conalog-node-red build: ', stdout, stderr)
        exec('grunt build', {cwd: process.cwd() + '/node_modules/conalog-node-red'}, (err, stdout, stderr) => {
            console.log('conalog-node-red build: ', stdout, stderr)
            if (err !== null)
              console.log('conalog-node-red build error: ', err)
          });
      }
      else {
        console.log('conalog-node-red build error: ', err)
      }
    })

  gulp.src(['./node_modules/pegjs/lib/**'])
    .pipe(gulp.dest('./public/vendor/pegjs/'))

  gulp.src(['./node_modules/antd/dist/**'])
    .pipe(gulp.dest('./public/vendor/antd/'))
});
