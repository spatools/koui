"use strict";

module.exports = function (grunt) {
    require("time-grunt")(grunt);
    require("jit-grunt")(grunt, {
        buildcontrol: "grunt-build-control",
        nugetpack: "grunt-nuget",
        nugetpush: "grunt-nuget"
    });

    var config = {
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
        
        options: {
            dev: grunt.option("dev")
        }
    };
    
    //#region Typescript
    
    config.ts = {
        options: {
            target: "es5",
            module: "amd",
            declaration: false,
            sourceMap: true,
            comments: true,
            disallowbool: true,
            disallowimportmodule: true,
            fast: "never"
        },
        dev: {
            src: ["_references.d.ts", "<%= paths.src %>/**/*.ts"],
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
        dist: {
            src: "<%= ts.dev.src %>",
            dest: "<%= paths.build %>/",
            options: {
                rootDir: "<%= paths.src %>",
                declaration: true,
                sourceMap: false
            }
        }
    };

    config.eslint = {
        options: {
            configFile: "eslint.json",
        },

        base: ["*.js"],
        dev: ["<%= paths.src %>/**/*.js"],
        samples: ["<%= paths.samples %>/**/*.js"],
        dist: ["<%= paths.build %>/**/*.js"],
        test: ["<%= paths.test %>/**/*.js"],
        all: {
            src: ["<%= eslint.dev %>", "<%= eslint.test %>"]
        }
    };
    
    //#endregion

    //#region Assets

    config.less = {
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
    };

    config.copy = {
        dist: {
            files: [
                {
                    expand: true,
                    cwd: "<%= paths.src %>/",
                    src: "**/*.html",
                    dest: "<%= paths.build %>/"
                },
                {
                    src: "README.md",
                    dest: "<%= paths.build %>/README.md"
                }
            ]
        }
    };

    grunt.registerTask("assets", function () {
        copyPackage("package.json");
        copyPackage("bower.json");

        writeDest(".gitignore", "node_modules/\nbower_components/");
    });
    
    function copyPackage(src) {
        var pkg = grunt.file.readJSON(src),
            dest = config.paths.build + "/" + dest;
        
        delete pkg.scripts;
        delete pkg.devDependencies;
        
        writeDest(src, JSON.stringify(pkg, null, 2));
    }
    
    function writeDest(name, content) {
        var dest = config.paths.build + "/" + name;
        grunt.file.write(dest, content);
        grunt.log.ok(dest + " created !");
    }
    
    //#endregion
    
    //#region Clean

    config.clean = {
        dist: "<%= paths.build %>",
        temp: "<%= paths.temp %>",
        dev: "<%= paths.src %>/**/*.{js,js.map,d.ts}",
        samples: [
            "<%= clean.dev %>",
            "<%= paths.samples %>/**/*.{d.ts,js,js.map}"
        ]
    };

    //#endregion
    
    //#region Watch

    config.connect = {
        test: {
            options: {
                port: "8080",
                livereload: 12321
            }
        }
    };

    config.newer = {
        options: {
            override: function (detail, include) {
                if (detail.task === "ts" && detail.path.indexOf(".d.ts") !== -1) {
                    return include(true);
                }
                
                include(false);
            }
        }
    };

    config.watch = {
        eslintdev: { files: ['<%= eslint.dev %>'], tasks: ['eslint:dev'] },
        eslintsamples: { files: ['<%= eslint.samples %>'], tasks: ['eslint:samples'] },

        tsdev: { files: ['<%= ts.dev.src %>'], tasks: ['ts:dev'] },
        tssamples: { files: ['<%= ts.samples.src %>'], tasks: ['ts:samples'] },

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
        },

        gruntfile: {
            files: ["Gruntfile.js"],
            options: { reload: true }
        }
    };
    
    //#endregion
    
    //#region Publish
    
    config.nugetpack = {
        all: {
            src: "nuget/*.nuspec",
            dest: "nuget/",

            options: {
                version: "<%= pkg.version %>"
            }
        }
    };
    
    config.nugetpush = {
        all: {
            src: "nuget/*.<%= pkg.version %>.nupkg"
        }
    };
    
    config.buildcontrol = {
        options: {
            commit: true,
            push: true,
            tag: "<%= pkg.version %>",
            remote: "<%= pkg.repository.url %>",
            branch: "release"
        },
        
        dist: {
            options: {
                dir: "<%= paths.build %>",
                message: "Release v<%= pkg.version %>"
            }
        }
    };
    
    grunt.registerTask("npm-publish", function () {
        var done = this.async();
        
        grunt.util.spawn(
            {
                cmd: "npm",
                args: ["publish"],
                opts: {
                    cwd: config.paths.build
                }
            }, 
            function(err, result, code) {
                if (err) {
                    grunt.log.error();
                    grunt.fail.warn(err, code);
                }
                
                if (code !== 0) {
                    grunt.fail.warn(result.stderr || result.stdout, code);
                }
                
                grunt.verbose.writeln(result.stdout);
                grunt.log.ok("NPM package " + config.pkg.version + " successfully published");
                
                done();
            }
        );
    });
    
    //#endregion
    
    grunt.initConfig(config);

    grunt.registerTask("dev", ["clean:dev", "ts:dev", "eslint:dev"]);
    grunt.registerTask("build", ["clean:dist", "ts:dist", "eslint:dist", "copy:dist", "less:dist", "assets"]);
    
    grunt.registerTask("samples", ["clean:samples", "ts:samples", "eslint:samples", "connect:test", "watch"]);
    
    grunt.registerTask("nuget", ["nugetpack", "nugetpush"]);
    grunt.registerTask("publish", ["build", "nuget", "buildcontrol:dist", "npm-publish"]);

    grunt.registerTask("default", ["build"]);
};
