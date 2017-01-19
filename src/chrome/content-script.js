window.__captureEvents = false;
window.__expectMode = false;
//Handler request from background page
chrome.runtime.onMessage.addListener(function (message, sender) {
  //console.log(message);
  if(message === "init"){

  } else if (message === "record") {
    window.postMessage({url: window.location.href}, '*');
    window.__hightlight_color = '#d9534f';
    window.__captureEvents = true;
    window.__expectMode = false;
    document.body.style.border = "10px solid " + window.__hightlight_color;
  } else if (message === "expect") {
    window.__hightlight_color = '#5cb85c';
    window.__expectMode = true;
    document.body.style.border = "10px solid " + window.__hightlight_color;
  }
  else if (message === "stop") {
    document.body.style.border = "0px";
    window.__captureEvents = false;
    window.__expectMode = false;
  }
});

/*window.__getPath = function (pathArray) {
  var pathStr = '//';
  for (var i = pathArray.length - 1; i >= 0; i--) {
    if (pathArray[i].tagName && (pathArray[i].tagName !== 'BODY' && pathArray[i].tagName !== 'HTML' && pathArray[i].tagName !== 'undefined'))
      pathStr += pathArray[i].tagName + '/';
  }
  return pathStr;
};*/
window.__getXPath = function(element)
{
  var val=element.value;
  var xpath = '';
  for ( ; element && element.nodeType == 1; element = element.parentNode )
  {
    var tagName = element.tagName.toLowerCase();
    if(tagName == 'ui-view' && element.parentNode === null){
      tagName = "/ui-view";
    }
    var id = $(element.parentNode).children(element.tagName).index(element) + 1;
    id > 1 ? (id = '[' + id + ']') : (element.tagName === 'TR' || element.tagName === 'TD' ||
    element.tagName === 'LI') ? (id = '[1]') : (id = '');
    xpath = '/' + tagName + id + xpath;
  }
//  console.log(xpath);
  return xpath;
}
window.addEventListener('click', function (e) {
  //console.log(e);
  //if(!window.__captureEvents) return;

  if (e && e.srcElement) {
    var tagName,
      element = e.srcElement;

    if (element.tagName === "INPUT") {
      tagName = element.type;
    } else {
      tagName = element.tagName;
    }
    if (tagName === "text") {
      element.onblur = function () {
        var pathStr = window.__getXPath(element);
        window.postMessage({
          tag: tagName,
          event: 'fill',
          data: {id: element.id, path: pathStr, value: element.value}
        }, '*');
      };
    }

    if (element.id.length === 0) {
      var pathStr = window.__getXPath(element);
      window.postMessage({
        tag: tagName, event: 'click',
        data: {id: element.id, path: pathStr, value: element.innerText}
      }, '*');
    } else {
      window.postMessage({tag: tagName, event: 'click', data: {id: element.id, value: element.innerText}}, '*');
    }
  }

});
window.addEventListener('message', function (event) {
  //if(!window.__captureEvents) return;
  // Only accept messages from the same frame
  if (event.source !== window) {
    return;
  }

  var message = event.data;

  // Only accept messages that we know are ours
  if (typeof message !== 'object' || message === null ||
    !message.source === 'my-devtools-extension') {
    return;
  }
  chrome.runtime.sendMessage(message);
});

var onHover = false, originalBgColor, originalBorder, element;
window.addEventListener('mouseover', function (e) {
  if(!e || !e.srcElement) return;
  if(window.__captureEvents === false) return;
  element = e.srcElement;

  /*element.addEventListener('click', function(ev){
    if(window.__expectMode === true){
      //console.log(ev);
      ev.stopPropagation();
      ev.preventDefault();
      ev.cancelBubble = true;
      return false;
    }
  });*/
  onHover = true;
  var elementRef = e.srcElement;
  originalBorder = element.style.border;
  originalBgColor = element.style.backgroundColor;
  element.style.border = "1px solid " + window.__hightlight_color;
  element.style.borderRadius = "5px";

  if (window.__expectMode === true) {
    setTimeout(function () {
      if (onHover) {
        if (elementRef !== element) return;
        element.style.backgroundColor = "green";
        var tagName;
        if (element.tagName === "INPUT") {
          tagName = element.type;
        } else {
          tagName = element.tagName;
        }
        if (element.id.length > 0) {
          window.postMessage({tag: tagName, event: 'expect', data: {id: element.id, value: element.innerText}}, '*');
        } else {
          var pathStr = window.__getXPath(element);
          /*if (pathStr.indexOf('TR') > -1) {
            var rowIndex = window.__getRowIndex(element);
            pathStr = pathStr.replace('TR', 'TR[' + rowIndex + ']');
          }
          ;
          if (pathStr.indexOf('TD') > -1) {
            var cellIndex = window.__getCellIndex(element);
            pathStr = pathStr.replace('TD', 'TD[' + cellIndex + ']');
          }*/
          window.postMessage({
            tag: tagName, event: 'expect',
            data: {id: element.id, path: pathStr, value: element.innerText}
          }, '*');
        }
        setTimeout(function () {
          element.style.backgroundColor = originalBgColor;
        }, 500);
      }
      onHover = false;
    }, 1500);
  }
});
window.__getRowIndex = function(child){
  if(child.parentElement === undefined || child.parentElement === null) return;
  if(child.parentElement.tagName === 'TR'){
    return child.parentElement.rowIndex;
  };
   return window.__getRowIndex(child.parentElement);
};
window.__getCellIndex = function(child){
  if(child.parentElement === undefined || child.parentElement === null) return;
  if(child.parentElement.tagName === 'TD'){
    return child.parentElement.cellIndex;
  };
  return window.__getCellIndex(child.parentElement);
};
window.addEventListener('mouseout', function (e) {
  onHover = false;
  var element = e.srcElement;
  element.style.backgroundColor = originalBgColor;
  element.style.border = originalBorder;
  originalBgColor = "none";
  originalBorder = "0px";
});
