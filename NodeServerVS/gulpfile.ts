/// <binding BeforeBuild='transfer' />
'use strict';

var fs = require('fs');
var gulp = require('gulp');
var GulpSSH = require('gulp-ssh');

var config = {
    host: '192.168.0.17',
    port: 22,
    username: 'pi',
    privateKey: fs.readFileSync('c:/dev/NodeServerVS/NodeServerVS/id_rsa')
};

var gulpSSH = new GulpSSH({
    ignoreErrors: false,
    sshConfig: config
});

gulp.task('transfer', function () {
    return gulp
        .src(['./**/*.js', '!**/node_modules/**', "!./**/*Copy*", "!./**/*gulp*"])
        .pipe(gulpSSH.dest('/home/pi/Documents/projects/pi3/pool-controller/'));
});