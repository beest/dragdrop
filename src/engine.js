define([
    "jquery",
    "underscore",
    "backbone"
], function($, _, Backbone) {

    var webkit = false;

    var draggables = [], droppables = [], scrollables = [];

    var dragging = null, dropping = null, scrolling = null;

    var interactCache = [], dropCache = [];

    var shim = null;

    var repeat = null;

    function generateCaches() {
        // Clear caches
        interactCache = [];
        dropCache = [];

        // If we're not dragging anything then clear caches
        if (dragging === null) {
            return;
        }

        var draggingIframe = dragging.getIframe();

        _.each(droppables, function(droppable) {

            if (droppable.isMatched(dragging)) {
                interactCache.push(droppable);

                var rect = droppable.getRect();

                if (rect !== null) {
                    // Cache the droppable's coordinates so they don't need to be calculated on every mousemove
                    droppable.cacheRect(rect);
                    dropCache.push(droppable);
                }                
            }
        });
    }

    function mousemove(x, y, doc, offset) {

        // Store arguments so the event can be repeated
        repeat = arguments;

        // We don't care about this event until a drag is in progress
        if (dragging !== null) {

            // Calculate the relevant coordinates in relation to parent
            var scrollTop = doc.scrollTop(),
                pageX = x + offset.left,
                pageY = y + offset.top - scrollTop,
                dragX = pageX - dragging.deltaX,
                dragY = pageY - dragging.deltaY;

            dragging.trigger("drag.move", {
                pageX: pageX,
                pageY: pageY,
                dragX: dragX,
                dragY: dragY
            });

            scrolling = null;

            _.every(scrollables, function(scrollable) {

                if (scrollable.isMatched(dragging)) {

                    var match = scrollable.hitTest(pageX, pageY);

                    if (match) {
                        scrolling = scrollable;
                        return false;
                    }
                }

                return true;
            });

            // Droppable matched during the last mousemove event
            var before = dropping;

            // Droppable that will be matched during this event
            var now = null;

            _.each(dropCache, function(droppable) {

                var match = droppable.hitTest(pageX, pageY, now);

                if (match) {
                    now = droppable;
                }
            });

            if (now !== null) {

                // If we have a hit now but we didn't before
                if (before === null) {
                    now.trigger("drag.enter", dragging);
                } else {

                    // If we have a match now but we had a different match before
                    if (now !== before) {
                        before.trigger("drag.leave", dragging);
                        now.trigger("drag.enter", dragging);
                    }

                }

                now.trigger("drag.move", dragging);

                dropping = now;
            } else {

                // If we don't have a match now but we did before
                if (before !== null) {
                    before.trigger("drag.leave", dragging);
                    dropping = null;
                }
            }
        }
    }

    function mouseup() {

        if (dragging !== null) {

            // If we have a current droppable match then this is a successful drag & drop
            if (dropping !== null) {
                dropping.trigger("drag.drop", dragging);
                dropping.trigger("drag.leave", dragging);
            }

            // Trigger drag finish events for the draggable and all droppables that interact with it
            dragging.trigger("drag.finish");

            _.each(interactCache, function(droppable) {
                droppable.trigger("drag.finish", dragging);
            });

            // Clear the state of everything
            dragging = null;
            dropping = null;
            scrolling = null;

            if (webkit) {
                shim.hide();
            }
        }
    }

    function createShim() {

        // The shim element covers the entire page in order to capture all mousemove events

        shim = $("<div></div>").css({
            position: "absolute",
            left: 0,
            top: 0,
            right: 0,
            bottom: 0,
            zIndex: 999,
            display: "none"
        });

        $(document.body).append(shim);
    }

    var Engine = {

        attachDocument: function(doc, offset) {

            doc.on("mousemove.dragdrop", function(e) {
                mousemove(e.pageX, e.pageY, doc, offset);
            });

            doc.on("mouseup.dragdrop", function(e) {
                mouseup();
            });
        },

        detachDocument: function(doc) {
            doc.off(".dragdrop");
        },

        addIframe: function(iframe) {

            if (!webkit) {
                this.attachDocument(iframe.contents(), iframe.offset());
            }
        },

        removeIframe: function(iframe) {

            if (!webkit) {
                this.detachDocument(iframe.contents());
            }
        },

        addDraggable: function(draggable) {
            draggables.push(draggable);
        },

        removeDraggable: function(draggable) {
            draggables = _.without(draggables, draggable);
        },

        addDroppable: function(droppable) {
            droppables.push(droppable);
        },

        removeDroppable: function(droppable) {
            droppables = _.without(droppables, droppable);
        },

        addScrollable: function(scrollable) {
            scrollables.push(scrollable);
        },

        removeScrollable: function(scrollable) {
            scrollables = _.without(scrollables, scrollable);
        },

        startDrag: function(draggable) {

            // Trigger drag start events for the draggable and all droppables that interact with it

            draggable.trigger("drag.start");

            _.each(interactCache, function(droppable) {
                droppable.trigger("drag.start", self);
            });

            dragging = draggable;

            _.each(scrollables, function(scrollable) {
                var scrollTop = scrollable.getMaxScrollTop();
                scrollable.cacheMaxScrollTop(scrollTop);
            });

            // We only need to generate the droppable cache at the start of the drag
            generateCaches();

            if (webkit) {
                shim.show();
            }
        }
    };

    $(function() {

        // WebKit has a bug when changing scrollTop for an iframe where the mousemove events sporadically jump around
        // To prevent this we can shim the entire document with an element to capture mousemove events

        webkit = navigator.userAgent.match(/webkit/i);

        if (webkit) {
            createShim();
        }

        Engine.attachDocument($(document), {
            left: 0,
            top: 0
        });

        setInterval(function() {

            if (scrolling !== null) {

                scrolling.scroll();

                generateCaches();

                if (!webkit) {
                    var actual = before - now;
                    repeat[1] -= actual;
                }

                // Repeat last mousemove
                mousemove.apply(window, repeat);
            }
        }, 20);
    });

    return Engine;
});
