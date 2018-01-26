var gulp 					= require('gulp'),							//подключаем gulp
		sass 					= require('gulp-sass'), 				//подключение Sass пакета
		browserSync 	= require('browser-sync'), 			//подключение Browser Sync
		concat 				= require('gulp-concat'),				//подключение gulp-concat для обединения файлов
		uglify				= require('gulp-uglifyjs'),			//подключение gulp-uglifyjs для сжатия JS файлов
		cssnano				= require('gulp-cssnano'),			//подключение пакета минификации css
		rename				= require('gulp-rename'),				//библиотека для переименования файлов
		del 					=	require('del'),								//библиотека для удаления файлов и папок
		imagemin 			= require('gulp-imagemin'),			//библиотека для работы с изображениями
		pngquant 			= require('imagemin-pngquant'),	//библиотека для работы с png
		cache 				= require('gulp-cache'),				//подключаем библиотеку для кэширования
		autoprefixer	= require('gulp-autoprefixer');	//библиотека для автоматич. доб. префикса

//BASE STRUCTURE
gulp.task('mytask2',function(){
	return gulp.src('source-files')// 1.выборка данных для работы
	.pipe(plugin())								 //подключение плагинов 2.обработка
	.pipe(gulp.dest('folder'))	  // dest - destination выгрузка в ... 3.выгрузка рез. в указ. место
});
//ВЫБОРКА ФАЙЛА
//=>	return gulp.src('app/sass/*.sass') //выбирает все файлы с расширением .sass
//=>	app/sass/**/*.sass //выбирает все файлы с расширением .sass из дирректории sass и всех поддиректорий sass
//=>	'!app/sass/main.sass' // исключение файла из выборки
//=>	['!app/sass/main.sass','app/sass/**/*.sass'] // се файлы с расширением .sass кроме main.sass
//=>	'app/sass/*.+(sccs|sass)' выбирает все .sccs .sass из sass folder
//=>	'app/sass/**/*.+(sccs|sass)' выбирает все .sccs .sass из sass директории и всех ее поддиректориях

//!!!Файлы с ниж подч  _part.sass, не участвуют в компиляции как отдельные файлы, только подключаются в другие файлы через import
//=>main.sass
//@import(_part.sass)

//ПОДКЛЮЧЕНИЕ SAS
gulp.task('sass',function(){
	return gulp.src('app/sass/**/*.sass')		//выборка всех sass files
	.pipe(sass())														//преобразуем sass в css с помощью sass
	.pipe(autoprefixer(['last 15 version', '> 1%','ie 8','ie 7'],{cascade:true}))//добавление префиксов
	.pipe(gulp.dest('app/css'))							//выгрузка в папку app/css уже скомп. файлов
	.pipe(browserSync.reload({stream:true}))//обновляем css на странице при измен. reload-подключение инжекта, stream:true - для инжекта непосредственно
});

//Подключение браузера sync, подключение сервера:
gulp.task('browser-sync', function(){
	browserSync({												//Выполняем browser sync
		server: {													//определяем параметры сервера
			baseDir:'app'										//директория для сервера - app
		},
		notify: false 										//отключение уведомлений от браузера
		})
});

//подключение JS файлов и библиотек, concat и uglifyjs// обьединение и минификация js файлов
gulp.task('scripts',function(){
	gulp.src([															//выборка всех необходимых библиотек
		'app/libs/jquery/dist/jquery.min.js',
		'app/libs/magnific-popup/dist/jquery.magnific-popup.min.js'
		])
	.pipe(concat('libs.min.js'))						// собираем их в кучу в новом файле libs.min.js
	.pipe(uglify())													//сжимаем js файл
	.pipe(gulp.dest('app/js'))							//выгружаем в папку app/js
})

//Таск для минификации всех css библиотек
gulp.task('css-libs',['sass'],function(){
	return gulp.src('app/css/libs.css')	//выбираем файл для минификации
	.pipe(cssnano())										//сжимаем
	.pipe(rename({suffix:'.min'}))			//добавляем суффикс .min
	.pipe(gulp.dest('app/css'))					//выгрузка в app/css
})

//НАБЛЮДЕНИЕ ЗА ИЗМЕНЕНИЯМИ
//watch - стандартная ф-ия отслеживания/ 1Й эл.что отслеживать / 2Й эл. какие ф-ции(в нашем случае 'sass')
//!!! ВАЖНО в task =>['',''] указываются компоненты, которые выполняются перед основной задачей 'watch'
//т.е. в нашем случае сначала подлючается browser-sync затем css-libs,scripts и только потом watch.
gulp.task('watch',['browser-sync','css-libs','scripts'], function(){
	gulp.watch('app/sass/**/*.sass',['sass']);			//наблюдение за sass файлами в папке sass
	gulp.watch('app/*.html',browserSync.reload);		//наблюдение за html файлами в корне проекта
	gulp.watch('app/js/**/*.js',browserSync.reload);//наблюдение за js в папке js
});
//в консоли:
//Access URLs:
//Local: http://localhost:3000 //наш хост
//External: http://176.241.137.23:3000 //хост для использ моб.устройств в сети wi-fi
//UI: http://localhost:3001 //settings sync(nothing important)
//UI External: http://176.241.137.23:3001

//Предварительная очистка папки dist от старыхфайлов. Используем пакет del
//	=>npm i del --save-dev
gulp.task('clean',function(){
	return del.sync('dist/'); //синхронзируется и удаляется папка dist
});

//Оптимизация работы с картинками Используем пакет gulp-imagemin imagemin-pngquant
gulp.task('img',function(){
	return gulp.src('app/img/**/*')						//выборка всех изображений из app
	.pipe(cache(imagemin({										//Сжимаем изображение с добавляем кэширования cache
		// .pipe(imagemin({ 										//Сжимаем изображения без кеширования
		interlaced: true,
		progressive: true,
		svgoPlugins: [{ removeViewBox: false}],
		use:[pngquant()]
	})))
	.pipe(gulp.dest('dist/img'))							//выгрузка в папку продакшена
})
//Добавим кэш для картинок.
//	=> npm i gulp-cache --save-dev

//СБОРКА ПРОЕКТА
gulp.task('build',['clean','img','sass','scripts'],function(){	
	var buildCss = gulp.src([			//переносим библиотеки в папки продакшн
		'app/css/main.css',
		'app/css/libs.min.css'
		])
	.pipe(gulp.dest('dist/css'));	//перенос main.css libs.css из app в dist продакшн
	
	var buildFonts = gulp.src('app/fonts/**/*')
	.pipe(gulp.dest('dist/fonts')); // переносим все шрифты в папку fonts продакшн

	var buildJs = gulp.src('app/js/**/*')
	.pipe(gulp.dest('dist/js'));		// переносим все js files в папку js продакшн

	var buildHtml = gulp.src('app/*.html')
	.pipe(gulp.dest('dist'));				// переносим все html files в папку dist продакшн
});

//чистка кэша
gulp.task('clear',function(){
	return cache.clearAll();
});

gulp.task('default',['watch']);