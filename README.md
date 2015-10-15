## Installation

Install all `node_modules` first.

```
$ npm install
```

## NODE_ENV

While set to `development` all scripts and stylesheets will be served uncompiled from the `src` folder. The app will be accessible from `localhost:3000`.

While set to `production`, only files from the `public` folder will be served. Run grunt to make sure these are compiled to their latest version.

## Grunt

Run grunt to compile scripts and stylesheets from the `src` folder into the `public` folder.

```
$ grunt
```