window.onload = function () {
    initHeaderSlider();
    initDefaultSlider();
    initResponsioveSlider();
    initLoopSlider();
    initThumbnailSlider();
    initCallbackSlider();
};
var initHeaderSlider = function () {
    new Lumens(".header__slider", {
        loop: true,
        autoplay: 1000,
        draggable: false
    });
};
var initDefaultSlider = function () {
    new Lumens("#default-slider");
};
var initResponsioveSlider = function () {
    window["responsive"] = new Lumens("#responsive-slider", {
        slidesPerPage: 2,
        responsive: [
            {
                width: 1000,
                options: {
                    slidesPerPage: 1
                }
            },
        ]
    });
};
var initLoopSlider = function () {
    window["loop"] = new Lumens("#loop-slider", {
        loop: true
    });
};
var initThumbnailSlider = function () {
    var large = new Lumens("#thumbnail-slider--large");
    var small = new Lumens("#thumbnail-slider--small", {
        slidesPerPage: 3
    });
    large.onSlideChanged(function () {
        var sPP = small.options.slidesPerPage;
        var index = Math.floor(large.currentPage / sPP) * sPP;
        small.gotoPage(index, true);
        for (var i = 0; i < small.slides.length; i++) {
            small.slides[i].classList.remove("thumbnail-slider__slide--active");
        }
        small.slides[large.currentPage].classList.add("thumbnail-slider__slide--active");
    });
    var _loop_1 = function (i) {
        var slide = small.slides[i];
        slide.addEventListener("click", function (e) {
            if (!small.wasDragged) {
                large.gotoPage(i, true);
            }
        });
    };
    for (var i = 0; i < small.slides.length; i++) {
        _loop_1(i);
    }
};
var initCallbackSlider = function () {
    var eventStack = [];
    var addToEventStack = function (text) {
        if (eventStack.length === 0) {
            eventStack.push(text + " - 1");
        }
        else if (eventStack[eventStack.length - 1].indexOf(text) === 0) {
            var split = eventStack[eventStack.length - 1].split("- ");
            eventStack[eventStack.length - 1] =
                split[0] + "- " + (parseInt(split[1]) + 1);
        }
        else {
            eventStack.push(text + " - 1");
        }
        var textArea = document.getElementById("callback-log");
        textArea.innerHTML = "";
        eventStack.forEach(function (line, index) {
            var pre = index === 0 ? "" : "\n";
            textArea.innerHTML += pre + line.replace("- ", "(") + ")";
        });
        textArea.scrollTop = textArea.scrollHeight;
    };
    var callbackSlider = new Lumens("#callback-slider", {
        onInit: function () {
            addToEventStack("Slideshow initialized");
        }
    });
    callbackSlider.onDragging(function () {
        var box = document.getElementById("onDragging");
        if (box.checked) {
            addToEventStack("onDragging");
        }
    });
    callbackSlider.onStopDragging(function () {
        var box = document.getElementById("onStopDragging");
        if (box.checked) {
            addToEventStack("onStopDragging");
        }
    });
    callbackSlider.onSlideChange(function () {
        var box = document.getElementById("onSlideChange");
        if (box.checked) {
            addToEventStack("onSlideChange");
        }
    });
    callbackSlider.onSlideChanged(function () {
        var box = document.getElementById("onSlideChanged");
        if (box.checked) {
            addToEventStack("onSlideChanged");
        }
    });
    callbackSlider.onAnimating(function () {
        var box = document.getElementById("onAnimating");
        if (box.checked) {
            addToEventStack("onAnimating");
        }
    });
    callbackSlider.onFinishAnimating(function () {
        var box = document.getElementById("onFinishAnimating");
        if (box.checked) {
            addToEventStack("onFinishAnimating");
        }
    });
    callbackSlider.onChangeResponsive(function () {
        var box = document.getElementById("onChangeResponsive");
        if (box.checked) {
            addToEventStack("onChangeResponsive");
        }
    });
    callbackSlider.onChangeResponsive(function () {
        var box = document.getElementById("onChangeResponsive");
        if (box.checked) {
            addToEventStack("onChangeResponsive");
        }
    });
};
