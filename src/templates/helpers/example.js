define([
  'hbs/handlebars'
], function (
  Handlebars
) {
  'use strict';

  Handlebars.registerHelper('example', function () {
    return 'example';
  });
});