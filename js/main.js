window.onload = function () {
    initHeaderSlider();
};
var initHeaderSlider = function () {
    new Lumens(".header__slider", {
        loop: true,
        autoplay: 1500
    });
};
