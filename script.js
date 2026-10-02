// ===============================
// WASHWISE JAVASCRIPT
// ===============================


// Get saved orders from localStorage
let orders = JSON.parse(localStorage.getItem("washwiseOrders")) || [];


// Service prices
const prices = {
    "Wash": 40,
    "Wash and Dry": 60,
    "Dry Clean": 80,
    "Ironing": 30
};


// ===============================
// CALCULATE PRICE
// ===============================

document.getElementById("calculateBtn").addEventListener("click", function() {

    const laundryType = document.getElementById("laundryType").value;
    const weight = Number(document.getElementById("weight").value);

    if (laundryType === "" || weight <= 0) {
        alert("Please select a laundry service and enter the weight.");
        return;
    }

    const price = prices[laundryType] * weight;

    document.getElementById("price").value = "₱" + price;

});


// ===============================
// ADD ORDER
// ===============================

document.getElementById("orderBtn").addEventListener("click", function() {

    const customerName =
        document.getElementById("customerName").value.trim();

    const contact =
        document.getElementById("contact").value.trim();

    const address =
        document.getElementById("address").value.trim();

    const laundryType =
        document.getElementById("laundryType").value;

    const weight =
        Number(document.getElementById("weight").value);

    const pickup =
        document.getElementById("pickup").value;


    if (
        customerName === "" ||
        contact === "" ||
        address === "" ||
        laundryType === "" ||
        weight <= 0
    ) {

        alert("Please complete all required information.");
        return;

    }


    const price = prices[laundryType] * weight;


    // Create Order ID
    const orderID =
        "WW-" + Date.now().toString().slice(-6);


    const newOrder = {

        id: orderID,

        customer: customerName,

        contact: contact,

        address: address,

        service: laundryType,

        weight: weight,

        price: price,

        pickup: pickup,

        status: "Order Received",

        payment: "Pending"

    };


    orders.push(newOrder);


    // Save to browser
    saveOrders();


    // Refresh display
    displayOrders();

    // Update dashboard tracking
    displayOrderTracking();


    // Clear form
    clearOrderForm();


    document.getElementById("orderMessage").textContent =
        "Order successfully created! Order ID: " + orderID;


    document.getElementById("orderMessage").style.color =
        "green";

});


// ===============================
// DISPLAY ORDERS
// ===============================

function displayOrders() {

    const table =
        document.getElementById("orderTable");

    table.innerHTML = "";


    orders.forEach(function(order) {

        const row = document.createElement("tr");


        row.innerHTML = `

            <td>${order.id}</td>

            <td>${order.customer}</td>

            <td>${order.service}</td>

            <td>${order.weight} kg</td>

            <td>₱${order.price}</td>

            <td>${order.status}</td>

            <td>

                <button
                    class="action-btn status-btn"
                    onclick="updateStatus('${order.id}')">

                    Update Status

                </button>


                <button
                    class="action-btn delete-btn"
                    onclick="deleteOrder('${order.id}')">

                    Delete

                </button>

            </td>

        `;


        table.appendChild(row);

    });


    updateDashboard();

    updatePaymentOrders();

}


// ===============================
// UPDATE ORDER STATUS
// ===============================

function updateStatus(orderID) {

    const order =
        orders.find(function(item) {

            return item.id === orderID;

        });


    if (!order) {
        return;
    }


    const statusFlow = [

        "Order Received",

        "Processing",

        "Ready",

        "Completed"

    ];


    const currentIndex =
        statusFlow.indexOf(order.status);


    if (currentIndex < statusFlow.length - 1) {

        order.status =
            statusFlow[currentIndex + 1];

    }


    // When order becomes Ready
    if (order.status === "Ready") {

        addNotification(
            order,
            "Your laundry is ready for pickup/delivery."
        );

    }


    // When completed
    if (order.status === "Completed") {

        addNotification(
            order,
            "Your laundry order has been completed."
        );

    }


    saveOrders();

    displayOrders();

    // Update dashboard order tracking
    displayOrderTracking();

}


// ===============================
// DELETE ORDER
// ===============================

function deleteOrder(orderID) {

    const confirmDelete =
        confirm("Are you sure you want to delete this order?");


    if (!confirmDelete) {
        return;
    }


    orders =
        orders.filter(function(order) {

            return order.id !== orderID;

        });


    saveOrders();

    displayOrders();

    // Update dashboard order tracking
    displayOrderTracking();

}


// ===============================
// PAYMENT
// ===============================

document.getElementById("paymentBtn").addEventListener(
    "click",
    function() {

        const orderID =
            document.getElementById("paymentOrder").value;

        const paymentMethod =
            document.getElementById("paymentMethod").value;


        if (orderID === "" || paymentMethod === "") {

            alert("Please select an order and payment method.");

            return;

        }


        const order =
            orders.find(function(item) {

                return item.id === orderID;

            });


        if (!order) {
            return;
        }


        order.payment = "Paid";

        order.paymentMethod = paymentMethod;


        saveOrders();

        displayOrders();

        // Update dashboard tracking
        displayOrderTracking();


        document.getElementById("paymentMessage").textContent =
            "Payment successfully recorded!";

        document.getElementById("paymentMessage").style.color =
            "green";


        addNotification(
            order,
            "Payment received through " + paymentMethod + "."
        );

    }
);


