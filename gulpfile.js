var gulp = require('gulp'),
 nodemon = require('gulp-nodemon')

gulp.task('default', function(){
    nodemon({
        script: 'app.js',
        ext: 'js',
        env: { PORT: 8088 },
        ignore: ['./node_modules/**']
    })
    .on('restart', function(){
        console.log('Restarted and Gulp Running at port: 8088');
    })
})