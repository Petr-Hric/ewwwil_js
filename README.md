# ewwwil_js
JavaScript tools and widgets

## How to use joystick

You need to include these two .JS files into your project
```html
    <script type="text/javascript" src="ewwwil_js/utility/interaction/ewwwil_interaction_handler.js"></script>
    <script type="text/javascript" src="ewwwil_js/widgets/joystick/ewwwil_joystick.js"></script>
```

Example of joystick creation
```javascript
    js_left = new Joystick('js_left' /* joystick base element id */, 50 /* joystick radius */, true /* auto-reset */);
    js_left.outer.style.backgroundColor = 'rgb(255, 0, 0)';
    js_left.inner.style.backgroundColor = 'rgb(0, 255, 0)';
```

Also you need to create HTML element which will be used as joystick base
```html
    <div id="js_left" style="position:absolute; top:100px; left:100px;"></div>
```
