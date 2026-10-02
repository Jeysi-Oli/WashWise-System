<<<<<<< HEAD
// WashWise script (shared sa lahat ng pages)

const $ = id => document.getElementById(id);

const load = key => JSON.parse(localStorage.getItem(key)) || [];

let orders = load("washwiseOrders");
let customers = load("washwiseCustomers");

const prices = { "Wash": 40, "Wash and Dry": 60, "Dry Clean": 80, "Ironing": 30 };
const statusFlow = ["Order Received", "Processing", "Ready", "Completed"];

// helpers

// so it does not error if no button page
function onClick(id, handler) {
    const el = $(id);
    if (el) el.addEventListener("click", handler);
}

function setText(id, text) {
    const el = $(id);
    if (el) el.textContent = text;
}

function showMessage(id, text, color = "green") {
    const el = $(id);
    if (!el) return;
    el.textContent = text;
    el.style.color = color;
}

// para safe kapag may special characters sa input
function esc(text) {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
}

// save tapos i-update lahat ng display
function refresh() {
    localStorage.setItem("washwiseOrders", JSON.stringify(orders));
    localStorage.setItem("washwiseCustomers", JSON.stringify(customers));
    displayOrders();
    displayCustomers();
    updatePaymentOrders();
    updateDashboard();
    displayOrderTracking();
}


// customer page

onClick("customerBtn", () => {
    const name = $("custName").value.trim();
    const contact = $("custContact").value.trim();
    const address = $("custAddress").value.trim();

    if (!name || !contact || !address) {
        return alert("Please complete all customer information.");
    }

    customers.push({ name, contact, address });
    ["custName", "custContact", "custAddress"].forEach(id => $(id).value = "");

    refresh();
    showMessage("customerMessage", "Customer saved!");
});

function displayCustomers() {
    const table = $("customerTable");
    if (!table) return;

    table.innerHTML = customers.map((c, i) => `
        <tr>
            <td>${esc(c.name)}</td>
            <td>${esc(c.contact)}</td>
            <td>${esc(c.address)}</td>
            <td><button class="delete-btn" onclick="deleteCustomer(${i})">Delete</button></td>
        </tr>
    `).join("") || '<tr><td colspan="4">No customers yet.</td></tr>';
}

function deleteCustomer(index) {
    if (!confirm("Delete this customer?")) return;

    customers.splice(index, 1);
    refresh();
}


// services page

document.querySelectorAll(".select-service").forEach(btn => {
    btn.addEventListener("click", () => {
        setText("selectedName", btn.dataset.service);
        setText("selectedPrice", "₱" + btn.dataset.price + " per kg");
        $("selectedBox").hidden = false;

        // para auto-select na siya sa orders page
        localStorage.setItem("washwiseService", btn.dataset.service);
    });
});

// kung may pinili sa services page, i-fill na agad sa order form
if ($("laundryType")) {
    $("laundryType").value = localStorage.getItem("washwiseService") || "";
}


// orders page

onClick("calculateBtn", () => {
    const type = $("laundryType").value;
    const weight = Number($("weight").value);

    if (!type || weight <= 0) {
        return alert("Please select a laundry service and enter the weight.");
    }
    $("price").value = "₱" + prices[type] * weight;
});

onClick("orderBtn", () => {
    const customer = $("customerName").value.trim();
    const contact = $("contact").value.trim();
    const address = $("address").value.trim();
    const service = $("laundryType").value;
    const weight = Number($("weight").value);
    const pickup = $("pickup").value;

    if (!customer || !contact || !address || !service || weight <= 0) {
        return alert("Please complete all required information.");
    }

    const id = "WW-" + Date.now().toString().slice(-6);

    orders.push({
        id, customer, contact, address, service, weight, pickup,
        price: prices[service] * weight,
        status: statusFlow[0],
        payment: "Pending"
    });

    refresh();
    clearOrderForm();
    showMessage("orderMessage", "Order successfully created! Order ID: " + id);
});

function displayOrders() {
    const table = $("orderTable");
    if (!table) return;

    table.innerHTML = orders.map(o => `
        <tr>
            <td>${o.id}</td>
            <td>${esc(o.customer)}</td>
            <td>${o.service}</td>
            <td>${o.weight} kg</td>
            <td>₱${o.price}</td>
            <td>${o.status}</td>
            <td>
                <button class="status-btn" onclick="updateStatus('${o.id}')">Update Status</button>
                <button class="delete-btn" onclick="deleteOrder('${o.id}')">Delete</button>
            </td>
        </tr>
    `).join("") || '<tr><td colspan="7">No orders yet.</td></tr>';
}

