angular.module('test-script-builder', [
  'ui.router','ui.ace'
])
.config(function ($urlRouterProvider) {
  'use strict';
  $urlRouterProvider
    .otherwise('/');
});
