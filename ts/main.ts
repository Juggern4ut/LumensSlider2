window.onload = () => {
  window["a"] = new Lumens("#test", {
    slidesPerPage: 2,
    freeScroll: false,
    animationSpeed: 1000,
    onInit: () => console.log("Slider initialized"),
    onDragging: () => console.log("Dragging"),
    onStopDragging: () => console.log("Dragging stoped"),
    onAnimating: () => console.log("Animation start"),
    onFinishAnimating: () => console.log("Animation finished"),
    onDestroy: () => console.log("Slider destoyed")
  });
};