function updateStatus(id) {
    const order = orders.find(o => o.id === id);
    if (!order) return;

    const next = statusFlow.indexOf(order.status) + 1;
    if (next < statusFlow.length) order.status = statusFlow[next];

    refresh();
}

function deleteOrder(id) {
    if (!confirm("Are you sure you want to delete this order?")) return;

    orders = orders.filter(o => o.id !== id);
    refresh();
}

function clearOrderForm() {
    ["customerName", "contact", "address", "laundryType", "weight", "pickup", "price"]
        .forEach(id => $(id).value = "");
    localStorage.removeItem("washwiseService");
}


// payments page

onClick("paymentBtn", () => {
    const id = $("paymentOrder").value;
    const method = $("paymentMethod").value;

    if (!id || !method) {
        return alert("Please select an order and payment method.");
    }

    const order = orders.find(o => o.id === id);
    if (!order) return;

    order.payment = "Paid";
    order.paymentMethod = method;

    refresh();
    showMessage("paymentMessage", "Payment successfully recorded!");
    addNotification(order, "Payment received through " + method + ".");
});

// unpaid orders lang yung lalabas sa dropdown
function updatePaymentOrders() {
    const select = $("paymentOrder");
    if (!select) return;

    select.innerHTML = '<option value="">Select order</option>' +
        orders
            .filter(o => o.payment !== "Paid")
            .map(o => `<option value="${o.id}">${o.id} - ${esc(o.customer)} (₱${o.price})</option>`)
            .join("");
}

function addNotification(order, message) {
    const box = $("notificationBox");
    if (!box) return;

    // tanggalin muna yung default text
    if (box.textContent.includes("No notifications yet.")) box.innerHTML = "";

    const note = document.createElement("div");
    note.className = "notification";
    note.innerHTML = `
        <strong>${esc(order.customer)}</strong>
        <p>${message}</p>
        <small>Order ID: ${order.id}</small>
    `;
    box.prepend(note);
}


// dashboard

function updateDashboard() {
    // bilang ng unique na pangalan galing sa customers at orders
    const names = new Set([...customers.map(c => c.name), ...orders.map(o => o.customer)]);

    setText("orderCount", orders.length);
    setText("customerCount", names.size);
    setText("paidCount", orders.filter(o => o.payment === "Paid").length);
}

function displayOrderTracking() {
    const container = $("orderTrackingContainer");
    if (!container) return;

    // wala pang orders
    if (orders.length === 0) {
        container.innerHTML = `
            <div class="dashboard-box">
                <h2>Order Tracking</h2>
                <p class="tracking-placeholder">No orders available yet.</p>
            </div>`;
        return;
    }

    // latest order lang yung ipapakita
    const order = orders[orders.length - 1];
    const current = statusFlow.indexOf(order.status);

    const steps = statusFlow.map((status, i) => {
        const state = i < current ? "completed" : i === current ? "active" : "";
        const line = i < statusFlow.length - 1
            ? `<div class="process-line ${i < current ? "completed" : ""}"></div>`
            : "";

        return `
            <div class="process-step ${state}">
                <div class="process-circle">${i < current ? "✓" : i + 1}</div>
                <p>${status}</p>
            </div>${line}`;
    }).join("");

    container.innerHTML = `
        <div class="dashboard-box">
            <h2>Order Tracking</h2>

            <div class="tracking-info">
                <p><strong>Order ID:</strong> ${order.id}</p>
                <p><strong>Customer:</strong> ${esc(order.customer)}</p>
                <p><strong>Service:</strong> ${order.service}</p>
                <p><strong>Weight:</strong> ${order.weight} kg</p>
                <p><strong>Total:</strong> ₱${order.price}</p>
                <p><strong>Payment:</strong> ${order.payment}</p>
            </div>

            <div class="order-process">${steps}</div>
            <p class="tracking-status">Current Status: ${order.status}</p>
        </div>`;
}


// hamburger / quick actions drawer

const hamburger = $("hamburgerBtn");
const drawer = $("drawer");
const overlay = $("overlay");

function toggleMenu(open) {
    drawer.classList.toggle("open", open);
    overlay.classList.toggle("show", open);
    hamburger.classList.toggle("open", open);
    hamburger.setAttribute("aria-expanded", open);
    drawer.setAttribute("aria-hidden", !open);
}

if (hamburger && drawer && overlay) {
    hamburger.addEventListener("click", () => toggleMenu(!drawer.classList.contains("open")));
    $("closeBtn").addEventListener("click", () => toggleMenu(false));
    overlay.addEventListener("click", () => toggleMenu(false));
    document.addEventListener("keydown", e => {
        if (e.key === "Escape") toggleMenu(false);
    });
}


