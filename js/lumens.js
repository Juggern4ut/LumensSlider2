var Lumens = /** @class */ (function () {
    /**
     * Will setup the DOM and EventListeners
     * for the use of the slider
     * @param selector The Element containing the slides
     * @param options Used to pass custom options to the slider
     * @param logWarnings If true, the slider may log errors and warnings to the console
     */
    function Lumens(selector, options, logWarnings) {
        this.currentPosX = 0;
        this.currentPage = 0;
        if (typeof selector === "string") {
            var container = document.querySelector(selector);
            if (!container)
                return null;
            this.container = container;
        }
        else if (selector instanceof HTMLElement) {
            this.container = selector;
        }
        this.logWarnings = logWarnings;
        this.setOptions(options);
        this.createWrapper();
        this.styleSlides();
        this.addDragListeners();
        this.options.onInit();
    }
    /**
     * Will define the default settings
     * and overwrite them with the passed
     * options
     * @author {Lukas Meier}
     * @param options The custom options to pass
     * @returns {void}
     */
    Lumens.prototype.setOptions = function (options) {
        var _this = this;
        this.options = {};
        var defaultOptions = {
            slidesPerPage: 1,
            preventSelection: true,
            freeScroll: false,
            animationSpeed: 200,
            onInit: function () { },
            onDragging: function () { },
            onStopDragging: function () { },
            onAnimating: function () { },
            onFinishAnimating: function () { },
            onDestroy: function () { }
        };
        Object.keys(defaultOptions).forEach(function (key) {
            if (options[key] !== undefined && options[key] !== null) {
                _this.options[key] = options[key];
            }
            else {
                _this.options[key] = defaultOptions[key];
            }
        });
    };
    /**
     * Will create a wrapper and fill
     * the slides into it
     * @author {Lukas Meier}
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
        this.wrapper.style.position = "relative";
        this.wrapper.style.right = "0";
        this.slides = this.wrapper.children;
    };
    /**
     * Will append certain needed styles to the
     * slides in the slideshow
     * @author {Lukas Meier}
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
            slide.style.width = newWidth;
            if (this.options.preventSelection) {
                slide.style.userSelect = "none";
            }
        }
    };
    /**
     * Will add all the needed event listeners
     * to the slideshow to allow dragging it around
     * @author {Lukas Meier}
     * @returns {void}
     */
    Lumens.prototype.addDragListeners = function () {
        var _this = this;
        var isDragging = false;
        var initialX = 0;
        var deltaX = 0;
        document.addEventListener("mouseup", function () {
            isDragging = false;
            _this.currentPosX = deltaX;
            _this.options.onStopDragging();
            _this.validateAndCorrectDragPosition();
        });
        this.container.addEventListener("mousedown", function (e) {
            initialX = e.pageX;
            isDragging = true;
            _this.transition(false);
        });
        this.container.addEventListener("mousemove", function (e) {
            if (!isDragging)
                return false;
            deltaX = initialX - e.pageX + _this.currentPosX;
            _this.setDragPosition(deltaX);
            _this.options.onDragging();
        });
    };
    /**
     * Will set the scrollposition of the
     * slideshow
     * @param offset The offset to set the slideshow to
     */
    Lumens.prototype.setDragPosition = function (offset, animate) {
        var _this = this;
        if (animate) {
            this.options.onAnimating();
            this.transition(true);
        }
        this.wrapper.style.right = offset + "px";
        if (animate) {
            clearTimeout(this.animationTimeout);
            this.animationTimeout = setTimeout(function () {
                _this.transition(false);
                _this.options.onFinishAnimating();
            }, this.options.animationSpeed);
        }
    };
    /**
     * Will enable or disable the transitions of the slideshow
     * based on the given parameter
     * @param enable Enables the transition if true, disables it otherwise
     */
    Lumens.prototype.transition = function (enable) {
        if (enable) {
            this.wrapper.style.transition = "right " + this.options.animationSpeed + "ms ease-out";
        }
        else {
            this.wrapper.style.transition = "none";
        }
    };
    /**
     * Will check if the current XPosition is
     * out of bounds and correct it, if so
     * @author {Lukas Meier}
     * @returns {void}
     */
    Lumens.prototype.validateAndCorrectDragPosition = function () {
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
            this.getClosestSlide(this.currentPosX);
        }
        this.setDragPosition(this.currentPosX, animate);
    };
    /**
     * Will calculate the closest page to the
     * given parameter and jump to said page
     * @param posX The position to which the closest slide should be calculated
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
        this.gotoPage(index, true);
    };
    /**
     * Will calculate the offset ot the
     * given page and scroll to it
     * @param page The page to go to (starting at 0)
     * @param animate If set to true, there will be a fluent change to the page instead of a instant one
     */
    Lumens.prototype.gotoPage = function (page, animate) {
        if (animate === void 0) { animate = true; }
        if (page > this.slides.length)
            return false;
        var totalOffset = 0;
        for (var i = 0; i < page; i++) {
            var slide = this.slides[i];
            totalOffset += this.getSlideWidth(slide);
        }
        this.currentPosX = totalOffset;
        this.setDragPosition(totalOffset, animate);
        this.currentPage = page;
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
     * Will remove all styling and the wrapper to
     * restore the state before the slider was
     * initialized
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
        this.options.onDestroy();
    };
    return Lumens;
}());
