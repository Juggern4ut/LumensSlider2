window.onload = () => {
  initHeaderSlider();
};

const initHeaderSlider = () => {
  new Lumens(".header__slider", {
    loop: true,
    autoplay: 1500
  });
}
