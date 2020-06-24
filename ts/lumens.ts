declare type CallbackFunction = (slider: Lumens) => void;
declare type CallbackFunctionNumber = (number: number) => void;

interface ResponsiveObject {
  width: number;
  options?: Options;
}

interface Options {
  /** The amount of slides that should be displayed in a single page */
  slidesPerPage?: number;
  /** Will set 'userSelect' to none if set to true */
  preventSelection?: boolean;
  /** If set to true, the slideshow will no longer jump to the closest slide on stop drag */
  freeScroll?: boolean;
  /** Amount of milliseconds it takes to animate to a page */
  animationSpeed?: number;
  /** Special options for certain screen widths */
  responsive?: ResponsiveObject[];
  /** If set to true, the slider can be scrolled infinitly */
  loop?: boolean;
  /** If set to true, the slider will only be as high as the current slide */
  variableHeight?: boolean;
  /** The page the slideshow should start on */
  startingPage?: number;
  /** Amount of milliseconds until the slideshow goes to the next slide automatically */
  autoplay?: number | false;
  /** If set to false, the slideshow will not be draggable with mouse- or touch-events */
  draggable?: boolean;
  /** If set to true touch devices can not scroll left/right or up/down when touching the slider */
  preventTouchDrag?: boolean;
  /** The amount of pixels that have to be dragged to change the slide */
  dragThreshold?: number;
  /** If set to true, the responsive options that are not set will be inherited by the initial options, otherwise unset options will use the default */
  inheritOptions?: boolean;
  /** If set to true, the slider can be controlled using the left and right arrow key */
  arrowKeys?: boolean;
  /** Callback that is called whenever the user drags the slideshow */
  onDragging?: CallbackFunction;
  /** Callback that is called whenever the user stops dragging */
  onStopDragging?: CallbackFunction;
  /** Callback that is called when an animation starts */
  onAnimating?: CallbackFunction;
  /** Callback that is called when an animation is finished */
  onFinishAnimating?: CallbackFunction;
  /** Callback that is called when the slider is destoyed */
  onDestroy?: CallbackFunction;
  /** Callback that is called when the slider finished initailizing */
  onInit?: CallbackFunction;
  /** Callback that is called when a responsive breakpoint is reached */
  onChangeResponsive?: CallbackFunction;
  /** Callback that is called when the slide is starting to change */
  onSlideChange?: CallbackFunction;
  /** Callback that is called when the slide is changed */
  onSlideChanged?: CallbackFunction;
  /** Callback that is called when an infinite slideshow is looping around */
  onLoop?: CallbackFunctionNumber;
}

class Lumens {
  container: HTMLElement;
  wrapper: HTMLElement;
  slides: HTMLCollection;
  options: Options;
  initialOptions: Options;
  currentPosX: number = 0;
  currentPage: number = 0;
  logWarnings: boolean;
  autoplayInterval: number;
  animationTimeout: number;
  wasDragged: boolean = false;
  inheritOptions: boolean = true;
  arrowKeyFunction;

