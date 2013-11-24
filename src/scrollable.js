define([
    "underscore",
    "backbone",
    "dragdrop/engine"
], function(_, Backbone, Engine) {

    function Scrollable(config) {

        config = _.extend({
            group: "default",
            distance: 20
        }, config);

        var direction = null;

        var cache = null;

        _.extend(this, {
            getEl: function() {
                return config.el;
            },

            getGroup: function() {
                return config.group;
            },

            getDirection: function() {
                return direction;
            },

            getRect: function() {

                // Determine the bounding box rectangle of the scrollable
                var rect = config.el.offset();
                rect.right = rect.left + config.el.outerWidth();
                rect.bottom = rect.top + config.el.outerHeight();

                return rect;
            },

            getMaxScrollTop: function() {
                var el = config.el;
                return el.contents().height() - el.outerHeight();
            },

            cacheMaxScrollTop: function(scrollTop) {
                cache = scrollTop;
            },

            isMatched: function(draggable) {

                var el = config.el,
                    draggableIframe = draggable.getIframe();

                if (el.is("iframe") && draggableIframe !== null) {
                    return el.get(0) === draggableIframe.get(0);
                }

                return true;
            },

            hitTest: function(x, y) {

                var rect = this.getRect();

                if (x > rect.left && x < rect.right && y > rect.top && y < (rect.top + config.distance)) {
                    direction = "up";
                    return true;
                } else if (x > rect.left && x < rect.right && y > (rect.bottom - config.distance) && y < rect.bottom) {
                    direction = "down";
                    return true;
                }

                direction = null;
                return false;
            },

            scroll: function() {

                var iframeDoc = config.el.contents(),
                    delta = direction == "up" ? -config.speed : config.speed,
                    before = iframeDoc.scrollTop();

                // Use the cached the scroll height of the document
                var height = cache;

                // Constrain the scroll to the height of the document
                var now = Math.min(height, Math.max(0, before + delta));

                iframeDoc.scrollTop(now);
            },

            remove: function() {
                Engine.removeScrollable(this);
            }
        });

        // Mixin Backbone custom event handling 
        _.extend(this, Backbone.Events);

        Engine.addScrollable(this);
    }

    return Scrollable;
});
