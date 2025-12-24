
const API_BASE = 'http://localhost:8787/api';

// ১. সেকশন পরিবর্তন করা (Routing)
function showSection(id) {
    document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
    document.querySelectorAll('nav button').forEach(b => b.classList.remove('active'));
    document.getElementById(id).classList.add('active');
    document.getElementById('btn-' + id).classList.add('active');

    if (id === 'partners') loadPartners();
    if (id === 'products') loadProducts();
    if (id === 'sales') loadSales();
}

// ২. পার্টনার হ্যান্ডলিং
async function loadPartners() {
    const res = await fetch(`${API_BASE}/partners`);
    const data = await res.json();
    const tbody = document.querySelector('#partnerTable tbody');
    tbody.innerHTML = data.map(p => `<tr><td>${p.id}</td><td>${p.name}</td><td>${p.mobile}</td><td>${p.partner_type}</td></tr>`).join('');
}

async function savePartner() {
    const payload = {
        name: document.getElementById('p_name').value,
        mobile: document.getElementById('p_mobile').value,
        address: document.getElementById('p_address').value,
        partner_type: document.getElementById('p_type').value
    };
    await fetch(`${API_BASE}/partners`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    });
    alert('Partner Saved!');
    loadPartners();
}

// ৩. প্রোডাক্ট হ্যান্ডলিং
async function loadProducts() {
    const res = await fetch(`${API_BASE}/products`);
    const data = await res.json();
    const tbody = document.querySelector('#productTable tbody');
    tbody.innerHTML = data.map(p => `<tr><td>${p.id}</td><td>${p.name}</td><td>${p.sale_price}</td><td>${p.stock}</td></tr>`).join('');
}

async function saveProduct() {
    const payload = {
        name: document.getElementById('pr_name').value,
        sale_price: parseFloat(document.getElementById('pr_sale').value),
        purchase_price: parseFloat(document.getElementById('pr_buy').value),
        stock: parseInt(document.getElementById('pr_stock').value),
        description: "", unit: "Pcs"
    };
    await fetch(`${API_BASE}/products`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    });
    alert('Product Saved!');
    loadProducts();
}

// ৪. সেলস অর্ডার দেখা
async function loadSales() {
    // নোট: ব্যাকএন্ডে আমরা JOIN কুয়েরি লিখেছিলাম, তাই partner_name দেখাবে
    const res = await fetch(`${API_BASE}/sales`);
    const data = await res.json();
    const tbody = document.querySelector('#salesTable tbody');
    tbody.innerHTML = data.map(s => `<tr><td>${s.id}</td><td>${s.partner_name}</td><td>${s.total_amount}</td><td>${s.status}</td></tr>`).join('');
}

// ডিফল্ট সেকশন
showSection('partners');