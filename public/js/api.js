const API = {
  async request(path, options = {}) {
    const token = localStorage.getItem("token");
    const headers = {
      "Content-Type": "application/json",
      ...options.headers
    };

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    try {
      const res = await fetch(path, { ...options, headers });
      let data = null;
      
      if (res.headers.get("content-type")?.includes("application/json")) {
        data = await res.json();
      } else {
        data = await res.text();
      }

      if (!res.ok) {
        const msg = data?.error || `Request failed (${res.status})`;
        throw new Error(msg);
      }
      
      return data;
    } catch (error) {
      console.error("API Error:", error);
      throw error;
    }
  },

  get(path) {
    return this.request(path, { method: "GET" });
  },

  post(path, body) {
    return this.request(path, { 
      method: "POST", 
      body: JSON.stringify(body || {}) 
    });
  },

  put(path, body) {
    return this.request(path, { 
      method: "PUT", 
      body: JSON.stringify(body || {}) 
    });
  },

  del(path) {
    return this.request(path, { method: "DELETE" });
  }
};

function setToast(text, type) {
  const el = document.getElementById("toast");
  if (!el) return;
  el.className = "toast " + (type || "");
  el.textContent = text || "";
  el.style.display = text ? "block" : "none";
}

function formatMoney(x) {
  return Number(x || 0).toFixed(0) + " ₸";
}

function loadCart() {
  try {
    return JSON.parse(localStorage.getItem("cart") || "[]");
  } catch {
    return [];
  }
}

function saveCart(items) {
  localStorage.setItem("cart", JSON.stringify(items || []));
  const badge = document.getElementById("cartCount");
  if (badge) {
    const count = (items || []).reduce((s, it) => s + Number(it.quantity || 0), 0);
    badge.textContent = String(count);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const token = localStorage.getItem("token");
  const loginLink = document.getElementById("navLogin");
  const logoutBtn = document.getElementById("navLogout");
  const adminLink = document.getElementById("navAdmin");

  if (loginLink) loginLink.style.display = token ? "none" : "inline-block";
  if (logoutBtn) logoutBtn.style.display = token ? "inline-block" : "none";

  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      setToast("Logged out", "ok");
      setTimeout(() => (window.location.href = "/login"), 300);
    });
  }

  if (adminLink) {
    adminLink.style.display = "none";
    const user = localStorage.getItem("user");
    if (user) {
      try {
        const u = JSON.parse(user);
        if (u.role === "admin") {
          adminLink.style.display = "inline-block";
        }
      } catch (e) {}
    }
  }

  const cart = loadCart();
  saveCart(cart);
});