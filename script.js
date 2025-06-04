// ===== public/script.js =====
document.addEventListener("DOMContentLoaded", () => {
  // 1) Fetch the full product list once from Render
  fetch("https://bokas-collection-backend.onrender.com/api/products")
    .then(res => {
      if (!res.ok) throw new Error("Failed to fetch products");
      return res.json();
    })
    .then(data => {
      window.products = data; // store globally
      initializePage();
    })
    .catch(err => {
      console.error("Error loading products:", err);
      alert("Sorry, we couldn’t load products at this time.");
    });
});

function initializePage() {
  const path = window.location.pathname;

  // Category pages
  if (path.endsWith("mini-bags.html")) {
    renderCategory("Mini Bags", "mini");
  }
  if (path.endsWith("shoulder-bags.html")) {
    renderCategory("Shoulder Bags", "shoulder-bags");
  }
  if (path.endsWith("backpacks.html")) {
    renderCategory("Backpacks", "backpacks");
  }
  if (path.endsWith("travel-bags.html")) {
    renderCategory("Travel Bags", "travel-bags");
  }
  if (path.endsWith("accessories.html")) {
    renderCategory("Accessories", "accessories");
  }

  // Cart page
  if (path.endsWith("cart.html")) {
    renderCart();
  }

  // Checkout page
  if (path.endsWith("checkout.html")) {
    renderCheckoutCart();
    setupCheckoutForm();
  }
}

function renderCategory(categoryName, containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;

  container.innerHTML = "";

  // Filter products by category
  const filtered = window.products.filter(prod => prod.category === categoryName);

  filtered.forEach(prod => {
    const card = document.createElement("div");
    card.className = "product-card";

    // Image (use forward slashes)
    const img = document.createElement("img");
    img.src = prod.image.replace(/\\/g, "/");
    img.alt = prod.name;
    card.appendChild(img);

    // Product name
    const h2 = document.createElement("h2");
    h2.textContent = prod.name;
    card.appendChild(h2);

    // Description
    const desc = document.createElement("p");
    desc.className = "description";
    desc.textContent = prod.description;
    card.appendChild(desc);

    // Price (convert from cents → ZAR)
    const priceP = document.createElement("p");
    priceP.textContent = "R" + (prod.price / 100).toLocaleString("en-ZA", {
      minimumFractionDigits: 2
    });
    card.appendChild(priceP);

    // “Add to Cart” button
    const btn = document.createElement("button");
    btn.className = "add-to-cart";
    btn.dataset.id = prod.id;
    btn.textContent = "Add to Cart";
    btn.addEventListener("click", () => {
      addToCart({
        id: prod.id,
        name: prod.name,
        price: prod.price / 100 // store price in ZAR (e.g. 10100/100 = 101.00)
      });
    });
    card.appendChild(btn);

    container.appendChild(card);
  });
}

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

function renderCart() {
  const cart = JSON.parse(localStorage.getItem("cart")) || [];
  const container = document.getElementById("cart-items");
  const summary   = document.getElementById("cart-summary");

  if (!container || !summary) return;

  container.innerHTML = "";
  summary.innerHTML = "";

  if (cart.length === 0) {
    container.innerHTML = "<p>Your cart is empty.</p>";
    return;
  }

  let totalZar   = 0;
  let totalItems = 0;

  cart.forEach((item, idx) => {
    const itemDiv = document.createElement("div");
    itemDiv.className = "cart-item";

    // Compute subtotal
    const subtotal = item.price * item.quantity;
    totalZar += subtotal;
    totalItems += item.quantity;

    itemDiv.innerHTML = `
      <h3>${item.name}</h3>
      <p>R${item.price.toFixed(2)} x ${item.quantity} = R${subtotal.toFixed(2)}</p>
      <button class="remove-button" data-index="${idx}">Remove</button>
      <hr>
    `;
    container.appendChild(itemDiv);
  });

  summary.innerHTML = `
    <h3>Total Items: ${totalItems}</h3>
    <h3>Total Price: R${totalZar.toFixed(2)}</h3>
    <a href="checkout.html"><button class="button-black">Proceed to Checkout</button></a>
    <button class="button-black" id="clear-cart">Clear Cart</button>
  `;

  // Hook up “Remove” buttons
  container.querySelectorAll(".remove-button").forEach(btn => {
    btn.addEventListener("click", () => {
      const idx = parseInt(btn.dataset.index);
      cart.splice(idx, 1);
      localStorage.setItem("cart", JSON.stringify(cart));
      renderCart();
    });
  });

  // Hook up “Clear Cart”
  document.getElementById("clear-cart").addEventListener("click", () => {
    localStorage.removeItem("cart");
    renderCart();
  });
}

function renderCheckoutCart() {
  let cart = JSON.parse(localStorage.getItem("cart")) || [];
  const itemsContainer = document.getElementById("checkout-items");
  const totalContainer = document.getElementById("checkout-total");

  if (!itemsContainer || !totalContainer) return;

  itemsContainer.innerHTML = "";
  let totalZar = 0;

  if (cart.length === 0) {
    itemsContainer.innerHTML = "<li>Your cart is empty.</li>";
    totalContainer.textContent = "0.00";
    return;
  }

  cart.forEach((item, idx) => {
    const li = document.createElement("li");
    const itemTotal = item.price * item.quantity;
    totalZar += itemTotal;

    // Build a <select> for quantity
    const select = document.createElement("select");
    select.dataset.index = idx;
    for (let i = 1; i <= 10; i++) {
      const opt = document.createElement("option");
      opt.value = i;
      opt.textContent = i;
      if (i === item.quantity) opt.selected = true;
      select.appendChild(opt);
    }
    select.addEventListener("change", (e) => {
      const newQty = parseInt(e.target.value);
      cart[idx].quantity = newQty;
      localStorage.setItem("cart", JSON.stringify(cart));
      renderCheckoutCart();
    });

    li.innerHTML = `<strong>${item.name}</strong> - R${item.price.toFixed(2)} x `;
    li.appendChild(select);
    li.insertAdjacentHTML("beforeend", ` = R${itemTotal.toFixed(2)}`);
    itemsContainer.appendChild(li);
  });

  totalContainer.textContent = totalZar.toFixed(2);
}

function setupCheckoutForm() {
  const form = document.getElementById("checkout-form");
  if (!form) return;

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const name    = form.name.value.trim();
    const address = form.address.value.trim();
    const cart    = JSON.parse(localStorage.getItem("cart")) || [];

    if (!name || !address || cart.length === 0) {
      alert("Please complete all fields and ensure cart is not empty.");
      return;
    }

    // POST to /api/sale on Render
    fetch("https://bokas-collection-backend.onrender.com/api/sale", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ cartItems: cart })
    })
      .then(r => {
        if (!r.ok) throw new Error("Sale failed");
        return r.json();
      })
      .then(result => {
        alert(`Sale recorded! Profit: R${(+result.profit).toFixed(2)}`);
        localStorage.removeItem("cart");
        window.location.href = "index.html";
      })
      .catch(err => {
        console.error("Error posting sale:", err);
        alert("Error processing your order. Please try again.");
      });
  });
}
