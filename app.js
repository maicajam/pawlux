const $ = id => document.getElementById(id);

let currentMode = "dog";
let selectedMode = "";
let cart = [];
let orders = [];
let appointments = [];
let wishlist = [];
let activeProfileTab = "profile";

function money(value) {
  return "₱" + Number(value).toLocaleString();
}

function cap(word) {
  return word.charAt(0).toUpperCase() + word.slice(1);
}

function startLogin() {
  $("startScreen").classList.add("hidden");
  $("auth").classList.remove("hidden");
  window.scrollTo(0, 0);
}

function toggleAuth(type) {
  $("loginBox").classList.toggle("hidden", type === "signup");
  $("signupBox").classList.toggle("hidden", type === "login");
}

function showPetMode() {
  $("auth").classList.add("hidden");
  $("petMode").classList.remove("hidden");
}

function selectMode(mode, button) {
  selectedMode = mode;
  currentMode = mode;
  document.querySelectorAll(".mode-option").forEach(item => item.classList.remove("selected"));
  button.classList.add("selected");
  $("continueBtn").disabled = false;
  $("continueBtn").classList.add("ready");
}

function launchApp() {
  setMode(selectedMode || "dog");
  $("auth").classList.add("hidden");
  $("petMode").classList.add("hidden");
  $("app").style.display = "block";
  window.scrollTo(0, 0);
}

function toggleNav() {
  $("navLinks").classList.toggle("show");
}

function go(id) {
  const section = $(id);
  if (section) section.scrollIntoView({ behavior: "smooth" });
  $("navLinks").classList.remove("show");
}

function setMode(mode) {
  currentMode = mode;
  document.body.classList.toggle("dog-mode", mode === "dog");
  document.body.classList.toggle("cat-mode", mode === "cat");
  $("dogToggle").classList.toggle("active", mode === "dog");
  $("catToggle").classList.toggle("active", mode === "cat");
  $("heroBadge").textContent = mode === "dog" ? "🐶 Dog Mode Active" : "🐱 Cat Mode Active";
  $("heroText").textContent = `Book ${mode} services, shop ${mode} essentials, read ${mode} care guides, and manage everything from your account.`;
  const heroImage = $("heroImage");
  heroImage.src = heroImage.dataset[mode];
  $("serviceTitle").textContent = `${cap(mode)} services.`;
  $("shopTitle").textContent = `${cap(mode)} products only.`;
  $("knowledgeTitle").textContent = `${cap(mode)} care guides.`;
  renderServices();
  renderProducts();
  renderArticles();
  renderProfile();
}

function sourceItems(selector) {
  return Array.from(document.querySelectorAll(selector));
}


function cloneImageFrom(card, className) {
  const image = card.querySelector("img").cloneNode(true);
  if (className) image.className = className;
  return image;
}

function productSource(name) {
  return sourceItems("#productSources .source-card").find(card => card.dataset.name === name);
}

function serviceSource(name, mode = currentMode) {
  return sourceItems("#serviceSources .source-card").find(card => card.dataset.name === name && card.dataset.mode === mode);
}

function articleSource(title, mode = currentMode) {
  return sourceItems("#articleSources .source-card").find(card => card.dataset.title === title && card.dataset.mode === mode);
}

function readProduct(card) {
  return {
    mode: card.dataset.mode,
    cat: card.dataset.cat,
    name: card.dataset.name,
    price: Number(card.dataset.price),
    rating: Number(card.dataset.rating),
    stock: Number(card.dataset.stock),
    img: card.querySelector("img").getAttribute("src")
  };
}

function readService(card) {
  return {
    mode: card.dataset.mode,
    name: card.dataset.name,
    desc: card.dataset.desc,
    price: Number(card.dataset.price),
    time: card.dataset.time,
    rating: card.dataset.rating,
    img: card.querySelector("img").getAttribute("src")
  };
}

