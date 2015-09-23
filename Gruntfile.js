'use strict';

module.exports = function (grunt) {
    // Load grunt tasks automatically
    require("jit-grunt")(grunt, {
        nugetpack: "grunt-nuget",
        nugetpush: "grunt-nuget"
    });
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
            samples: 'samples',
            css: 'css',
            temp: '.temp',
            test: 'test'
        },

        typescript: {
            options: {
                target: "es3",
                module: "amd",
                sourceMap: false,
                declaration: false,
                comments: false,
                disallowbool: true,
                disallowimportmodule: true
            },
            dev: {
                src: "<%= paths.src %>/**/*.ts",
                options: {
                    sourceMap: true
                }
            },
            samples: {
                src: "<%= paths.samples %>/**/*.ts",
                options: {
                    sourceMap: true
                }
            },
            test: {
                src: "<%= paths.test %>/**/*.ts"
            },
            declaration: {
                src: "<%= paths.src %>/**/*.ts",
                dest: "<%= paths.temp %>/",
                options: {
                    rootDir: '<%= paths.src %>',
                    declaration: true
                }
            },
            dist: {
                src: "<%= paths.src %>/**/*.ts",
                dest: "<%= paths.build %>/",
                options: {
                    rootDir: '<%= paths.src %>'
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
            samples: ["<%= paths.samples %>/**/*.js"],
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
            samples: {
                src: "<%= paths.samples %>/**/*.ts"
            },
            test: {
                src: "<%= paths.test %>/**/*.ts"
            }
        },

        connect: {
            test: {
                options: {
                    port: "8080",
                    livereload: 12321
                }
            }
        },

        mocha: {
            test: ["<%= paths.test %>/index.html"]
        },

        clean: {
            dev: [
                "<%= paths.src %>/**/*.{d.ts,js,js.map}",
                "!<%= paths.src %>/base.d.ts"
            ],
            samples: ["<%= paths.samples %>/**/*.{d.ts,js,js.map}"],
            test: ["<%= paths.test %>/**/*.{d.ts,js,js.map}"],
            temp: ["<%= paths.temp %>/**/*.*"]
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
            tslintdev: { files: ['<%= tslint.dev.src %>'], tasks: ['tslint:dev'] },
            tslintsamples: { files: ['<%= tslint.samples.src %>'], tasks: ['samples:test'] },
            tslinttest: { files: ['<%= tslint.test.src %>'], tasks: ['tslint:test'] },

            jshintdev: { files: ['<%= jshint.dev %>'], tasks: ['jshint:dev'] },
            jshintsamples: { files: ['<%= jshint.samples %>'], tasks: ['jshint:samples'] },
            jshinttest: { files: ['<%= jshint.test %>'], tasks: ['jshint:test'] },

            dev: { files: ['<%= typescript.dev.src %>'], tasks: ['typescript:dev'] },
            samples: { files: ['<%= typescript.samples.src %>'], tasks: ['typescript:samples'] },
            test: { files: ['<%= typescript.test.src %>'], tasks: ['typescript:test'] },

            less: { files: ['<%= paths.less %>/**/*.less'], tasks: ['less:dist'] },

            gruntfile: { files: ['Gruntfile.js'] },

            livereload: {
                options: {
                    livereload: "<%= connect.test.options.livereload %>"
                },
                files: [
                    "<%= paths.src %>/**/*.{js,js.map,html}",
                    "<%= paths.samples %>/**/*.{js,js.map,html}",
                    "<%= paths.test %>/**/*.{js,js.map,html}",
                    "<%= paths.css %>/*.css"
                ]
            }
        }
    });

    grunt.registerTask("fixdecla", function () {
        var content = grunt.file.read("dist/koui.d.ts");
        content = content.replace(/\.{2}\/typings/g, "../../../typings");
        grunt.file.write("dist/koui.d.ts", content);
    });

    grunt.registerTask("dev", ["tslint:dev", "typescript:dev", "jshint:dev"]);
    grunt.registerTask("build", ["tslint:dev", "typescript:dist", "jshint:dist", "copy:dist", "less:dist", "declaration"]);
    grunt.registerTask("declaration", ["typescript:declaration", "tsdamdconcat:declaration", "concat:declaration", "clean:temp", "fixdecla"]);

    grunt.registerTask("test", ["dev", "tslint:test", "typescript:test", "jshint:test", "mocha:test", "clean"]);
    grunt.registerTask("btest", ["dev", "tslint:test", "typescript:test", "jshint:test", "connect:test", "watch"]);
    grunt.registerTask("samples", ["dev", "tslint:samples", "typescript:samples", "jshint:samples", "connect:test", "watch"]);

    grunt.registerTask("nuget", ["nugetpack", "nugetpush"]);

    grunt.registerTask("default", ["clean", "test", "build"]);
};