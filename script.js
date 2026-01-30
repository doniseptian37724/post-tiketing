// --- State Management ---
let cart = [];
let allTickets = tickets; // Import from data.js

let currentFilter = 'all';
let appliedDiscount = 0; // Nominal diskon
let activeVoucherCode = null; // Kode voucher aktif
let transactionHistory = JSON.parse(localStorage.getItem('transactionHistory')) || []; // Load history
let customers = JSON.parse(localStorage.getItem('customers')) || []; // Database Pelanggan
let users = JSON.parse(localStorage.getItem('users')) || []; // Database User Auth
let activeMember = null; // Member yang dipilih saat ini
let currentUser = localStorage.getItem('currentUser'); // Sesi Login
let salesChart = null; // Chart Instance

const VOUCHERS = {
    'HEMAT50': { type: 'percent', value: 50 },
    'POTONG10K': { type: 'fixed', value: 10000 },
    'MERDEKA': { type: 'percent', value: 17 }
};

// --- DOM Elements ---
const ticketGrid = document.getElementById('ticket-grid');
const cartItemsContainer = document.getElementById('cart-items');
const searchInput = document.getElementById('search-input');
const filterBtns = document.querySelectorAll('.filter-btn');

// Cart Stats Elements
const subtotalEl = document.getElementById('subtotal');
const finalTotalEl = document.getElementById('final-total');
const checkoutBtn = document.getElementById('checkout-btn');
const clearCartBtn = document.getElementById('clear-cart');

// Modal Elements
const paymentModal = document.getElementById('payment-modal');
const closeModalBtn = document.querySelector('.close-modal');
const modalTotalEl = document.getElementById('modal-total');
const cashInput = document.getElementById('cash-input');
const changeEl = document.getElementById('change-amount');
const confirmPayBtn = document.getElementById('confirm-pay');


// Sidebar & Nav Elements
// Sidebar & Nav Elements
const navThemeBtn = document.getElementById('nav-theme-btn');
const navLogoutBtn = document.getElementById('nav-logout-btn');
const navMemberBtn = document.getElementById('nav-member-btn');
const navPosBtn = document.getElementById('nav-pos-btn');     // New
const navStatsBtn = document.getElementById('nav-stats-btn'); // New
const navItems = document.querySelectorAll('.nav-item');

// Views
const viewPos = document.getElementById('view-pos');
const viewStats = document.getElementById('view-stats');

// Auth Elements
const loginOverlay = document.getElementById('login-overlay');
const loginUsernameInput = document.getElementById('login-username');
const loginPasswordInput = document.getElementById('login-password');
const loginSubmitBtn = document.getElementById('login-submit-btn');
const authToggleLink = document.getElementById('auth-toggle-link');
const authTitle = document.getElementById('auth-title');
const authMessage = document.getElementById('auth-message');

// Member Elements
const memberBtn = document.getElementById('member-btn');
const memberModal = document.getElementById('member-modal');
const closeMemberModalBtn = document.querySelector('.close-modal-member');
const memberSearchInput = document.getElementById('member-search');
const memberListContainer = document.getElementById('member-list');
const addMemberBtn = document.getElementById('add-member-btn');
const newMemberName = document.getElementById('new-member-name');
const newMemberPhone = document.getElementById('new-member-phone');
const memberInfoBar = document.getElementById('member-info-bar');
const memberNameEl = document.getElementById('member-name');
const memberPointsEl = document.getElementById('member-points');
const removeMemberBtn = document.getElementById('remove-member');

// Voucher Elements
const voucherInput = document.getElementById('voucher-input');
const applyVoucherBtn = document.getElementById('apply-voucher');
const discountRow = document.getElementById('discount-row');
const discountAmountEl = document.getElementById('discount-amount');

// --- Initialization ---
document.addEventListener('DOMContentLoaded', () => {
    // Check Auth
    if (!currentUser) {
        loginOverlay.classList.remove('hidden');
    } else {
        loginOverlay.classList.add('hidden');
        renderTickets(allTickets);
        switchView('pos'); // Force Default View
    }

    // Simulate Loading (Only if logged in for visual effect)
    if (currentUser) {
        setTimeout(() => {
            renderTickets(allTickets);
            initChart(); // Init Chart
        }, 800);
    }

    // Load Theme
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    updateThemeIcon(savedTheme);
});

