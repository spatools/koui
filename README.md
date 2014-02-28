# KoUI [![Build Status](https://travis-ci.org/spatools/koui.png)](https://travis-ci.org/spatools/koui) [![Bower version](https://badge.fury.io/bo/koui.png)](http://badge.fury.io/bo/koui) [![NuGet version](https://badge.fury.io/nu/koui.png)](http://badge.fury.io/nu/koui)

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

### Browser (with built file)

Include built script in your HTML file.

```html
<script type="text/javascript" src="path/to/knockout.js"></script>
<script type="text/javascript" src="path/to/underscore.js"></script>
<script type="text/javascript" src="path/to/jquery.js"></script>
<script type="text/javascript" src="path/to/koutils.min.js"></script>
<script type="text/javascript" src="path/to/koui.min.js"></script>
```

## Documentation

Samples can be found on __samples__ folder.

Documentation is hosted on [Github Wiki](https://github.com/spatools/koui/wiki).