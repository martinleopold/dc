/* eslint-env node */

var gulp = require('gulp');
var bower = require('bower');
var sh = require('shelljs');
var KarmaServer = require('karma').Server;
var $ = require('gulp-load-plugins')();
var wiredep = require('wiredep').stream;

var paths = {
  sass: ['./scss/**/*.scss'],
  js: ['js/**/*.js', '!js/**/*.old.js'],
  test: ['./test/**/*.js']
};



/**
 * main tasks
 */
gulp.task('default', ['sass', 'js', 'inject-bower']);
gulp.task('watch', ['watch-sass', 'watch-js']);



/**
 * SASS
 */
gulp.task('sass', function() {
   return gulp.src('./scss/ionic.app.scss')
      .pipe($.cached('sass'))
      .pipe($.sourcemaps.init())
      .pipe($.sass())
      // .pipe(gulp.dest('./www/css/'))
      .pipe($.minifyCss({
         keepSpecialComments: 0
      }))
      .pipe($.rename({ extname: '.min.css' }))
      .pipe($.sourcemaps.write('.'))
      .pipe(gulp.dest('./www/css/'));
});

gulp.task('watch-sass', ['sass'], function() {
   gulp.watch(paths.sass, ['sass']);
});



/**
 * JS
 */

gulp.task('js', ['eslint'], function() {
   return gulp.src(paths.js)
      // .pipe($.cached('js')) // can't cache here, beacause we need all files to concat
      .pipe($.sourcemaps.init())
      .pipe($.babel())
      .pipe($.concat('app.js'))
      .pipe($.uglify({ mangle: false }))
      .pipe($.rename({ extname: '.min.js' }))
      .pipe($.sourcemaps.write('.'))
      .pipe(gulp.dest('./www/js/'));
});

gulp.task('eslint', function() {
   return gulp.src(paths.js.concat(paths.test))
      .pipe($.cached('eslint'))
      .pipe($.eslint())
      .pipe($.eslint.format());
});

gulp.task('watch-js', ['js'], function() {
   return gulp.watch(paths.js.concat(paths.test), ['js']);
});


/**
 * inject bower dependecies
 */
gulp.task('inject-bower', function() {
   return gulp.src('./www/index.html')
      .pipe(wiredep({
         exclude: "angular/"
      }))
      .pipe(gulp.dest('./www/'));
});



/**
 * install tools (bower, git)
 */
gulp.task('install', ['git-check'], function() {
  return bower.commands.install()
    .on('log', function(data) {
      $.util.log('bower', $.util.colors.cyan(data.id), data.message);
    });
});

gulp.task('git-check', function(done) {
  if (!sh.which('git')) {
    console.log(
      '  ' + $.util.colors.red('Git is not installed.'),
      '\n  Git, the version control system, is required to download Ionic.',
      '\n  Download git here:', $.util.colors.cyan('http://git-scm.com/downloads') + '.',
      '\n  Once git is installed, run \'' + $.util.colors.cyan('gulp install') + '\' again.'
    );
    process.exit(1);
  }
  done();
});



/**
 * deploy app to web via ftp
 * TODO: replace with vinyl-ftp
 */
try {
  var sftpConfig = JSON.parse( require('fs').readFileSync('sftp.config') );
  var sftp = require('gulp-sftp')(sftpConfig);

  gulp.task('deploy-web', ['sass'], function() {
    gulp.src('./www/**/*').pipe(sftp);
  });
} catch(e) {
  console.log("sftp.config not present. 'gulp deploy-web' not available.");
}



/**
 * run test suite once
 */
gulp.task('test', function (done) {
   new KarmaServer({
      configFile: __dirname + '/karma.conf.js',
      singleRun: true
   }, function() {
      done();
   }).start();
});

/**
 * watch for file changes and re-run tests on each change (i.e. test driven development)
 */
gulp.task('tdd', function (done) {
   new KarmaServer({
      configFile: __dirname + '/karma.conf.js'
   }, function() {
      done();
   }).start();
});