// --- Theme Toggle ---
// --- Theme Toggle ---
navThemeBtn.addEventListener('click', () => {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';

    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    updateThemeIcon(newTheme);
});

function updateThemeIcon(theme) {
    const icon = navThemeBtn.querySelector('i');
    if (theme === 'dark') {
        icon.classList.replace('ph-moon', 'ph-sun');
    } else {
        icon.classList.replace('ph-sun', 'ph-moon');
    }
}

// --- Rendering Logic ---
function renderTickets(data) {
    ticketGrid.innerHTML = '';

    if (data.length === 0) {
        ticketGrid.innerHTML = `<div class="empty-results">Tidak ada tiket ditemukan</div>`;
        return;
    }

    data.forEach(ticket => {
        const card = document.createElement('div');
        card.className = 'ticket-card';
        card.onclick = () => addToCart(ticket);

        // Icon Logic
        const iconName = ticket.category === 'makanan' ? 'ph-hamburger' :
            ticket.category === 'minuman' ? 'ph-coffee' : 'ph-ticket';

        // Format Price
        const formattedPrice = formatRupiah(ticket.price);

        card.innerHTML = `
            <div class="card-img" style="display: flex; align-items: center; justify-content: center;">
                <i class="ph ${iconName}" style="font-size: 3.5rem; color: rgba(255,255,255,0.9);"></i>
            </div> 
            <div class="card-body">
                <div class="ticket-category">${ticket.category}</div>
                <h3 class="ticket-title">${ticket.title}</h3>
                <div class="ticket-price">${formattedPrice}</div>
            </div>
        `;
        ticketGrid.appendChild(card);
    });
}

function renderCart() {
    cartItemsContainer.innerHTML = '';

    if (cart.length === 0) {
        cartItemsContainer.innerHTML = `
            <div class="empty-state">
                <i class="ph ph-shopping-cart"></i>
                <p>Belum ada tiket dipilih</p>
            </div>
        `;
        updateTotals();
        return;
    }

    cart.forEach(item => {
        const itemEl = document.createElement('div');
        itemEl.className = 'cart-item';

        itemEl.innerHTML = `
            <div class="item-info">
                <h4>${item.title}</h4>
                <div class="item-price">@ ${formatRupiah(item.price)}</div>
            </div>
            <div class="item-controls">
                <button class="qty-btn" onclick="updateQty(${item.id}, -1)">-</button>
                <div class="qty-val">${item.qty}</div>
                <button class="qty-btn" onclick="updateQty(${item.id}, 1)">+</button>
            </div>
        `;
        cartItemsContainer.appendChild(itemEl);
    });

    updateTotals();
}

// --- Cart Logic ---
function addToCart(ticket) {
    playBeepSound(); // Premium interaction

    const existingItem = cart.find(item => item.id === ticket.id);

    if (existingItem) {
        existingItem.qty++;
    } else {
        cart.push({ ...ticket, qty: 1 });
    }

    renderCart();
}

function updateQty(id, change) {
    const itemIndex = cart.findIndex(item => item.id === id);
    if (itemIndex === -1) return;

    const item = cart[itemIndex];
    item.qty += change;

    if (item.qty <= 0) {
        // Remove item
        cart.splice(itemIndex, 1);
    }

    renderCart();
}