  /**
   * Will setup the DOM and EventListeners
   * for the use of the slider
   * @param selector The Element containing the slides
   * @param options Used to pass custom options to the slider
   * @param logWarnings If true, the slider may log errors and warnings to the console
   */
  constructor(
    selector: string | Element,
    options: Options = {},
    logWarnings?: boolean
  ) {
    if (typeof selector === "string") {
      const container = document.querySelector(selector) as HTMLElement;

      if (!container) {
        console.warn(
          `No Element could be found using the given selector: "${selector}"`
        );
        return null;
      }

      this.container = container;
    } else if (selector instanceof HTMLElement) {
      this.container = selector;
    } else {
      throw new Error(
        `The selector passed is neither a string nor an instance of an HTMLElement`
      );
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

    this.arrowKeyFunction = (e) => {
      if (e.keyCode === 37) {
        this.gotoPrev();
      } else if (e.keyCode === 39) {
        this.gotoNext();
      }
    };
    this.arrowKeyControls();

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
   * @param options The custom options to pass
   * @returns {void}
   */
  setOptions(options: Options, inherit?: boolean) {
    this.options = {};

    let defaultOptions: Options = {
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
      onInit: () => {},
      onDragging: () => {},
      onStopDragging: () => {},
      onAnimating: () => {},
      onFinishAnimating: () => {},
      onChangeResponsive: () => {},
      onSlideChange: () => {},
      onSlideChanged: () => {},
      onDestroy: () => {},
      onLoop: () => {},
    };

    Object.keys(defaultOptions).forEach((key) => {
      if (key === "responsive" || key === "inheritOptions") return false;

      if (options[key] !== undefined && options[key] !== null) {
        this.options[key] = options[key];
      } else {
        if (this.inheritOptions) {
          if (
            this.initialOptions[key] !== undefined &&
            this.initialOptions[key] !== null
          ) {
            this.options[key] = this.initialOptions[key];
          } else {
            this.options[key] = defaultOptions[key];
          }
        } else {
          this.options[key] = defaultOptions[key];
        }
      }
    });
  }

  /**
   * Will enable the control of the slideshow
   * using the arrow keys
   * @returns {void}
   */
  arrowKeyControls() {
    document.removeEventListener("keydown", this.arrowKeyFunction, true);
    if (this.options.arrowKeys) {
      document.addEventListener("keydown", this.arrowKeyFunction, true);
    }
  }

  /**
   * Will start the autoplay interval
   * @returns {void}
   */
  startAutoplayInterval(): void {
    if (this.options.autoplay) {
      clearInterval(this.autoplayInterval);
      this.autoplayInterval = window.setInterval(() => {
        let targetPage;
        if (this.options.loop) {
          targetPage = this.currentPage + 1;
        } else {
          targetPage =
            this.currentPage + 1 + this.options.slidesPerPage >
            this.slides.length
              ? 0
              : this.currentPage + 1;
        }

        this.gotoPage(targetPage);
      }, this.options.autoplay);
    }
  }

  /**
   * Will stop the autoplay interval
   * @returns {void}
   */
  stopAutoplayInterval(): void {
    clearInterval(this.autoplayInterval);
  }

  /**
   * Updates the current slider settings based
   * on the current width of the window
   * @returns {void}
   */
  responsiveHandler() {
    let previousResponsiveIndex = undefined;
    let currentResponsiveIndex;

    const resizeFunction = () => {
      currentResponsiveIndex = undefined;
      this.initialOptions.responsive.forEach((res, index) => {
        if (window.innerWidth < res.width) {
          currentResponsiveIndex = index;
        }
      });

      if (previousResponsiveIndex !== currentResponsiveIndex) {
        previousResponsiveIndex = currentResponsiveIndex;
        if (currentResponsiveIndex !== undefined) {
          this.setOptions(
            this.initialOptions.responsive[currentResponsiveIndex].options
          );
        } else {
          this.setOptions(this.initialOptions);
        }
        this.styleSlides();
        this.arrowKeyControls();
        this.options.onChangeResponsive(this);
      }
      this.gotoPage(this.currentPage, false);
    };

    //Call function on init and resize
    resizeFunction();
    window.addEventListener("resize", resizeFunction);
  }

  /**
   * Will create a wrapper and fill
   * the slides into it
   * @returns {void}
   */
  createWrapper(): void {
    this.wrapper = document.createElement("div");
    let loopLength = this.container.children.length;
    for (let i = 0; i < loopLength; i++) {
      const slide = this.container.children[0] as Node;
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
  }

  /**
   * Creates clones of the last and first slides
   * (depending on slidesPerPage) and appends them
   * to the start end end of the slider. This is
   * used for the infiniteLoop option
   * @returns {void}
   */
  createCloneNodes(): void {
    const clones = this.container.querySelectorAll(".lumens__clone");
    clones.forEach((clone) => clone.remove());

    let startClones: HTMLElement[] = [];
    let endClones: HTMLElement[] = [];
    for (let i = 0; i < this.options.slidesPerPage; i++) {
      const startCloneNode = this.slides[i].cloneNode(true) as HTMLElement;
      startCloneNode.classList.add("lumens__clone");
      startClones.push(startCloneNode);

      const endIndex = this.slides.length - 1 - i;
      const endCloneNode = this.slides[endIndex].cloneNode(true) as HTMLElement;
      endCloneNode.classList.add("lumens__clone");
      endClones.push(endCloneNode);
    }

    startClones.forEach((clone) => {
      this.wrapper.append(clone);
    });

    endClones.forEach((clone) => {
      this.wrapper.prepend(clone);
    });

    this.currentPage += this.options.slidesPerPage;
  }

  /**
   * Will append certain needed styles to the
   * slides in the slideshow
   * @returns {void}
   */
  styleSlides(): void {
    for (let i = 0; i < this.slides.length; i++) {
      const slide = this.slides[i] as HTMLElement;

      const calculatedProperties = window.getComputedStyle(slide, null);
      const marginTotal =
        parseFloat(calculatedProperties.getPropertyValue("margin-right")) +
        parseFloat(calculatedProperties.getPropertyValue("margin-left"));

      const newWidth = `calc((100% / ${this.options.slidesPerPage}) - ${marginTotal}px)`;

      slide.style.display = "inline-block";
      slide.style.boxSizing = "border-box";
      slide.style.verticalAlign = "top";
      slide.style.whiteSpace = "normal";
      slide.style.width = newWidth;

      if (this.options.preventSelection) {
        slide.style.userSelect = "none";
      }
    }
  }

  /**
   * Will add all the needed event listeners
   * to the slideshow to allow dragging it around
   * @returns {void}
   */
  addDragListeners(): void {
    let isDragging = false;
    let initialX = 0;
    let deltaX = 0;
    let hasFocus = false;
    let hasDragged = false;
    let dragDelta;

    const startDragFunction = (e) => {
      if (!this.options.draggable) return false;

      this.stopAutoplayInterval();
      hasFocus = true;
      this.wasDragged = false;

      if (e.type === "touchstart") {
        initialX = e.targetTouches[0].pageX;
      } else {
        initialX = e.pageX;
      }

      isDragging = true;
      this.transition(false);
    };

    const moveDragFunction = (e) => {
      if (!isDragging || !this.options.draggable) return false;

      if (e.type === "touchmove") {
        if (this.options.preventTouchDrag) {
          e.preventDefault();
        }
        dragDelta = initialX - e.targetTouches[0].pageX;
      } else {
        dragDelta = initialX - e.pageX;
      }
      deltaX = dragDelta + this.currentPosX;

      hasDragged = true;
      this.wasDragged = Math.abs(dragDelta) > this.options.dragThreshold;
      this.wrapper.style.right = deltaX + "px";
      this.options.onDragging(this);
    };

    const releaseDragFunction = (e) => {
      if (!hasFocus || !this.options.draggable) return false;

      hasFocus = false;
      isDragging = false;
      this.startAutoplayInterval();
      this.currentPosX = hasDragged ? deltaX : this.currentPosX;
      hasDragged = false;
      this.options.onStopDragging(this);

      let currentSlide = this.slides[this.currentPage] as HTMLElement;

      if (
        dragDelta > this.options.dragThreshold &&
        dragDelta < this.getSlideWidth(currentSlide) / 2 &&
        this.currentPage < this.slides.length - this.options.slidesPerPage &&
        this.options.freeScroll === false
      ) {
        this.gotoPage(this.currentPage + 1);
      } else if (
        dragDelta < this.options.dragThreshold * -1 &&
        dragDelta > (this.getSlideWidth(currentSlide) / 2) * -1 &&
        this.currentPage > 0 &&
        this.options.freeScroll === false
      ) {
        this.gotoPage(this.currentPage - 1);
      } else {
        this.validateAndCorrectDragPosition();
      }
    };

    document.addEventListener("mouseup", releaseDragFunction);
    document.addEventListener("touchend", releaseDragFunction);

    document.addEventListener("mousemove", moveDragFunction);
    document.addEventListener("touchmove", moveDragFunction, {
      passive: false,
    });

    this.container.addEventListener("mousedown", startDragFunction);
    this.container.addEventListener("touchstart", startDragFunction);
  }

  /**
   * Will set the scrollposition of the
   * slideshow
   * @param offset The offset to set the slideshow to
   * @returns {void}
   */
  setDragPosition(
    offset: number,
    animate?: boolean,
    changedSlide?: boolean
  ): void {
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
      this.animationTimeout = window.setTimeout(() => {
        this.transition(false);
        this.options.onFinishAnimating(this);
        if (changedSlide) {
          this.options.onSlideChanged(this);
          this.loopHandler();
        }
      }, this.options.animationSpeed);
    }
  }

  /**
   * Checks if the slide was scrolled to the very beginning
   * or the very end and jumps to the opposite end if the
   * infinite loop option is set
   * @returns {void}
   */
  loopHandler(): void {
    const cp = this.currentPage;
    const loop = this.options.loop;

    if (cp === 0 && loop) {
      const endIndex = this.slides.length - this.options.slidesPerPage * 2;
      this.gotoPage(endIndex, false);
      this.options.onLoop(0);
    } else if (cp === this.slides.length - this.options.slidesPerPage && loop) {
      const startIndex = this.options.slidesPerPage;
      this.gotoPage(startIndex, false);
      this.options.onLoop(1);
    }
  }

  /**
   * Will enable or disable the transitions of the slideshow
   * based on the given parameter
   * @param enable Enables the transition if true, disables it otherwise
   */
  transition(enable: boolean): void {
    if (enable) {
      this.wrapper.style.transition = `${this.options.animationSpeed}ms ease-out`;
    } else {
      if (this.options.variableHeight) {
        this.wrapper.style.transition = `height ${this.options.animationSpeed}ms ease-out`;
      } else {
        this.wrapper.style.transition = "none";
      }
    }
  }

  /**
   * Will check if the current XPosition is
   * out of bounds and correct it, if so
   * @returns {void}
   */
  validateAndCorrectDragPosition(): void {
    let initialPage = this.currentPage;
    let totalWidth = 0;
    let animate = false;
    for (let i = 0; i < this.slides.length - this.options.slidesPerPage; i++) {
      let slide = this.slides[i] as HTMLElement;
      totalWidth += this.getSlideWidth(slide);
    }

    if (this.currentPosX < 0) {
      this.currentPosX = 0;
      this.currentPage = 0;
      animate = true;
    } else if (this.currentPosX > totalWidth) {
      this.currentPosX = totalWidth;
      this.currentPage = this.slides.length - this.options.slidesPerPage;
      animate = true;
    } else if (this.options.freeScroll === false) {
      let closest = this.getClosestSlide(this.currentPosX);
      this.gotoPage(closest, true);
    }

    if (this.currentPosX <= 0 || this.currentPosX >= totalWidth) {
      const changedSlide = initialPage !== this.currentPage;
      this.setDragPosition(this.currentPosX, animate, changedSlide);
    }
  }

  /**
   * Will calculate the closest page to the
   * given parameter and jump to said page
   * @param posX The position to which the closest slide should be calculated
   * @returns {void}
   */
  getClosestSlide(posX: number): number {
    let slideCoordinates: number[] = [];
    let total = 0;
    for (let i = 0; i < this.slides.length; i++) {
      let slide = this.slides[i] as HTMLElement;
      slideCoordinates.push(total);
      total += this.getSlideWidth(slide);
    }

    let index = 0;
    slideCoordinates.reduce((p, n, i) => {
      if (Math.abs(p) > Math.abs(n - posX)) {
        index = i;
      }
      return Math.abs(p) > Math.abs(n - posX) ? n - posX : p;
    }, Infinity) + posX;

    return index;
  }

  /**
   * Will return the exact calculated amount
   * of pixels a given slide takes on the screen
   * this includes the margin aswell
   * @param el The slide to calculate
   * @returns {number} The calculated width
   */
  getSlideWidth(el: HTMLElement): number {
    let width = 0;
    const computed = window.getComputedStyle(el, null);
    width += parseFloat(computed.getPropertyValue("width"));
    width += parseFloat(computed.getPropertyValue("margin-right"));
    width += parseFloat(computed.getPropertyValue("margin-left"));
    return width;
  }

  /**
   * Sets the callbackfunction for onSlideChanged
   * @param callback The function to call for this event
   * @returns The current Slider
   */
  onSlideChanged(callback: CallbackFunction): Lumens {
    this.options.onSlideChanged = callback;
    return this;
  }

  /**
   * Sets the callbackfunction for onDragging
   * @param callback The function to call for this event
   * @returns The current Slider
   */
  onDragging(callback: CallbackFunction): Lumens {
    this.options.onDragging = callback;
    return this;
  }

  /**
   * Sets the callbackfunction for onStopDragging
   * @param callback The function to call for this event
   * @returns The current Slider
   */
  onStopDragging(callback: CallbackFunction): Lumens {
    this.options.onStopDragging = callback;
    return this;
  }

  /**
   * Sets the callbackfunction for onAnimating
   * @param callback The function to call for this event
   * @returns The current Slider
   */
  onAnimating(callback: CallbackFunction): Lumens {
    this.options.onAnimating = callback;
    return this;
  }

  /**
   * Sets the callbackfunction for onFinishAnimating
   * @param callback The function to call for this event
   * @returns The current Slider
   */
  onFinishAnimating(callback: CallbackFunction): Lumens {
    this.options.onFinishAnimating = callback;
    return this;
  }

  /**
   * Sets the callbackfunction for onDestroy
   * @param callback The function to call for this event
   * @returns The current Slider
   */
  onDestroy(callback: CallbackFunction): Lumens {
    this.options.onDestroy = callback;
    return this;
  }

  /**
   * Sets the callbackfunction for onInit
   * @param callback The function to call for this event
   * @returns The current Slider
   */
  onInit(callback: CallbackFunction): Lumens {
    this.options.onInit = callback;
    return this;
  }

  /**
   * Sets the callbackfunction for onChangeResponsive
   * @param callback The function to call for this event
   * @returns The current Slider
   */
  onChangeResponsive(callback: CallbackFunction): Lumens {
    this.options.onChangeResponsive = callback;
    return this;
  }

  /**
   * Sets the callbackfunction for onSlideChange
   * @param callback The function to call for this event
   * @returns The current Slider
   */
  onSlideChange(callback: CallbackFunction): Lumens {
    this.options.onSlideChange = callback;
    return this;
  }

  /**
   * Sets the callbackfunction for onLoop
   * @param callback The function to call for this event
   * @returns The current Slider
   */
  onLoop(callback: CallbackFunctionNumber): Lumens {
    this.options.onLoop = callback;
    return this;
  }

  /**
   * Will calculate the offset ot the
   * given page and scroll to it
   * @param page The page to go to (starting at 0)
   * @param animate If set to true, there will be a fluent change to the page instead of a instant one
   * @returns {boolean} Will return false if the given page doesn't exist
   */
  gotoPage(page: number, animate: boolean = true): boolean {
    if (page > this.slides.length - this.options.slidesPerPage) {
      page = this.slides.length - this.options.slidesPerPage;
    }

    let totalOffset = 0;
    for (let i = 0; i < page; i++) {
      let slide = this.slides[i] as HTMLElement;
      totalOffset += this.getSlideWidth(slide);
    }

    let isLooped = false;
    if (
      this.options.loop &&
      ((this.currentPage === this.slides.length - this.options.slidesPerPage &&
        page === this.options.slidesPerPage) ||
        (this.currentPage === 0 &&
          page === this.slides.length - this.options.slidesPerPage * 2))
    ) {
      isLooped = true;
    }

    const changed = page !== this.currentPage && isLooped === false;
    this.currentPosX = totalOffset;
    this.setDragPosition(totalOffset, animate, changed);
    this.currentPage = page;
    if (this.options.variableHeight) {
      let slide = this.slides[this.currentPage] as HTMLElement;
      this.wrapper.style.height = slide.offsetHeight + "px";
    }
    return true;
  }

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
  gotoNext(loopAround: boolean = false): number {
    if (this.currentPage < this.slides.length - 1) {
      this.gotoPage(this.currentPage + 1);
    } else if (loopAround) {
      this.gotoPage(0);
    }
    return this.currentPage;
  }

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
  gotoPrev(loopAround: boolean = false): number {
    if (this.currentPage > 0) {
      this.gotoPage(this.currentPage - 1);
    } else if (loopAround) {
      this.gotoPage(this.slides.length - 1);
    }
    return this.currentPage;
  }

  /**
   * Will add a new slide to the slideshow and update all the functionality
   * @param position The position where the slide should be inserted. Can range from 0 to the amount of slides
   * @param slide The HTMLElement of the slide that should be added
   */
  insertSlide(position: number, slide: HTMLElement): Lumens {
    if (position < 0 || position > this.slides.length) {
      throw new Error(
        `Tried to insert a slide at a position smaller than zero or larger than amount of slides`
      );
    } else if (!(slide instanceof HTMLElement)) {
      throw new Error(
        `The slide that was tried to be inserted is not an instance of an HTMLElement`
      );
    }

    position = this.options.loop
      ? position + this.options.slidesPerPage
      : position;

    let referenceNode =
      position === this.slides.length ? null : this.slides[position];

    this.wrapper.insertBefore(slide, referenceNode);
    this.styleSlides();

    if (this.options.loop) {
      this.createCloneNodes();
    }

    return this;
  }

  /**
   * Will remove a slide to the slideshow at the give position
   * @param position The position of the slide to remove. Can range from 0 to the amount of slides
   */
  removeSlide(position: number): Lumens {
    if (position < 0 || position > this.slides.length) {
      throw new Error(
        `Tried to remove non existing slide at position ${position}`
      );
    }

    position = this.options.loop
      ? position + this.options.slidesPerPage
      : position;

    this.slides[position].remove();
    this.styleSlides();

    if (this.options.loop) {
      this.createCloneNodes();
    }

    return this;
  }

  /**
   * Will remove all styling and the wrapper to
   * restore the state before the slider was
   * initialized
   * @returns {void}
   */
  destroy(): void {
    let slideAmount = this.slides.length;
    for (let i = 0; i < slideAmount; i++) {
      let slide = this.slides[0] as HTMLElement;

      slide.style.removeProperty("box-sizing");
      slide.style.removeProperty("width");
      slide.style.removeProperty("display");
      slide.style.removeProperty("user-select");

      this.wrapper.remove();

      this.container.append(slide);
    }

    const clones = this.container.querySelectorAll(".lumens__clone");
    clones.forEach((clone) => clone.remove());

    this.options.onDestroy(this);
    this.setOptions({});
  }
}

/**
 * Defining some alias functions for simpler usage
 */
interface Lumens {
  next: typeof Lumens.prototype.gotoNext;
  prev: typeof Lumens.prototype.gotoPrev;
  previous: typeof Lumens.prototype.gotoPrev;
  goto: typeof Lumens.prototype.gotoPage;
  kill: typeof Lumens.prototype.destroy;
}

Lumens.prototype.next = Lumens.prototype.gotoNext;
Lumens.prototype.prev = Lumens.prototype.gotoPrev;
Lumens.prototype.previous = Lumens.prototype.gotoPrev;
Lumens.prototype.goto = Lumens.prototype.gotoPage;
Lumens.prototype.kill = Lumens.prototype.destroy;
