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
