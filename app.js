import jewelryData from './data.js';

const appRoot = document.getElementById('app-root');
const logo = document.getElementById('home-logo');
const navLinks = {
    'rings': document.getElementById('nav-rings'),
    'earings': document.getElementById('nav-earings'),
    'neckles': document.getElementById('nav-neckles'),
    'braclete': document.getElementById('nav-braclete'),
};

const categoryLabels = {
    'rings': 'Rings',
    'earings': 'Earrings',
    'neckles': 'Necklaces',
    'braclete': 'Bracelets'
};

let currentView = 'home';
let currentCategory = null;
let currentProduct = null;

let videoModal, modalClose, reelVideo;

// ====== CART SYSTEM ======
let cart = [];

function getCartTotal() {
    return cart.reduce((sum, item) => {
        const raw = parseInt(item.price.replace(/,/g, ''));
        return sum + raw * item.qty;
    }, 0).toLocaleString('en-PK');
}

function updateCartBadge() {
    const badge = document.getElementById('cart-badge');
    const total = cart.reduce((sum, i) => sum + i.qty, 0);
    if (badge) {
        badge.textContent = total;
        badge.style.display = total > 0 ? 'flex' : 'none';
    }
}

function updateCartModal() {
    const cartItems = document.getElementById('cart-items');
    if (!cartItems) return;
    if (cart.length === 0) {
        cartItems.innerHTML = `
            <div style="text-align:center; padding: 2rem 0; color: var(--text-muted);">
                <i class="fas fa-shopping-bag" style="font-size: 3rem; margin-bottom: 1.5rem; color: var(--border-light); display:block;"></i>
                Your cart is currently empty.
            </div>`;
        const totalDiv = document.getElementById('cart-total-section');
        if (totalDiv) totalDiv.style.display = 'none';
        return;
    }
    cartItems.innerHTML = cart.map((item, idx) => `
        <div style="display:flex; align-items:center; gap:1rem; padding:1rem 0; border-bottom:1px solid var(--border-light);">
            <img src="${item.image}" alt="${item.name}" style="width:70px; height:70px; object-fit:contain; border-radius:8px; border:1px solid var(--border-light); background:#fff; padding:5px;">
            <div style="flex:1;">
                <div style="font-family:var(--font-heading); font-size:0.95rem; color:var(--text-main); letter-spacing:1px;">${item.name}</div>
                <div style="color:var(--gold); font-weight:600; font-size:0.9rem; margin-top:4px;">Rs. ${item.price}</div>
                <div style="display:flex; align-items:center; gap:0.5rem; margin-top:8px;">
                    <button onclick="window.appCartQty(${idx}, -1)" style="width:28px;height:28px;border:1px solid var(--border-light);background:transparent;border-radius:4px;cursor:pointer;font-size:1rem;color:var(--text-main);">−</button>
                    <span style="font-weight:600; color:var(--text-main);">${item.qty}</span>
                    <button onclick="window.appCartQty(${idx}, 1)" style="width:28px;height:28px;border:1px solid var(--border-light);background:transparent;border-radius:4px;cursor:pointer;font-size:1rem;color:var(--text-main);">+</button>
                </div>
            </div>
            <button onclick="window.appCartRemove(${idx})" style="background:none;border:none;cursor:pointer;color:var(--text-muted);font-size:1.3rem;transition:color 0.3s;" onmouseover="this.style.color='#c0392b'" onmouseout="this.style.color='var(--text-muted)'"><i class="fas fa-trash-alt"></i></button>
        </div>
    `).join('');
    const totalDiv = document.getElementById('cart-total-section');
    if (totalDiv) {
        totalDiv.style.display = 'block';
        const totalAmt = document.getElementById('cart-total-amount');
        if (totalAmt) totalAmt.textContent = 'Rs. ' + getCartTotal();
    }
}

window.appAddToCart = function(category, productId) {
    const item = jewelryData[category].find(i => i.id === productId);
    if (!item) return;
    const price = getPrice(productId);
    const existing = cart.find(c => c.id === productId);
    if (existing) {
        existing.qty++;
    } else {
        cart.push({ id: productId, name: item.name, price, image: item.images[0], qty: 1 });
    }
    updateCartBadge();
    // Show mini toast
    showToast(item.name + ' added to cart!');
};

window.appCartRemove = function(idx) {
    cart.splice(idx, 1);
    updateCartBadge();
    updateCartModal();
};

window.appCartQty = function(idx, delta) {
    cart[idx].qty += delta;
    if (cart[idx].qty <= 0) cart.splice(idx, 1);
    updateCartBadge();
    updateCartModal();
};

function showToast(msg) {
    let toast = document.getElementById('cart-toast');
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'cart-toast';
        toast.style.cssText = `position:fixed;bottom:2rem;right:2rem;background:var(--text-main);color:#fff;padding:1rem 2rem;border-radius:8px;font-family:var(--font-body);font-size:0.9rem;letter-spacing:1px;z-index:9999;box-shadow:0 8px 25px rgba(0,0,0,0.2);transition:all 0.4s;opacity:0;transform:translateY(20px);`;
        document.body.appendChild(toast);
    }
    toast.textContent = '🛍️ ' + msg;
    toast.style.opacity = '1';
    toast.style.transform = 'translateY(0)';
    clearTimeout(toast._t);
    toast._t = setTimeout(() => { toast.style.opacity = '0'; toast.style.transform = 'translateY(20px)'; }, 2500);
}

