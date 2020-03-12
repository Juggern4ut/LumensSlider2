declare type CallbackFunction = () => void;

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
  /** The page the slideshow should start on */
  startingPage?: number;
  /** Callback that is called whenever the user drags the slideshow*/
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

  animationTimeout: number;

  /**
   * Will setup the DOM and EventListeners
   * for the use of the slider
   * @param selector The Element containing the slides
   * @param options Used to pass custom options to the slider
   * @param logWarnings If true, the slider may log errors and warnings to the console
   */
  constructor(
    selector: string | Element,
    options?: Options,
    logWarnings?: boolean
  ) {
    if (typeof selector === "string") {
      const container = document.querySelector(selector) as HTMLElement;
      if (!container) return null;
      this.container = container;
    } else if (selector instanceof HTMLElement) {
      this.container = selector;
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

    this.gotoPage(this.currentPage, false);

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
  setOptions(options: Options) {
    this.options = {};
    let defaultOptions: Options = {
      slidesPerPage: 1,
      preventSelection: true,
      freeScroll: false,
      animationSpeed: 200,
      responsive: [],
      loop: false,
      startingPage: 0,
      onInit: () => {},
      onDragging: () => {},
      onStopDragging: () => {},
      onAnimating: () => {},
      onFinishAnimating: () => {},
      onDestroy: () => {},
      onChangeResponsive: () => {},
      onSlideChange: () => {},
      onSlideChanged: () => {}
    };

    Object.keys(defaultOptions).forEach(key => {
      if (options[key] !== undefined && options[key] !== null) {
        this.options[key] = options[key];
      } else if (key !== "responsive") {
        this.options[key] = defaultOptions[key];
      }
    });

    this.currentPage = this.options.startingPage;
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
        this.options.onChangeResponsive();
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

    startClones.forEach(clone => {
      this.wrapper.append(clone);
    });

    endClones.forEach(clone => {
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

    document.addEventListener("mouseup", () => {
      isDragging = false;
      this.currentPosX = deltaX;
      this.options.onStopDragging();
      this.validateAndCorrectDragPosition();
    });

    this.container.addEventListener("mousedown", e => {
      initialX = e.pageX;
      isDragging = true;
      this.transition(false);
    });

    this.container.addEventListener("mousemove", e => {
      if (!isDragging) return false;
      deltaX = initialX - e.pageX + this.currentPosX;
      this.wrapper.style.right = deltaX + "px";
      this.options.onDragging();
    });
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
      this.options.onSlideChange();
    }

    if (animate) {
      this.options.onAnimating();
      this.transition(true);
    }

    this.wrapper.style.right = offset + "px";

    if (animate) {
      clearTimeout(this.animationTimeout);
      this.animationTimeout = setTimeout(() => {
        this.transition(false);
        this.options.onFinishAnimating();
        if (changedSlide) {
          this.options.onSlideChanged();

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
    } else if (cp === this.slides.length - this.options.slidesPerPage && loop) {
      const startIndex = this.options.slidesPerPage;
      this.gotoPage(startIndex, false);
    }
  }

  /**
   * Will enable or disable the transitions of the slideshow
   * based on the given parameter
   * @param enable Enables the transition if true, disables it otherwise
   */
  transition(enable: boolean): void {
    if (enable) {
      this.wrapper.style.transition = `right ${this.options.animationSpeed}ms ease-out`;
    } else {
      this.wrapper.style.transition = "none";
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
   * Will calculate the offset ot the
   * given page and scroll to it
   * @param page The page to go to (starting at 0)
   * @param animate If set to true, there will be a fluent change to the page instead of a instant one
   * @returns {boolean} Will return false if the given page doesn't exist
   */
  gotoPage(page: number, animate: boolean = true): boolean {
    if (page > this.slides.length - this.options.slidesPerPage) return false;

    let totalOffset = 0;
    for (let i = 0; i < page; i++) {
      let slide = this.slides[i] as HTMLElement;
      totalOffset += this.getSlideWidth(slide);
    }

    const changed = page !== this.currentPage;
    this.currentPosX = totalOffset;
    this.setDragPosition(totalOffset, animate, changed);
    this.currentPage = page;
    return true;
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
    clones.forEach(clone=>clone.remove());
    
    this.options.onDestroy();
    this.setOptions({});
  }
}