// initial load
=======
// WashWise script (shared sa lahat ng pages)

const $ = id => document.getElementById(id);

const load = key => JSON.parse(localStorage.getItem(key)) || [];

let orders = load("washwiseOrders");
let customers = load("washwiseCustomers");

const prices = { "Wash": 40, "Wash and Dry": 60, "Dry Clean": 80, "Ironing": 30 };
const statusFlow = ["Order Received", "Processing", "Ready", "Completed"];


// helpers

// does not error when the button not existing
function onClick(id, handler) {
    const el = $(id);
    if (el) el.addEventListener("click", handler);
}

function setText(id, text) {
    const el = $(id);
    if (el) el.textContent = text;
}

function showMessage(id, text, color = "green") {
    const el = $(id);
    if (!el) return;
    el.textContent = text;
    el.style.color = color;
}

// para safe kapag may special characters sa input
function esc(text) {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
}

// save tapos i-update lahat ng display
function refresh() {
    localStorage.setItem("washwiseOrders", JSON.stringify(orders));
    localStorage.setItem("washwiseCustomers", JSON.stringify(customers));
    displayOrders();
    displayCustomers();
    updatePaymentOrders();
    updateDashboard();
    displayOrderTracking();
}


// customer page

onClick("customerBtn", () => {
    const name = $("custName").value.trim();
    const contact = $("custContact").value.trim();
    const address = $("custAddress").value.trim();

    if (!name || !contact || !address) {
        return alert("Please complete all customer information.");
    }

    customers.push({ name, contact, address });
    ["custName", "custContact", "custAddress"].forEach(id => $(id).value = "");

    refresh();
    showMessage("customerMessage", "Customer saved!");
});

function displayCustomers() {
    const table = $("customerTable");
    if (!table) return;

    table.innerHTML = customers.map((c, i) => `
        <tr>
            <td>${esc(c.name)}</td>
            <td>${esc(c.contact)}</td>
            <td>${esc(c.address)}</td>
            <td><button class="delete-btn" onclick="deleteCustomer(${i})">Delete</button></td>
        </tr>
    `).join("") || '<tr><td colspan="4">No customers yet.</td></tr>';
}

function deleteCustomer(index) {
    if (!confirm("Delete this customer?")) return;

    customers.splice(index, 1);
    refresh();
}


// services page

document.querySelectorAll(".select-service").forEach(btn => {
    btn.addEventListener("click", () => {
        setText("selectedName", btn.dataset.service);
        setText("selectedPrice", "₱" + btn.dataset.price + " per kg");
        $("selectedBox").hidden = false;

        // para auto-select na siya sa orders page
        localStorage.setItem("washwiseService", btn.dataset.service);
    });
});

// kung may pinili sa services page, i-fill na agad sa order form
if ($("laundryType")) {
    $("laundryType").value = localStorage.getItem("washwiseService") || "";
}


// orders page

onClick("calculateBtn", () => {
    const type = $("laundryType").value;
    const weight = Number($("weight").value);

    if (!type || weight <= 0) {
        return alert("Please select a laundry service and enter the weight.");
    }
    $("price").value = "₱" + prices[type] * weight;
});

onClick("orderBtn", () => {
    const customer = $("customerName").value.trim();
    const contact = $("contact").value.trim();
    const address = $("address").value.trim();
    const service = $("laundryType").value;
    const weight = Number($("weight").value);
    const pickup = $("pickup").value;

    if (!customer || !contact || !address || !service || weight <= 0) {
        return alert("Please complete all required information.");
    }

    const id = "WW-" + Date.now().toString().slice(-6);

    orders.push({
        id, customer, contact, address, service, weight, pickup,
        price: prices[service] * weight,
        status: statusFlow[0],
        payment: "Pending"
    });

    refresh();
    clearOrderForm();
    showMessage("orderMessage", "Order successfully created! Order ID: " + id);
});

function displayOrders() {
    const table = $("orderTable");
    if (!table) return;

    table.innerHTML = orders.map(o => `
        <tr>
            <td>${o.id}</td>
            <td>${esc(o.customer)}</td>
            <td>${o.service}</td>
            <td>${o.weight} kg</td>
            <td>₱${o.price}</td>
            <td>${o.status}</td>
            <td>
                <button class="status-btn" onclick="updateStatus('${o.id}')">Update Status</button>
                <button class="delete-btn" onclick="deleteOrder('${o.id}')">Delete</button>
            </td>
        </tr>
    `).join("") || '<tr><td colspan="7">No orders yet.</td></tr>';
}