function getPrice(idStr) {
    let hash = 0;
    for (let i = 0; i < idStr.length; i++) {
        hash = idStr.charCodeAt(i) + ((hash << 5) - hash);
    }
    const val = (Math.abs(hash) % 305000) + 45000;
    return val.toLocaleString('en-PK');
}

function init() {
    videoModal = document.getElementById('video-modal');
    modalClose = document.getElementById('close-modal');
    reelVideo = document.getElementById('reel-video');

    // --- Video Modal ---
    if (modalClose) {
        modalClose.addEventListener('click', () => {
            videoModal.classList.remove('active');
            if (reelVideo) reelVideo.pause();
        });
    }
    if (videoModal) {
        videoModal.addEventListener('click', (e) => {
            if (e.target === videoModal) {
                videoModal.classList.remove('active');
                if (reelVideo) reelVideo.pause();
            }
        });
    }

    // --- Search Modal ---
    const searchModal   = document.getElementById('search-modal');
    const navSearch     = document.getElementById('nav-search');
    const closeSearch   = document.getElementById('close-search');
    const searchInput   = document.getElementById('search-input');
    const searchBtn     = document.getElementById('search-btn');
    const searchResults = document.getElementById('search-results');

    // Open search modal
    if (navSearch) {
        navSearch.addEventListener('click', () => {
            searchModal.classList.add('active');
            if (searchInput) { searchInput.value = ''; searchInput.focus(); }
            if (searchResults) searchResults.innerHTML = '';
        });
    }
    // Close search modal
    if (closeSearch) {
        closeSearch.addEventListener('click', () => searchModal.classList.remove('active'));
    }
    if (searchModal) {
        searchModal.addEventListener('click', (e) => {
            if (e.target === searchModal) searchModal.classList.remove('active');
        });
    }
    // Search functionality
    function doSearch() {
        const query = searchInput ? searchInput.value.trim().toLowerCase() : '';
        if (!searchResults) return;
        if (!query) { searchResults.innerHTML = '<p style="color:var(--text-muted);text-align:center;">Please enter a search term.</p>'; return; }
        const matches = [];
        Object.keys(jewelryData).forEach(cat => {
            jewelryData[cat].forEach(item => {
                if (item.name.toLowerCase().includes(query) || cat.includes(query)) {
                    matches.push({ cat, item });
                }
            });
        });
        if (matches.length === 0) {
            searchResults.innerHTML = '<p style="color:var(--text-muted);text-align:center;">No results found for "' + searchInput.value.trim() + '".</p>';
            return;
        }
        searchResults.innerHTML = matches.map(({ cat, item }) => `
            <div class="search-item" onclick="document.getElementById('search-modal').classList.remove('active'); window.appRenderProduct('${cat}', '${item.id}')">
                <img src="${item.images[0]}" alt="${item.name}">
                <h4>${item.name}</h4>
                <p>Rs. ${getPrice(item.id)}</p>
            </div>
        `).join('');
    }
    if (searchBtn)   searchBtn.addEventListener('click', doSearch);
    if (searchInput) searchInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') doSearch(); });

    // --- Cart Modal ---
    const cartModal  = document.getElementById('cart-modal');
    const navCart    = document.getElementById('nav-cart');
    const closeCart  = document.getElementById('close-cart');

    if (navCart) {
        navCart.addEventListener('click', () => {
            updateCartModal();
            cartModal.classList.add('active');
        });
    }
    if (closeCart) {
        closeCart.addEventListener('click', () => cartModal.classList.remove('active'));
    }
    if (cartModal) {
        cartModal.addEventListener('click', (e) => {
            if (e.target === cartModal) cartModal.classList.remove('active');
        });
    }

    // --- Logo & Nav Links ---
    if(logo) {
        logo.addEventListener('click', (e) => {
            e.preventDefault();
            renderHome();
        });
    }
    Object.keys(navLinks).forEach(key => {
        if(navLinks[key]) {
            navLinks[key].addEventListener('click', (e) => {
                e.preventDefault();
                renderCategory(key);
            });
        }
    });

    renderHome();
}

