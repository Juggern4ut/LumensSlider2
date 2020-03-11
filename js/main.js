window.onload = function () {
    window["a"] = new Lumens("#test", {
        slidesPerPage: 3,
        freeScroll: false,
        animationSpeed: 1000,
        onInit: function () { return console.log("Slider initialized"); },
        onDragging: function () { return console.log("Dragging"); },
        onStopDragging: function () { return console.log("Dragging stoped"); },
        onAnimating: function () { return console.log("Animation start"); },
        onFinishAnimating: function () { return console.log("Animation finished"); },
        onDestroy: function () { return console.log("Slider destoyed"); },
        onChangeResponsive: function () { return console.log("Changed breakpoint"); },
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
