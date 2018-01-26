var gulp 				= require('gulp'),
		sass 				= require('gulp-sass'), // подключение пакета
		browserSync = require('browser-sync'), // подключение браузера из package.json devDependencies
		concat 				= require('gulp-concat'),	//для обединения файлов (сборки)
		uglify				= require('gulp-uglifyjs'),//сжатие JS файлов
		cssnano				= require('gulp-cssnano'),
		rename				= require('gulp-rename'),
		del 					=	require('del'),
		imagemin 			= require('gulp-imagemin'),
		pngquant 			= require('imagemin-pngquant'),
		cache 				= require('gulp-cache'),
		autoprefixer	= require('gulp-autoprefixer');
//FIRST TASK
gulp.task('mytask', function(){
                        console.log('Hello i\'m your task')
});

//BASE STRUCTURE
gulp.task('mytask2',function(){
	return gulp.src('source-files')		// 1.БЕРЕМ ФАЙЛ
	.pipe(plugin())										//подключение плагинов 2.ЧТО-ТО ДЕЛАЕМ С НИМ
	.pipe(gulp.dest('folder'))				// dest - destination выгрузка в ... 3.ВЫВОДИМ РЕЗУЛЬТАТ/ЗАПИСЫВАЕМ В НУЖНОЕ МЕСТО
});

//ПОДКЛЮЧЕНИЕ SAS
//var sass = require('gulp-sass'); // подключение пакета
gulp.task('addsass', function(){
	return gulp.src('app/sass/main.sass')//исходный файл
	.pipe(sass()) 											// подключение sass пакета
	.pipe(gulp.dest('app/css'))//gulp.dest только вместе/ нельзя сделать выгрузку в файл
});
//ВЫБОРКА ФАЙЛА
//шаблон глобал:
//=>	return gulp.src('app/sass/*.sass') //выбирает все файлы с расширением .sass
//=>	app/sass/**/*.sass //выбирает все файлы с расширением .sass из дирректории sass и всех поддиректорий sass
//=>	'!app/sass/main.sass' // исключение файла из выборки
//=>	['!app/sass/main.sass','app/sass/**/*.sass'] // се файлы с расширением .sass кроме main.sass

//=>	'app/sass/*.+(sccs|sass)' выбирает все .sccs .sass из sass folder
//=>	'app/sass/**/*.+(sccs|sass)' выбирает все .sccs .sass из sass директории и всех ее поддиректориях

//!!!Файлы с ниж подч  _part.sass, не участвуют в компиляции как отдельные файлы, только подключаются в другие файлы через импорт
//=>main.sass
//@import(_part.sass)
//body
//	background...

//НАБЛЮДЕНИЕ ЗА ИЗМЕНЕНИЯМИ
gulp.task('watcher',function(){
		gulp.watch('app/sass/**/*.sass',['addsass'])//watch - стандартная ф-ия отслеживания/ 1Й эл.что отслеживать / 2Й эл. какие ф-ции(в нашем случае 'addsass')
});

//Подключение sass и др плагинов для reject JS
gulp.task('sass',function(){
	return gulp.src('app/sass/**/*.sass')//выборка всех sass files
	.pipe(sass())//подключение sass
	.pipe(autoprefixer(['last 15 version', '> 1%','ie 8','ie 7'],{cascade:true}))//добавление автопрефиксов
	.pipe(gulp.dest('app/css'))//выгрузка в папку уже скомп. файлов
	.pipe(browserSync.reload({stream:true}))//reload-подключение инжекта, stream:true - для инжекта непосредственно

});
//Подключение браузера sync, подключение сервера:
gulp.task('browser-sync', function(){
	browserSync({
		server: {
			baseDir:'app'//папка которая будет выступать в качестве сервера
		},
		notify: false //отключение уведомлений от браузера
		})
});
//Перепишем watcher для sync:
//!!! ВАЖНО в task =>['',''] указываются компоненты, которые выполняются перед основной задачей 'watch'
//т.е. в нашем случае сначала подлючается browser-sync затем sass, и только потом watch.
//для запуска достаточно запустить gulp watch
gulp.task('watch',['browser-sync','css-libs','scripts'], function(){
	gulp.watch('app/sass/**/*.sass',['sass']);
	gulp.watch('app/*.html',browserSync.reload);//add html watch
	gulp.watch('app/js/**/*.js',browserSync.reload);//add js watch
});
//командная строка выдает
//Access URLs:
//Local: http://localhost:3000
//External: http://176.241.137.23:3000 для использ моб.устройств в сети wi-fi
//UI: http://localhost:3001 //settings sync(nothing important)
//UI External: http://176.241.137.23:3001

//подключение JS файлов и библиотек, concat и uglifyjs// обьединение и минимизация js файлов подкл. библиотек
gulp.task('scripts',function(){
	gulp.src([
		'app/libs/jquery/dist/jquery.min.js',
		'app/libs/magnific-popup/dist/jquery.magnific-popup.min.js'
		])
	.pipe(concat('libs.min.js'))//libs.min.js => new file, в который происходит сборка всех js files
	.pipe(uglify())//сжатие
	.pipe(gulp.dest('app/js'))//конечная дирректория выгрузки

})

//Таск для сжатия всех библиотек
gulp.task('css-libs',['sass'],function(){
	return gulp.src('app/css/libs.css')//выбираем файл для сжатия
	.pipe(cssnano())										//сжимаем
	.pipe(rename({suffix:'.min'}))		//добавляем суффикс min
	.pipe(gulp.dest('app/css'))					//выгрузка
})

//СБОРКА ПРОЕКТА
gulp.task('build',['clean','img','sass','scripts'],function(){
	var buildCss = gulp.src(['app/css/main.css','app/css/libs.min.css'])
	.pipe(gulp.dest('dist/css'));//перенос main.css libs.css из app в dist
	
	var buildFonts = gulp.src('app/fonts/**/*')
	.pipe(gulp.dest('dist/fonts')); // переносим все шрифты в папку fonts

	var buildJs = gulp.src('app/js/**/*')
	.pipe(gulp.dest('dist/js'));	// переносим все js files в папку js

	var buildHtml = gulp.src('app/*.html')
	.pipe(gulp.dest('dist'));			// переносим все html files в папку dist
});

//Предварительная очистка папки dist от старыхфайлов. Используем пакет del
//	=>npm i del --save-dev
gulp.task('clean',function(){
	return del.sync('dist/'); //синхронзируется и удаляется папка dist
});

//чистка кэша
gulp.task('clear',function(){
	return cache.clearAll();
});


//Оптимизация работы с приложениями. Используем пакет gulp-imagemin imagemin-pngquant
//	=>npm i gulp-imagemin imagemin-pngquant --save-dev
gulp.task('img',function(){
	return gulp.src('app/img/**/*')
	.pipe(cache(imagemin({
		interlaced: true,
		progressive: true,
		svgoPlugins: [{ removeViewBox: false}],
		use:[pngquant()]
	})))
	.pipe(gulp.dest('dist/img'))
})

//Добавим кэш для картинок.
//	=> npm i gulp-cache --save-dev
//добавил cache в img

//Добавим автоматич добавление автопрефиксов
//	=> npm i gulp-autoprefixer --save-dev
