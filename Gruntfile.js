'use strict';

module.exports = function (grunt) {
    require('load-grunt-tasks')(grunt); // Load grunt tasks automatically
    require('time-grunt')(grunt); // Time how long tasks take. Can help when optimizing build times

    var options = {
        dev: grunt.option('dev')
    };

    // Define the configuration for all the tasks
    grunt.initConfig({

        pkg: grunt.file.readJSON("package.json"),
        paths: {
            src: 'src',
            build: 'dist',
            less: 'less',
            css: 'css',
            temp: '.temp',
            test: 'test'
        },

        typescript: {
            options: {
                target: "es3",
                module: "amd",
                sourcemap: false,
                declaration: false,
                comments: false,
                disallowbool: true,
                disallowimportmodule: true
            },
            dev: {
                src: "<%= paths.src %>/**/*.ts",
                options: {
                    sourcemap: true
                }
            },
            test: {
                src: "<%= paths.test %>/**/*.ts"
            },
            declaration: {
                src: "<%= paths.src %>/**/*.ts",
                dest: "<%= paths.temp %>/",
                options: {
                    base_path: '<%= paths.src %>',
                    declaration: true
                }
            },
            dist: {
                src: "<%= paths.src %>/**/*.ts",
                dest: "<%= paths.build %>/",
                options: {
                    base_path: '<%= paths.src %>'
                }
            }
        },

        less: {
            dist: {
                files: [
                    {
                        expand: true,
                        cwd: '<%= paths.less %>/',
                        src: ['*.less', '!variables.less', '!mixins.less'],
                        dest: '<%= paths.css %>/',
                        ext: '.css'
                    }
                ]
            }
        },

        concat: {
            declaration: {
                src: [
                    "<%= paths.src %>/base.d.ts",
                    "<%= paths.temp %>/temp.d.ts"
                ],
                dest: "<%= paths.build %>/koui.d.ts"
            }
        },

        copy: {
            dist: {
                expand: true,
                cwd: "<%= paths.src %>/",
                src: "**/*.html",
                dest: "<%= paths.build %>/"
            }
        },

        tsdamdconcat: {
            options: {
                removeReferences: true,
                basePath: "<%= paths.temp %>",
                prefixPath: "koutils"
            },
            declaration: {
                src: "<%= paths.temp %>/*.d.ts",
                dest: "<%= paths.temp %>/temp.d.ts"
            }
        },

        jshint: {
            options: {
                jshintrc: "jshint.json",
            },

            base: ["*.js"],
            dev: ["<%= paths.src %>/**/*.js"],
            dist: ["<%= paths.build %>/**/*.js"],
            test: ["<%= paths.test %>/**/*.js"]
        },

        tslint: {
            options: {
                configuration: grunt.file.readJSON("tslint.json")
            },
            dev: {
                src: "<%= paths.src %>/**/*.ts"
            },
            test: {
                src: "<%= paths.test %>/**/*.ts"
            }
        },

        connect: {
            test: {
                options: {
                    port: "8080",
                    open: "http://localhost:8080/test/index.html",
                    keepalive: true
                }
            },
            samples: {
                options: {
                    port: "8080",
                    open: "http://localhost:8080/samples/index.html",
                    keepalive: true
                }
            }
        },

        mocha: {
            test: ["<%= paths.test %>/index.html"]
        },

        clean: {
            dev: [
                "<%= paths.src %>/**/*.d.ts",
                "!<%= paths.src %>/base.d.ts",
                "<%= paths.src %>/**/*.js",
                "<%= paths.src %>/**/*.js.map"
            ],
            test: [
                "<%= paths.test %>/**/*.d.ts",
                "<%= paths.test %>/**/*.js",
                "<%= paths.test %>/**/*.js.map"
            ],
            temp: [
                "<%= paths.temp %>/**/*.*"
            ]
        },

        nugetpack: {
            all: {
                src: "nuget/*.nuspec",
                dest: "nuget/",

                options: {
                    version: "<%= pkg.version %>"
                }
            }
        },
        nugetpush: {
            all: {
                src: "nuget/*.<%= pkg.version %>.nupkg"
            }
        },

        watch: {
            tslint: {
                files: ['<%= tslint.dev.src %>'],
                tasks: ['tslint:dev']
            },
            jshint: {
                files: ['<%= jshint.dev.src %>'],
                tasks: ['jshint:dev']
            },
            test: {
                files: ['<%= paths.test %>/*.*'],
                tasks: ['test']
            },
            gruntfile: {
                files: ['Gruntfile.js']
            }
        }
    });

    grunt.registerTask("fixdecla", function () {
        var content = grunt.file.read("dist/koui.d.ts");
        content = content.replace(/\.{2}\/typings/g, "../../../typings");
        grunt.file.write("dist/koui.d.ts", content);
    });

    grunt.registerTask("declaration", ["typescript:declaration", "tsdamdconcat:declaration", "concat:declaration", "clean:temp", "fixdecla"]);
    grunt.registerTask("build", ["tslint:dev", "typescript:dist", "jshint:dist", "copy:dist", "less:dist", "declaration"]);
    grunt.registerTask("dev", ["tslint:dev", "typescript:dev", "jshint:dev"]);
    grunt.registerTask("test", ["dev", "tslint:test", "typescript:test", "jshint:test", "mocha:test", "clean"]);
    grunt.registerTask("nuget", ["nugetpack", "nugetpush"]);

    grunt.registerTask("default", ["clean", "test", "build"]);
};