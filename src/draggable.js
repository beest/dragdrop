define([
    "jquery",
    "underscore",
    "backbone",
    "dragdrop/engine"
], function($, _, Backbone, Engine) {

    function Draggable(config) {

        config = _.extend({
            group: "default",
            timeout: 100,
            iframe: null
        }, config);

        var self = this, el = config.el;

        el.on("mousedown.dragdrop", function(e) {

            // Wait a short time to ensure we don't interfere with clicks
            setTimeout(function() {

                // Calculate the delta between cursor and element position
                var position = el.offset();
                self.deltaX = e.pageX - position.left;
                self.deltaY = e.pageY - position.top;

                // The drag & drop engine deals with everything from here
                Engine.startDrag(self);
            }, config.timeout);

            e.preventDefault();
        });

        _.extend(this, {
            getEl: function() {
                return el;
            },

            getIframe: function() {
                return config.iframe;
            },

            getGroup: function() {
                return config.group;
            },

            remove: function() {
                el.off(".dragdrop");
                Engine.removeDraggable(this);
            }
        });

        // Mixin Backbone custom event handling 
        _.extend(this, Backbone.Events);

        Engine.addDraggable(this);
    }

    return Draggable;
})
