# gulp-react-typescript-boilerplate
Boilerplate for Gulp + TypeScript + React + Express + Livereload. Basically it's based on this [repo](https://github.com/rico345100/gulp-react-boilerplate).

## Features
- Express
- Live reload
- SASS compiling
- React
- JSX(TSX actually)
- TypeScript
- Production builds(HTML/CSS/JS minify)


## To Start
Install dependencies first.
```bash
$ npm install
```

Note that you must installed gulp globally if you didn't.
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

1. Build HTML/SCSS/TS
2. Start Express server and initiate browser-sync
3. Watch all changes and refresh or inject(scss as css only) your client resources.

### gulp serve
Start server with Express, also initiate Browser-Sync with Express server.
Express will uses port number in config.json(default 3000), and Browser-Sync will uses proxyPort number in config.json(default 4000).
After you change your server side code, nodemon will restarts Express server automatically.
If you change your clients side resources, browser-sync will reload or inject client resources automatically.

### gulp build
Build all resources.

### gulp build::html
Build HTML resources. In production build, it uses gulp-htmlmin to minify HTML.

### gulp build::scss
Build SCSS resources. In production build, it uses gulp-cssnano to minify CSS.

### gulp build::script
Build TS resources. It will create two scripts, vendor.js and bundle.js.
vendor.js contains common scripts and bundle.js contains actual your code.


## Production Build
To set your application production mode, simply update "environment" inside of config.json to "production".
Also don't run your server with "gulp serve" in production state!


## License
MIT. Free to use. Also this project will gonna update continuously.