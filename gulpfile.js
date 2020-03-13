/* Base Module */
const gulp = require("gulp");

/* Convert PUG to HTML */
const pug = require("gulp-pug");

/* Changed - Only minify images that changed */
const changed = require("gulp-changed");

/* Imagemin - Used to optimize Images for websites */
const imagemin = require("gulp-imagemin");

/* SASS - Used for converting SASS to CSS */
const sass = require("gulp-sass");

/* CSSO - Used to minify CSS */
const minifyCSS = require("gulp-csso");

/* Sourcemaps - Used to generate sourcemaps*/
const sourcemaps = require("gulp-sourcemaps");

/* PostCSS - Used to use certain modules on the CSS after converting from SASS to CSS */
const postcss = require("gulp-postcss");

/* Autoprefixer - Used with PostCSS to apply vendor-prefixes to CSS */
const autoprefixer = require("autoprefixer");

/**
 * 1. Set the source
 * 2. Initialize sourcemaps
 * 3. Convert to CSS
 * 4. Add vendor-prefixes
 * 5. Minify the CSS
 * 6. Write the sourcemap
 * 7. Write the file
 */
function css() {
  var plugins = [autoprefixer()];
  return gulp
    .src(["./webpage/src/scss/main.scss"])
    .pipe(sourcemaps.init())
    .pipe(sass())
    .pipe(postcss(plugins))
    .pipe(minifyCSS())
    .pipe(sourcemaps.write("../maps"))
    .pipe(gulp.dest("./webpage/dist/css"));
}

function html() {
  return gulp
    .src("./webpage/src/templates/pages/**/*.pug")
    .pipe(pug())
    .pipe(gulp.dest("./webpage/dist/html"));
}

/**
 * 1. Set a source and destination path
 * 2. Optimize the images
 * 3. Save the images to the destination folder
 */
function optimizeImages() {
  return gulp
    .src(["./webpage/src/img/**/*.+(png|jpg|gif)"], {
      base: "./webpage/src/img/"
    })
    .pipe(changed("./webpage/dist/img"))
    .pipe(imagemin())
    .pipe(gulp.dest("./webpage/dist/img"));
}

/**
 * 1. Setup watchers
 */
function watch() {
  gulp.watch("webpage/src/img/**/*.+(png|jpg|gif)", optimizeImages);
  gulp.watch("webpage/src/scss/**/*.scss", css);
  gulp.watch("webpage/src/templates/**/*.pug", html);
}

/**
 * This export will start the process of watching the
 * files and running the coresponding function
 */
const build = gulp.series(gulp.parallel(css, optimizeImages, html), watch);
exports.default = build;
