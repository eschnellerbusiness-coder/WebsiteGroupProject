// Shared browser-side helpers for the product cards and demo cart.
const productFallback = [
  { id: "timer", name: "Compact Parking Timer", price: 19.99, category: "Accessories", description: "A simple dashboard timer to help track parking time.", icon: "⏱️" },
  { id: "mount", name: "Dashboard Phone Mount", price: 24.99, category: "Accessories", description: "A sturdy mount that keeps your phone in view while parked.", icon: "📱" },
  { id: "sign", name: "Reflective Parking Sign", price: 14.99, category: "Signs", description: "A reflective sign for clearly marking a reserved parking space.", icon: "🅿️" }
];

function getCart() {
  try { return JSON.parse(localStorage.getItem("parkingCart") || "{}"); }
  catch { return {}; }
}
function saveCart(cart) { localStorage.setItem("parkingCart", JSON.stringify(cart)); }
function addToCart(id) {
  const cart = getCart();
  cart[id] = Math.min(99, (Number(cart[id]) || 0) + 1);
  saveCart(cart);
  // PUT demonstrates updating a cart quantity through the HTTP API.
  fetch("/api/cart", { method:"PUT", headers:{"Content-Type":"application/json"}, body:JSON.stringify({id, quantity:cart[id]}) }).catch(() => {});
  alert("Added to cart. You can review your items at Checkout.");
}
function removeFromCart(id) {
  const cart = getCart();
  delete cart[id];
  saveCart(cart);
  // DELETE demonstrates removing an item from the server's demo cart.
  fetch("/api/cart/" + encodeURIComponent(id), { method:"DELETE" }).catch(() => {});
  if (typeof renderCheckout === "function") renderCheckout();
}
function money(value) { return "$" + Number(value).toFixed(2); }
