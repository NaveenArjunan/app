// --- In-memory mock data ---
let products = [
    { id: 1, name: "Dairy Feed", type: "Pellet", weight: 50, price: 1200, expiryDate: "2025-12-31", category: "Dairy", protein: "High" },
    { id: 2, name: "Calf Starter", type: "Mash", weight: 25, price: 700, expiryDate: "2025-10-15", category: "Calf", protein: "Medium" },
    { id: 3, name: "Organic Feed", type: "Pellet", weight: 40, price: 1500, expiryDate: "2025-09-01", category: "Organic", protein: "High" }
];
let users = [
    { id: 1, username: "admin", password: "admin", role: "ADMIN" },
    { id: 2, username: "farmer", password: "farmer", role: "FARMER" }
];
let orders = [
    { id: 1, userId: 2, productId: 1, quantity: 2, status: "Delivered" }
];
let currentUser = null;

// --- Utility functions ---
function showNotification(msg) {
    const note = document.getElementById('notification');
    note.textContent = msg;
    note.classList.remove('hidden');
    setTimeout(() => note.classList.add('hidden'), 2000);
}

// --- Language toggle ---
const langEnBtn = document.getElementById('lang-en');
const langTaBtn = document.getElementById('lang-ta');
if (langEnBtn && langTaBtn) {
    langEnBtn.onclick = () => setLanguage('en');
    langTaBtn.onclick = () => setLanguage('ta');
}
function setLanguage(lang) {
    document.body.setAttribute('data-lang', lang);
    langEnBtn.classList.toggle('active', lang === 'en');
    langTaBtn.classList.toggle('active', lang === 'ta');
    // Optionally, update text content for all sections here
}

// --- Navigation (scroll to section) ---
document.querySelectorAll('.nav-links a').forEach(link => {
    link.onclick = e => {
        e.preventDefault();
        const target = document.querySelector(link.getAttribute('href'));
        if (target) target.scrollIntoView({ behavior: 'smooth' });
    };
});

// --- Product CRUD (static) ---
function renderProducts() {
    const grid = document.getElementById('productGrid');
    if (!grid) return;
    grid.innerHTML = '';
    let filtered = products.slice();
    // Apply filters
    const cat = document.getElementById('categoryFilter')?.value;
    const form = document.getElementById('formFilter')?.value;
    const protein = document.getElementById('proteinFilter')?.value;
    if (cat && cat !== 'All Categories') filtered = filtered.filter(p => p.category === cat);
    if (form && form !== 'All Forms') filtered = filtered.filter(p => p.type === form);
    if (protein && protein !== 'All Protein Levels') filtered = filtered.filter(p => p.protein === protein);
    filtered.forEach(product => {
        const card = document.createElement('div');
        card.className = 'product-card';
        card.innerHTML = `
            <div class="product-title">${product.name} <span class="tamil">(${product.type})</span></div>
            <div class="product-meta">Weight: ${product.weight} kg</div>
            <div class="product-meta">Price: ₹${product.price}</div>
            <div class="product-meta">Expiry: ${product.expiryDate}</div>
            ${currentUser && currentUser.role === 'ADMIN' ? `<div class="product-actions">
                <button onclick="editProduct(${product.id})">Edit</button>
                <button onclick="deleteProduct(${product.id})">Delete</button>
            </div>` : ''}
        `;
        grid.appendChild(card);
    });
}
['categoryFilter','formFilter','proteinFilter'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.onchange = renderProducts;
});

