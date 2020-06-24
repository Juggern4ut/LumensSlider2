window.onload = () => {
  initHeaderSlider();
  initDefaultSlider();
  initResponsioveSlider();
  initLoopSlider();
  initThumbnailSlider();
  initCallbackSlider();

  new Lumens("#meineDivId");
};

const initHeaderSlider = () => {
  new Lumens(".header__slider", {
    loop: true,
    autoplay: 1000,
    draggable: false,
  });
};

const initDefaultSlider = () => {
  new Lumens("#default-slider");
};

const initResponsioveSlider = () => {
  window["responsive"] = new Lumens("#responsive-slider", {
    slidesPerPage: 2,
    responsive: [
      {
        width: 1000,
        options: {
          slidesPerPage: 1,
        },
      },
    ],
  });
};

const initLoopSlider = () => {
  window["loop"] = new Lumens("#loop-slider", {
    loop: true,
  });
};

const initThumbnailSlider = () => {
  const large = new Lumens("#thumbnail-slider--large", {
    variableHeight: true,
  });

  const small = new Lumens("#thumbnail-slider--small", {
    slidesPerPage: 3,
  });

  large.onSlideChanged(() => {
    const sPP = small.options.slidesPerPage;
    const index = Math.floor(large.currentPage / sPP) * sPP;
    small.gotoPage(index, true);
    for (let i = 0; i < small.slides.length; i++) {
      small.slides[i].classList.remove("thumbnail-slider__slide--active");
    }
    small.slides[large.currentPage].classList.add(
      "thumbnail-slider__slide--active"
    );
  });

  Array.from(small.slides).forEach((slide, i) => {
    slide.addEventListener("click", () => {
      if (!small.wasDragged) {
        large.gotoPage(i, true);
      }
    });
  });
};

const initCallbackSlider = () => {
  let eventStack = [];

  const addToEventStack = (text) => {
    if (eventStack.length === 0) {
      eventStack.push(text + " - 1");
    } else if (eventStack[eventStack.length - 1].indexOf(text) === 0) {
      let split = eventStack[eventStack.length - 1].split("- ");
      eventStack[eventStack.length - 1] =
        split[0] + "- " + (parseInt(split[1]) + 1);
    } else {
      eventStack.push(text + " - 1");
    }

    if (eventStack.length > 100) {
      eventStack.shift();
    }

    const textArea = document.getElementById("callback-log");
    textArea.innerHTML = "";
    eventStack.forEach((line, index) => {
      let pre = index === 0 ? "" : "\n";
      textArea.innerHTML += pre + line.replace("- ", "(") + ")";
    });

    textArea.scrollTop = textArea.scrollHeight;
  };

  const callbackSlider = new Lumens("#callback-slider", {
    loop: true,
    onInit: () => {
      addToEventStack("Slideshow initialized");
    },
  });

  callbackSlider.onLoop((e) => {
    const box = document.getElementById("onLoop") as HTMLInputElement;
    if (box.checked) {
      if (e === 1) {
        addToEventStack("onLoop (forwards)");
      } else if (e === 0) {
        addToEventStack("onLoop (backwards)");
      }
    }
  });

  callbackSlider.onDragging(() => {
    const box = document.getElementById("onDragging") as HTMLInputElement;
    if (box.checked) {
      addToEventStack("onDragging");
    }
  });

  callbackSlider.onStopDragging(() => {
    const box = document.getElementById("onStopDragging") as HTMLInputElement;
    if (box.checked) {
      addToEventStack("onStopDragging");
    }
  });

  callbackSlider.onSlideChange(() => {
    const box = document.getElementById("onSlideChange") as HTMLInputElement;
    if (box.checked) {
      addToEventStack("onSlideChange");
    }
  });

  callbackSlider.onSlideChanged(() => {
    const box = document.getElementById("onSlideChanged") as HTMLInputElement;
    if (box.checked) {
      addToEventStack("onSlideChanged");
    }
  });

  callbackSlider.onAnimating(() => {
    const box = document.getElementById("onAnimating") as HTMLInputElement;
    if (box.checked) {
      addToEventStack("onAnimating");
    }
  });

  callbackSlider.onFinishAnimating(() => {
    const box = document.getElementById(
      "onFinishAnimating"
    ) as HTMLInputElement;
    if (box.checked) {
      addToEventStack("onFinishAnimating");
    }
  });

  callbackSlider.onChangeResponsive(() => {
    const box = document.getElementById(
      "onChangeResponsive"
    ) as HTMLInputElement;
    if (box.checked) {
      addToEventStack("onChangeResponsive");
    }
  });

  callbackSlider.onChangeResponsive(() => {
    const box = document.getElementById(
      "onChangeResponsive"
    ) as HTMLInputElement;
    if (box.checked) {
      addToEventStack("onChangeResponsive");
    }
  });
};
