function el(id) { return document.getElementById(id); }

function renderCart() {
    const box = el("cartBox");
    const totalEl = el("cartTotal");
    if (!box) return;

    const cart = loadCart();
    if (!cart.length) {
        box.innerHTML = `<div class="muted">Cart is empty</div>`;
        if (totalEl) totalEl.textContent = formatMoney(0);
        return;
    }

    let total = 0;
    box.innerHTML = "";

    cart.forEach((it, idx) => {
        const row = document.createElement("div");
        row.className = "item";

        const left = document.createElement("div");
        const title = document.createElement("h3");
        title.textContent = it.name || "Item";
        const sub = document.createElement("div");
        sub.className = "muted";
        sub.textContent = `${formatMoney(it.price)} × ${it.quantity}`;

        left.appendChild(title);
        left.appendChild(sub);

        const right = document.createElement("div");
        right.className = "row";
        right.style.justifyContent = "flex-end";

        const minus = document.createElement("button");
        minus.className = "btn secondary";
        minus.textContent = "-";
        minus.addEventListener("click", () => changeQty(idx, -1));

        const plus = document.createElement("button");
        plus.className = "btn secondary";
        plus.textContent = "+";
        plus.addEventListener("click", () => changeQty(idx, +1));

        const del = document.createElement("button");
        del.className = "btn danger";
        del.textContent = "Remove";
        del.addEventListener("click", () => removeItem(idx));

        right.appendChild(minus);
        right.appendChild(plus);
        right.appendChild(del);

        row.appendChild(left);
        row.appendChild(right);

        box.appendChild(row);

        total += Number(it.price || 0) * Number(it.quantity || 0);
    });

    if (totalEl) totalEl.textContent = formatMoney(total);
}

function changeQty(idx, delta) {
    const cart = loadCart();
    if (!cart[idx]) return;

    cart[idx].quantity = Number(cart[idx].quantity || 0) + delta;
    if (cart[idx].quantity <= 0) cart.splice(idx, 1);

    saveCart(cart);
    renderCart();
}

function removeItem(idx) {
    const cart = loadCart();
    cart.splice(idx, 1);
    saveCart(cart);
    renderCart();
}

async function checkout() {
  setToast("", "");
  const cart = loadCart();
  if (!cart.length) {
    setToast("Cart is empty", "bad");
    return;
  }

  try {
    const payload = {
      items: cart.map(x => ({ menuItem: x.menuItem, quantity: x.quantity }))
    };

    await API.post("/api/orders", payload);
    
    saveCart([]);
    renderCart();
    setToast("Order created ✅", "ok");
    
  } catch (err) {
    setToast(err.message, "bad");
  }
}

async function loadOrders() {
    const table = el("ordersTableBody");
    if (!table) return;

    table.innerHTML = `<tr><td colspan="4" class="muted">Loading...</td></tr>`;
    try {
        const orders = await API.get("/api/orders");
        if (!orders || !orders.length) {
            table.innerHTML = `<tr><td colspan="4" class="muted">No orders</td></tr>`;
            return;
        }

        table.innerHTML = "";
        orders.forEach((o) => {
            const tr = document.createElement("tr");
            const dt = new Date(o.orderDate || o.createdAt || Date.now());
            const itemsCount = Array.isArray(o.items) ? o.items.reduce((s, x) => s + (x.quantity || 0), 0) : 0;

            tr.innerHTML = `
        <td>${dt.toISOString().slice(0,10)}</td>
        <td>${o.status || "pending"}</td>
        <td>${itemsCount}</td>
        <td>${formatMoney(o.totalAmount || 0)}</td>
      `;
            table.appendChild(tr);
        });
    } catch (err) {
        table.innerHTML = `<tr><td colspan="4">${err.message}</td></tr>`;
    }
}