function readArticle(card) {
  return {
    mode: card.dataset.mode,
    title: card.dataset.title,
    cat: card.dataset.cat,
    summary: card.dataset.summary,
    body: card.dataset.body,
    img: card.querySelector("img").getAttribute("src")
  };
}

function renderServices() {
  const servicesGrid = $("servicesGrid");
  servicesGrid.innerHTML = "";
  sourceItems("#serviceSources .source-card").filter(card => card.dataset.mode === currentMode).forEach(card => {
    const service = readService(card);
    const article = document.createElement("article");
    article.className = "card service-card";
    const imageButton = document.createElement("button");
    imageButton.className = "image-button";
    imageButton.type = "button";
    imageButton.appendChild(cloneImageFrom(card));
    const content = document.createElement("div");
    content.className = "card-pad";
    content.innerHTML = `
        <div class="meta"><span>⭐ ${service.rating} • ${service.time}</span><span>${cap(currentMode)}</span></div>
        <h3>${service.name}</h3>
        <p class="muted-text">${service.desc}</p>
        <div class="meta"><span>STARTING AT</span><span class="price">${money(service.price)}</span></div>
        <button class="book" type="button">Book Appointment</button>`;
    imageButton.onclick = () => book(service);
    content.querySelector(".book").onclick = () => book(service);
    article.append(imageButton, content);
    servicesGrid.appendChild(article);
  });
}

function renderProducts() {
  const search = $("searchInput").value.toLowerCase();
  const category = $("categoryFilter").value;
  const sort = $("sortFilter").value;
  let products = sourceItems("#productSources .source-card").map(readProduct).filter(product => {
    return product.mode === currentMode && (category === "all" || product.cat === category) && product.name.toLowerCase().includes(search);
  });
  if (sort === "low") products.sort((a, b) => a.price - b.price);
  if (sort === "high") products.sort((a, b) => b.price - a.price);
  if (sort === "rating") products.sort((a, b) => b.rating - a.rating);
  const productsGrid = $("productsGrid");
  productsGrid.innerHTML = "";
  products.forEach(product => {
    const source = productSource(product.name);
    const saved = wishlist.some(item => item.name === product.name);
    const article = document.createElement("article");
    article.className = "card product-card";
    const imageButton = document.createElement("button");
    imageButton.className = "image-button";
    imageButton.type = "button";
    imageButton.appendChild(cloneImageFrom(source));
    const content = document.createElement("div");
    content.className = "card-pad";
    content.innerHTML = `
        <span class="product-badge">🛍 ${product.cat}</span>
        <div class="meta"><span>In stock</span><button class="rating-btn" type="button">⭐ ${product.rating}</button></div>
        <h3>${product.name}</h3>
        <p class="product-desc">${product.name} is a premium ${product.cat.toLowerCase()} specially selected for ${product.mode} pets.</p>
        <p class="stock-text">Stock: ${product.stock}</p>
        <div class="product-actions">
          <button class="book" type="button">${money(product.price)} • Add to Cart</button>
          <button class="icon-btn wishlist-btn ${saved ? "saved" : ""}" type="button">${saved ? "♥" : "♡"}</button>
        </div>`;
    imageButton.onclick = () => viewProduct(product);
    content.querySelector(".rating-btn").onclick = () => viewReviews(product);
    content.querySelector(".book").onclick = () => addCart(product);
    content.querySelector(".wishlist-btn").onclick = () => toggleWishlist(product);
    article.append(imageButton, content);
    productsGrid.appendChild(article);
  });
  if (products.length === 0) productsGrid.innerHTML = "<p>No products found.</p>";
}

