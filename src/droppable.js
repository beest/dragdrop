define([
    "jquery",
    "underscore",
    "backbone",
    "dragdrop/engine"
], function($, _, Backbone, Engine) {

    function Droppable(config) {

        config = _.extend({
            group: "default",
            iframe: null
        }, config);

        var cache = null;

        _.extend(this, {
            getEl: function() {
                return config.el;
            },

            getIframe: function() {
                return config.iframe;
            },

            getGroup: function() {
                return config.group;
            },

            isVisible: function() {
                return config.el.is(":visible");
            },

            getRect: function() {
 
                var el = config.el;

                // Determine the rect coordinates of the droppable relative to the element's document
                var rect = el.offset();
                rect.right = rect.left + el.outerWidth();
                rect.bottom = rect.top + el.outerHeight();

                var iframe = config.iframe;

                if (iframe !== null) {

                    // Adjust the coordinates of the droppable element based on the position of the iframe in the partner document
                    var offset = iframe.offset(), height = iframe.height(), scrollTop = iframe.contents().scrollTop();
                    rect.left += offset.left;
                    rect.right += offset.left;
                    rect.top += offset.top - scrollTop;
                    rect.bottom += offset.top - scrollTop;

                    // Make sure droppable is within the visible scroll area (vertical only)
                    if (rect.bottom < offset.top || rect.top > (offset.top + height)) {
                        return null;
                    }

                    // Clip the top and bottom of the element to the visible scroll area
                    rect.top = Math.max(rect.top, offset.top);
                    rect.bottom = Math.min(rect.bottom, offset.top + height);
                }

                return rect;
            },

            cacheRect: function(rect) {
                cache = rect;
            },

            isMatched: function(draggable) {

                var droppableIframe = config.iframe,
                    draggableIframe = draggable.getIframe();

                // The draggable and droppable must be in the same interacion group
                if (draggable.getGroup() === config.group) {

                    // Match when draggable not constrained to an iframe or is withn the same iframe
                    return (draggableIframe === null || (droppableIframe !== null && draggableIframe.get(0) === droppableIframe.get(0)));
                }
            },

            hitTest: function(x, y, now) {

                var rect = cache;

                if (x > rect.left && x < rect.right && y > rect.top && y < rect.bottom) {

                    // If this is the first time the cursor is within a droppable then we have a match
                    // For subsequent times the droppable needs to be a descendent of the current match

                    if (now === null || $.contains(now.getEl(), config.el)) {
                        return true;
                    }
                }

                return false;
            },

            remove: function() {
                Engine.removeDroppable(this);
            }
        });

        // Mixin Backbone custom event handling 
        _.extend(this, Backbone.Events);

        Engine.addDroppable(this);
    }

    return Droppable;
});
