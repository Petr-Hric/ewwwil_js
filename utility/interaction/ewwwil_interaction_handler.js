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

    debug(message) {
        if (!this._debug) {
            return;
        }
        Console.log("[IH - debug] -> " + message);
    }

    error(message) {
        throw new Error("[IH - error] -> " + message);
    }

    handleEvent(evt) {
        this.debug("[handleEvent]: " + evt.type);

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

    observerIndex(target /* observer"s target element id */) {
        this.debug("[observerIndex]: " + target.id);

        for (var i = 0; i < this._ihObserverList.length; ++i) {
            if (this._ihObserverList[parseInt(i)]._id === target.id) {
                return i;
            }
        }
        return -1;
    }

    activeTouchIndex(touchId) {
        for (var i = 0; i < this._activeTouchList.length; ++i) {
            if (this._activeTouchList[i]._touchId === touchId) {
                return i;
            }
        }

        this.error("Could not find touch " + touchId);

        return -1;
    }

    insertTouch(touchId, x, y, target) {
        this.debug("[insertTouch]: {target: " + target.id + "}");

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
                    this._ihObserverList[parseInt(o, 10)]._ihObserver.getThis);
            }
        }
    }

    removeTouch(touchId) {
        this.debug("[removeTouch]: {touch id: " + touchId + "}");

        var o;

        var index = this.activeTouchIndex(touchId);
        if (index >= 0) {
            for (o = 0; o < this._activeTouchList[index]._atObserverList.length; ++o) {
                this._activeTouchList[parseInt(index, 10)]._atObserverList[o].handleInteraction(
                    "up", this._activeTouchList[parseInt(index, 10)]);
            }

            this._activeTouchList.splice(index, 1);
        }
    }

    handleStart(evt) {
        this.debug("[handleStart]: " + evt.type);

        var i;

        evt.preventDefault();

        if ("mousedown" === evt.type) {
            this.insertTouch(99, evt.pageX, evt.pageY, evt.target);
        } else {
            for (i = 0; i < evt.changedTouches.length; ++i) {
                this.insertTouch(
                    evt.changedTouches[parseInt(i, 10)].identifier
                    , evt.changedTouches[parseInt(i, 10)].pageXOffset
                    , evt.changedTouches[parseInt(i, 10)].pageYOffset
                    , evt.changedTouches[parseInt(i, 10)].target);
            }
        }
    }

    handleEnd(evt) {
        this.debug("[handleEnd]: " + evt.type);

        var i;

        evt.preventDefault();

        if ("mouseup" === evt.type) {
            this.removeTouch(99);
        } else {
            for (i = 0; i < evt.changedTouches.length; ++i) {
                this.removeTouch(evt.changedTouches[parseInt(i, 10)].identifier);
            }
        }
    }

    handleCancel(evt) {
        this.debug("[handleCancel]: " + evt.type);

        this.handleEnd(evt);
    }

    handleMove(evt) {
        var index;
        var o, i;

        if (this._activeTouchList.length === 0) {
            return;
        }

        this.debug("[handleMove]: " + evt.type);

        if (evt.type === "mousemove") {
            index = this.activeTouchIndex(99);
            if (index >= 0) {
                this._activeTouchList[parseInt(index, 10)]._x = evt.pageX;
                this._activeTouchList[parseInt(index, 10)]._y = evt.pageY;

                for (o = 0; o < this._activeTouchList[index]._atObserverList.length; ++o) {
                    this._activeTouchList[parseInt(index, 10)]._atObserverList[parseInt(o, 10)].handleInteraction(
                        "move", this._activeTouchList[parseInt(index, 10)]);
                }
            }
        } else {
            for (i = 0; i < evt.changedTouches.length; ++i) {
                index = this.activeTouchIndex(evt.changedTouches[i].identifier);
                if (index >= 0) {
                    this._activeTouchList[parseInt(index, 10)]._x = evt.changedTouches[parseInt(index, 10)].pageXOffset;
                    this._activeTouchList[parseInt(index, 10)]._y = evt.changedTouches[parseInt(index, 10)].pageYOffset;

                    for (o = 0; o < this._activeTouchList[index]._atObserverList.length; ++o) {
                        this._activeTouchList[parseInt(index, 10)]._atObserverList[parseInt(o, 10)].handleInteraction(
                            "move", this._activeTouchList[parseInt(index, 10)]);
                    }
                }
            }
        }
    }

    registerObserver(target /* target element id */, observer /* observer"s this pointer */) {
        this.debug("[registerObserver]: " + target.id);

        var index = this.observerIndex(target);
        if (-1 === index) {
            this._ihObserverList.push({ _id: target.id, _ihObserver: observer.getThis });
        } else {
            this.error("Observer already registered");
        }
    }

    unRegisterObserver(target) {
        this.debug("[unRegisterObserver]: " + target.id);

        var index = observerIndex(target);
        if (index >= 0) {
            this._ihObserverList.splice(index, 1);
        } else {
            this.error("Observer not registered");
        }
    }
}
