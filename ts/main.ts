window.onload = () => {
  window["a"] = new Lumens("#test", {
    slidesPerPage: 3,
    freeScroll: false,
    animationSpeed: 1000,
    loop: true,
    onInit: () => console.log("%cSlider initialized", "color: red;"),
    onDragging: () => console.log("%cDragging", "color: green;"),
    onStopDragging: () => console.log("%cDragging stoped", "color: green;"),
    onAnimating: () => console.log("%cAnimation start", "color: blue;"),
    onFinishAnimating: () => console.log("%cAnimation finished", "color: blue;"),
    onDestroy: () => console.log("%cSlider destoyed", "color: red;"),
    onChangeResponsive: () => console.log("%cChanged breakpoint", "color: black;"),
    onSlideChange: () => console.log("%cChanging slide", "color: orange;"),
    onSlideChanged: () => console.log("%cChanged slide", "color: orange;"),
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
