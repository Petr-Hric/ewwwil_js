/* Petr Hric - Ewwwil Copyright (c) 2020-20xx */

class InteractionHandler {
    _activeTouchList = [];
    _ihObserverList = [];

    constructor() {
        // Touch events
        // document.addEventListener("touchstart", this, { passive: false });
        // document.addEventListener("touchend", this, { passive: false });
        // document.addEventListener("touchcancel", this, { passive: false });
        // document.addEventListener("touchmove", this, { passive: false });
        // // Mouse events
        // document.addEventListener("mousedown", this, { passive: false });
        // document.addEventListener("mouseup", this, { passive: false });
        // document.addEventListener("mousemove", this, { passive: false });
    }

    error(message) {
        throw new Error("[IH - error] -> " + message);
    }

    handleEvent(evt) {
        if (0 === this._ihObserverList.length) {
            return;
        }

        switch (evt.type) {
            case "mousedown":
                this.insertTouch(99, evt.pageX, evt.pageY, evt.target);
                break;
            case "touchstart":
                for (let i = 0; i < evt.changedTouches.length; ++i) {
                    this.insertTouch(
                        evt.changedTouches[parseInt(i, 10)].identifier
                        , evt.changedTouches[parseInt(i, 10)].pageX
                        , evt.changedTouches[parseInt(i, 10)].pageY
                        , evt.changedTouches[parseInt(i, 10)].target);
                }
                break;
            case "mouseup":
                this.removeTouch(99);
                break;
            case "touchend":
                this.handleTouchEnd(evt);
                break;
            case "mousemove": {
                if (0 === this._activeTouchList.length) {
                    break;
                }

                const index = this.activeTouchIndex(99);
                if (parseInt(index, 10) >= 0) {
                    this._activeTouchList[parseInt(index, 10)]._x = evt.pageX;
                    this._activeTouchList[parseInt(index, 10)]._y = evt.pageY;

                    for (let o = 0; o < this._activeTouchList[parseInt(index, 10)]._atObserverList.length; ++o) {
                        this._activeTouchList[parseInt(index, 10)]._atObserverList[parseInt(o, 10)].handleInteraction(
                            "move", this._activeTouchList[parseInt(index, 10)]);
                    }
                }
            }
                break;
            case "touchmove":
                if (0 === this._activeTouchList.length) {
                    break;
                }

                for (let i = 0; i < evt.changedTouches.length; ++i) {
                    const index = this.activeTouchIndex(evt.changedTouches[parseInt(i, 10)].identifier);
                    if (parseInt(index, 10) >= 0) {
                        this._activeTouchList[parseInt(index, 10)]._x = evt.changedTouches[parseInt(index, 10)].pageX;
                        this._activeTouchList[parseInt(index, 10)]._y = evt.changedTouches[parseInt(index, 10)].pageY;

                        for (let o = 0; o < this._activeTouchList[parseInt(index, 10)]._atObserverList.length; ++o) {
                            this._activeTouchList[parseInt(index, 10)]._atObserverList[parseInt(o, 10)].handleInteraction(
                                "move", this._activeTouchList[parseInt(index, 10)]);
                        }
                    }
                }
                break;
            case "touchcancel":
                this.handleTouchEnd(evt);
                break;
            default:
                break;
        }
    }

    observerIndex(target /* observer's target element id */) {
        for (let i = 0; i < this._ihObserverList.length; ++i) {
            if (this._ihObserverList[parseInt(i, 10)]._id === target.id) {
                return i;
            }
        }
        return -1;
    }

    activeTouchIndex(touchId) {
        for (let i = 0; i < this._activeTouchList.length; ++i) {
            if (this._activeTouchList[parseInt(i, 10)]._touchId === touchId) {
                return i;
            }
        }

        this.error("Could not find touch " + touchId);

        return -1;
    }

    handleTouchEnd(evt) {
        for (let i = 0; i < evt.changedTouches.length; ++i) {
            this.removeTouch(evt.changedTouches[parseInt(i, 10)].identifier);
        }
    }

    insertTouch(touchId, x, y, target) {
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

        for (let o = 0; o < this._ihObserverList.length; ++o) {
            if (this._ihObserverList[parseInt(o, 10)]._id
                === this._activeTouchList[this._activeTouchList.length - 1]._target.id) {
                this._activeTouchList[this._activeTouchList.length - 1]._atObserverList.push(
                    this._ihObserverList[parseInt(o, 10)]._ihObserver.getThis);
            }
        }
    }

    removeTouch(touchId) {
        const index = this.activeTouchIndex(touchId);
        if (parseInt(index, 10) >= 0) {
            const length = this._activeTouchList[parseInt(index, 10)]._atObserverList.length;
            for (let o = 0; o < length; ++o) {
                this._activeTouchList[parseInt(index, 10)]._atObserverList[parseInt(o, 10)].handleInteraction(
                    "up", this._activeTouchList[parseInt(index, 10)]);
            }

            this._activeTouchList.splice(parseInt(index, 10), 1);
        }
    }

    registerObserver(target /* target element id */, observer /* observer's this pointer */) {
        const index = this.observerIndex(target);
        if (-1 === parseInt(index, 10)) {
            const element = document.getElementById(target.id);
            if (null === element) {
                this.error("Could not find observer's target element");
            }

            // Touch events
            element.addEventListener("touchstart", this, { passive: false });
            element.addEventListener("touchend", this, { passive: false });
            element.addEventListener("touchcancel", this, { passive: false });
            element.addEventListener("touchmove", this, { passive: false });
            // Mouse events
            element.addEventListener("mousedown", this, { passive: false });
            element.addEventListener("mouseup", this, { passive: false });
            element.addEventListener("mousemove", this, { passive: false });

            this._ihObserverList.push({ _id: target.id, _ihObserver: observer.getThis });
        } else {
            this.error("Observer already registered");
        }
    }

    unRegisterObserver(target) {
        const index = this.observerIndex(target);
        if (parseInt(index, 10) >= 0) {
            const element = document.getElementById(target.id);
            if (null === element) {
                this.error("Could not find observer's target element");
            }

            // Touch events
            element.removeEventListener("touchstart", this);
            element.removeEventListener("touchend", this);
            element.removeEventListener("touchcancel", this);
            element.removeEventListener("touchmove", this);
            // Mouse events
            element.removeEventListener("mousedown", this);
            element.removeEventListener("mouseup", this);
            element.removeEventListener("mousemove", this);

            this._ihObserverList.splice(parseInt(index, 10), 1);
        } else {
            this.error("Observer not registered");
        }
    }
}
