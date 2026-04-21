/*
document.addEventListener("DOMContentLoaded", function() {
  var activeMenu = document.querySelector(".mnu-options-active");
  var menuContainer = document.getElementById("menu-contner"); 
  if (activeMenu && menuContainer) {
  menuContainer.scrollTop = activeMenu.offsetTop - menuContainer.offsetTop;
  }
});

*/

document.addEventListener("DOMContentLoaded", function () {
    var activeMenu = document.querySelector(".menu-active,.mnu-options-active");
    var menuContainer = document.getElementById("menu-contner"); 

    if (activeMenu && menuContainer) {
        // Calculate the position to center the active menu item
        var scrollPosition =
            activeMenu.offsetTop - menuContainer.offsetHeight / 2 + activeMenu.offsetHeight / 2;
        
        // Scroll the menu to that position smoothly
        menuContainer.scrollTo({ top: scrollPosition, behavior: "smooth" });
    }
});