window.onload = function () {
    initHeaderSlider();
    initDefaultSlider();
    initResponsioveSlider();
    initLoopSlider();
    initThumbnailSlider();
};
var initHeaderSlider = function () {
    new Lumens(".header__slider", {
        loop: true,
        autoplay: false
    });
};
var initDefaultSlider = function () {
    new Lumens("#default-slider");
};
var initResponsioveSlider = function () {
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
var initLoopSlider = function () {
    new Lumens("#loop-slider", {
        loop: true
    });
};
var initThumbnailSlider = function () {
    var large = new Lumens("#thumbnail-slider--large", {
        onSlideChanged: function (slider) {
            var sPP = small.options.slidesPerPage;
            var index = Math.floor(slider.currentPage / sPP) * sPP;
            small.gotoPage(index, true);
            for (var i = 0; i < small.slides.length; i++) {
                small.slides[i].classList.remove("thumbnail-slider__slide--active");
            }
            small.slides[slider.currentPage].classList.add("thumbnail-slider__slide--active");
        }
    });
    window["small"] = new Lumens("#thumbnail-slider--small", {
        slidesPerPage: 3
    });
    var small = window["small"];
    var _loop_1 = function (i) {
        var slide = small.slides[i];
        slide.addEventListener("click", function (e) {
            if (!small.isDragging) {
                large.gotoPage(i, true);
            }
        });
    };
    for (var i = 0; i < small.slides.length; i++) {
        _loop_1(i);
    }
};
