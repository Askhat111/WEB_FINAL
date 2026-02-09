function el(id) { return document.getElementById(id); }

function renderMenu(items) {
    const list = el("menuList");
    if (!list) return;

    list.innerHTML = "";
    if (!items || !items.length) {
        list.innerHTML = `<div class="muted">No items found</div>`;
        return;
    }

    items.forEach((it) => {
        const card = document.createElement("div");
        card.className = "item";

        const left = document.createElement("div");
        const name = document.createElement("h3");
        name.textContent = it.name || "Item";

        const meta = document.createElement("div");
        const cat = document.createElement("span");
        cat.className = "pill";
        cat.textContent = (it.category || "category");

        const stock = document.createElement("span");
        stock.className = "pill";
        stock.textContent = `stock: ${it.stockQuantity ?? "-"}`;

        meta.appendChild(cat);
        meta.appendChild(stock);

        const desc = document.createElement("div");
        desc.className = "muted";
        desc.textContent = it.description || "";

        left.appendChild(name);
        left.appendChild(meta);
        left.appendChild(desc);

        const right = document.createElement("div");
        right.style.display = "grid";
        right.style.gap = "8px";
        right.style.justifyItems = "end";

        const price = document.createElement("div");
        price.className = "price";
        price.textContent = formatMoney(it.price);

        const btn = document.createElement("button");
        btn.className = "btn";
        btn.textContent = "Add to cart";
        btn.disabled = it.isAvailable === false || (Number(it.stockQuantity) === 0);

        btn.addEventListener("click", () => addToCart(it));

        right.appendChild(price);
        right.appendChild(btn);

        card.appendChild(left);
        card.appendChild(right);
        list.appendChild(card);
    });
}

function addToCart(item) {
  if (item.stockQuantity <= 0) {
    setToast(`${item.name} is out of stock!`, 'bad');
    return;
  }
  
  if (!item.isAvailable) {
    setToast(`${item.name} is not available`, 'bad');
    return;
  }
  
  const cart = loadCart();
  const id = item._id || item.id;
  
  const existing = cart.find(x => x.menuItem === id);
  const currentQty = existing ? existing.quantity : 0;
  
  if (currentQty + 1 > item.stockQuantity) {
    setToast(`Only ${item.stockQuantity} ${item.name} available`, 'bad');
    return;
  }
  
  if (existing) {
    existing.quantity += 1;
  } else {
    cart.push({ 
      menuItem: id, 
      name: item.name, 
      price: item.price, 
      quantity: 1,
      maxStock: item.stockQuantity
    });
  }
  
  saveCart(cart);
  setToast("Added to cart ✅", "ok");
}

async function loadMenu() {
    setToast("", "");

    const category = el("categoryFilter") ? el("categoryFilter").value : "";
    const available = el("availableOnly") ? el("availableOnly").checked : false;

    let query = '';
    if (category) query += `category=${category}&`;
    if (available) query += 'available=true&';
    
    const url = query ? `/api/menu?${query.slice(0, -1)}` : '/api/menu';

    try {
        const items = await API.get(url);
        renderMenu(items);
    } catch (err) {
        setToast(err.message, "bad");
    }
}

document.addEventListener("DOMContentLoaded", () => {
    const btn = el("loadMenuBtn");
    if (btn) btn.addEventListener("click", loadMenu);

    const cat = el("categoryFilter");
    if (cat) cat.addEventListener("change", loadMenu);

    const av = el("availableOnly");
    if (av) av.addEventListener("change", loadMenu);

    loadMenu();
});