// --- Product Modal Logic ---
const modal = document.getElementById('productModal');
const form = document.getElementById('productForm');
if (form && modal) {
    document.getElementById('addProductBtn')?.addEventListener('click', () => {
        form.reset();
        form.id.value = '';
        modal.classList.remove('hidden');
    });
    document.getElementById('closeModalBtn')?.addEventListener('click', () => modal.classList.add('hidden'));
    form.onsubmit = e => {
        e.preventDefault();
        const data = {
            id: form.id.value ? parseInt(form.id.value) : Date.now(),
            name: form.name.value,
            type: form.type.value,
            weight: parseFloat(form.weight.value),
            price: parseFloat(form.price.value),
            expiryDate: form.expiryDate.value,
            category: document.getElementById('categoryFilter')?.value || 'Dairy',
            protein: document.getElementById('proteinFilter')?.value || 'Medium'
        };
        if (form.id.value) {
            // Edit
            products = products.map(p => p.id === data.id ? data : p);
            showNotification('Product updated!');
        } else {
            // Add
            products.push(data);
            showNotification('Product added!');
        }
        modal.classList.add('hidden');
        renderProducts();
    };
}
window.editProduct = function(id) {
    const p = products.find(p => p.id === id);
    if (!p) return showNotification('Product not found');
    form.name.value = p.name;
    form.type.value = p.type;
    form.weight.value = p.weight;
    form.price.value = p.price;
    form.expiryDate.value = p.expiryDate;
    form.id.value = p.id;
    modal.classList.remove('hidden');
};
window.deleteProduct = function(id) {
    if (!confirm('Delete this product?')) return;
    products = products.filter(p => p.id !== id);
    showNotification('Product deleted');
    renderProducts();
};

// --- Login/Signup Logic ---
const loginForm = document.getElementById('loginForm');
if (loginForm) {
    loginForm.onsubmit = e => {
        e.preventDefault();
        const username = loginForm.username.value;
        const password = loginForm.password.value;
        const user = users.find(u => u.username === username && u.password === password);
        if (user) {
            currentUser = user;
            showNotification('Login successful!');
            renderProducts();
            renderAdminPanel();
        } else {
            showNotification('Invalid credentials');
        }
    };
    document.getElementById('signupBtn')?.addEventListener('click', () => {
        const username = prompt('Choose a username:');
        const password = prompt('Choose a password:');
        if (username && password) {
            if (users.some(u => u.username === username)) {
                showNotification('Username already exists');
            } else {
                const newUser = { id: Date.now(), username, password, role: 'FARMER' };
                users.push(newUser);
                showNotification('Signup successful! Please login.');
            }
        }
    });
}

// --- Admin Panel Logic ---
function renderAdminPanel() {
    // Dashboard widgets
    const inv = document.getElementById('invCount');
    const sales = document.getElementById('salesCount');
    const userCount = document.getElementById('userCount');
    if (inv) inv.textContent = products.length;
    if (sales) sales.textContent = orders.length;
    if (userCount) userCount.textContent = users.length;
    // Product grid in admin
    const adminGrid = document.getElementById('adminProductGrid');
    if (adminGrid) {
        adminGrid.innerHTML = '';
        products.forEach(product => {
            const card = document.createElement('div');
            card.className = 'product-card';
            card.innerHTML = `
                <div class="product-title">${product.name} <span class="tamil">(${product.type})</span></div>
                <div class="product-meta">Weight: ${product.weight} kg</div>
                <div class="product-meta">Price: ₹${product.price}</div>
                <div class="product-meta">Expiry: ${product.expiryDate}</div>
                <div class="product-actions">
                    <button onclick="editProduct(${product.id})">Edit</button>
                    <button onclick="deleteProduct(${product.id})">Delete</button>
                </div>
            `;
            adminGrid.appendChild(card);
        });
    }
    // Orders
    const orderList = document.getElementById('orderList');
    if (orderList) {
        orderList.innerHTML = orders.map(o => {
            const prod = products.find(p => p.id === o.productId);
            const user = users.find(u => u.id === o.userId);
            return `<div>Order #${o.id}: ${prod?.name || 'Unknown'} x${o.quantity} for ${user?.username || 'Unknown'} - <b>${o.status}</b></div>`;
        }).join('');
    }
    // Users
    const userList = document.getElementById('userList');
    if (userList) {
        userList.innerHTML = users.map(u => `<div>${u.username} (${u.role})</div>`).join('');
    }
    // Content manager, reports, etc. can be similarly mocked
}

// --- Contact/Inquiry Form ---
const inquiryForm = document.getElementById('inquiryForm');
if (inquiryForm) {
    inquiryForm.onsubmit = e => {
        e.preventDefault();
        showNotification('Inquiry sent! Our team will contact you.');
        inquiryForm.reset();
    };
}

// --- Initial load ---
renderProducts();
renderAdminPanel();
