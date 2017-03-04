# gulp-react-typescript-boilerplate
Boilerplate for Gulp + TypeScript + React + livereload. Basically it's based on this [repo](https://github.com/rico345100/gulp-react-boilerplate).

## Features
- Live reload
- React
- JSX(TSX actually)
- TypeScript
- Production builds(HTML/CSS/JS minify)


## To Start
This project will provides as minimal as possible, so if you want to add some more functionalities, 
Using sass or TypeScript, you must do it yourself.

Basic usage is:

```bash
$ npm install
```

To install all dependencies first. Note that you must installed gulp globally if you didn't.
```bash
$ npm install -g gulp
```

Now run the default task, which build all resources and automatically run browser-sync to serve your resources.
```bash
$ gulp
```


## Tasks
### gulp default
By default, will proceed these steps:

1. Build HTML/CSS/JS(From TS)
2. Initiate browser-sync and serve resources
3. Watch all changes and refresh or inject(css only)

### gulp serve
Start browser-sync and serve resources, with watching all changes.

### gulp build
Build all resources.

### gulp build::html
Build HTML resources. In production build, it uses gulp-htmlmin to minify HTML.

### gulp build::css
Build CSS resources. In production build, it uses gulp-cssnano to minify CSS.

### gulp build::script
Build TS resources. It will create two scripts, vendor.js and bundle.js.
vendor.js contains common scripts and bundle.js contains actual your code.


## Production Build
To set your application production mode, simply add --p or --prod or --production when using gulp:

```bash
// Run everything with Production state
$ gulp --p

// Build JS only with Production state
$ gulp build::script --p
```


## License
MIT. Free to use. Also this project will gonna update continuously.