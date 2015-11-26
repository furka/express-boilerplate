module.exports = function(grunt) {
  'use strict';

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    requirejs: {
      app: {
        options: {
          baseUrl: 'src',
          mainConfigFile: 'src/require-config.js',
          optimize: 'none',

          deps: ['main'],
          name: 'app',
          insertRequire: ['main'],
          out: 'public/javascripts/app.js',
          create: true,
          wrap: true
        }
      }
    },

    uglify: {
      requirejs: {
        options: {
          //beautify: true,
        },
        files: {
          'public/javascripts/app.min.js': [
            'node_modules/requirejs/require.js',
            'public/javascripts/app.js'
          ]
        }
      }
    },

    copy: {
      main: {
        files: [
          {
            expand: true,
            cwd: 'src/fonts',
            src: '**/*',
            dest: 'public/fonts'
          },
          {
            expand: true,
            cwd: 'src/furniture',
            src: '**/*',
            dest: 'public/furniture'
          }
        ]
      }
    },

    less: {
      development: {
        options: {
          compress: true
        },
        files:  {
          'public/stylesheets/main.css': 'src/stylesheets/main.less'
        }
      }
    },

    version: {
      defaults: {
        src: ['package.json']
      }
    },

    watch: {
      src: {
        files: [
          'src/**/*'
        ],
        tasks: ['requirejs', 'uglify'],
        options: {
          interrupt: true,
        }
      }
    }
  });

  // 3. Where we tell Grunt we plan to use this plug-in.
  grunt.loadNpmTasks('grunt-contrib-requirejs');
  grunt.loadNpmTasks('grunt-contrib-less');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-version');


  // 4. Where we tell Grunt what to do when we type "grunt" into the terminal.
  grunt.registerTask('default', ['requirejs', 'uglify', 'less', 'copy']);
  grunt.registerTask('build', ['default']);
};