document.addEventListener("DOMContentLoaded", () => {
  setupAddToCartButtons();

  if (window.location.pathname.includes("cart.html")) {
    displayCart();
  }

  if (window.location.pathname.includes("checkout.html")) {
    renderCheckoutCart();
    setupCheckoutForm();
  }
});

// Setup Add to Cart button
function setupAddToCartButtons() {
  const buttons = document.querySelectorAll(".add-to-cart");

  buttons.forEach(btn => {
    btn.addEventListener("click", () => {
      const card = btn.closest(".product-card");
      const id = btn.dataset.id;
      const name = card.querySelector("h2")?.textContent.trim();
      const priceText = card.querySelector("p:not(.description)")?.textContent.trim().replace(/[^\d,\.]/g, "").replace(",", ".");
      const price = parseFloat(priceText);

      if (!id || !name || isNaN(price)) {
        alert("Error adding item to cart. Missing data.");
        return;
      }

      addToCart({ id, name, price });
    });
  });
}

// Add item to localStorage cart
function addToCart(product) {
  let cart = JSON.parse(localStorage.getItem("cart")) || [];
  const existing = cart.find(item => item.id === product.id);

  if (existing) {
    existing.quantity += 1;
  } else {
    cart.push({ ...product, quantity: 1 });
  }

  localStorage.setItem("cart", JSON.stringify(cart));
  alert(`${product.name} added to cart!`);
}

// Display cart on cart.html
function displayCart() {
  const cart = JSON.parse(localStorage.getItem("cart")) || [];
  const container = document.getElementById("cart-items");
  const summary = document.getElementById("cart-summary");

  if (!container || !summary) return;

  if (cart.length === 0) {
    container.innerHTML = "<p>Your cart is empty.</p>";
    summary.innerHTML = "";
    return;
  }

  container.innerHTML = "";
  let total = 0;
  let totalQty = 0;

  cart.forEach((item, index) => {
    const itemTotal = item.price * item.quantity;
    total += itemTotal;
    totalQty += item.quantity;

    container.innerHTML += `
      <div class="cart-item">
        <h3>${item.name}</h3>
        <p>R${item.price.toFixed(2)} x ${item.quantity}</p>
        <button class="remove-button" data-index="${index}">Remove</button>
      </div>
    `;
  });

  summary.innerHTML = `
    <h3>Total Items: ${totalQty}</h3>
    <h3>Total Price: R${total.toFixed(2)}</h3>
  `;

  document.querySelectorAll(".remove-button").forEach(btn => {
    btn.addEventListener("click", () => {
      const index = parseInt(btn.dataset.index);
      cart.splice(index, 1);
      localStorage.setItem("cart", JSON.stringify(cart));
      displayCart();
    });
  });
}

// Render cart for checkout.html
function renderCheckoutCart() {
  const cart = JSON.parse(localStorage.getItem("cart")) || [];
  const container = document.getElementById("checkout-items");
  const totalPriceElem = document.getElementById("checkout-total");

  if (!container || !totalPriceElem) return;

  if (cart.length === 0) {
    container.innerHTML = "<li>Your cart is empty.</li>";
    totalPriceElem.textContent = "R0.00";
    return;
  }

  let total = 0;
  container.innerHTML = "";

  cart.forEach((item, index) => {
    const subtotal = item.price * item.quantity;
    total += subtotal;

    container.innerHTML += `
      <li>
        ${item.name} - R${item.price.toFixed(2)} x 
        <select data-index="${index}" class="qty-select">
          ${generateQtyOptions(item.quantity)}
        </select>
        = R${subtotal.toFixed(2)}
      </li>
    `;
  });

  totalPriceElem.textContent = R$`{total.toFixed(2)}`;

  document.querySelectorAll(".qty-select").forEach(select => {
    select.addEventListener("change", event => {
      const index = parseInt(event.target.dataset.index);
      const newQty = parseInt(event.target.value);
      cart[index].quantity = newQty;
      localStorage.setItem("cart", JSON.stringify(cart));
      renderCheckoutCart();
    });
  });
}

// Quantity dropdown options
function generateQtyOptions(selected) {
  let options = "";
  for (let i = 1; i <= 10; i++) {
    options += `<option value="${i}" ${i === selected ? "selected" : ""}>${i}</option>`;
  }
  return options;
}

// Checkout form submit
function setupCheckoutForm() {
  const form = document.getElementById("checkout-form");
  if (!form) return;

  form.addEventListener("submit", e => {
    e.preventDefault();
    const name = form.name.value.trim();
    const address = form.address.value.trim();
    const cart = JSON.parse(localStorage.getItem("cart")) || [];

    if (!name || !address || cart.length === 0) {
      alert("Please complete all fields and ensure cart is not empty.");
      return;
    }

    alert(`Thank you for your purchase, ${name}!`);
    localStorage.removeItem("cart");
    window.location.href = "index.html";
  });
}