function viewProduct(product) {
  $("productModalTitle").textContent = product.name;
  const body = $("productModalBody");
  body.innerHTML = "";
  body.appendChild(cloneImageFrom(productSource(product.name), "modal-image"));
  body.insertAdjacentHTML("beforeend", `
    <p class="muted-text modal-copy">${product.name} is a premium ${currentMode} product under ${product.cat}. It is selected for comfort, safety, daily care, and a polished PawLux shopping experience.</p>
    <h3>${money(product.price)} • ⭐ ${product.rating}</h3>
    <div class="modal-actions">
      <button class="wide-btn" type="button" id="modalAddCart">Add to Cart</button>
      <button class="secondary" type="button" id="modalWishlist">Add to Wishlist</button>
      <button class="secondary" type="button" id="modalReviews">Read Reviews</button>
    </div>`);
  $("modalAddCart").onclick = () => { addCart(product); closeModal("productModal"); };
  $("modalWishlist").onclick = () => toggleWishlist(product);
  $("modalReviews").onclick = () => viewReviews(product);
  openModal("productModal");
}

function viewReviews(product) {
  $("productModalTitle").textContent = `${product.name} Reviews`;
  const body = $("productModalBody");
  body.innerHTML = "";
  body.appendChild(cloneImageFrom(productSource(product.name), "modal-image"));
  body.insertAdjacentHTML("beforeend", `
    <h3>⭐ ${product.rating} PawLux rating</h3>
    <p class="muted-text modal-copy">Customers like the product quality, useful design, pet-friendly comfort, and clean packaging. This review area is clickable from every rating button.</p>
    <div class="review-card">“Great value and very useful for my pet.”</div>
    <div class="review-card">“The quality feels premium and delivery was smooth.”</div>`);
  openModal("productModal");
}

function toggleWishlist(product) {
  const index = wishlist.findIndex(item => item.name === product.name);
  if (index >= 0) {
    wishlist.splice(index, 1);
    toast("Removed from wishlist.");
  } else {
    wishlist.push({ ...product });
    toast("Added to wishlist!");
  }
  renderProducts();
  renderProfile();
}

function addCart(product) {
  const existingProduct = cart.find(item => item.name === product.name);
  if (existingProduct) existingProduct.qty++;
  else cart.push({ ...product, qty: 1 });
  renderCart();
  toast("Added to cart!");
}

function renderCart() {
  const cartList = $("cartList");
  let total = 0;
  let count = 0;
  cartList.innerHTML = "";
  cart.forEach((product, index) => {
    total += product.price * product.qty;
    count += product.qty;
    const row = document.createElement("div");
    row.className = "cart-row";
    row.appendChild(cloneImageFrom(productSource(product.name)));
    const info = document.createElement("div");
    info.innerHTML = `<b>${product.name}</b><br><small>${money(product.price)} each</small>`;
    const qty = document.createElement("div");
    qty.className = "qty";
    qty.innerHTML = `
          <button type="button" onclick="changeQty(${index}, -1)">−</button>
          <span>${product.qty}</span>
          <button type="button" onclick="changeQty(${index}, 1)">+</button>
          <button type="button" onclick="removeItem(${index})">×</button>`;
    row.append(info, qty);
    cartList.appendChild(row);
  });
  if (cart.length === 0) cartList.innerHTML = "<p>Your cart is empty.</p>";
  $("cartCount").textContent = count;
  $("cartTotal").textContent = "Total: " + money(total);
}

function changeQty(index, amount) {
  cart[index].qty += amount;
  if (cart[index].qty <= 0) cart.splice(index, 1);
  renderCart();
}

function removeItem(index) {
  cart.splice(index, 1);
  renderCart();
}

function openCart() {
  renderCart();
  $("cartDrawer").classList.add("show");
}

function closeCart() {
  $("cartDrawer").classList.remove("show");
}

function openCheckout() {
  if (cart.length === 0) {
    toast("Your cart is empty.");
    return;
  }
  let summary = "<h3>Order Summary</h3>";
  cart.forEach(product => summary += `<p>${product.qty}× ${product.name} — ${money(product.price * product.qty)}</p>`);
  summary += `<h3>${$("cartTotal").textContent}</h3>`;
  $("checkoutSummary").innerHTML = summary;
  closeCart();
  openModal("checkoutModal");
}