async function adminBoot() {
    const adminBox = el("adminBox");
    if (!adminBox) return;

    try {
        const me = await API.get("/api/users/profile");
        if (!me || me.role !== "admin") {
            adminBox.innerHTML = `<div class="toast bad">Admin only</div>`;
            return;
        }

        await loadAdminMenu();
        await loadAdminReports();

        const createForm = el("adminCreateForm");
        if (createForm) {
            createForm.addEventListener("submit", async (e) => {
                e.preventDefault();
                setToast("", "");

                const body = {
                    name: el("mName").value.trim(),
                    description: el("mDesc").value.trim(),
                    price: Number(el("mPrice").value),
                    category: el("mCat").value.trim(),
                    stockQuantity: Number(el("mStock").value),
                    isAvailable: el("mAvail").checked
                };

                try {
                    await API.post("/api/menu", body);
                    setToast("Menu item created ✅", "ok");
                    createForm.reset();
                    await loadAdminMenu();
                    await loadAdminReports();
                } catch (err) {
                    setToast(err.message, "bad");
                }
            });
        }
    } catch (err) {
        adminBox.innerHTML = `<div class="toast bad">${err.message}</div>`;
    }
}

async function loadAdminMenu() {
    const list = el("adminMenuList");
    if (!list) return;

    list.innerHTML = `<div class="muted">Loading...</div>`;
    
    const items = await API.get("/api/menu");
    
    list.innerHTML = "";

    items.forEach((it) => {
        const row = document.createElement("div");
        row.className = "item";

        const left = document.createElement("div");
        left.innerHTML = `
      <h3>${it.name}</h3>
      <div class="muted">${it.category || ""} • stock ${it.stockQuantity ?? "-"}</div>
    `;

        const right = document.createElement("div");
        right.className = "row";
        right.style.justifyContent = "flex-end";

        const del = document.createElement("button");
        del.className = "btn danger";
        del.textContent = "Delete";
        del.addEventListener("click", async () => {
            try {
                await API.del(`/api/menu/${it._id}`);
                setToast("Deleted ✅", "ok");
                await loadAdminMenu();
                await loadAdminReports();
            } catch (err) {
                setToast(err.message, "bad");
            }
        });

        const edit = document.createElement("button");
        edit.className = "btn secondary";
        edit.textContent = "Edit";
        edit.addEventListener("click", async () => {
            const name = prompt("Name", it.name || "");
            if (name === null) return;
            const price = prompt("Price", String(it.price ?? ""));
            if (price === null) return;
            const stock = prompt("Stock", String(it.stockQuantity ?? ""));
            if (stock === null) return;

            try {
                await API.put(`/api/menu/${it._id}`, {
                    name: name.trim(),
                    price: Number(price),
                    stockQuantity: Number(stock)
                });
                setToast("Updated ✅", "ok");
                await loadAdminMenu();
                await loadAdminReports();
            } catch (err) {
                setToast(err.message, "bad");
            }
        });

        right.appendChild(edit);
        right.appendChild(del);

        row.appendChild(left);
        row.appendChild(right);

        list.appendChild(row);
    });
}

async function loadAdminReports() {
    const salesEl = el("salesBox");
    const invEl = el("inventoryBox");
    if (!salesEl || !invEl) return;

    salesEl.innerHTML = `<div class="muted">Loading...</div>`;
    invEl.innerHTML = `<div class="muted">Loading...</div>`;

    try {
        const sales = await API.get("/api/reports/sales");
        salesEl.textContent = typeof sales === "string" ? sales : JSON.stringify(sales);
    } catch (err) {
        salesEl.textContent = err.message;
    }

    try {
        const inv = await API.get("/api/reports/inventory");
        if (Array.isArray(inv)) {
            invEl.innerHTML = inv.length ? inv.map(x => `<div class="pill">${x.name || "item"}: ${x.stockQuantity ?? "-"}</div>`).join(" ") : `<div class="muted">No low-stock items</div>`;
        } else {
            invEl.textContent = JSON.stringify(inv);
        }
    } catch (err) {
        invEl.textContent = err.message;
    }
}

document.addEventListener("DOMContentLoaded", () => {
    const checkoutBtn = el("checkoutBtn");
    if (checkoutBtn) checkoutBtn.addEventListener("click", checkout);

    if (el("cartBox")) renderCart();
    if (el("ordersTableBody")) loadOrders();
    if (el("adminBox")) adminBoot();
});