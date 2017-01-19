angular.module('test-script-builder')
  .factory('TestCase', function () {
    'use strict';
    var TestCaseModel = function () {
      this.name;
      this.id;
      this.events = [];
      this.isNew = true;
      this.isStarted = false;
      this.expectMode = false;
    };
    return TestCaseModel;
  });
