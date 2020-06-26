/* Petr Hric - Ewwwil Copyright (c) 2020-20xx */

class IHObserver {
    constructor(id, ihObserver) {
        this._id = id;
        this._ihObserver = ihObserver;
    }

    _id;
    _ihObserver;
}

class IHActiveTouch {
    constructor() {}

    _touchId;
    _startX;
    _startY;
    _x;
    _y;
    _target;
    _atObserverList;
}

class InteractionHandler {
    _activeTouchList = [];
    _ihObserverList = [];

    error(message) {
        throw new Error("[IH - error]: " + message);
    }

    constructor() {
        // Touch events:
        document.addEventListener("touchmove", this);
        document.addEventListener("touchend", this);
        document.addEventListener("touchcancel", this);
        // Mouse events:
        document.addEventListener("mousemove", this);
        document.addEventListener("mouseup", this);
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

    handleEvent(evt) {
        if (0 === this._ihObserverList.length) {
            return;
        }

        switch (evt.type) {
            case "mousedown":
                evt.preventDefault();
                for (let o = 0; o < this._ihObserverList.length; ++o) {
                    if (this._ihObserverList[o]._target == evt.target.id) {
                        this.insertTouch(99, evt.pageX, evt.pageY, evt.target);
                        break;
                    }
                }
                break;
            case "touchstart":
                evt.preventDefault();

                for (let i = 0; i < evt.changedTouches.length; ++i) {
                    this.insertTouch(
                        evt.changedTouches[parseInt(i, 10)].identifier
                        , evt.changedTouches[parseInt(i, 10)].pageX
                        , evt.changedTouches[parseInt(i, 10)].pageY
                        , evt.changedTouches[parseInt(i, 10)].target);
                }
                break;
            case "mouseup":
                evt.preventDefault();

                this.removeTouch(99);
                break;
            case "mousemove": {
                evt.preventDefault();

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
                evt.preventDefault();

                if (0 === this._activeTouchList.length) {
                    break;
                }

                for (let i = 0; i < evt.changedTouches.length; ++i) {
                    const index = this.activeTouchIndex(evt.changedTouches[parseInt(i, 10)].identifier);
                    if (parseInt(index, 10) >= 0) {
                        this._activeTouchList[parseInt(index, 10)]._x = evt.changedTouches[parseInt(i, 10)].pageX;
                        this._activeTouchList[parseInt(index, 10)]._y = evt.changedTouches[parseInt(i, 10)].pageY;

                        for (let o = 0; o < this._activeTouchList[parseInt(index, 10)]._atObserverList.length; ++o) {
                            this._activeTouchList[parseInt(index, 10)]._atObserverList[parseInt(o, 10)].handleInteraction(
                                "move", this._activeTouchList[parseInt(index, 10)]);
                        }
                    }
                }
                break;
            case "touchend":
            case "touchcancel":
                evt.preventDefault();

                for (let i = 0; i < evt.changedTouches.length; ++i) {
                    this.removeTouch(evt.changedTouches[parseInt(i, 10)].identifier);
                }
                break;
            default:
                break;
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
            element.addEventListener("touchstart", this);
            // Mouse events
            element.addEventListener("mousedown", this);

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

            // Touch events:
            element.removeEventListener("touchstart", this);
            // Mouse events:
            element.removeEventListener("mousedown", this);

            this._ihObserverList.splice(parseInt(index, 10), 1);
        } else {
            this.error("Observer not registered");
        }
    }
}
