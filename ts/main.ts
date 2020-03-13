window.onload = () => {
  initHeaderSlider();
  initDefaultSlider();
  initResponsioveSlider();
  initLoopSlider();
  initThumbnailSlider();
};

const initHeaderSlider = () => {
  new Lumens(".header__slider", {
    loop: true,
    autoplay: 1000
  });
};

const initDefaultSlider = () => {
  new Lumens("#default-slider");
};

const initResponsioveSlider = () => {
  new Lumens("#responsive-slider", {
    slidesPerPage: 2,
    responsive: [
      {
        width: 1000,
        options: {
          slidesPerPage: 1
        }
      }
    ]
  });
};

const initLoopSlider = () => {
  new Lumens("#loop-slider", {
    loop: true
  });
};

const initThumbnailSlider = () => {
  const large = new Lumens("#thumbnail-slider--large", {
    onSlideChanged: slider => {
      const sPP = small.options.slidesPerPage;
      const index = Math.floor(slider.currentPage / sPP) * sPP;
      small.gotoPage(index, true);
      for (let i = 0; i < small.slides.length; i++) {
        small.slides[i].classList.remove("thumbnail-slider__slide--active");
      }
      small.slides[slider.currentPage].classList.add(
        "thumbnail-slider__slide--active"
      );
    }
  });

  window["small"] = new Lumens("#thumbnail-slider--small", {
    slidesPerPage: 3
  });

  const small = window["small"];

  for (let i = 0; i < small.slides.length; i++) {
    const slide = small.slides[i];
    slide.addEventListener("click", e => {
      if (!small.wasDragged) {
        large.gotoPage(i, true);
      }
    });
  }
};
