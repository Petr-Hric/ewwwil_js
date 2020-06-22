/* Petr Hric - Ewwwil Copyright (c) 2020-20xx */

class InteractionHandler {
    _activeTouchList = [];
    _ihObserverList = [];
    _debug = false;

    constructor() {
        // Touch events
        document.addEventListener("touchstart", this, false);
        document.addEventListener("touchend", this, false);
        document.addEventListener("touchcancel", this, false);
        document.addEventListener("touchmove", this, false);
        // Mouse events
        document.addEventListener("mousedown", this, false);
        document.addEventListener("mouseup", this, false);
        document.addEventListener("mousemove", this, false);
    }

    DEBUG(message) {
        if (!this._debug) {
            return;
        }
        console.log("[IH - debug] -> " + message);
    }

    ERROR(message) {
        console.log(new Error("[IH - error] -> " + message));
    }

    handleEvent(evt) {
        this.DEBUG("[handleEvent]: " + evt.type);

        switch (evt.type) {
            case "mousedown":
            case "touchstart":
                this.handleStart(evt);
                break;
            case "mouseup":
            case "touchend":
                this.handleEnd(evt);
                break;
            case "mousemove":
            case "touchmove":
                this.handleMove(evt);
                break;
            case "touchcancel":
                this.handleCancel(evt);
                break;
            default:
                break;
        }
    }

    activeTouchIndex(touchId) {
        for (var i = 0; i < this._activeTouchList.length; ++i) {
            if (this._activeTouchList[i]._touchId === touchId) {
                return i;
            }
        }

        this.ERROR("Could not find touch " + touchId);

        return -1;
    }

    insertTouch(touchId, x, y, target) {
        this.DEBUG("[insertTouch]: {target: " + target.id + "}");

        this._activeTouchList.push(
            {
                _touchId: touchId
                , _startX: x
                , _startY: y
                , _x: x
                , _y: y
                , _target: target
                , _atObserverList: []
            }
        );

        for (var o = 0; o < this._ihObserverList.length; ++o) {
            if (this._ihObserverList[o]._id
                === this._activeTouchList[this._activeTouchList.length - 1]._target.id) {
                this._activeTouchList[this._activeTouchList.length - 1]._atObserverList.push(
                    this._ihObserverList[o]._ihObserver.getThis);
            }
        }
    }

    removeTouch(touchId) {
        this.DEBUG("[removeTouch]: {touch id: " + touchId + "}");

        var index = this.activeTouchIndex(touchId);
        if (index >= 0) {
            for (var o = 0; o < this._activeTouchList[index]._atObserverList.length; ++o) {
                this._activeTouchList[index]._atObserverList[o].handleInteraction(
                    "up", this._activeTouchList[index]);
            }

            this._activeTouchList.splice(index, 1);
        }
    }

    handleStart(evt) {
        this.DEBUG("[handleStart]: " + evt.type);

        evt.preventDefault();

        if ("mousedown" === evt.type) {
            this.insertTouch(99, evt.pageX, evt.pageY, evt.target);
        } else {
            for (var i = 0; i < evt.changedTouches.length; ++i) {
                this.insertTouch(
                    evt.changedTouches[i].identifier
                    , evt.changedTouches[i].pageXOffset
                    , evt.changedTouches[i].pageYOffset
                    , evt.changedTouches[i].target);
            }
        }
    }

    handleEnd(evt) {
        this.DEBUG("[handleEnd]: " + evt.type);

        evt.preventDefault();

        if ("mouseup" === evt.type) {
            this.removeTouch(99);
        } else {
            for (var i = 0; i < evt.changedTouches.length; ++i) {
                this.removeTouch(evt.changedTouches[i].identifier);
            }
        }
    }

    handleCancel(evt) {
        this.DEBUG("[handleCancel]: " + evt.type);

        this.handleEnd(evt);
    }

    handleMove(evt) {
        if (this._activeTouchList.length === 0) {
            return;
        }

        this.DEBUG("[handleMove]: " + evt.type);

        if (evt.type === "mousemove") {
            var index = this.activeTouchIndex(99);
            if (index >= 0) {
                this._activeTouchList[index]._x = evt.pageX;
                this._activeTouchList[index]._y = evt.pageY;

                for (var o = 0; o < this._activeTouchList[index]._atObserverList.length; ++o) {
                    this._activeTouchList[index]._atObserverList[o].handleInteraction(
                        "move", this._activeTouchList[index]);
                }
            }
        } else {
            for (var i = 0; i < evt.changedTouches.length; ++i) {
                var index = this.activeTouchIndex(evt.changedTouches[i].identifier);
                if (index >= 0) {
                    this._activeTouchList[index]._x = evt.changedTouches[i].pageXOffset;
                    this._activeTouchList[index]._y = evt.changedTouches[i].pageYOffset;

                    for (var o = 0; o < this._activeTouchList[index]._atObserverList.length; ++o) {
                        this._activeTouchList[index]._atObserverList[o].handleInteraction(
                            "move", this._activeTouchList[index]);
                    }
                }
            }
        }
    }

    registerObserver(target /* target element id */, observer /* observer"s this pointer */) {
        this.DEBUG("[registerObserver]: " + target.id);

        var index = this.observerIndex(target);
        if (-1 === index) {
            this._ihObserverList.push({ _id: target.id, _ihObserver: observer.getThis });
        } else {
            this.ERROR("Observer already registered");
        }
    }

    unRegisterObserver(target) {
        this.DEBUG("[unRegisterObserver]: " + target.id);

        var index = observerIndex(target);
        if (index >= 0) {
            this._ihObserverList.splice(index, 1);
        } else {
            this.ERROR("Observer not registered");
        }
    }

    observerIndex(target /* observer"s target element id */) {
        this.DEBUG("[observerIndex]: " + target.id);

        for (var i = 0; i < this._ihObserverList.length; ++i) {
            if (this._ihObserverList[i]._id === target.id) {
                return i;
            }
        }
        return -1;
    }
};