function updateTotals() {
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
    let total = subtotal;

    // Calculate Discount
    if (activeVoucherCode) {
        const voucher = VOUCHERS[activeVoucherCode];
        if (voucher.type === 'percent') {
            appliedDiscount = subtotal * (voucher.value / 100);
        } else if (voucher.type === 'fixed') {
            appliedDiscount = voucher.value;
        }
    } else {
        appliedDiscount = 0;
    }

    // Prevent negative total
    if (appliedDiscount > subtotal) appliedDiscount = subtotal;

    total = subtotal - appliedDiscount;

    // Member Discount (e.g. 5% extra or just points? Let's do POINTS only for simplicity in this version, or minimal discount)
    // Instruksi says "Member Pricing". Let's assume Members get 10% OFF automatically on top of vouchers.
    // NOTE: For simplicity and conflict avoidance, let's keep it simple: Just Points for now, OR show separate line.
    // Let's implement: Member gets implicit 10% discount if NO voucher is used? Or stack? 
    // Let's make it simple: Member Pricing = 5% auto discount.

    let memberDiscount = 0;
    if (activeMember) {
        memberDiscount = Math.floor(subtotal * 0.05); // 5% Member Discount
        if ((appliedDiscount + memberDiscount) > subtotal) {
            memberDiscount = subtotal - appliedDiscount;
        }
        total -= memberDiscount;
    }

    subtotalEl.textContent = formatRupiah(subtotal);
    finalTotalEl.textContent = formatRupiah(total);
    modalTotalEl.textContent = formatRupiah(total);

    // Update Mini Cart Info
    if (miniCartCount) miniCartCount.textContent = cart.reduce((acc, item) => acc + item.qty, 0);
    if (miniCartTotal) miniCartTotal.textContent = formatRupiah(total);

    // Show/Hide Discount Row (Combine discounts for display or show separate?)
    // Let's combine for now to save space
    const totalDisc = appliedDiscount + memberDiscount;
    if (totalDisc > 0) {
        discountRow.classList.remove('hidden');
        discountAmountEl.textContent = `-${formatRupiah(totalDisc)}`;
    } else {
        discountRow.classList.add('hidden');
    }

    // Disable checkout if empty
    checkoutBtn.disabled = total === 0 && cart.length === 0;
}

// --- Member Logic ---
memberBtn.addEventListener('click', () => {
    memberModal.classList.remove('hidden');
    renderMembers();
});

closeMemberModalBtn.addEventListener('click', () => {
    memberModal.classList.add('hidden');
});

removeMemberBtn.addEventListener('click', () => {
    activeMember = null;
    updateMemberUI();
    updateTotals();
});

function renderMembers(query = '') {
    memberListContainer.innerHTML = '';
    const filtered = customers.filter(c =>
        c.name.toLowerCase().includes(query.toLowerCase()) ||
        c.phone.includes(query)
    );

    if (filtered.length === 0) {
        memberListContainer.innerHTML = '<div style="padding:1rem; text-align:center; color:var(--text-muted)">Tidak ada member ditemukan</div>';
        return;
    }

    filtered.forEach(c => {
        const div = document.createElement('div');
        div.className = 'member-item';
        div.innerHTML = `
            <div>
                <strong>${c.name}</strong><br>
                <small>${c.phone} | Poin: ${c.points}</small>
            </div>
            <button class="icon-btn-small" style="background:var(--success)">Pilih</button>
        `;
        div.onclick = () => selectMember(c);
        memberListContainer.appendChild(div);
    });
}

memberSearchInput.addEventListener('input', (e) => {
    renderMembers(e.target.value);
});

addMemberBtn.addEventListener('click', () => {
    const name = newMemberName.value;
    const phone = newMemberPhone.value;

    if (!name || !phone) {
        alert('Isi nama dan nomor HP!');
        return;
    }

    const newMember = {
        id: `MEM-${Date.now()}`,
        name,
        phone,
        points: 0,
        joinedAt: new Date().toISOString()
    };

    customers.push(newMember);
    localStorage.setItem('customers', JSON.stringify(customers));

    newMemberName.value = '';
    newMemberPhone.value = '';

    // Auto select
    selectMember(newMember);
});

function selectMember(member) {
    activeMember = member;
    updateMemberUI();
    updateTotals();
    memberModal.classList.add('hidden');
    // alert(`Member ${member.name} aktif! Diskon 5% diterapkan.`);
}

