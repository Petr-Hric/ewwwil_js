# ewwwil_js

[![Codacy Badge](https://api.codacy.com/project/badge/Grade/29fb93f11f5c421d81fe594e2b8b4a50)](https://app.codacy.com/manual/Petr-Hric/ewwwil_js?utm_source=github.com&utm_medium=referral&utm_content=Petr-Hric/ewwwil_js&utm_campaign=Badge_Grade_Dashboard)

JavaScript tools and widgets

## How to use joystick

You need to include these two .JS files into your project
```html
    <script type="text/javascript" src="ewwwil_js/utility/interaction/ewwwil_interaction_handler.js"></script>
    <script type="text/javascript" src="ewwwil_js/widgets/joystick/ewwwil_joystick.js"></script>
```

Example of joystick creation
```javascript
    var interactionHandler = new InteractionHandler();

    // Joystick(/* base element id */, /* base element radius */, /* auto-reset */, /* joystick size ratio (optional) */)
    joystick = new Joystick(interactionHandler, 'joystick_div', 50, true);
    joystick.outer.style.backgroundColor = 'rgb(255, 0, 0)';
    joystick.inner.style.backgroundColor = 'rgb(0, 255, 0)';
```

Also you need to create HTML element which will be used as joystick base
```html
    <div id="joystick_div" style="position:absolute; top:100px; left:100px;"></div>
```
