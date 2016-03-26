# KoUI [![Build Status](https://travis-ci.org/spatools/koui.png)](https://travis-ci.org/spatools/koui) [![Bower version](https://badge.fury.io/bo/koui.png)](http://badge.fury.io/bo/koui) [![NuGet version](https://badge.fury.io/nu/koui.png)](http://badge.fury.io/nu/koui) [![npm version](https://badge.fury.io/js/koutils.svg)](https://badge.fury.io/js/koutils)

Knockout UI widgets to help Knockout app development.

## Installation

Using Bower:

```console
$ bower install koui --save
```

Using NuGet: 

```console
$ Install-Package KoUI
```

## Usage

You could use koui in different context.

### Browser (AMD from source)

#### Configure RequireJS.

```javascript
requirejs.config({
    paths: {
        knockout: 'path/to/knockout',
        underscore: 'path/to/underscore',
        jquery: 'path/to/jquery',
        koutils: 'path/to/koutils',
        koui: 'path/to/koui'
    }
});
```

#### Load modules

```javascript
define(["koui/tree"], function(tree) {
    var command = new tree.Tree({
        //...
    });
});
```

## Documentation

Samples can be found on __samples__ folder.

Documentation is hosted on [Github Wiki](https://github.com/spatools/koui/wiki).