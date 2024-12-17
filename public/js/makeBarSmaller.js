// JavaScript to handle the scroll event
window.addEventListener("scroll", function () {
  const whiteBar = document.getElementsByClassName("white-bar")[0];
  const whiteBarContents =
    document.getElementsByClassName("white-bar-contents")[0];
  // Shrink the white bar and image when scrolled
  if (window.scrollY > 0) {
    // Scale down the image and reduce the white bar height
    whiteBar.classList.add("shrink");
    whiteBarContents.classList.add("shrink-contents");
  } else {
    // Reset to original size when at the top
    whiteBar.classList.remove("shrink");
    whiteBarContents.classList.remove("shrink-contents");
  }
});