function renderHome() {
    currentView = 'home';
    
    // User's provided video for the homepage
    const heroVideoUrl = "5705007-uhd_4096_2160_24fps.mp4"; 
    
    let html = `
        <div class="fade-in">
            <section class="hero">
                <video class="hero-video" autoplay loop muted playsinline>
                    <source src="${heroVideoUrl}" type="video/mp4">
                    Your browser does not support HTML5 video.
                </video>
                <div class="hero-overlay"></div>
                <div class="hero-content">
                    <h2>Elegance in Every Detail</h2>
                    <p>Discover our exclusive luxury collection featuring exquisite rings, elegant bracelets, sophisticated earrings, and timeless necklaces.</p>
                    <button class="btn" onclick="window.appScrollToCategories()">Explore Now</button>
                </div>
            </section>

            <section id="categories" class="grid-wrapper">
                <h3 class="section-title">Shop by <span>Category</span></h3>
                <div class="category-grid">
    `;

    Object.keys(jewelryData).forEach(cat => {
        const coverImg = jewelryData[cat][0]?.images[0] || '';
        html += `
            <div class="card" onclick="window.appRenderCategory('${cat}')">
                <div class="card-img-container">
                    <img src="${coverImg}" alt="${categoryLabels[cat]}">
                </div>
                <div class="card-info">
                    <h3>${categoryLabels[cat]}</h3>
                    <div style="color: var(--gold); font-size: 0.9rem; margin-top: 5px; letter-spacing: 2px;">EXPLORE &rarr;</div>
                </div>
            </div>
        `;
    });

    html += `
                </div>
            </section>
        </div>
    `;
    
    appRoot.innerHTML = html;
    window.scrollTo(0, 0);
}

function renderCategory(category) {
    currentView = 'category';
    
    const items = jewelryData[category] || [];
    
    let html = `
        <div class="fade-in">
            <div class="view-header">
                <div class="breadcrumb">
                    <span onclick="window.appRenderHome()">Home</span> &nbsp;&gt;&nbsp; <span style="color:var(--text-main)">${categoryLabels[category]}</span>
                </div>
                <h2 class="view-title">${categoryLabels[category]} Collection</h2>
                <p style="color:var(--text-muted)">Showing ${items.length} exquisite pieces</p>
            </div>
            
            <div class="grid-wrapper">
                <div class="category-grid">
    `;
    
    items.forEach(item => {
        const price = getPrice(item.id);
        html += `
            <div class="card" onclick="window.appRenderProduct('${category}', '${item.id}')">
                <div class="card-img-container">
                    <img src="${item.images[0]}" alt="${item.name}" loading="lazy">
                </div>
                <div class="card-info">
                    <h3>${item.name}</h3>
                    <div class="card-price">Rs. ${price}</div>
                    <button class="card-btn" onclick="event.stopPropagation(); window.appAddToCart('${category}', '${item.id}');">Add to Cart</button>
                </div>
            </div>
        `;
    });

    html += `
                </div>
            </div>
        </div>
    `;
    
    appRoot.innerHTML = html;
    window.scrollTo(0, 0);
}

function renderProduct(category, productId) {
    currentView = 'product';
    
    const item = jewelryData[category].find(i => i.id === productId);
    if (!item) return;

    let imagesHtml = '';
    const numImages = item.images.length;
    let gridClass = 'product-images';
    
    if (numImages === 3) {
        gridClass += ' layout-3-images';
        imagesHtml = item.images.map(img => `<div class="img-box"><img src="${img}" alt="${item.name} view" loading="lazy"></div>`).join('');
    } else if (numImages >= 4) {
        gridClass += ' layout-4-images';
        imagesHtml = item.images.slice(0, 4).map(img => `<div class="img-box"><img src="${img}" alt="${item.name} view" loading="lazy"></div>`).join('');
    } else {
        gridClass += ' layout-4-images'; 
        imagesHtml = item.images.map(img => `<div class="img-box"><img src="${img}" alt="${item.name} view" loading="lazy"></div>`).join('');
    }

    const price = getPrice(item.id);

    appRoot.innerHTML = `
        <div class="fade-in">
            <div class="view-header" style="padding-bottom: 2rem;">
                <div class="breadcrumb">
                    <span onclick="window.appRenderHome()">Home</span> &nbsp;&gt;&nbsp; 
                    <span onclick="window.appRenderCategory('${category}')">${categoryLabels[category]}</span> &nbsp;&gt;&nbsp; 
                    <span style="color:var(--text-main)">${item.name}</span>
                </div>
            </div>
            
            <div class="product-showcase">
                <div class="product-details">
                    <h2>${item.name}</h2>
                    <div class="product-price">Rs. ${price}</div>
                    <p>Experience true luxury. This masterpiece is designed with impeccable precision, carefully curated for our most exclusive clients. Add an aura of elegance and pure sophistication to any ensemble.</p>
                    <div class="action-buttons">
                        <button class="btn btn-primary" onclick="window.appAddToCart('${category}', '${item.id}')">Add to Cart</button>
                    </div>
                </div>
                
                <div class="${gridClass}">
                    ${imagesHtml}
                </div>
            </div>
        </div>
    `;
    window.scrollTo(0, 0);
}

window.appRenderCategory = renderCategory;
window.appRenderProduct = renderProduct;
window.appRenderHome = renderHome;

// Shop Now scroll
window.appScrollToCategories = function() {
    const catSection = document.getElementById('categories');
    if (catSection) catSection.scrollIntoView({ behavior: 'smooth' });
};

window.appOpenReelModal = function() {
    if(videoModal && reelVideo) {
        videoModal.classList.add('active');
        reelVideo.loop = true;
        reelVideo.play().catch(e => console.log('Video play error:', e));
    }
};

document.addEventListener('DOMContentLoaded', init);
