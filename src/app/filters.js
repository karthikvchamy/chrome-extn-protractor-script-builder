angular.module('test-script-builder')
  .filter('reverse', function() {
  return function(items) {
    return items.slice().reverse();
  };
});
