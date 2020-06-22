/* Petr Hric - Ewwwil Copyright (c) 2020-20xx */

class Joystick {
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

    constructor(id, radius, autoReset, joystickSizeRatio = 0.5) {
        this._jsOuter = document.getElementById(id);
        if (null === this._jsOuter) {
            console.log("[error]: Could not find joystick " + id);
            return;
        }

        this._autoReset = autoReset;
        this._radius = radius;

        // Outer part style
        this._jsOuter.style.width = (this._radius * 2) + "px";
        this._jsOuter.style.height = (this._radius * 2) + "px";
        this._jsOuter.style.borderRadius = "50%";

        this._centerX = this._jsOuter.offsetLeft + this._jsOuter.offsetWidth / 2;
        this._centerY = this._jsOuter.offsetTop + this._jsOuter.offsetHeight / 2;

        // Create inner part
        this._jsOuter.innerHTML = "<div id='" + id + "_inner'/>";

        if (null === (this._jsInner = this._jsOuter.querySelector("#" + id + "_inner"))) {
            console.log("[error]: Could not find " + id + "_inner");
        }

        // Calc inner part radius
        this._innerRadius = (this._radius * joystickSizeRatio);

        // Set inner part initial position
        if ("fixed" === this._jsOuter.style.position) {
            this._x = this._centerX;
            this._y = this._centerY;
        } else {
            this._x = this._jsOuter.offsetWidth / 2;
            this._y = this._jsOuter.offsetHeight / 2;
        }

        // Inner part style
        this._jsInner.style.width = (this._innerRadius * 2) + "px";
        this._jsInner.style.height = (this._innerRadius * 2) + "px";
        this._jsInner.style.zindex = this._jsOuter.zindex + 1;
        this._jsInner.style.position = this._jsOuter.style.position;
        this._jsInner.style.borderRadius = "50%";

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

    get outer() {
        return this._jsOuter;
    }

    get inner() {
        return this._jsInner;
    }

    blockXAxis(block) {
        if (typeof (block) !== "boolean") {
            console.log("[error]: Invalid argument type");
            return;
        }
        this._blockXAxis = block;
    }

    blockYAxis(block) {
        if (typeof (block) !== "boolean") {
            console.log("[error]: Invalid argument type");
            return;
        }
        this._blockYAxis = block;
    }

    reset() {
        if ("fixed" === this._jsOuter.style.position) {
            this._x = this._centerX;
            this._y = this._centerY;
        } else {
            this._x = this._jsOuter.offsetWidth / 2;
            this._y = this._jsOuter.offsetHeight / 2;
        }

        this._distance = 0;

        this._offsetX = 0;
        this._offsetY = 0;

        this.updateUI();
    }

    updateUI() {
        this._jsInner.style.left = (this._x - this._innerRadius) + "px";
        this._jsInner.style.top = (this._y - this._innerRadius) + "px";
    }

    handleInteraction(type, interactionData) {
        switch (type) {
            case "move":
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

                if ("fixed" === this._jsOuter.style.position) {
                    this._x = this._centerX + this._lastPosX;
                    this._y = this._centerY + this._lastPosY;
                } else {
                    this._x = this._jsOuter.offsetWidth / 2 + this._lastPosX;
                    this._y = this._jsOuter.offsetHeight / 2 + this._lastPosY;
                }

                this.updateUI();

                break;
            case "up":
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