function confirmOrder(event) {
  event.preventDefault();
  if (cart.length === 0) return;
  const form = event.target;
  const total = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  orders.unshift({
    id: "PLX-" + String(Date.now()).slice(-6),
    date: new Date().toLocaleDateString(),
    total,
    items: cart.map(item => ({ ...item })),
    customer: form.elements[0].value
  });
  cart = [];
  renderCart();
  renderProfile();
  closeModal("checkoutModal");
  form.reset();
  toast("Order confirmed successfully!");
}

function renderArticles() {
  const search = $("articleSearch").value.toLowerCase();
  const category = $("articleCat").value;
  const articlesGrid = $("articlesGrid");
  articlesGrid.innerHTML = "";
  sourceItems("#articleSources .source-card").filter(card => {
    return card.dataset.mode === currentMode && (category === "all" || card.dataset.cat === category) && card.dataset.title.toLowerCase().includes(search);
  }).forEach(card => {
    const article = readArticle(card);
    const item = document.createElement("article");
    item.className = "card article-card";
    const imageButton = document.createElement("button");
    imageButton.className = "image-button";
    imageButton.type = "button";
    imageButton.appendChild(cloneImageFrom(card));
    const content = document.createElement("div");
    content.className = "card-pad";
    content.innerHTML = `
        <div class="meta"><span class="guide-tag">${article.cat}</span><span>5 min read</span></div>
        <h3>${article.title}</h3>
        <p class="muted-text">${article.summary}</p>
        <button class="book" type="button">Read Guide</button>`;
    imageButton.onclick = () => viewArticle(article);
    content.querySelector(".book").onclick = () => viewArticle(article);
    item.append(imageButton, content);
    articlesGrid.appendChild(item);
  });
  if (!articlesGrid.innerHTML) articlesGrid.innerHTML = "<p>No care guides found.</p>";
}

function viewArticle(article) {
  $("articleModalTitle").textContent = article.title;
  const body = $("articleModalBody");
  body.innerHTML = "";
  body.appendChild(cloneImageFrom(articleSource(article.title, article.mode), "modal-image"));
  body.insertAdjacentHTML("beforeend", `
    <p class="long-guide">${article.body}</p>
    <button class="wide-btn" type="button" onclick="go('services');closeModal('articleModal')">Book Related Service</button>`);
  openModal("articleModal");
}

function book(service) {
  $("apptPet").value = cap(currentMode);
  $("apptService").value = service.name;
  const details = $("serviceDetails");
  details.innerHTML = "";
  const preview = document.createElement("div");
  preview.className = "appointment-preview";
  preview.appendChild(cloneImageFrom(serviceSource(service.name, service.mode || currentMode)));
  const info = document.createElement("div");
  info.innerHTML = `<b>${service.name}</b><br>${service.desc}<br><b>Starting at ${money(service.price)}</b><br><small>Choose a staff member, date, time, and payment method below.</small>`;
  preview.appendChild(info);
  details.appendChild(preview);
  openModal("appointmentModal");
}

function confirmBooking(event) {
  event.preventDefault();
  const form = event.target;
  appointments.unshift({
    pet: form.elements[0].value,
    service: form.elements[1].value,
    staff: form.elements[2].value,
    date: form.elements[3].value,
    time: form.elements[4].value,
    payment: form.elements[5].value
  });
  renderProfile();
  closeModal("appointmentModal");
  form.reset();
  toast("Appointment confirmed!");
}

function setProfileTab(tab) {
  activeProfileTab = tab;
  renderProfile();
}

