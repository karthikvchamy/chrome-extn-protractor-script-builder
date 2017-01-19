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