function updateMemberUI() {
    if (activeMember) {
        memberInfoBar.classList.remove('hidden');
        memberNameEl.textContent = activeMember.name;
        memberPointsEl.textContent = `${activeMember.points} Poin`;
        memberBtn.classList.add('active'); // Style active state if needed
    } else {
        memberInfoBar.classList.add('hidden');
        memberBtn.classList.remove('active');
    }
}

// --- Voucher Logic ---
applyVoucherBtn.addEventListener('click', () => {
    if (activeVoucherCode) {
        // If a voucher is already active, this click means "remove voucher"
        activeVoucherCode = null;
        updateTotals();
        voucherInput.disabled = false;
        voucherInput.value = '';
        applyVoucherBtn.innerHTML = '<i class="ph ph-check"></i>';
        applyVoucherBtn.style.backgroundColor = 'var(--primary)';
        alert('Voucher berhasil dihapus!');
    } else {
        // No voucher active, this click means "apply voucher"
        const code = voucherInput.value.trim().toUpperCase();

        if (!code) {
            alert('Masukkan kode voucher!');
            return;
        }

        if (VOUCHERS[code]) {
            activeVoucherCode = code;
            alert(`Voucher ${code} berhasil dipasang!`);
            updateTotals();
            voucherInput.value = '';
            voucherInput.disabled = true;
            applyVoucherBtn.innerHTML = '<i class="ph ph-trash"></i>';
            applyVoucherBtn.style.backgroundColor = 'var(--danger)';
        } else {
            alert('Kode voucher tidak valid!');
            activeVoucherCode = null; // Ensure no invalid voucher is set
            updateTotals();
        }
    }
});


// --- Filter & Search ---
filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        // Update Active Class
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        currentFilter = btn.dataset.category;
        filterTickets();
    });
});

searchInput.addEventListener('input', (e) => {
    filterTickets(e.target.value.toLowerCase());
});

function filterTickets(searchTerm = '') {
    let filtered = allTickets;

    // Category Filter
    if (currentFilter !== 'all') {
        filtered = filtered.filter(t => t.category === currentFilter);
    }

    // Search Filter
    if (searchTerm) {
        filtered = filtered.filter(t => t.title.toLowerCase().includes(searchTerm));
    }

    renderTickets(filtered);
}

// --- Checkout Modal ---
checkoutBtn.addEventListener('click', () => {
    paymentModal.classList.remove('hidden');
    cashInput.value = '';
    changeEl.textContent = 'Rp 0';
    cashInput.focus();
});

closeModalBtn.addEventListener('click', () => {
    paymentModal.classList.add('hidden');
});

clearCartBtn.addEventListener('click', () => {
    if (confirm('Hapus semua item keranjang?')) {
        cart = [];
        renderCart();
    }
});

// Calculate Change Real-time
cashInput.addEventListener('input', (e) => {
    const cash = parseFloat(e.target.value) || 0;
    const total = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
    const change = cash - total;

    if (change >= 0) {
        changeEl.textContent = formatRupiah(change);
        changeEl.style.color = 'var(--success)';
        confirmPayBtn.disabled = false;
        confirmPayBtn.style.opacity = '1';
    } else {
        changeEl.textContent = 'Rp -'; // Kurang
        changeEl.style.color = 'var(--danger)';
        confirmPayBtn.disabled = true;
        confirmPayBtn.style.opacity = '0.5';
    }
});

