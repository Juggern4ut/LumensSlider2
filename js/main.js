window.onload = function () {
    window["a"] = new Lumens("#test", {
        slidesPerPage: 3,
        freeScroll: false,
        animationSpeed: 200,
        loop: true,
        autoplay: false,
        onInit: function () { return console.log("%cSlider initialized", "color: red;"); },
        onDragging: function () { return console.log("%cDragging", "color: green;"); },
        onStopDragging: function () { return console.log("%cDragging stoped", "color: green;"); },
        onAnimating: function () { return console.log("%cAnimation start", "color: blue;"); },
        onFinishAnimating: function () { return console.log("%cAnimation finished", "color: blue;"); },
        onDestroy: function () { return console.log("%cSlider destoyed", "color: red;"); },
        onChangeResponsive: function () { return console.log("%cChanged breakpoint", "color: black;"); },
        onSlideChange: function (slider) { return console.log("%cChanging slide from " + slider.currentPage, "color: orange;"); },
        onSlideChanged: function (slider) { return console.log("%cChanged slide to " + slider.currentPage, "color: orange;"); },
        responsive: [
            {
                width: 1240,
                options: {
                    slidesPerPage: 2,
                    animationSpeed: 100
                }
            },
            {
                width: 900,
                options: {
                    slidesPerPage: 1,
                    freeScroll: true
                }
            }
        ]
    });
};
