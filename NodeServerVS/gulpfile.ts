/// <binding BeforeBuild='transfer' />
'use strict';

var fs = require('fs');
var gulp = require('gulp');
var GulpSSH = require('gulp-ssh');

var config = {
    host: '192.168.0.17',
    port: 22,
    username: 'pi',
    privateKey: fs.readFileSync("e:/Jay's Stuff/dev/PoolServerTS/NodeServerVS/id_rsa")
};

var gulpSSH = new GulpSSH({
    ignoreErrors: false,
    sshConfig: config
});

gulp.task('transfer', function () {
    return gulp
        .src(['./**/*.js', '!**/node_modules/**', "!./**/*Copy*", "!./**/*gulp*"])
        .pipe(gulpSSH.dest('/home/pi/projects/staging/PoolServer/NodeServerVS/'));
});