confirmPayBtn.addEventListener('click', () => {
    // 1. Prepare Transaction Data
    const transaction = {
        id: `TRX-${Date.now()}`,
        date: new Date().toISOString(),
        items: [...cart], // Copy cart
        subtotal: cart.reduce((sum, item) => sum + (item.price * item.qty), 0),
        discount: appliedDiscount, // Note: This should ideally include member discount too for record
        total: parseInt(modalTotalEl.textContent.replace(/[^0-9]/g, '')), // Parse from formatted string or calc again
        paymentMethod: document.querySelector('.pm-btn.active').dataset.method,
        memberId: activeMember ? activeMember.id : null
    };

    // 2. Save to History
    transactionHistory.push(transaction);
    localStorage.setItem('transactionHistory', JSON.stringify(transactionHistory));

    // 3. Update Member Points
    if (activeMember) {
        // 1 Poin per 10.000 IDR
        const pointsEarned = Math.floor(transaction.total / 10000);
        const memberIdx = customers.findIndex(c => c.id === activeMember.id);
        if (memberIdx !== -1) {
            customers[memberIdx].points += pointsEarned;
            customers[memberIdx].lastVisit = new Date().toISOString();
            localStorage.setItem('customers', JSON.stringify(customers));
        }
    }

    // 4. Process Payment UI
    // alert('Transaksi Berhasil! \nStruk sedang dicetak...'); // Replaced with real print
    printReceipt(transaction, parseFloat(cashInput.value));

    cart = [];
    activeVoucherCode = null;
    activeMember = null; // Reset member after transaction? Usually yes or keep? Let's reset for next customer.
    updateMemberUI(); // Hide bar

    voucherInput.disabled = false;
    voucherInput.value = '';
    applyVoucherBtn.innerHTML = '<i class="ph ph-check"></i>';
    applyVoucherBtn.style.backgroundColor = 'var(--primary)';

    renderCart();
    paymentModal.classList.add('hidden');

    // ... stats update ...
    const currentSold = parseInt(document.getElementById('stat-sold').textContent) || 0;
    const currentRevenue = parseInt(document.getElementById('stat-revenue').textContent.replace(/[^0-9]/g, '')) || 0;
    const itemsCount = transaction.items.reduce((acc, item) => acc + item.qty, 0);

    document.getElementById('stat-sold').textContent = currentSold + itemsCount;
    document.getElementById('stat-revenue').textContent = formatRupiah(currentRevenue + transaction.total);

    updateChartData(); // Refresh Chart
});

// --- Print Logic ---
function printReceipt(trx, cashGiven) {
    const itemsList = document.getElementById('receipt-items-list');
    itemsList.innerHTML = '';

    trx.items.forEach(item => {
        itemsList.innerHTML += `
            <div class="receipt-item">
                <span>${item.title} x${item.qty}</span>
                <span>${formatRupiah(item.price * item.qty)}</span>
            </div>
        `;
    });

    // Add Discount Line if exists
    if (trx.discount > 0) {
        itemsList.innerHTML += `
            <div class="receipt-item" style="color: black; font-style: italic;">
                <span>Diskon</span>
                <span>-${formatRupiah(trx.discount)}</span>
            </div>
        `;
    }

    document.getElementById('rec-total').textContent = formatRupiah(trx.total);
    document.getElementById('rec-cash').textContent = formatRupiah(cashGiven);
    document.getElementById('rec-change').textContent = formatRupiah(cashGiven - trx.total);
    document.getElementById('rec-date').textContent = new Date().toLocaleString('id-ID');
    document.getElementById('rec-id').textContent = '#' + trx.id.slice(-8);

    // Trigger Print
    setTimeout(() => {
        window.print();
    }, 500);
}

// --- Export / Report Logic ---
const exportBtn = document.getElementById('action-export-btn'); // Stats Header Export Button

exportBtn.addEventListener('click', () => {
    if (transactionHistory.length === 0) {
        alert('Belum ada data transaksi untuk diexport.');
        return;
    }

    if (!confirm('Unduh laporan penjualan (CSV)?')) return;

    // CSV Header
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "ID Transaksi,Waktu,Item,Total Qty,Metode Bayar,Diskon,Total Bayar\n";

    // CSV Rows
    transactionHistory.forEach(trx => {
        const date = new Date(trx.date).toLocaleString('id-ID');
        const itemsSummary = trx.items.map(i => `${i.title} (${i.qty})`).join('; ');
        const totalQty = trx.items.reduce((acc, i) => acc + i.qty, 0);

        const row = [
            trx.id,
            `"${date}"`, // Quote to handle commas in date
            `"${itemsSummary}"`, // Quote to handle commas in item names
            totalQty,
            trx.paymentMethod,
            trx.discount,
            trx.total
        ].join(",");

        csvContent += row + "\r\n";
    });

    // Create Download Link
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);

    // Filename with Date
    const today = new Date().toISOString().slice(0, 10);
    link.setAttribute("download", `Laporan_Penjualan_${today}.csv`);

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
});

