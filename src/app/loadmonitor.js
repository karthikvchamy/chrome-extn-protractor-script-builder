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