function renderProfile() {
  if (!$("profilePanel")) return;
  document.querySelectorAll(".profile-tab").forEach(btn => btn.classList.toggle("active", btn.dataset.tab === activeProfileTab));
  $("profileOrderCount").textContent = orders.length;
  $("profileAppointmentCount").textContent = appointments.length;
  $("profileWishlistCount").textContent = wishlist.length;
  if (activeProfileTab === "profile") {
    $("profilePanel").innerHTML = `
      <form class="profile-edit" onsubmit="saveProfile(event)">
        <label>Profile Picture<input id="profilePicInput" type="file" accept="image/*"></label>
        <label>Name<input id="profileName" value="PawLux Member" required></label>
        <label>Email<input id="profileEmail" value="pawluxmember@email.com" type="email" required></label>
        <label>Phone Number<input id="profilePhone" value="0917-PAWLUX" required></label>
        <label>Address<input id="profileAddress" value="Quezon City, Philippines" required></label>
        <button class="primary" type="submit">Save Profile</button>
      </form>`;
  }
  if (activeProfileTab === "orders") {
    $("profilePanel").innerHTML = orders.length ? orders.map(order => `
      <div class="order-card"><b>${order.id}</b><p>${order.date} • ${money(order.total)}</p><small>${order.items.map(item => `${item.qty}× ${item.name}`).join(", ")}</small></div>`).join("") : "<p>No orders yet. Checkout products to see them here.</p>";
  }
  if (activeProfileTab === "appointments") {
    $("profilePanel").innerHTML = appointments.length ? appointments.map(appt => `
      <div class="appointment-card"><b>${appt.service}</b><p>${appt.pet} • ${appt.date} at ${appt.time}</p><small>${appt.staff} • ${appt.payment}</small></div>`).join("") : "<p>No appointments yet. Book a service to see it here.</p>";
  }
  if (activeProfileTab === "wishlist") {
    $("profilePanel").innerHTML = wishlist.length ? wishlist.map((item, index) => `
      <div class="wishlist-card" data-wishlist-index="${index}"><div class="wishlist-image-slot"></div><div><b>${item.name}</b><p>${money(item.price)} • ⭐ ${item.rating}</p><button class="secondary" type="button" onclick="moveWishlistToCart(${index})">Add to Cart</button></div></div>`).join("") : "<p>Your wishlist is empty. Tap the heart on a product to save it here.</p>";
    document.querySelectorAll(".wishlist-card").forEach(card => {
      const item = wishlist[Number(card.dataset.wishlistIndex)];
      card.querySelector(".wishlist-image-slot").appendChild(cloneImageFrom(productSource(item.name)));
    });
  }
}

function saveProfile(event) {
  event.preventDefault();
  const name = $("profileName").value;
  $("profileDisplayName").textContent = name;
  const file = $("profilePicInput").files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = e => {
      $("profileAvatar").textContent = "";
      $("profileAvatar").style.backgroundImage = `url('${e.target.result}')`;
      $("profileAvatar").classList.add("has-photo");
    };
    reader.readAsDataURL(file);
  }
  toast("Profile saved.");
}

function moveWishlistToCart(index) {
  addCart(wishlist[index]);
}

function openModal(id) {
  $(id).style.display = "flex";
  if (id === "accountModal") renderProfile();
}

function closeModal(id) {
  $(id).style.display = "none";
}

function toast(message) {
  const toastBox = $("toast");
  toastBox.textContent = message;
  toastBox.style.display = "block";
  setTimeout(() => toastBox.style.display = "none", 2200);
}

function logout() {
  document.querySelectorAll(".modal-backdrop").forEach(modal => modal.style.display = "none");
  closeCart();
  $("app").style.display = "none";
  $("auth").classList.add("hidden");
  $("petMode").classList.add("hidden");
  $("startScreen").classList.remove("hidden");
  window.scrollTo(0, 0);
  toast("Logged out successfully.");
}

window.onclick = event => {
  if (event.target.classList.contains("modal-backdrop")) event.target.style.display = "none";
};

document.addEventListener("keydown", event => {
  if (event.key === "Escape") {
    document.querySelectorAll(".modal-backdrop").forEach(modal => modal.style.display = "none");
    closeCart();
  }
});

setMode("dog");
renderCart();