function updateStatus(id) {
    const order = orders.find(o => o.id === id);
    if (!order) return;

    const next = statusFlow.indexOf(order.status) + 1;
    if (next < statusFlow.length) order.status = statusFlow[next];

    refresh();
}

function deleteOrder(id) {
    if (!confirm("Are you sure you want to delete this order?")) return;

    orders = orders.filter(o => o.id !== id);
    refresh();
}

function clearOrderForm() {
    ["customerName", "contact", "address", "laundryType", "weight", "pickup", "price"]
        .forEach(id => $(id).value = "");
    localStorage.removeItem("washwiseService");
}


// payments page

onClick("paymentBtn", () => {
    const id = $("paymentOrder").value;
    const method = $("paymentMethod").value;

    if (!id || !method) {
        return alert("Please select an order and payment method.");
    }

    const order = orders.find(o => o.id === id);
    if (!order) return;

    order.payment = "Paid";
    order.paymentMethod = method;

    refresh();
    showMessage("paymentMessage", "Payment successfully recorded!");
    addNotification(order, "Payment received through " + method + ".");
});

// unpaid orders lang yung lalabas sa dropdown
function updatePaymentOrders() {
    const select = $("paymentOrder");
    if (!select) return;

    select.innerHTML = '<option value="">Select order</option>' +
        orders
            .filter(o => o.payment !== "Paid")
            .map(o => `<option value="${o.id}">${o.id} - ${esc(o.customer)} (₱${o.price})</option>`)
            .join("");
}

function addNotification(order, message) {
    const box = $("notificationBox");
    if (!box) return;

    // tanggalin muna yung default text
    if (box.textContent.includes("No notifications yet.")) box.innerHTML = "";

    const note = document.createElement("div");
    note.className = "notification";
    note.innerHTML = `
        <strong>${esc(order.customer)}</strong>
        <p>${message}</p>
        <small>Order ID: ${order.id}</small>
    `;
    box.prepend(note);
}


// dashboard

function updateDashboard() {
    // bilang ng unique na pangalan galing sa customers at orders
    const names = new Set([...customers.map(c => c.name), ...orders.map(o => o.customer)]);

    setText("orderCount", orders.length);
    setText("customerCount", names.size);
    setText("paidCount", orders.filter(o => o.payment === "Paid").length);
}

function displayOrderTracking() {
    const container = $("orderTrackingContainer");
    if (!container) return;

    // wala pang orders
    if (orders.length === 0) {
        container.innerHTML = `
            <div class="dashboard-box">
                <h2>Order Tracking</h2>
                <p class="tracking-placeholder">No orders available yet.</p>
            </div>`;
        return;
    }

    // latest order lang yung ipapakita
    const order = orders[orders.length - 1];
    const current = statusFlow.indexOf(order.status);

    const steps = statusFlow.map((status, i) => {
        const state = i < current ? "completed" : i === current ? "active" : "";
        const line = i < statusFlow.length - 1
            ? `<div class="process-line ${i < current ? "completed" : ""}"></div>`
            : "";

        return `
            <div class="process-step ${state}">
                <div class="process-circle">${i < current ? "✓" : i + 1}</div>
                <p>${status}</p>
            </div>${line}`;
    }).join("");

    container.innerHTML = `
        <div class="dashboard-box">
            <h2>Order Tracking</h2>

            <div class="tracking-info">
                <p><strong>Order ID:</strong> ${order.id}</p>
                <p><strong>Customer:</strong> ${esc(order.customer)}</p>
                <p><strong>Service:</strong> ${order.service}</p>
                <p><strong>Weight:</strong> ${order.weight} kg</p>
                <p><strong>Total:</strong> ₱${order.price}</p>
                <p><strong>Payment:</strong> ${order.payment}</p>
            </div>

            <div class="order-process">${steps}</div>
            <p class="tracking-status">Current Status: ${order.status}</p>
        </div>`;
}


// hamburger / quick actions drawer

const hamburger = $("hamburgerBtn");
const drawer = $("drawer");
const overlay = $("overlay");

function toggleMenu(open) {
    drawer.classList.toggle("open", open);
    overlay.classList.toggle("show", open);
    hamburger.classList.toggle("open", open);
    hamburger.setAttribute("aria-expanded", open);
    drawer.setAttribute("aria-hidden", !open);
}

if (hamburger && drawer && overlay) {
    hamburger.addEventListener("click", () => toggleMenu(!drawer.classList.contains("open")));
    $("closeBtn").addEventListener("click", () => toggleMenu(false));
    overlay.addEventListener("click", () => toggleMenu(false));
    document.addEventListener("keydown", e => {
        if (e.key === "Escape") toggleMenu(false);
    });
}


// initial load
>>>>>>> 04a3580 (Initial commit)
refresh();