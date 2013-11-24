# Drag & Drop

## Summary

A robust drag & drop engine, which supports interaction to, from and between one or more iframes.

The drag & drop engine consists of three behaviours that work together: *draggable*, *droppable* and *scrollable*. Each behaviour object is an event emitter to which you can bind functions that respond to events in the drag & drop life cycle.

The drag & drop engine doesn't perform any actions, so it's up to you to move an element, resize an object, or whatever it is you need to happen. Tthe engine simply emits events at every point in the drag and drop life cycle.

You respond to events by binding event handler functions. This gives you complete flexibility to make your app behave the way you need it to.

## Usage

Currently this library works with [requirejs](http://requirejs.org/), but it should also work with other loaders that conforms to the [AMD API](https://github.com/amdjs/amdjs-api/wiki/AMD).

Each behaviour can be included independently of others, directly where it is needed in your project. Here is an example including all dependencies provided with the engine:

```javascript
define([
    "dragdrop/engine",
    "dragdrop/draggable",
    "dragdrop/droppable",
    "dragdrop/scrollable"
], function(
    Engine,
    Draggable,
    Droppable,
    Scrollable
) {
    ...
});
```

## Interaction Groups

Every draggable and droppable has a group that is used to ensure that interaction only happens between similar elements. For example, items from a list could be draggable into one area, and images could be draggable into a different area. The elements that have behaviours with different groups will not i
nteract with one another.

If you don't specify the interaction group to be used by the draggable or droppable then the value "default" will be assumed.

## Engine

The *engine* is a single object that is responsible for transforming raw DOM events into specific events that are more useful to provide drag and drop functionality.

To start the engine, just call the *start* method when the document is ready.

```javascript
$(function() {
    Engine.start();
});
```

## Draggable

A *draggable* object represents a DOM element that responds to receiving mouse clicks and drags. A *drag.drop* event is triggered when it is dropped on a droppable in the same interaction group. The draggable will typically provide a payload to the droppable to indicate what is being dropped.

To give an element the draggable behaviour, instantiate the Draggable object and pass in the element and an optional interaction group.

```javascript
var item = new Draggable({
    el: $(".item"),
    group: "items"
});
```

### Events
A draggable object will emit the following events:

#### drag.start
This is triggered when a draggable element is clicked to begin a drag and drop operation.

Typically, this event is used to create a proxy element that will move with the mouse throughout the drag and drop operation.

```javascript
item.on("drag.start", function() {
    var el = this.getEl(), offset = el.offset();

    this.proxy = el.clone().css({
        position: "absolute",
        left: offset.left + "px",
        top: offset.top + "px"
    });

    $(document.body).append(this.proxy);
});
```

#### drag.move
This is triggered for every DOM mousemove event that takes place between the start and finish of the drag operation.

Typically, this event is used to move the proxy element to match the current drag position.

The position coordinates provided are always relative to the document in which the draggable element is within.

```javascript
item.on("drag.move", function(position) {
    var el = this.getEl(), offset = el.offset();

    this.proxy.css({
        left: position.dragX + "px",
        top: position.dragY + "px"
    });
});
```

#### drag.finish
This is triggered when a draggable element is dropped. This is fired regardless of whether there has been a *drag.drop* event.

Typically, this event is used to remove the proxy element that was added in response to the *drag.start* event.

```javascript
item.on("drag.finish", function() {
    this.proxy.remove();
    this.proxy = null;
});
```

## Droppable

A *droppable* object represents a DOM element that responds to having droppable elements dropped within their visible area. A *drag.drop* event is triggered when a draggable in the same interaction group is dropped on it.

To give an element the droppable behaviour, instantiate the Droppable object and pass in the element and an optional interaction group.

```javascript
var area = new Droppable({
    el: $(".area"),
    group: "items"
});
```

### Events
A draggable object will emit the following events:

#### drag.start
This is triggered when a draggable element in the same interaction group as the droppable starts to be dragged.

Typically, this event is used to apply a CSS class to the droppable element, inviting the user to drop the current draggable element on it.

```javascript
item.on("drag.start", function(dragging) {
    this.getEl().addClass("invite-drop");
});
```

#### drag.finish
This is triggered when a draggable element in the same interaction group as the droppable finishes being dragged.

Typically, this event is used to remove a CSS class from the droppable element.

```javascript
item.on("drag.finish", function(dragging) {
    this.getEl().removeClass("invite-drop");
});
```

#### drag.enter
This is triggered when a draggable element in the same interaction group as the droppable enters its visible area.

Typically, this event is used to apply a CSS class to the droppable element, indicating that it will accept the drop.

```javascript
item.on("drag.enter", function(dragging) {
    this.getEl().addClass("accept-drop");
});
```

#### drag.leave
This is triggered when a draggable element in the same interaction group as the droppable leaves its visible area.

Typically, this event is used to remove a CSS class from the droppable element, indicating that it is not longer within its visible area.

```javascript
item.on("drag.leave", function(dragging) {
    this.getEl().removeClass("accept-drop");
});
```

#### drag.drop
This is triggered when a draggable element in the same interaction group as the droppable is dropped on its visible area.

```javascript
item.on("drag.drop", function(dragging, payload) {
    list.addItem(payload.id);
});
```

## Scrollable

A *scrollable* object represents a DOM element that will automatically scroll up and down wben a draggable element is dragged near the top or bottom of its scroll area. This behaviour is typically given to an iframe. To give an element the droppable behaviour, instantiate the Scrollable object and pass in the element, and an optional distance or speed.

*distance* is the number of pixels from the top or bottom of the scroll area that will trigger the scroll. The default value is 20 pixels.

*speed* is the number of pixels that will be scrolled on every frame of the scroll animation. The default value is 10 pixels.


```javascript
new Scrollable({
    el: $(".workspace"),
    distance: 24,
    speed: 8
});
```

### Events
A scrollable object does not emit any events.

## Using iframes

If you need to support draggables or droppables in iframes then you need to make the engine aware of each iframe by calling the *addIframe* method.

```javascript
$(function() {
    Engine.start();
    Engine.addIframe($(".workspace"));
});
```

This will attach mousemove events to the iframe's document as well as the document in which the engine is being instantiated.

### Proxy Elements

If you want to drag and drop between iframes, you need to create a proxy element in the top-level document. The element is able to be positioned over the top of all iframes.

### Draggables Within iframes

You may want to constrain a draggable within an iframe, for example if the draggable only needs to interact with other elements in the iframe's document. To do this you need to provide the iframe when you create the draggable object.


```javascript
var icon = new Draggable({
    el: $("#icon-example"),
    group: "icons",
    iframe: $(".view")
});
```

### Droppables Within iframes

If a droppable element is within an iframe then you should always provide the iframe when you create the droppable object.

```javascript
var trash = new Droppable({
    el: $("#trash"),
    group: "files",
    iframe: $(".directory")
});
```
