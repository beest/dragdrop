# Drag & Drop

A robust drag & drop engine, which also supports interaction to, from and between one or more iframes.

The drag & drop engine consists of four behaviours that work together: *draggable*, *droppable*, *iframe* and *scrollable*. Each behaviour object is an event emitter to which you can bind to respond to events in the drag & drop life cycle.

## Usage

Uses AMD

Add dependencies 

```
define([
    "dragdrop/engine",
    "dragdrop/draggable",
    "dragdrop/droppable",
    "dragdrop/iframe",
    "dragdrop/scrollable"
], function(
    Engine,
    Draggable,
    Droppable,
    Iframe,
    Scrollable
) {
    // 
});
```

## Draggable

A *draggable* represents a DOM element that responds to receiving mouse clicks and drags. To give an element the draggable behaviour, instantiate the Draggable object and pass in the element and an optional interaction group.

Every draggable and droppable has a group that is used to ensure that interaction only happens between similar elements. For example, items from a list could be draggable into one area, and images could be draggable into a different area. The elements that have behaviours with different groups will not interact with one another.

If you don't specify an interaction group then the default value of "default" will be used.

```
var item = new Draggable({
    el: $(".item"),
    group: "items"
});
```

A draggable object will emit the following events:

- drag.start
- drag.move
- drag.drop
- drag.finish
- drag.enter
- drag.leave

To respond to these events, just add an event handler by using the *on* method.

```
item.on("drag.start", function() {
    // Respond to start of drag operation
});
```

## Droppable

## Draggable

## Draggable



```

```
