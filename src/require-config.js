
/* -------------------
 | CONFIG
 ------------------- */

require.config({
  baseUrl: '.',

  paths: {
    //bower components
    'jquery': '../node_modules/jquery/dist/jquery',
    'underscore': '../node_modules/underscore/underscore',
    'hbs': '../node_modules/require-handlebars-plugin/hbs',

    //requirejs file loaders
    'image': '../node_modules/requirejs-plugins/src/image',
    'json': '../node_modules/requirejs-plugins/src/json',
    'text': '../node_modules/requirejs-plugins/lib/text',
    'markdownConverter' : '../node_modules/requirejs-plugins/lib/Markdown.Converter'
  }
});
