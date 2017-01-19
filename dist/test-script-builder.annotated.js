angular.module('test-script-builder', [
  'ui.router','ui.ace'
])
.config(["$urlRouterProvider", function ($urlRouterProvider) {
  'use strict';
  $urlRouterProvider
    .otherwise('/');
}]);

angular.module('test-script-builder')
  .factory('Templates', function(){
    return {
      jasmine: {
        "init": "var ptor;",
        "testSpec":"describe('[0]', function () {[1]});",
        "testCase": "it('[0]', function () {[1]});",
        "beforeEach":"beforeEach(function () {\n\t\tbrowser.get('[0]');\n\t\tptor = protractor.getInstance();\n\t\tptor.ignoreSynchronization = true;\n\t\tbrowser.driver.manage().window().setSize([1], [2]);\n\t\tptor.sleep(2000);\n\t});",
        "clickById": "element(by.id('[0]')).click();",
        "clickByPath": "element(by.xpath('[0]')).click();",
        "fillFieldById": "element(by.id('[0]')).sendKeys('[1]');",
        "fillFieldByPath": "element(by.xpath('[0]')).sendKeys('[1]');",
        "expectById": "expect(element(by.id('[0]')).getText()).toMatch('[1]');",
        "expectByPath": "expect(element(by.xpath('[0]')).getText()).toMatch('[1]');",
        "expectCountByPath": "expect(element.all(by.xpath('[0]')).count()).toBe([1]);",
        "expectElementPresentById": "expect(ptor.isElementPresent(by.id('[0]'))).toBe(true);",
        "expectElementPresentByPath": "expect(ptor.isElementPresent(by.xpath('[0]'))).toBe(true);",
        "sleep": "ptor.sleep([0]);"
      },
      mocha:{
        //todo
      },
      selenium:{
        //todo
      }
    };
  });

angular.module('test-script-builder')
  .factory('String', function(){
    return {
      format: function (input, arg1, arg2, arg3, arg4, arg5) {
        var args = [];
        if(arg1) args.push(arg1.toString());
        if(arg2) args.push(arg2.toString());
        if(arg3) args.push(arg3.toString());
        if(arg4) args.push(arg4.toString());
        if(arg5) args.push(arg5.toString());

        return input.replace(/\[(\d+)\]/g, function (match, capture) {
          return args[1*capture];
        });
      }
    };
});

angular.module('test-script-builder')
  .factory('TestSpec', ["String", "Templates", function (String, Templates) {
    'use strict';
    var TestSpecModel = function (dto) {
      this.name;
      this.id;
      this.url = "";
      this.testcases = [];
    };
    TestSpecModel.prototype.buildScript = function () {
      if (this.testcases.length == 0) return '';
      var template = Templates.jasmine;
      var testSpec = '\n' + template.init + '\n';
      var beforeEach = "\t" + String.format(template.beforeEach, this.url, 1200, 1500);
      testSpec += beforeEach;
      angular.forEach(this.testcases, function (tc) {
        var it = "\t";
        if (tc.events) {
          angular.forEach(tc.events, function (event) {
            it += "\n\t\t";
            if (event.type === "click" && event.tag !== "text") {
              if (event.element_id) {
                it += String.format(template.clickById, event.element_id);
              } else if (event.element_path) {
                it += String.format(template.clickByPath, event.element_path)
              }
            } else if (event.type === "fill" && event.tag === "text") {
              if (event.element_id) {
                it += String.format(template.fillFieldById, event.element_id, event.element_value);
              } else if (event.element_path) {
                it += String.format(template.fillFieldByPath, event.element_path, event.element_value);
              }
            } else if (event.type === 'expect') {
              if(event.element_value){
                //expect element value to the match
                if (event.element_id) {
                  it += String.format(template.expectById, event.element_id, event.element_value);
                } else if (event.element_path) {
                  it += String.format(template.expectByPath, event.element_path, event.element_value);
                }
              } else {
                //expect element is present
                if (event.element_id) {
                  it += String.format(template.expectElementPresentById, event.element_id);
                } else if (event.element_path) {
                  it += String.format(template.expectElementPresentByPath, event.element_path);
                }
              }
            }

            if (event.sleep && event.sleep > 0) it += "\n\t\t" + String.format(template.sleep, event.sleep);
          });

        }
        it += "\n\t";
        it = String.format(template.testCase, tc.name, it);
        testSpec += "\n\t" + it;
      });
      testSpec += '\n';
      testSpec = String.format(template.testSpec, this.name, testSpec);
      return testSpec;
    };
    return TestSpecModel;
  }]);

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

angular.module('test-script-builder')
  .factory('Event', function () {
    'use strict';
    var EventModel = function (msg, expectMode) {
      this.type;
      this.tag;
      this.element_id;
      this.element_path;
      this.element_value;
      this.sleep;
      this.expected_value;
      if (msg) this.init(msg, expectMode);
    };
    EventModel.prototype.init = function (msg, expectMode) {
      this.type = msg.event.toLowerCase();
      this.tag = msg.tag.toLowerCase();
      if (msg.data) {
        this.element_id = msg.data.id;
        if(msg.data.path) this.element_path = msg.data.path.toLowerCase();
        if(msg.data.value) this.element_value = msg.data.value.trim();
      }
    };
    return EventModel;
  });

(function() {
  /*
   * @param {function} Called  after the 'load' event on the inspected window
   * @return {function} A function to be injected into the inspected window.
   */
  function LoadMonitor(onLoadedCallback) {

    function checkForLoad() {
      var expr = 'window.__inspectedWindowLoaded';
      function onEval(isLoaded, isException) {
        if (isException)
          throw new Error('Eval failed for ' + expr, isException.value);
        if (isLoaded){
          onLoadedCallback();
        }
        else
          pollForLoad();
      }
      chrome.devtools.inspectedWindow.eval(expr, onEval);
    }

    function pollForLoad() {
      setTimeout(checkForLoad, 200);
    }
    pollForLoad();
  }

  LoadMonitor.prototype = {
    // This function should be converted to a string and run in the Web page
    injectedScript: function() {
      var self = this;
      // Initialize a secret data structure.
      window.__inspectedWindowLoaded = false;
      window.__hightlight_color = 'red';
      window.addEventListener('load', function () {
        window.__inspectedWindowLoaded = true;
        //window.postMessage({url: window.location.href}, '*');
        window.__captureEvents = true;
      });
    }
  };

  window.InspectedWindow = window.InspectedWindow || {};
  InspectedWindow.LoadMonitor = LoadMonitor;
})();

angular.module('test-script-builder')
  .filter('reverse', function() {
  return function(items) {
    return items.slice().reverse();
  };
});

angular
  .module('test-script-builder')
  .controller('PanelCtrl', ["$scope", "$window", "Event", "TestCase", "TestSpec", function ($scope, $window, Event, TestCase, TestSpec) {
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
  }]);
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

(function(module) {
try {
  module = angular.module('test-script-builder');
} catch (e) {
  module = angular.module('test-script-builder', []);
}
module.run(['$templateCache', function($templateCache) {
  $templateCache.put('/test-script-builder/todo/todo.html',
    '');
}]);
})();
