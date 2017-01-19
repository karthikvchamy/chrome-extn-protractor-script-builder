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
