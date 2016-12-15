# porta frontend starter kit
***

## Set up your environment and install global packages
+ install node.js and npm (include it to system PATH variable)
	- run `npm update -g npm`
	- run `npm install -g bower`
	- run `npm install -g gulp`
+ optianally install livereload browser extension http://livereload.com/extensions/

## Install local project packages
+ npm install

## Start developing
+ gulp dev

## Build project for production
+ gulp prod

## Create new project via composer
+ from your project folder run `composer create-project portabucket/porta_static --repository-url=https://packages.portadesign.cz . version` (see https://packages.portadesign.cz for available versions)`

## The chain
+ js libraries are downloaded via bower into the bower_components with a lot of mess
+ the libraries are cherry-picked with the main bower files gulp task and copied into static/js/lib and staic/scss/lib folders
+ fancybox css is already commited in static/scss/partials as _fancybox.scss because of image path dependencies
+ css is compiled from scss/styles.scss with the sass gulp task into static/css/styles.css (development) or static/css/styles.min.css (production)
+ js libraries and js partials are concatenated and minified with the uglify gulp task into static/js/scripts.js (development) or static/js/scripts.min.js (production)
+ the watch gulp task listens to changes of *.scss files in scss/partials/ and *.js files in static/js/partials/ and *.html files in root folder
