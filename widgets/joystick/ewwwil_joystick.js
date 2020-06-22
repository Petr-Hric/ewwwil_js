/* Petr Hric - Ewwwil Copyright (c) 2020-20xx */

class Joystick {
    _positionProp = 'fixed';
    _autoReset;
    _radius;
    _centerX;
    _centerY;
    _x;
    _y;
    _lastPosX = 0;
    _lastPosY = 0;
    _offsetX = 0;
    _offsetY = 0;
    _distance = 0;
    _blockXAxis = false;
    _blockYAxis = false;

    constructor(id, x, y, radius, autoReset, zindex = 1, joystickSizeRatio = 0.5) {
        this._autoReset = autoReset;
        this._radius = radius;
        this._centerX = x + this._radius;
        this._centerY = y + this._radius;

        var jsOuter = document.getElementById(id);
        if (null == jsOuter) {
            console.log('[error]: Could not find joystick ' + id);
            return;
        }

        // Outer part style
        jsOuter.style.width = (this._radius * 2) + 'px';
        jsOuter.style.height = (this._radius * 2) + 'px';
        jsOuter.style.zindex = zindex;
        jsOuter.style.position = this._positionProp;
        jsOuter.style.left = x + 'px';
        jsOuter.style.top = y + 'px';
        jsOuter.style.borderRadius = '50%';
        jsOuter.style.backgroundColor = 'rgb(255, 0, 0)';

        // Create inner part
        jsOuter.innerHTML = "<div id='" + id + "_inner'/>";

        if (null == (this._jsInner = jsOuter.querySelector('#' + id + '_inner'))) {
            console.log('[error]: Could not find ' + id + '_inner');
        }

        // Calc inner part radius
        this._innerRadius = (this._radius * joystickSizeRatio);

        // Set inner part initial position
        if ('fixed' == this._positionProp) {
            this._x = this._centerX;
            this._y = this._centerY;
        } else {
            this._x = this._radius;
            this._y = this._radius;
        }

        // Inner part style
        this._jsInner.style.width = (this._innerRadius * 2) + 'px';
        this._jsInner.style.height = (this._innerRadius * 2) + 'px';
        this._jsInner.style.zindex = zindex + 1;
        this._jsInner.style.position = this._positionProp;
        this._jsInner.style.borderRadius = '50%';
        this._jsInner.style.backgroundColor = 'rgb(0, 255, 0)';

        // Register for interaction callback
        interactionHandler.registerObserver(this._jsInner, this);

        this.updateUI();
    }

    get getThis() {
        return this;
    }

    get getDistance() {
        return this._distance;
    }

    get getXCoord() {
        return this._lastPosX;
    }

    get getYCoord() {
        return this._lastPosY;
    }

    blockXAxis(block) {
        if (typeof (block) != "boolean") {
            console.log('[error]: Invalid argument type');
            return;
        }
        this._blockXAxis = block;
    }

    blockYAxis(block) {
        if (typeof (block) != "boolean") {
            console.log('[error]: Invalid argument type');
            return;
        }
        this._blockYAxis = block;
    }

    reset() {
        if ('fixed' == this._positionProp) {
            this._x = this._centerX;
            this._y = this._centerY;
        } else {
            this._x = this._radius;
            this._y = this._radius;
        }

        this._distance = 0;

        this._offsetX = 0;
        this._offsetY = 0;

        this.updateUI();
    }

    updateUI() {
        this._jsInner.style.left = (this._x - this._innerRadius) + 'px';
        this._jsInner.style.top = (this._y - this._innerRadius) + 'px';
    }

    handleInteraction(type, interactionData) {
        switch (type) {
            case 'move':
                if (!this._blockXAxis) {
                    this._lastPosX = this._offsetX + (interactionData._x - interactionData._startX);
                }

                if (!this._blockYAxis) {
                    this._lastPosY = this._offsetY + (interactionData._y - interactionData._startY);
                }

                this._distance = Math.sqrt(this._lastPosX * this._lastPosX + this._lastPosY * this._lastPosY);
                if (this._distance > this._radius) {
                    var ratio = this._radius / this._distance;
                    this._lastPosX *= ratio;
                    this._lastPosY *= ratio;
                    this._distance = this._radius;
                }

                if ('fixed' == this._positionProp) {
                    this._x = this._centerX + this._lastPosX;
                    this._y = this._centerY + this._lastPosY;
                } else {
                    this._x = this._radius + this._lastPosX;
                    this._y = this._radius + this._lastPosY;
                }

                this.updateUI();

                break;
            case 'up':
                if (this._autoReset) {
                    this.reset();
                } else {
                    this._offsetX = this._lastPosX;
                    this._offsetY = this._lastPosY;
                }
                break;
        }
    }
};
