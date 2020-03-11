window.onload = () => {
  window["a"] = new Lumens("#test", {
    slidesPerPage: 3,
    freeScroll: false,
    animationSpeed: 1000,
    onInit: () => console.log("Slider initialized"),
    onDragging: () => console.log("Dragging"),
    onStopDragging: () => console.log("Dragging stoped"),
    onAnimating: () => console.log("Animation start"),
    onFinishAnimating: () => console.log("Animation finished"),
    onDestroy: () => console.log("Slider destoyed"),
    onChangeResponsive: () => console.log("Changed breakpoint"),
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
