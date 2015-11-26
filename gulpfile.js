/* eslint-env node */

var MINIFY = false; // use minfyCss and uglify?

var gulp = require('gulp');
var bower = require('bower');
var sh = require('shelljs');
var KarmaServer = require('karma').Server;
var $ = require('gulp-load-plugins')();
var wiredep = require('wiredep').stream;
var path = require('path');

var paths = {
  sass: ['scss/includes/*.scss', 'scss/*.scss', 'scss/overrides/*.scss'],
  js: ['js/**/*.js', '!js/**/*.old.js'],
  test: ['./test/*.js']
};


/**
 * helpers
 */

var injectValue = function(value, startTag, endTag) {
   startTag = startTag || '/* inject:value */';
   endTag = endTag || '/* endinject */';
   var regexEscape = function(str) {
        return str.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
   };
   var search = regexEscape(startTag) + '(.|\n|\r)*?' + regexEscape(endTag);
   var replace = startTag + '\n' + JSON.stringify(value, null, '   ') + '\n' + endTag;
   return $.replace( new RegExp(search), replace );
};


/**
 * main tasks
 */
gulp.task('default', ['ruby-sass', 'js']);
gulp.task('watch', ['watch-ruby-sass', 'watch-js']);



/**
 * SASS
 */
gulp.task('sass', function() {
   return gulp.src(paths.sass)
      // .pipe($.cached('sass')) // can't cache here, beacause we need all files to concat for sass
      .pipe($.sourcemaps.init())
      .pipe($.sass())
      .pipe($.concat('ionic.app.css'))
      .pipe($.if(MINIFY, $.minifyCss({ keepSpecialComments: 0 })))
      .pipe($.rename({ extname: '.min.css' }))
      .pipe($.sourcemaps.write('.'))
      .pipe(gulp.dest('./www/css/'));
});

gulp.task('watch-sass', ['sass'], function() {
   gulp.watch(paths.sass, ['sass']);
});

gulp.task('ruby-sass', function() {
   var sassOptions = {
      loadPath: '.', // base path for @import
      sourcemap: true,
      emitCompileError: true,
      trace: true,
      style: 'expanded'
   };
   return $.rubySass(paths.sass, sassOptions)
      .on('error', $.rubySass.logError)
      .pipe($.concat('ionic.app.css'))
      .pipe($.if(MINIFY, $.minifyCss({ keepSpecialComments: 0 })))
      .pipe($.rename({ extname: '.min.css' }))
      .pipe($.sourcemaps.write('.'))
      .pipe(gulp.dest('./www/css/'));
});

gulp.task('watch-ruby-sass', ['ruby-sass'], function() {
   gulp.watch(paths.sass, ['ruby-sass']);
});



/**
 * JS
 */

gulp.task('js', ['inject-bower', 'inject-secrets', 'eslint'], function() {
   var babelOptions = {
      presets: ['es2015']
   };
   return gulp.src(paths.js)
      // .pipe($.cached('js')) // can't cache here, beacause we need all files to concat
      .pipe($.sourcemaps.init())
      .pipe($.babel(babelOptions))
      .pipe($.concat('app.js'))
      .pipe($.if(MINIFY, $.uglify({ mangle: false })))
      .pipe($.rename({ extname: '.min.js' }))
      .pipe($.sourcemaps.write('.'))
      .pipe(gulp.dest('./www/js/'));
});

gulp.task('eslint', function() {
   return gulp.src(paths.js.concat(paths.test))
      .pipe($.cached('eslint')) // only lint changed files
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
 * inject secrets
 */
gulp.task('inject-secrets', function() {
   var secrets = require('./secrets.json');
   return gulp.src('./js/services/secrets.js')
      .pipe( injectValue(secrets) )
      .pipe( gulp.dest('./js/services/') );
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

  gulp.task('deploy-web', ['ruby-sass'], function() {
    gulp.src('./www/**/*').pipe(sftp);
  });
} catch(e) {
  console.log("sftp.config not present. 'gulp deploy-web' not available.");
}



/**
 * karma setup
 */
var karmaOptions = {
   configFile: __dirname + '/karma.conf.js'
};

// base test files (always included)
var karmaTestFiles = [
  // 'www/lib/ionic/js/ionic.bundle.js',
  'www/lib/angular/angular.js',
  'www/lib/angular-mocks/angular-mocks.js',
  'www/lib/firebase/firebase.js',
  'www/lib/angularfire/dist/angularfire.js',
  'www/lib/lodash/lodash.js',
  'www/lib/moment/moment.js',
  'www/lib/SHA-1/sha1.js',
  'www/lib/angular-simple-logger/dist/angular-simple-logger.js',
  'www/lib/angular-google-maps/dist/angular-google-maps.js',
  'js/services/**/*.js',
  'test/includes/**/*.js',
  { pattern: 'test/**/*.+(png|jpg|jpeg|gif)', served:true, included:false } // load all images
];

// figure out which test files to run
// gets all test specified in paths.test by default
// runs a specific file, if the '--file spec-file.js' option is used
function getKarmaTestFiles() {
   var files = karmaTestFiles;
   if (!gulp.env.file) return files.concat(paths.test); // default tests
   return files.concat([path.join('test', gulp.env.file)]); // file specified on command line
}

/**
 * run test suite once
 * use the '--file spec-file.js' option to run a specific test suite
 */
gulp.task('test', function (done) {
   var opts = Object.assign({}, karmaOptions, {
      singleRun: true,
      files: getKarmaTestFiles()
   });
   new KarmaServer(opts, function() {
      done();
   }).start();
});

/**
 * watch for file changes and re-run tests on each change (i.e. test driven development)
 * use the ''--file spec-file.js' option to run a specific test suite
 */
gulp.task('tdd', function (done) {
   var opts = Object.assign({}, karmaOptions, {
      files: getKarmaTestFiles()
   });
   new KarmaServer(opts, function() {
      done();
   }).start();
});