// --- Authentication Logic ---
let isRegisterMode = false;

authToggleLink.addEventListener('click', (e) => {
    e.preventDefault();
    isRegisterMode = !isRegisterMode;

    if (isRegisterMode) {
        authTitle.textContent = 'Daftar Akun Baru';
        loginSubmitBtn.textContent = 'Daftar';
        authMessage.textContent = 'Sudah punya akun?';
        authToggleLink.textContent = 'Masuk disini';
    } else {
        authTitle.textContent = 'Masuk Petugas';
        loginSubmitBtn.textContent = 'Masuk';
        authMessage.textContent = 'Belum punya akun?';
        authToggleLink.textContent = 'Daftar disini';
    }
});

loginSubmitBtn.addEventListener('click', handleAuth);
loginPasswordInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') handleAuth();
});

function handleAuth() {
    const username = loginUsernameInput.value.trim();
    const password = loginPasswordInput.value.trim();

    if (!username || !password) {
        alert('Data tidak boleh kosong!');
        return;
    }

    if (isRegisterMode) {
        // Register Logic
        if (users.find(u => u.username === username)) {
            alert('Username sudah terpakai!');
            return;
        }

        users.push({ username, password });
        localStorage.setItem('users', JSON.stringify(users));
        alert('Pendaftaran berhasil! Silakan login.');

        // Switch back to login mode automatically
        authToggleLink.click();

    } else {
        // Login Logic
        const validUser = users.find(u => u.username === username && u.password === password);

        if (validUser) {
            currentUser = username;
            localStorage.setItem('currentUser', username);
            loginOverlay.classList.add('hidden');
            renderTickets(allTickets);
            alert(`Selamat datang, ${username}!`);
        } else {
            alert('Username atau password salah!');
        }
    }
}



navLogoutBtn.addEventListener('click', () => {
    if (confirm('Yakin ingin keluar?')) {
        currentUser = null;
        localStorage.removeItem('currentUser');
        location.reload(); // Reload to show login screen
    }
});

const sidebarToggleKey = 'sidebarState';
const sidebarToggleBtn = document.getElementById('sidebar-toggle');
const appContainer = document.querySelector('.app-container');

// Load Saved Sidebar State
if (localStorage.getItem(sidebarToggleKey) === 'collapsed') {
    appContainer.classList.add('nav-collapsed');
}

sidebarToggleBtn.addEventListener('click', () => {
    appContainer.classList.toggle('nav-collapsed');

    // Save State
    if (appContainer.classList.contains('nav-collapsed')) {
        localStorage.setItem(sidebarToggleKey, 'collapsed');
    } else {
        localStorage.setItem(sidebarToggleKey, 'expanded');
    }
});

// --- Cart Collapse Logic ---
const cartToggleBtn = document.getElementById('cart-toggle-btn');
const cartExpandBtn = document.getElementById('cart-expand-btn');
const miniCartCount = document.getElementById('mini-cart-count');
const miniCartTotal = document.getElementById('mini-cart-total');
const cartStateKey = 'cartState';

// Load Saved Cart State
if (localStorage.getItem(cartStateKey) === 'collapsed') {
    appContainer.classList.add('cart-collapsed');
}

function toggleCart() {
    appContainer.classList.toggle('cart-collapsed');
    const isCollapsed = appContainer.classList.contains('cart-collapsed');
    localStorage.setItem(cartStateKey, isCollapsed ? 'collapsed' : 'expanded');
}

if (cartToggleBtn) cartToggleBtn.addEventListener('click', toggleCart);
if (cartExpandBtn) cartExpandBtn.addEventListener('click', toggleCart);

navMemberBtn.addEventListener('click', () => {
    memberModal.classList.remove('hidden');
    renderMembers();
});

