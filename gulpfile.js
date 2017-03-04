"use strict";
const gulp = require('gulp');
const gutil = require('gulp-util');
const rename = require('gulp-rename');
const merge = require('merge2');
const runSequence = require('run-sequence');

const persistify = require('persistify');
const watchify = require('watchify');
const tsify = require('tsify');
const uglify = require('gulp-uglify');

const source = require('vinyl-source-stream');
const buffer = require('vinyl-buffer');

const htmlmin = require('gulp-htmlmin');
const cssnano = require('gulp-cssnano');

const yargs = require('yargs');
const argv = yargs.argv;

const browserSync = require('browser-sync').create();

const vendors = [
	'react',
	'react-dom'
];

const isProduction = argv.p || argv.prod || argv.production;

if(isProduction) {
	process.env.NODE_ENV = 'production';
}

const SRC_DIR = './src';
const BUILD_DIR = './build';

function swallowError (error) {
	console.log(error.toString());
	this.emit('end');
}

function buildHtml() {
	let buildStartTime = null;
	let buildEndTime = null;

	function run() {
		buildStartTime = new Date();

		let stream = gulp.src(`${SRC_DIR}/html/index.html`)
		.on('error', swallowError)
		.on('end', () => {
			buildEndTime = new Date();
			gutil.log(`Building HTML done. (Time elapsed ${buildEndTime - buildStartTime}ms.)`);
		})

		if(isProduction) {
			stream.pipe(htmlmin({collapseWhitespace: true}));
		}

		return stream.pipe(gulp.dest(`${BUILD_DIR}/html`));
	} 

	gulp.watch(`${SRC_DIR}/html/**`, () => {
		gutil.log('Detect HTML changes. Rebuilding...');
		return run();
	});

	return run();
}

function buildCss() {
	let buildStartTime = null;
	let buildEndTime = null;

	function run() {
		buildStartTime = new Date();

		let stream = gulp.src(`${SRC_DIR}/css/app.css`)
		.on('error', swallowError)
		.on('end', () => {
			buildEndTime = new Date();
			gutil.log(`Building CSS done. (Time elapsed ${buildEndTime - buildStartTime}ms.)`);
		})

		if(isProduction) {
			stream.pipe(cssnano());
		}

		return stream.pipe(gulp.dest(`${BUILD_DIR}/css`))
		.pipe(browserSync.stream());
	} 

	gulp.watch(`${SRC_DIR}/css/**`, () => {
		gutil.log('Detect CSS changes. Rebuilding...');
		return run();
	});

	return run();
}

function buildVendor() {
	const b = persistify({ debug: false });

	vendors.forEach(vendor => {
		b.require(vendor);
	});

	let stream = b.bundle()
	.on('error', swallowError)
	.on('end', () => {
		browserSync.reload();
	})
	.pipe(source('vendor.js'))
	.pipe(buffer())
	.pipe(rename('vendor.js'));

	if(isProduction) {
		stream.pipe(uglify());
	}

	return stream.pipe(gulp.dest(`${BUILD_DIR}/js`));
}

function buildScript() {
	let opts = Object.assign({}, watchify.args, { debug: true });
	let b = watchify(persistify(opts))
	.add('./src/ts/index.tsx')
	.on('update', bundle)
	.on('log', gutil.log)
	.external(vendors)
	.plugin(tsify, {
		jsx: 'react'
	});

	function bundle() {
		let stream =  b.bundle()
		.on('error', swallowError)
		.on('end', () => {
			browserSync.reload();
		})
		.pipe(source('bundle.js'))
		.pipe(buffer())
		.pipe(rename('bundle.js'));

		if(isProduction) {
			stream.pipe(uglify());
		}

		return stream.pipe(gulp.dest(`./${BUILD_DIR}/js`));
	}

	return bundle();
}

function serve() {
	browserSync.init({
		server: {
			baseDir: [
				BUILD_DIR,
				`${BUILD_DIR}/html`,
				`${BUILD_DIR}/css`,
				`${BUILD_DIR}/js`
			]
		}
	});

	gulp.watch(`${SRC_DIR}/html/**`, buildHtml);
	gulp.watch(`${SRC_DIR}/css/**`, buildCss);

	gulp.watch(`${BUILD_DIR}/html/index.html`).on('change', browserSync.reload);

	// return empty stream
	return gutil.noop();	
}

gulp.task('default', () => {
	runSequence('build', 'serve');
});

gulp.task('build', () => {
	return merge([
		buildHtml(),
		buildCss(),
		buildScript(),
		buildVendor()
	]);
});

gulp.task('build::html', () => {
	return buildHtml();
});

gulp.task('build::css', () => {
	return buildCss();
});

gulp.task('build::script', () => {
	return merge([
		buildJs(), 
		buildVendor()
	]);
});

gulp.task('serve', () => {
	return serve();
});