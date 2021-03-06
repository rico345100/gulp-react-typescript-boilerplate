"use strict";
const config = require('./config.json');

const gulp = require('gulp');
const gutil = require('gulp-util');
const merge = require('merge2');
const streamify = require('gulp-streamify');
const runSequence = require('run-sequence');

const persistify = require('persistify');
const tsify = require('tsify');
const uglify = require('gulp-uglify');
const scssify = require('scssify');

const source = require('vinyl-source-stream');
const nodemon = require('gulp-nodemon');

const sass = require('gulp-sass');
const htmlmin = require('gulp-htmlmin');
const cssnano = require('gulp-cssnano');

const yargs = require('yargs');
const argv = yargs.argv;

const browserSync = require('browser-sync')

const vendors = [
	'react',
	'react-dom'
];

const isProduction = config.environment === 'production';

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

	if(!argv.once) {
		gulp.watch(`${SRC_DIR}/html/**`, () => {
			gutil.log('Detect HTML changes. Rebuilding...');
			return run();
		});
	}

	return run();
}

function buildScss() {
	let buildStartTime = null;
	let buildEndTime = null;

	function run() {
		buildStartTime = new Date();

		let stream = gulp.src(`${SRC_DIR}/scss/app.scss`)
		.on('error', swallowError)
		.on('end', () => {
			buildEndTime = new Date();
			gutil.log(`Building SCSS done. (Time elapsed ${buildEndTime - buildStartTime}ms.)`);
		})
		.pipe(
			sass()
			.on('error', sass.logError)
		);

		if(isProduction) {
			stream.pipe(cssnano());
		}

		return stream.pipe(gulp.dest(`${BUILD_DIR}/css`))
		.pipe(browserSync.stream());
	} 

	if(!argv.once) {
		gulp.watch(`${SRC_DIR}/scss/**`, () => {
			gutil.log('Detect SCSS changes. Rebuilding...');
			return run();
		});
	}

	return run();
}

function buildVendor() {
	const b = persistify({ debug: false }, {
 		watch: !!!argv.once
 	});

	vendors.forEach(vendor => {
		b.require(vendor);
	});

	let stream = b.bundle()
	.on('error', swallowError)
	.on('end', () => {
		gutil.log(`Building JS:vendor done.`);
		browserSync.reload();
	})
	.pipe(source('vendor.js'));

	if(isProduction) {
		stream.pipe(streamify(uglify()));
	}

	return stream.pipe(gulp.dest(`${BUILD_DIR}/js`));
}

function buildScript() {
	const opts = Object.assign({ debug: !isProduction });
	const b = persistify(opts, {
		watch: !!!argv.once
	})
	.add('./src/ts/index.tsx')
	.on('update', bundle)
	.on('log', gutil.log)
	.external(vendors)
	.plugin(tsify)
	.transform(scssify, {
		autoInject: true,
		sass: {
			"includePaths": [`${SRC_DIR}/scss`]
		}
	});

	function bundle() {
		let stream = b.bundle()
		.on('error', swallowError)
		.on('end', () => {
			gutil.log(`Building JS:bundle done.`);
			browserSync.reload();
		})
		.pipe(source('bundle.js'));

		if(isProduction) {
			stream.pipe(streamify(uglify()));
		}

		return stream.pipe(gulp.dest(`${BUILD_DIR}/js`));
	}
	
	return bundle();
}

function serve() {
	let serverStarted = false;

	nodemon({ 
		script: 'server.js',
		ignore: ['src/**', 'build/**']
	})
	.on('start', () => {
		if(!serverStarted) {
			serverStarted = true;

			browserSync.init(null, {
				proxy: `localhost:${config.port || 3000}`,
				port: config.proxyPort || 4000
			});

			gulp.watch(`${SRC_DIR}/html/**`, buildHtml);
			gulp.watch(`${SRC_DIR}/scss/**`, buildScss);

			gulp.watch(`${BUILD_DIR}/html/index.html`).on('change', browserSync.reload);

			// return empty stream
			return gutil.noop();	
		}
	});
}

gulp.task('default', () => {
	runSequence('build', 'serve');
});

gulp.task('build', () => {
	return merge([
		buildHtml(),
		buildScss(),
		buildScript(),
		buildVendor()
	]);
});

gulp.task('build::html', () => {
	return buildHtml();
});

gulp.task('build::scss', () => {
	return buildScss();
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