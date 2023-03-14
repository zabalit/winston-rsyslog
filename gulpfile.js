const gulp = require('gulp');
const insert  = require('gulp-insert');
const fs = require('fs');
const glob = require('glob');


const RUTA_SOURCE = './src/';
const FICHERO_LIB = 'index.ts';

gulp.task('gen-lib', () => {
    return new Promise(function(resolve, reject) {
        fs.writeFile(RUTA_SOURCE + FICHERO_LIB, '', function() {
            let content = '';
            glob(RUTA_SOURCE + '**/*.ts', {ignore: [RUTA_SOURCE + FICHERO_LIB]}, (err, files) => {
                files.forEach((file) => {
                    var filename = file.split('.').slice(0, -1).join('.');
                    filename = filename.replace(RUTA_SOURCE, './');
                    if (filename !== 'index') {
                        content += 'export * from \'' + filename + '\';\n';
                    }
                });
                resolve(gulp.src(RUTA_SOURCE + FICHERO_LIB)
                    .pipe(insert.append(content))
                    .pipe(gulp.dest(RUTA_SOURCE))
                );
            });
        });
    });

});
