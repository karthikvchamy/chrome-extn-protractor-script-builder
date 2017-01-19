angular
  .module('test-script-builder')
  .controller('PanelCtrl', function ($scope, $window, Event, TestCase, TestSpec) {
    'use strict';
    $scope.testScript = "";
    $scope.scriptMode = false;
    $scope.testSpec = new TestSpec();
    $scope.testCase = new TestCase();
   /* $scope.testCase.name = "sample test";
    var event = new Event();
    event.type = 'click';
    event.tag = 'a';
    $scope.testCase.events = [];
    $scope.testCase.events.push(event);
    $scope.testSpec.testcases.push($scope.testCase);*/
    $scope.startCapture = function () {
      $scope.testCase.isStarted = !$scope.testCase.isStarted;
      if($scope.testCase.isStarted) {
        $window._scope = $window.angular.element(document.getElementById('panelContainer')).scope();
        $window.__startCapturing();
      } else {
       $scope.cancelCapture();
      }
    };
    $scope.cancelCapture = function () {
      $scope.testCase.isStarted = false;
      $scope.testCase.expectMode = false;
      $window.__respond('stop');
    };
    $scope.setExpectMode = function (mode) {
      $scope.testCase.expectMode = !$scope.testCase.expectMode;
      if ($scope.testCase.expectMode) {
        $window.__respond('expect');
      } else {
        $window.__respond('record');
      }
    };
    $scope.onMessage_received = function (msg) {
      if ($scope.testSpec.url.length === 0 && msg.url) {
        $scope.testSpec.url = msg.url;
      }
      var newEvent = new Event(msg);
      if (newEvent.type === 'click' && newEvent.tag === 'text') return;
      $scope.testCase.events.push(newEvent);
      $scope.$apply();
    };
    $scope.newTestCase = function () {
      $scope.testCase = new TestCase();
    };
    $scope.showTestCase = function (tc) {
      $scope.testCase = tc;
    };
    $scope.saveTestCase = function () {
      if(!$scope.testCase.id){
        $scope.testCase.id =  (((1 + Math.random()) * 0x10000)).toString(5);
        var tc = angular.copy($scope.testCase);
        $scope.testSpec.testcases.push($scope.testCase);
      }

      $scope.cancelCapture();
      $scope.testCase = new TestCase();
    };
    $scope.deleteEvent = function (index) {
      $scope.testCase.events.splice(index, 1);
    };
    $scope.deleteTestCase = function (index) {
      $scope.testSpec.testcases.splice(index, 1);
    };
    $scope.showScript = function () {
      /*var ts = JSON.parse('{"testcases":[{"events":[{"type":"click","tag":"text","element_id":"","element_path":"//FORM/DIV/SECTION/DIV/DIV/UI-VIEW/SECTION/DIV/DIV/NG-INCLUDE/DIV/DIV/DIV/HEADER/DIV/DIV/INPUT/","$$hashKey":"object:3"},{"type":"blur","tag":"text","element_id":"","element_value":"prime.com","element_path":"//FORM/DIV/SECTION/DIV/DIV/UI-VIEW/SECTION/DIV/DIV/NG-INCLUDE/DIV/DIV/DIV/HEADER/DIV/DIV/INPUT/","$$hashKey":"object:5"}],"expects":[],"isNew":true,"isStarted":true,"expectMode":false,"name":"testcase","$$hashKey":"object:7"}],"name":"testspec"}');
       $scope.testSpec = new TestSpec();
       $scope.testSpec.name = ts.name;
       $scope.testSpec.testcases = ts.testcases;
       $scope.testScript = JSON.stringify($scope.testSpec);*/
      $scope.scriptMode = !$scope.scriptMode;
      $scope.testScript = $scope.testSpec.buildScript();
    };
  });
(function () {
  window.__onStarted = function () {
    window.__respond('record');
  };

  window.__startCapturing = function () {
    var loadMonitor = new InspectedWindow.LoadMonitor(window.__onStarted);
    var options = {
      ignoreCache: true,
      userAgent: undefined,
      injectedScript: '(' + loadMonitor.injectedScript + ')()',
      preprocessingScript: undefined
    };
    chrome.devtools.inspectedWindow.reload(options);
  };
})();
