angular.module('test-script-builder')
  .factory('TestSpec', function (String, Templates) {
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
  });
