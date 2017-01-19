(function() {
  /*
   * @param {function} Called  after the 'load' event on the inspected window
   * @return {function} A function to be injected into the inspected window.
   */
  function LoadMonitor(onLoadedCallback, onClickCallback) {

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
    injectedScript: function(onClickCallback) {
      var self = this;
      // Initialize a secret data structure.
      window.__inspectedWindowLoaded = false;
      window.addEventListener('load', function() {
        window.__inspectedWindowLoaded = true;
        window.__captureEvents = true;
      });

      window.addEventListener('click', function(e){
        if(!window.__captureEvents) return;
        if(e && e.srcElement){

          var tagName,
            element = e.srcElement;

          if(element.tagName === "INPUT"){
            tagName = element.type;
          } else {
            tagName = element.tagName;
          }
          if(tagName === "text"){
            element.onblur = function(){
              window.postMessage({tag:tagName, event:'blur', data:{value:element.value}},'*');
            };
          }

          if(element.id.length  === 0){
            setTimeout(function(){
              var pathStr ='//';
              var pathArray = e.path;
              for(var i = pathArray.length - 1; i >= 0; i--){
                pathStr += pathArray[i].tagName + '/';
              }
              window.postMessage({tag:tagName, event:'click', data:{id: element.id, path: pathStr}},'*');
            },3);
          } else {
            window.postMessage({tag:tagName, event:'click', data:{id: element.id}},'*');
          }
        }
      });
    }
  };

  window.InspectedWindow = window.InspectedWindow || {};
  InspectedWindow.LoadMonitor = LoadMonitor;
})();
