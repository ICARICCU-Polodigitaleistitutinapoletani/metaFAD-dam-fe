'use strict';

var path = require('path');
var gulp = require('gulp');
var conf = require('./conf');
var rename = require("gulp-rename");
var replace = require("gulp-replace");
var clean = require('gulp-clean');

var $ = require('gulp-load-plugins')({
  pattern: ['gulp-*', 'main-bower-files', 'uglify-save-license', 'del']
});

gulp.task('partials', function () {
  return gulp.src([
    path.join(conf.paths.src, '/app/**/*.html'),
    path.join(conf.paths.tmp, '/serve/app/**/*.html')
  ])
    .pipe($.minifyHtml({
      empty: true,
      spare: true,
      quotes: true
    }))
    .pipe($.angularTemplatecache('templateCacheHtml.js', {
      module: 'damApp',
      root: 'app'
    }))
    .pipe(gulp.dest(conf.paths.tmp + '/partials/'));
});

gulp.task('html', ['inject', 'partials'], function () {
  var partialsInjectFile = gulp.src(path.join(conf.paths.tmp, '/partials/templateCacheHtml.js'), { read: false });
  var partialsInjectOptions = {
    starttag: '<!-- inject:partials -->',
    ignorePath: path.join(conf.paths.tmp, '/partials'),
    addRootSlash: false
  };

  var htmlFilter = $.filter('*.html', { restore: true });
  var jsFilter = $.filter('**/*.js', { restore: true });
  var cssFilter = $.filter('**/*.css', { restore: true });
  var assets;

  return gulp.src(path.join(conf.paths.tmp, '/serve/*.html'))
    .pipe($.inject(partialsInjectFile, partialsInjectOptions))
    .pipe(assets = $.useref.assets())
    .pipe($.rev())
    .pipe(jsFilter)
    .pipe($.sourcemaps.init())
    .pipe($.ngAnnotate())
    .pipe($.uglify({ preserveComments: $.uglifySaveLicense })).on('error', conf.errorHandler('Uglify'))
    //.pipe($.sourcemaps.write('maps'))
    .pipe(jsFilter.restore)
    .pipe(cssFilter)
    .pipe($.sourcemaps.init())
    .pipe($.replace('../../bower_components/bootstrap/fonts/', '../fonts/'))
    .pipe($.minifyCss({ processImport: false }))
    //.pipe($.sourcemaps.write('maps'))
    .pipe(cssFilter.restore)
    .pipe(assets.restore())
    .pipe($.useref())
    .pipe($.revReplace())
    .pipe(htmlFilter)
    .pipe($.minifyHtml({
      empty: true,
      spare: true,
      quotes: true,
      conditionals: true
    }))
    .pipe(htmlFilter.restore)
    .pipe(gulp.dest(path.join(conf.paths.dist, '/')))
    .pipe($.size({ title: path.join(conf.paths.dist, '/'), showFiles: true }));
  });

// Only applies for fonts from bower dependencies
// Custom fonts are handled by the "other" task
gulp.task('fonts', function () {
  return gulp.src($.mainBowerFiles())
    .pipe($.filter('**/*.{eot,svg,ttf,woff,woff2}'))
    .pipe($.flatten())
    .pipe(gulp.dest(path.join(conf.paths.dist, '/fonts/')));
});

gulp.task('other', function () {
  var fileFilter = $.filter(function (file) {
    return file.stat.isFile();
  });

  return gulp.src([
    path.join(conf.paths.src, '/**/*'),
    path.join('!' + conf.paths.src, '/**/*.{html,css,js,less}')
  ])
    .pipe(fileFilter)
    .pipe(gulp.dest(path.join(conf.paths.dist, '/')));
});

gulp.task('clean', function () {
  return $.del([path.join(conf.paths.dist, '/'), path.join(conf.paths.tmp, '/')]);
});

gulp.task('copy-htaccess', function () {
  var config_path = process.argv.indexOf("--configpath") !== -1 ? process.argv[process.argv.indexOf("--configpath") + 1] : "";
  return gulp.src('src/js/.htaccess')
    .pipe(replace(/##CONFIG_PATH##/, config_path))
    .pipe(gulp.dest('dist/js'));
});

gulp.task('meta_js', function () {
    var jsFiles = path.join(conf.paths.src, '/js/*.js');
    return gulp.src([
          jsFiles, 
          '!'+ path.join(conf.paths.src, '/js/config_local.js')
      ]).pipe(gulp.dest(path.join(conf.paths.dist, '/js/')));
});

gulp.task('meta_btn', function () {
    var scrollbarBtn = path.join(conf.paths.src, '/../bower_components/malihu-custom-scrollbar-plugin/mCSB_buttons.png');
    return gulp.src(scrollbarBtn)
        .pipe(gulp.dest(path.join(conf.paths.dist, '/styles/')));
});

gulp.task('meta_lightgray', function () {
    var lightgrayFld = path.join(conf.paths.src, '/../bower_components/tinymce/skins/lightgray/**/*');
    return gulp.src(lightgrayFld)
        .pipe(gulp.dest(path.join(conf.paths.dist, '/scripts/skins/lightgray/')));
});

gulp.task('pdfjs_viewer', function(){
    var pdfjsViewer = path.join(conf.paths.src, '/../bower_components/pdfjs-viewer/**/*');
    return gulp.src([
          pdfjsViewer,
          '!' + path.join(conf.paths.src, '/../bower_components/pdfjs-viewer/web/*.pdf')
      ]).pipe(gulp.dest(path.join(conf.paths.dist, '/pdfjs-viewer/')));
});

gulp.task('meta_config', function () {
    var timestamp = new Date().getTime();
    var configFile = path.join(conf.paths.dist, '/js/config.js');
    var indexFile = path.join(conf.paths.dist, '/index.html');
    gulp.src(configFile)
        .pipe(rename("config-"+timestamp+".js"))
        .pipe(gulp.dest(path.join(conf.paths.dist, '/js/')));
    return gulp.src(indexFile)
        .pipe(replace("config.js","config-"+timestamp+".js"))
        .pipe(gulp.dest(conf.paths.dist));

});

gulp.task('dropzone-images', function () {
    var lightgrayFld = path.join(conf.paths.src, '/../bower_components/dropzone/downloads/images/**/*');
    return gulp.src(lightgrayFld)
        .pipe(gulp.dest(path.join(conf.paths.dist, '/images/')));
});

gulp.task('clean-js', function () {
    return gulp.src('dist/js/*.*')
        .pipe(clean({force:true}));
});

gulp.task('build', ['clean-js', 'html', 'fonts', 'meta_js', 'meta_btn', 'meta_lightgray', 'pdfjs_viewer', 'dropzone-images', 'other', 'copy-htaccess'], function() {
  return $.del([path.join(conf.paths.dist, '/app')]);
});