// Sidebar Active State
// Sidebar Active State
navItems.forEach(item => {
    item.addEventListener('click', function () {
        if (this.id !== 'nav-theme-btn' && this.id !== 'nav-logout-btn' && this.id !== 'nav-member-btn') {
            navItems.forEach(n => n.classList.remove('active'));
            this.classList.add('active');
        }
    });
});

// --- View Switching Logic ---
navPosBtn.addEventListener('click', () => switchView('pos'));
navStatsBtn.addEventListener('click', () => switchView('stats'));

function switchView(viewName) {
    if (viewName === 'pos') {
        viewPos.classList.remove('hidden');
        viewStats.classList.add('hidden');
    } else if (viewName === 'stats') {
        viewPos.classList.add('hidden');
        viewStats.classList.remove('hidden');

        // Refresh Chart when view is active to ensure animation plays/canvas renders correctly
        setTimeout(() => {
            updateChartData();
        }, 100);
    }
}

// --- Utilities ---
function formatRupiah(number) {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0
    }).format(number);
}

// Simple Audio Context for "Beep"
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

function playBeepSound() {
    if (audioCtx.state === 'suspended') {
        audioCtx.resume();
    }
    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(800, audioCtx.currentTime); // 800Hz beep
    gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime); // Volume

    oscillator.start();
    oscillator.stop(audioCtx.currentTime + 0.1); // 100ms duration
}
// --- Chart.js Logic ---
function initChart() {
    const ctx = document.getElementById('salesChart').getContext('2d');

    salesChart = new Chart(ctx, {
        type: 'bar', // or 'line'
        data: {
            labels: ['08:00', '10:00', '12:00', '14:00', '16:00', '18:00', '20:00'],
            datasets: [{
                label: 'Penjualan (Rp)',
                data: [0, 0, 0, 0, 0, 0, 0],
                backgroundColor: '#4f46e5',
                borderRadius: 6,
                barThickness: 20
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                title: {
                    display: true,
                    text: 'Tren Penjualan Hari Ini',
                    align: 'start',
                    font: { size: 14, family: "'Outfit', sans-serif" }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: { color: '#f3f4f6' },
                    ticks: { display: false } // Hide numbers to be cleaner
                },
                x: {
                    grid: { display: false }
                }
            }
        }
    });

    updateChartData();
}

function updateChartData() {
    if (!salesChart) return;

    // Aggregate Data by Hour (Dummy Buckets for now based on Labels)
    // Real implementation would parse transactionHistory dates
    // Buckets: 8, 10, 12, 14, 16, 18, 20
    const buckets = { '08': 0, '10': 0, '12': 0, '14': 0, '16': 0, '18': 0, '20': 0 };

    const todayStr = new Date().toISOString().slice(0, 10);

    transactionHistory.forEach(trx => {
        if (trx.date.startsWith(todayStr)) {
            const date = new Date(trx.date);
            const hour = date.getHours();

            // Simple mapping to nearest bucket
            let key = '20';
            if (hour < 9) key = '08';
            else if (hour < 11) key = '10';
            else if (hour < 13) key = '12';
            else if (hour < 15) key = '14';
            else if (hour < 17) key = '16';
            else if (hour < 19) key = '18';

            buckets[key] += trx.total;
        }
    });

    salesChart.data.datasets[0].data = Object.values(buckets);
    salesChart.update();
}

// --- Real-time Clock ---
function startClock() {
    const timeEl = document.querySelector('#digital-clock .time');
    const dateEl = document.querySelector('#digital-clock .date');
    
    function update() {
        if (!timeEl) return;
        const now = new Date();
        
        // Time: HH:mm:ss
        timeEl.textContent = now.toLocaleTimeString('id-ID', { 
            hour: '2-digit', 
            minute: '2-digit', 
            second: '2-digit',
            hour12: false 
        }).replace(/\./g, ':'); 

        // Date: Hari, DD MMM YYYY
        dateEl.textContent = now.toLocaleDateString('id-ID', { 
            weekday: 'long', 
            day: 'numeric', 
            month: 'short', 
            year: 'numeric' 
        });
    }

    update(); 
    setInterval(update, 1000); 
}

// Init Clock
startClock();

