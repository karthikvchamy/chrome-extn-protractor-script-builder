console.log('loading devtools');

chrome.devtools.panels.create(
  'TestScriptBuilder',
  'vz-logo.png', // No icon path
  'index.html',
  function (extensionPanel) {
    var _window, _scope;

    var port = chrome.runtime.connect({
      name: "testscriptbuilder" //Given a Name
    });

//Handle response when recieved from background page
    port.onMessage.addListener(function (msg) {
      if (_window) {
        _window.__onMessage_received(msg);
      }
    });

    extensionPanel.onShown.addListener(function tmp(panelWindow) {
      extensionPanel.onShown.removeListener(tmp); // Run once only
      _window = panelWindow;
      _window.__respond = function (msg) {
        port.postMessage({tabId: chrome.devtools.inspectedWindow.tabId, msg: msg});
      };
      _window.__onMessage_received = function (msg) {
        setTimeout(function () {
          _window._scope.onMessage_received(msg);
        }, 1);
      };
    });
  }
);
