define([
    "underscore",
    "backbone",
    "dragdrop/engine"
], function(_, Backbone, DragDropEngine) {

    function Iframe(config) {

        config = _.extend({
            group: "default"
        }, config);

        _.extend(this, {
            getEl: function() {
                return config.el;
            },

            getOffset: function() {
                return config.el.offset();
            },

            getGroup: function() {
                return config.group;
            },

            getDoc: function() {
                return config.el.contents();
            }
        });

        // Mixin Backbone custom event handling 
        _.extend(this, Backbone.Events);

        DragDropEngine.addIframe(this);
    }

    return Iframe;
});
