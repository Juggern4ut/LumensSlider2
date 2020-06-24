var Lumens = /** @class */ (function () {
    /**
     * Will setup the DOM and EventListeners
     * for the use of the slider
     * @param selector The Element containing the slides
     * @param options Used to pass custom options to the slider
     * @param logWarnings If true, the slider may log errors and warnings to the console
     */
    function Lumens(selector, options, logWarnings) {
        if (options === void 0) { options = {}; }
        this.currentPosX = 0;
        this.currentPage = 0;
        this.wasDragged = false;
        this.inheritOptions = true;
        if (typeof selector === "string") {
            var container = document.querySelector(selector);
            if (!container)
                return null;
            this.container = container;
        }
        else if (selector instanceof HTMLElement) {
            this.container = selector;
        }
        if (!options.responsive) {
            options.responsive = [];
        }
        if (options.inheritOptions === false || options.inheritOptions === true) {
            this.inheritOptions = options.inheritOptions;
        }
        this.logWarnings = logWarnings;
        this.initialOptions = options;
        this.setOptions(options);
        this.createWrapper();
        this.styleSlides();
        this.addDragListeners();
        this.responsiveHandler();
        if (this.options.loop) {
            this.createCloneNodes();
        }
        if (this.currentPage !== 0) {
            this.gotoPage(this.currentPage, false);
        }
        this.options.onInit(this);
        this.startAutoplayInterval();
    }
    /**
     * Will define the default settings
     * and overwrite them with the passed
     * options
     * @author {Lukas Meier}
     * @param options The custom options to pass
     * @returns {void}
     */
    Lumens.prototype.setOptions = function (options, inherit) {
        var _this = this;
        this.options = {};
        var defaultOptions = {
            slidesPerPage: 1,
            preventSelection: true,
            freeScroll: false,
            animationSpeed: 200,
            responsive: [],
            inheritOptions: true,
            loop: false,
            variableHeight: false,
            startingPage: 0,
            autoplay: false,
            draggable: true,
            preventTouchDrag: true,
            dragThreshold: 50,
            arrowKeys: false,
            onInit: function () { },
            onDragging: function () { },
            onStopDragging: function () { },
            onAnimating: function () { },
            onFinishAnimating: function () { },
            onChangeResponsive: function () { },
            onSlideChange: function () { },
            onSlideChanged: function () { },
            onDestroy: function () { }
        };
        Object.keys(defaultOptions).forEach(function (key) {
            if (key === "responsive" || key === "inheritOptions")
                return false;
            if (options[key] !== undefined && options[key] !== null) {
                _this.options[key] = options[key];
            }
            else {
                if (_this.inheritOptions) {
                    if (_this.initialOptions[key] !== undefined &&
                        _this.initialOptions[key] !== null) {
                        _this.options[key] = _this.initialOptions[key];
                    }
                    else {
                        _this.options[key] = defaultOptions[key];
                    }
                }
                else {
                    _this.options[key] = defaultOptions[key];
                }
            }
        });
    };
    /**
     * Will start the autoplay interval
     * @returns {void}
     */
    Lumens.prototype.startAutoplayInterval = function () {
        var _this = this;
        if (this.options.autoplay) {
            clearInterval(this.autoplayInterval);
            this.autoplayInterval = window.setInterval(function () {
                var targetPage;
                if (_this.options.loop) {
                    targetPage = _this.currentPage + 1;
                }
                else {
                    targetPage =
                        _this.currentPage + 1 + _this.options.slidesPerPage >
                            _this.slides.length
                            ? 0
                            : _this.currentPage + 1;
                }
                _this.gotoPage(targetPage);
            }, this.options.autoplay);
        }
    };
    /**
     * Will stop the autoplay interval
     * @returns {void}
     */
    Lumens.prototype.stopAutoplayInterval = function () {
        clearInterval(this.autoplayInterval);
    };
    /**
     * Updates the current slider settings based
     * on the current width of the window
     * @returns {void}
     */
    Lumens.prototype.responsiveHandler = function () {
        var _this = this;
        var previousResponsiveIndex = undefined;
        var currentResponsiveIndex;
        var resizeFunction = function () {
            currentResponsiveIndex = undefined;
            _this.initialOptions.responsive.forEach(function (res, index) {
                if (window.innerWidth < res.width) {
                    currentResponsiveIndex = index;
                }
            });
            if (previousResponsiveIndex !== currentResponsiveIndex) {
                previousResponsiveIndex = currentResponsiveIndex;
                if (currentResponsiveIndex !== undefined) {
                    _this.setOptions(_this.initialOptions.responsive[currentResponsiveIndex].options);
                }
                else {
                    _this.setOptions(_this.initialOptions);
                }
                _this.styleSlides();
                _this.options.onChangeResponsive(_this);
            }
            _this.gotoPage(_this.currentPage, false);
        };
        //Call function on init and resize
        resizeFunction();
        window.addEventListener("resize", resizeFunction);
    };
    /**
     * Will create a wrapper and fill
     * the slides into it
     * @returns {void}
     */
    Lumens.prototype.createWrapper = function () {
        this.wrapper = document.createElement("div");
        var loopLength = this.container.children.length;
        for (var i = 0; i < loopLength; i++) {
            var slide = this.container.children[0];
            this.wrapper.appendChild(slide);
        }
        this.container.appendChild(this.wrapper);
        this.container.style.overflow = "hidden";
        this.wrapper.style.whiteSpace = "nowrap";
        this.wrapper.style.height = "100%";
        this.wrapper.style.transition = "height 200ms ease-out";
        this.wrapper.style.position = "relative";
        this.wrapper.style.right = "0";
        this.slides = this.wrapper.children;
    };
    /**
     * Creates clones of the last and first slides
     * (depending on slidesPerPage) and appends them
     * to the start end end of the slider. This is
     * used for the infiniteLoop option
     * @returns {void}
     */
    Lumens.prototype.createCloneNodes = function () {
        var _this = this;
        var startClones = [];
        var endClones = [];
        for (var i = 0; i < this.options.slidesPerPage; i++) {
            var startCloneNode = this.slides[i].cloneNode(true);
            startCloneNode.classList.add("lumens__clone");
            startClones.push(startCloneNode);
            var endIndex = this.slides.length - 1 - i;
            var endCloneNode = this.slides[endIndex].cloneNode(true);
            endCloneNode.classList.add("lumens__clone");
            endClones.push(endCloneNode);
        }
        startClones.forEach(function (clone) {
            _this.wrapper.append(clone);
        });
        endClones.forEach(function (clone) {
            _this.wrapper.prepend(clone);
        });
        this.currentPage += this.options.slidesPerPage;
    };
    /**
     * Will append certain needed styles to the
     * slides in the slideshow
     * @returns {void}
     */
    Lumens.prototype.styleSlides = function () {
        for (var i = 0; i < this.slides.length; i++) {
            var slide = this.slides[i];
            var calculatedProperties = window.getComputedStyle(slide, null);
            var marginTotal = parseFloat(calculatedProperties.getPropertyValue("margin-right")) +
                parseFloat(calculatedProperties.getPropertyValue("margin-left"));
            var newWidth = "calc((100% / " + this.options.slidesPerPage + ") - " + marginTotal + "px)";
            slide.style.display = "inline-block";
            slide.style.boxSizing = "border-box";
            slide.style.verticalAlign = "top";
            slide.style.whiteSpace = "normal";
            slide.style.width = newWidth;
            if (this.options.preventSelection) {
                slide.style.userSelect = "none";
            }
        }
    };
    /**
     * Will add all the needed event listeners
     * to the slideshow to allow dragging it around
     * @returns {void}
     */
    Lumens.prototype.addDragListeners = function () {
        var _this = this;
        var isDragging = false;
        var initialX = 0;
        var deltaX = 0;
        var hasFocus = false;
        var hasDragged = false;
        var dragDelta;
        var startDragFunction = function (e) {
            if (!_this.options.draggable)
                return false;
            _this.stopAutoplayInterval();
            hasFocus = true;
            _this.wasDragged = false;
            if (e.type === "touchstart") {
                initialX = e.targetTouches[0].pageX;
            }
            else {
                initialX = e.pageX;
            }
            isDragging = true;
            _this.transition(false);
        };
        var moveDragFunction = function (e) {
            if (!isDragging || !_this.options.draggable)
                return false;
            if (e.type === "touchmove") {
                if (_this.options.preventTouchDrag) {
                    e.preventDefault();
                }
                dragDelta = initialX - e.targetTouches[0].pageX;
            }
            else {
                dragDelta = initialX - e.pageX;
            }
            deltaX = dragDelta + _this.currentPosX;
            hasDragged = true;
            _this.wasDragged = Math.abs(dragDelta) > _this.options.dragThreshold;
            _this.wrapper.style.right = deltaX + "px";
            _this.options.onDragging(_this);
        };
        var releaseDragFunction = function (e) {
            if (!hasFocus || !_this.options.draggable)
                return false;
            hasFocus = false;
            isDragging = false;
            _this.startAutoplayInterval();
            _this.currentPosX = hasDragged ? deltaX : _this.currentPosX;
            hasDragged = false;
            _this.options.onStopDragging(_this);
            var currentSlide = _this.slides[_this.currentPage];
            if (dragDelta > _this.options.dragThreshold &&
                dragDelta < _this.getSlideWidth(currentSlide) / 2 &&
                _this.currentPage < _this.slides.length - _this.options.slidesPerPage &&
                _this.options.freeScroll === false) {
                _this.gotoPage(_this.currentPage + 1);
            }
            else if (dragDelta < _this.options.dragThreshold * -1 &&
                dragDelta > (_this.getSlideWidth(currentSlide) / 2) * -1 &&
                _this.currentPage > 0 &&
                _this.options.freeScroll === false) {
                _this.gotoPage(_this.currentPage - 1);
            }
            else {
                _this.validateAndCorrectDragPosition();
            }
        };
        document.addEventListener("mouseup", releaseDragFunction);
        document.addEventListener("touchend", releaseDragFunction);
        document.addEventListener("mousemove", moveDragFunction);
        document.addEventListener("touchmove", moveDragFunction, {
            passive: false
        });
        this.container.addEventListener("mousedown", startDragFunction);
        this.container.addEventListener("touchstart", startDragFunction);
    };
    /**
     * Will set the scrollposition of the
     * slideshow
     * @param offset The offset to set the slideshow to
     * @returns {void}
     */
    Lumens.prototype.setDragPosition = function (offset, animate, changedSlide) {
        var _this = this;
        if (changedSlide) {
            this.options.onSlideChange(this);
        }
        if (animate) {
            this.options.onAnimating(this);
            this.transition(true);
        }
        this.wrapper.style.right = offset + "px";
        if (animate) {
            clearTimeout(this.animationTimeout);
            this.animationTimeout = window.setTimeout(function () {
                _this.transition(false);
                _this.options.onFinishAnimating(_this);
                if (changedSlide) {
                    _this.options.onSlideChanged(_this);
                    _this.loopHandler();
                }
            }, this.options.animationSpeed);
        }
    };
    /**
     * Checks if the slide was scrolled to the very beginning
     * or the very end and jumps to the opposite end if the
     * infinite loop option is set
     * @returns {void}
     */
    Lumens.prototype.loopHandler = function () {
        var cp = this.currentPage;
        var loop = this.options.loop;
        if (cp === 0 && loop) {
            var endIndex = this.slides.length - this.options.slidesPerPage * 2;
            this.gotoPage(endIndex, false);
        }
        else if (cp === this.slides.length - this.options.slidesPerPage && loop) {
            var startIndex = this.options.slidesPerPage;
            this.gotoPage(startIndex, false);
        }
    };
    /**
     * Will enable or disable the transitions of the slideshow
     * based on the given parameter
     * @param enable Enables the transition if true, disables it otherwise
     */
    Lumens.prototype.transition = function (enable) {
        if (enable) {
            this.wrapper.style.transition = this.options.animationSpeed + "ms ease-out";
        }
        else {
            if (this.options.variableHeight) {
                this.wrapper.style.transition = "height " + this.options.animationSpeed + "ms ease-out";
            }
            else {
                this.wrapper.style.transition = "none";
            }
        }
    };
    /**
     * Will check if the current XPosition is
     * out of bounds and correct it, if so
     * @returns {void}
     */
    Lumens.prototype.validateAndCorrectDragPosition = function () {
        var initialPage = this.currentPage;
        var totalWidth = 0;
        var animate = false;
        for (var i = 0; i < this.slides.length - this.options.slidesPerPage; i++) {
            var slide = this.slides[i];
            totalWidth += this.getSlideWidth(slide);
        }
        if (this.currentPosX < 0) {
            this.currentPosX = 0;
            this.currentPage = 0;
            animate = true;
        }
        else if (this.currentPosX > totalWidth) {
            this.currentPosX = totalWidth;
            this.currentPage = this.slides.length - this.options.slidesPerPage;
            animate = true;
        }
        else if (this.options.freeScroll === false) {
            var closest = this.getClosestSlide(this.currentPosX);
            this.gotoPage(closest, true);
        }
        if (this.currentPosX <= 0 || this.currentPosX >= totalWidth) {
            var changedSlide = initialPage !== this.currentPage;
            this.setDragPosition(this.currentPosX, animate, changedSlide);
        }
    };
    /**
     * Will calculate the closest page to the
     * given parameter and jump to said page
     * @param posX The position to which the closest slide should be calculated
     * @returns {void}
     */
    Lumens.prototype.getClosestSlide = function (posX) {
        var slideCoordinates = [];
        var total = 0;
        for (var i = 0; i < this.slides.length; i++) {
            var slide = this.slides[i];
            slideCoordinates.push(total);
            total += this.getSlideWidth(slide);
        }
        var index = 0;
        slideCoordinates.reduce(function (p, n, i) {
            if (Math.abs(p) > Math.abs(n - posX)) {
                index = i;
            }
            return Math.abs(p) > Math.abs(n - posX) ? n - posX : p;
        }, Infinity) + posX;
        return index;
    };
    /**
     * Will return the exact calculated amount
     * of pixels a given slide takes on the screen
     * this includes the margin aswell
     * @param el The slide to calculate
     * @returns {number} The calculated width
     */
    Lumens.prototype.getSlideWidth = function (el) {
        var width = 0;
        var computed = window.getComputedStyle(el, null);
        width += parseFloat(computed.getPropertyValue("width"));
        width += parseFloat(computed.getPropertyValue("margin-right"));
        width += parseFloat(computed.getPropertyValue("margin-left"));
        return width;
    };
    /**
     * Sets the callbackfunction for onSlideChanged
     * @param callback The function to call for this event
     * @returns The current Slider
     */
    Lumens.prototype.onSlideChanged = function (callback) {
        this.options.onSlideChanged = callback;
        return this;
    };
    /**
     * Sets the callbackfunction for onDragging
     * @param callback The function to call for this event
     * @returns The current Slider
     */
    Lumens.prototype.onDragging = function (callback) {
        this.options.onDragging = callback;
        return this;
    };
    /**
     * Sets the callbackfunction for onStopDragging
     * @param callback The function to call for this event
     * @returns The current Slider
     */
    Lumens.prototype.onStopDragging = function (callback) {
        this.options.onStopDragging = callback;
        return this;
    };
    /**
     * Sets the callbackfunction for onAnimating
     * @param callback The function to call for this event
     * @returns The current Slider
     */
    Lumens.prototype.onAnimating = function (callback) {
        this.options.onAnimating = callback;
        return this;
    };
    /**
     * Sets the callbackfunction for onFinishAnimating
     * @param callback The function to call for this event
     * @returns The current Slider
     */
    Lumens.prototype.onFinishAnimating = function (callback) {
        this.options.onFinishAnimating = callback;
        return this;
    };
    /**
     * Sets the callbackfunction for onDestroy
     * @param callback The function to call for this event
     * @returns The current Slider
     */
    Lumens.prototype.onDestroy = function (callback) {
        this.options.onDestroy = callback;
        return this;
    };
    /**
     * Sets the callbackfunction for onInit
     * @param callback The function to call for this event
     * @returns The current Slider
     */
    Lumens.prototype.onInit = function (callback) {
        this.options.onInit = callback;
        return this;
    };
    /**
     * Sets the callbackfunction for onChangeResponsive
     * @param callback The function to call for this event
     * @returns The current Slider
     */
    Lumens.prototype.onChangeResponsive = function (callback) {
        this.options.onChangeResponsive = callback;
        return this;
    };
    /**
     * Sets the callbackfunction for onSlideChange
     * @param callback The function to call for this event
     * @returns The current Slider
     */
    Lumens.prototype.onSlideChange = function (callback) {
        this.options.onSlideChange = callback;
        return this;
    };
    /**
     * Will calculate the offset ot the
     * given page and scroll to it
     * @param page The page to go to (starting at 0)
     * @param animate If set to true, there will be a fluent change to the page instead of a instant one
     * @returns {boolean} Will return false if the given page doesn't exist
     */
    Lumens.prototype.gotoPage = function (page, animate) {
        if (animate === void 0) { animate = true; }
        if (page > this.slides.length - this.options.slidesPerPage) {
            page = this.slides.length - this.options.slidesPerPage;
        }
        var totalOffset = 0;
        for (var i = 0; i < page; i++) {
            var slide = this.slides[i];
            totalOffset += this.getSlideWidth(slide);
        }
        var changed = page !== this.currentPage;
        this.currentPosX = totalOffset;
        this.setDragPosition(totalOffset, animate, changed);
        this.currentPage = page;
        if (this.options.variableHeight) {
            var slide = this.slides[this.currentPage];
            this.wrapper.style.height = slide.offsetHeight + "px";
        }
        return true;
    };
    /**
     * Will advance the slideshow to the next slide.
     * If the last slide is reached, the slideshow will
     * either stop or go back to the beginning, based
     * on the given parameter
     * Alias: next
     * @param loopAround If set to true, the slideshow
     * will jump to the first slide if the last slide is surpassed
     * (Will not work if infinite loop is enabled)
     * @returns {number} The now active slide
     */
    Lumens.prototype.gotoNext = function (loopAround) {
        if (loopAround === void 0) { loopAround = false; }
        if (this.currentPage < this.slides.length - 1) {
            this.gotoPage(this.currentPage + 1);
        }
        else if (loopAround) {
            this.gotoPage(0);
        }
        return this.currentPage;
    };
    /**
     * Will revert the slideshow to the previous slide.
     * If the first slide is reached, the slideshow will
     * either stop or go to the final slide, based
     * on the given parameter.
     * Alias: previous, prev
     * @param loopAround If set to true, the slideshow
     * will jump to the last slide if the first slide is surpassed
     * (Will not work if infinite loop is enabled)
     * @returns {number} The now active slide
     */
    Lumens.prototype.gotoPrev = function (loopAround) {
        if (loopAround === void 0) { loopAround = false; }
        if (this.currentPage > 0) {
            this.gotoPage(this.currentPage - 1);
        }
        else if (loopAround) {
            this.gotoPage(this.slides.length - 1);
        }
        return this.currentPage;
    };
    /**
     * Will remove all styling and the wrapper to
     * restore the state before the slider was
     * initialized
     * @returns {void}
     */
    Lumens.prototype.destroy = function () {
        var slideAmount = this.slides.length;
        for (var i = 0; i < slideAmount; i++) {
            var slide = this.slides[0];
            slide.style.removeProperty("box-sizing");
            slide.style.removeProperty("width");
            slide.style.removeProperty("display");
            slide.style.removeProperty("user-select");
            this.wrapper.remove();
            this.container.append(slide);
        }
        var clones = this.container.querySelectorAll(".lumens__clone");
        clones.forEach(function (clone) { return clone.remove(); });
        this.options.onDestroy(this);
        this.setOptions({});
    };
    return Lumens;
}());
Lumens.prototype.next = Lumens.prototype.gotoNext;
Lumens.prototype.prev = Lumens.prototype.gotoPrev;
Lumens.prototype.previous = Lumens.prototype.gotoPrev;
Lumens.prototype.goto = Lumens.prototype.gotoPage;
Lumens.prototype.kill = Lumens.prototype.destroy;