// ===============================
// PAYMENT ORDER DROPDOWN
// ===============================

function updatePaymentOrders() {

    const paymentOrder =
        document.getElementById("paymentOrder");


    paymentOrder.innerHTML =
        '<option value="">Select order</option>';


    orders.forEach(function(order) {

        const option =
            document.createElement("option");


        option.value = order.id;

        option.textContent =
            order.id + " - " + order.customer;


        paymentOrder.appendChild(option);

    });

}


// ===============================
// NOTIFICATIONS
// ===============================

function addNotification(order, message) {

    const notificationBox =
        document.getElementById("notificationBox");


    // Remove default message
    if (
        notificationBox.textContent.includes(
            "No notifications yet."
        )
    ) {

        notificationBox.innerHTML = "";

    }


    const notification =
        document.createElement("div");


    notification.className =
        "notification";


    notification.innerHTML = `

        <strong>${order.customer}</strong>

        <p>${message}</p>

        <small>
            Order ID: ${order.id}
        </small>

    `;


    notificationBox.prepend(notification);

}


// ===============================
// CLEAR FORM
// ===============================

function clearOrderForm() {

    document.getElementById("customerName").value = "";

    document.getElementById("contact").value = "";

    document.getElementById("address").value = "";

    document.getElementById("laundryType").value = "";

    document.getElementById("weight").value = "";

    document.getElementById("price").value = "";

}


// ===============================
// DASHBOARD
// ===============================

function updateDashboard() {

    document.getElementById("orderCount").textContent =
        orders.length;


    const customers =
        new Set(
            orders.map(function(order) {

                return order.customer;

            })
        );


    document.getElementById("customerCount").textContent =
        customers.size;


    const paidOrders =
        orders.filter(function(order) {

            return order.payment === "Paid";

        });


    document.getElementById("paidCount").textContent =
        paidOrders.length;

}


// ===============================
// DASHBOARD ORDER TRACKING
// ===============================

function displayOrderTracking() {

    const trackingContainer =
        document.getElementById("orderTrackingContainer");


    // Only run on Dashboard
    if (!trackingContainer) {
        return;
    }


    // No orders yet
    if (orders.length === 0) {

        trackingContainer.innerHTML = `

            <div class="dashboard-box order-tracking">

                <h2>Order Tracking</h2>

                <p class="tracking-placeholder">
                    No orders available yet.
                </p>

            </div>

        `;

        return;
    }


    // Show the latest order
    const order =
        orders[orders.length - 1];


    const statusFlow = [

        "Order Received",

        "Processing",

        "Ready",

        "Completed"

    ];


    const currentIndex =
        statusFlow.indexOf(order.status);


    let processHTML = "";


    statusFlow.forEach(function(status, index) {

        let className = "";


        // Completed steps
        if (index < currentIndex) {

            className = "completed";

        }


        // Current step
        else if (index === currentIndex) {

            className = "active";

        }


        processHTML += `

            <div class="process-step ${className}">

                <div class="process-circle">

                    ${
                        index < currentIndex
                        ? "✓"
                        : index + 1
                    }

                </div>

                <p>${status}</p>

            </div>

        `;


        // Add line between steps
        if (index < statusFlow.length - 1) {

            processHTML += `

                <div class="process-line
                    ${
                        index < currentIndex
                        ? "completed"
                        : ""
                    }">
                </div>

            `;

        }

    });


    trackingContainer.innerHTML = `

        <div class="dashboard-box order-tracking">

            <h2>Order Tracking</h2>


            <div class="tracking-info">

                <p>
                    <strong>Order ID:</strong>
                    ${order.id}
                </p>

                <p>
                    <strong>Customer:</strong>
                    ${order.customer}
                </p>

                <p>
                    <strong>Service:</strong>
                    ${order.service}
                </p>

                <p>
                    <strong>Weight:</strong>
                    ${order.weight} kg
                </p>

                <p>
                    <strong>Total:</strong>
                    ₱${order.price}
                </p>

                <p>
                    <strong>Payment:</strong>
                    ${order.payment}
                </p>

            </div>


            <div class="order-process">

                ${processHTML}

            </div>


            <p class="tracking-status">

                Current Status:
                ${order.status}

            </p>

        </div>

    `;

}


// ===============================
// SAVE ORDERS
// ===============================

function saveOrders() {

    localStorage.setItem(
        "washwiseOrders",
        JSON.stringify(orders)
    );

}


// ===============================
// INITIAL LOAD
// ===============================

displayOrders();

displayOrderTracking();