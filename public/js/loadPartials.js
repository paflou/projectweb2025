// Function to load a single partial into a target element
function loadPartial(id, file) {
  return fetch(file)
    .then((response) => {
      if (!response.ok) throw new Error(`Failed to load ${file}`);
      return response.text();
    })
    .then((data) => {
      document.getElementById(id).innerHTML = data;
    });
}

// Load all partials and then reveal the content
window.onload = async () => {
  try {
    await Promise.all([
      loadPartial("header", "partials/header.html"),
      loadPartial("navbar", "partials/navbar.html"),
      loadPartial("footer", "partials/footer.html"),
    ]);

    // Add "show" class to the body to trigger fade-in effect
    document.getElementById("body").classList.add("show");
  } catch (error) {
    console.error("Error loading partials:", error);
  }
};
