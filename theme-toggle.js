document.addEventListener("DOMContentLoaded", function () {
  const toggle = document.getElementById("themeToggle");
  if (toggle) {
    toggle.addEventListener("click", () => {
      const currentTheme = document.body.getAttribute("data-theme");
      if (currentTheme === "dark") {
        document.body.removeAttribute("data-theme");
      } else {
        document.body.setAttribute("data-theme", "dark");
      }
    });
  }
});