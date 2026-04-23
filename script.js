let products = [];
let cart = [];
let customerData = {};
let globalCustomerInfo = {};
// let cart = JSON.parse(localStorage.getItem('cart')) || [];

// Khởi tạo
async function init() {
    try {
        const res = await fetch('data.json');
        products = await res.json();
        showHome();
    } catch (e) { console.error("Lỗi: Phải chạy qua Live Server để tải dữ liệu!"); }
}

// Sửa lại hàm showHome để bỏ khung Slider
function showHome() {
    const banner = document.getElementById('mainCarousel');
    if (banner) banner.style.display = 'block';

    const container = document.getElementById('app-container');
    
    // Chỉ giữ lại tiêu đề và lưới sản phẩm (Grid)
    container.innerHTML = `
        <h4 class="fw-bold mb-4 border-start border-4 border-danger ps-3">DANH SÁCH SẢN PHẨM</h4>
        <div class="row g-4" id="productGrid"></div>
    `;

    renderUI();
}

function renderUI() {
    const grid = document.getElementById('productGrid');
    if (!grid) return;

    // Chỉ vẽ lưới sản phẩm (Grid)
    grid.innerHTML = products.map(p => `
        <div class="col-6 col-md-4 col-lg-3">
            <div class="card h-100 border-0 shadow-sm product-card" onclick="showDetail(${p.id})">
                <div class="position-relative" style="background: #f8f9fa;">
                    <img src="${p.img}" class="card-img-top p-3" style="height: 200px; object-fit: contain;">
                </div>
                <div class="card-body d-flex flex-column">
                    <p class="text-secondary small mb-1" style="font-size: 11px;">${p.grade}</p>
                    <h6 class="product-name" style="font-size: 0.9rem;">${p.name}</h6>
                    <div class="d-flex justify-content-between align-items-center mt-auto pt-3">
                        <span class="text-danger fw-bold">${p.price.toLocaleString()}đ</span>
                        <button class="btn btn-sm btn-outline-danger" onclick="event.stopPropagation(); addToCart(${p.id})">+</button>
                    </div>
                </div>
            </div>
        </div>
    `).join('');

   
}
function renderProducts(data) {
    const grid = document.getElementById('productGrid');
    grid.innerHTML = data.map(p => `
        <div class="col-6 col-md-3">
            <div class="card h-100 product-card border-0 shadow-sm" onclick="showDetail(${p.id})">
                <div class="img-container">
                    <img src="${p.img}">
                </div>
                <div class="card-body text-center">
                    <h6 class="fw-bold text-truncate">${p.name}</h6>
                    <p class="text-danger fw-bold">${p.price.toLocaleString()}đ</p>
                    <button class="btn btn-sm btn-dark w-100 rounded-pill" 
                            onclick="event.stopPropagation(); addToCart(${p.id})">
                        Thêm giỏ
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}

function filterByGrade(gradeName, btn = null) {
    // 1. Quản lý Banner và hiệu ứng cuộn
    const banner = document.getElementById('mainCarousel');
    if (banner) banner.style.display = 'none';
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // 2. Xử lý đổi màu nút lọc (Nếu bạn dùng thanh lọc ngang kiểu TGDD)
    if (btn) {
        document.querySelectorAll('.filter-item').forEach(el => el.classList.remove('active'));
        btn.classList.add('active');
    }

    // 3. Lọc dữ liệu (Nếu gradeName là 'All' thì hiện tất cả)
    const filtered = gradeName === 'All' 
        ? products 
        : products.filter(p => p.grade === gradeName);

    // 4. Hiển thị tiêu đề và khung lưới
    const container = document.getElementById('app-container');
    container.innerHTML = `
        <div class="animate__animated animate__fadeIn">
            <h4 class="fw-bold mb-4 border-start border-4 border-danger ps-3 text-dark text-uppercase">
                ${gradeName === 'All' ? 'TẤT CẢ SẢN PHẨM' : 'PHÂN LOẠI: ' + gradeName}
            </h4>
            <div class="row g-3 g-md-4" id="productGrid"></div>
        </div>
    `;
    
    // 5. Kiểm tra và render sản phẩm
    const grid = document.getElementById('productGrid');
    if (filtered.length > 0) {
        renderProducts(filtered); // Gọi hàm render chung của bạn
    } else {
        grid.innerHTML = `
            <div class="col-12 text-center py-5">
                <i class="fas fa-box-open fa-3x text-muted mb-3"></i>
                <p class="text-muted">Hiện chưa có sản phẩm nào thuộc phân loại này.</p>
                <button class="btn btn-outline-danger btn-sm" onclick="showHome()">Quay lại trang chủ</button>
            </div>
        `;
    }
}


// 1. Hàm tìm kiếm sản phẩm
function handleSearch(event) {
    event.preventDefault();
    const query = document.getElementById('searchInput').value.toLowerCase();
    
    // Tự động ẩn banner khi tìm kiếm để tập trung vào kết quả
    const banner = document.getElementById('mainCarousel');
    if (banner) banner.style.display = 'none';

    const filtered = products.filter(p => 
        p.name.toLowerCase().includes(query) || 
        p.grade.toLowerCase().includes(query)
    );

    const container = document.getElementById('app-container');
    container.innerHTML = `
        <h4 class="fw-bold mb-4">KẾT QUẢ TÌM KIẾM: "${query}"</h4>
        <div class="row g-4" id="productGrid"></div>
    `;
    renderProducts(filtered);
}
function liveSearch(query) {
    const resultBox = document.getElementById('liveSearchResult');
    
    // Nếu không gõ gì thì ẩn khung đi
    if (!query.trim()) {
        resultBox.classList.add('d-none');
        return;
    }

    // Lọc ra tối đa 5 sản phẩm khớp tên
    const matches = products.filter(p => 
        p.name.toLowerCase().includes(query.toLowerCase())
    ).slice(0, 5);

    if (matches.length > 0) {
        resultBox.classList.remove('d-none');
        resultBox.innerHTML = matches.map(p => `
            <div class="search-item d-flex align-items-center p-2" onclick="viewQuickProduct(${p.id})">
                <img src="${p.img}" alt="${p.name}" style="width: 45px; height: 45px; object-fit: contain;" class="me-3">
                <div class="flex-grow-1">
                    <div class="fw-bold small text-dark text-truncate" style="max-width: 200px;">${p.name}</div>
                    <div class="text-danger small fw-bold">${p.price.toLocaleString()}đ</div>
                </div>
            </div>
        `).join('');
    } else {
        resultBox.innerHTML = '<div class="p-3 text-muted small text-center">Không tìm thấy sản phẩm...</div>';
        resultBox.classList.remove('d-none');
    }
}

// Hàm để khi bấm vào sản phẩm trong danh sách gợi ý sẽ hiện chi tiết luôn
function viewQuickProduct(id) {
    document.getElementById('liveSearchResult').classList.add('d-none');
    document.getElementById('searchInput').value = ""; // Xóa chữ trong ô search
    showDetail(id); // Hàm hiện chi tiết sản phẩm bạn đã có
}

// Click ra ngoài thì ẩn khung tìm kiếm
document.addEventListener('click', function(e) {
    if (!e.target.closest('.search-box') && !e.target.closest('.live-search-box')) {
        document.getElementById('liveSearchResult').classList.add('d-none');
    }
});

function showDetail(id) {
    const p = products.find(item => item.id === id);
    if (!p) return;

    const banner = document.getElementById('mainCarousel');
    if (banner) banner.style.display = 'none';

    const container = document.getElementById('app-container');

    const images = p.thumbnails && p.thumbnails.length > 0 ? p.thumbnails : [p.img]; 

    const relatedProducts = products
        .filter(item => item.grade === p.grade && item.id !== p.id)
        .slice(0, 5);

    container.innerHTML = `
        <div class="product-detail-container animate__animated animate__fadeIn px-2">
            <div class="row mb-5">
                <div class="col-md-5 mb-4">
                    <div class="main-image-container mb-3 shadow-sm bg-white rounded p-3 border text-center">
                        <img src="${p.img}" id="mainImg" class="img-fluid" alt="${p.name}" style="max-height: 400px; object-fit: contain;">
                    </div>
                    <div class="thumbnail-list d-flex gap-2 justify-content-center flex-wrap">
                        ${images.map((imgSrc, index) => `
                            <div class="thumb-item ${index === 0 ? 'active' : ''}" onclick="changeImage('${imgSrc}', this)">
                                <img src="${imgSrc}" class="img-fluid" onerror="this.parentElement.style.display='none'">
                            </div>
                        `).join('')}
                    </div>
                </div>

                <div class="col-md-4 px-md-4">
                    <nav aria-label="breadcrumb">
                        <ol class="breadcrumb mb-2">
                            <li class="breadcrumb-item"><a href="#" onclick="showHome()" class="text-decoration-none text-secondary">Trang chủ</a></li>
                            <li class="breadcrumb-item active text-danger fw-bold">${p.grade}</li>
                        </ol>
                    </nav>
                    <h2 class="fw-bold text-dark mb-2">${p.name}</h2>
                    <p class="text-muted small mb-3">SKU: <span class="text-dark fw-bold">GD-${p.id}${p.price.toString().substring(0,3)}</span></p>
                    <h3 class="text-danger fw-bold mb-4" style="font-size: 2rem;">${p.price.toLocaleString()}đ</h3>
                    
                    <div class="p-3 bg-light rounded mb-4 border-start border-4 border-danger shadow-sm">
                        <p class="mb-1"><b>Tình trạng:</b> <span class="text-success fw-bold"><i class="fas fa-check me-1"></i>Còn hàng</span></p>
                        <p class="mb-0"><b>Phân loại:</b> ${p.grade}</p>
                    </div>

                    <div class="d-flex align-items-center gap-3 mb-4">
                        
                        <button class="btn btn-danger btn-lg flex-grow-1 fw-bold shadow" onclick="addToCart(${p.id})">
                            <i class="fas fa-cart-plus me-2"></i> THÊM VÀO GIỎ
                        </button>
                    </div>
                    
                    <button class="btn btn-outline-secondary w-100 py-2" onclick="showHome()">
                        <i class="fas fa-arrow-left me-2"></i>QUAY LẠI TRANG CHỦ
                    </button>
                </div>

                <div class="col-md-3">
                    <div class="card border-0 shadow-sm mb-3">
                        <div class="card-header bg-success text-white fw-bold py-3 text-center">
                            CAM KẾT BÁN HÀNG
                        </div>
                        <ul class="list-group list-group-flush small">
                            <li class="list-group-item py-3"><i class="fas fa-certificate text-success me-2"></i> <b>Chính hãng:</b> Nguồn gốc rõ ràng</li>
                            <li class="list-group-item py-3"><i class="fas fa-shield-alt text-success me-2"></i> <b>Bảo hành:</b> Tặng kit mới nếu hàng giả</li>
                            <li class="list-group-item py-3"><i class="fas fa-truck text-success me-2"></i> <b>Giao hàng:</b> Nội thành trong 2 giờ</li>
                            <li class="list-group-item py-3"><i class="fas fa-box-open text-success me-2"></i> <b>Kiểm tra:</b> Xem hàng trước khi trả tiền</li>
                        </ul>
                    </div>
                </div>
            </div>

            <div class="row border-top pt-5">
                <div class="col-md-8 pe-md-5 mb-5">
                    <h4 class="fw-bold border-bottom border-3 border-danger d-inline-block pb-2 mb-4">MÔ TẢ SẢN PHẨM</h4>
                    <div class="product-description lh-lg text-secondary">
                        <h5 class="text-dark fw-bold mb-3">Giới thiệu mô hình</h5>
                        <p>Mô hình <b>${p.name}</b> là sản phẩm lắp ráp cao cấp thuộc dòng <b>${p.grade}</b>. Đây là sự kết hợp hoàn hảo giữa thiết kế cơ khí hiện đại và độ chi tiết sắc nét của hãng Bandai Nhật Bản.</p>
                        <ul class="list-unstyled mt-3">
                            <li class="mb-2"><i class="fas fa-caret-right text-danger me-2"></i><b>Khung xương:</b> Thiết kế chuẩn ${p.grade} vững chãi, dễ tạo dáng.</li>
                            <li class="mb-2"><i class="fas fa-caret-right text-danger me-2"></i><b>Lắp ráp:</b> Dạng bấm khớp (snap-fit) không cần dùng keo.</li>
                            <li class="mb-2"><i class="fas fa-caret-right text-danger me-2"></i><b>Chất liệu:</b> Nhựa ABS an toàn, độ bền màu cao.</li>
                            <li class="mb-2"><i class="fas fa-caret-right text-danger me-2"></i><b>Trang bị:</b> Đi kèm vũ khí đặc trưng và decal trang trí.</li>
                        </ul>
                    </div>
                </div>
                <div class="col-md-4">
                    <h4 class="fw-bold border-bottom border-3 border-dark d-inline-block pb-2 mb-4">THÔNG SỐ KỸ THUẬT</h4>
                    <table class="table table-bordered shadow-sm">
                        <tbody>
                            <tr><td class="bg-light fw-bold w-40">Cấp độ</td><td>${p.grade}</td></tr>
                            <tr><td class="bg-light fw-bold">Tỉ lệ</td><td>1/144 (Dự kiến)</td></tr>
                            <tr><td class="bg-light fw-bold">Thương hiệu</td><td>Bandai Namco</td></tr>
                            <tr><td class="bg-light fw-bold">Nguồn gốc</td><td>Nhật Bản</td></tr>
                            <tr><td class="bg-light fw-bold">Độ tuổi</td><td>15+</td></tr>
                        </tbody>
                    </table>
                </div>
            </div>

            <div class="related-products-section mt-5 border-top pt-5 pb-5">
                <div class="text-center mb-5">
                    <h4 class="fw-bold text-uppercase mb-1" style="letter-spacing: 3px;">Sản phẩm liên quan</h4>
                    <div class="mx-auto bg-danger" style="height: 3px; width: 80px;"></div>
                </div>
                
                <div class="row row-cols-2 row-cols-md-3 row-cols-lg-5 g-4">
                    ${relatedProducts.map(item => `
                        <div class="col">
                            <div class="card h-100 border-0 shadow-sm product-card-hover rounded-4 overflow-hidden" onclick="showDetail(${item.id})" style="cursor: pointer;">
                                <div class="position-relative p-3 bg-white">
                                    <img src="${item.img}" class="card-img-top" alt="${item.name}" style="height: 160px; object-fit: contain;">
                                    <div class="btn-add-quick">
                                        <i class="fas fa-shopping-cart text-white"></i>
                                    </div>
                                </div>
                                <div class="card-body p-3 text-center border-top">
                                    <p class="text-muted extra-small mb-1">${item.grade}</p>
                                    <h6 class="card-title text-truncate-2 mb-2 fw-bold" style="font-size: 0.85rem; height: 2.5rem;">${item.name}</h6>
                                    <p class="text-danger fw-bold mb-0">${item.price.toLocaleString()}đ</p>
                                </div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        </div>
    `;
    window.scrollTo({ top: 0, behavior: 'smooth' });
}
function changeImage(imgSrc, element) {
    const mainImg = document.getElementById('mainImg');
    
    // Thêm hiệu ứng mờ đi một chút khi đổi ảnh
    mainImg.style.opacity = '0.5';
    
    setTimeout(() => {
        mainImg.src = imgSrc;
        mainImg.style.opacity = '1';
    }, 100); // Đổi ảnh sau 0.1s
    
    // Đổi trạng thái active
    document.querySelectorAll('.thumb-item').forEach(el => el.classList.remove('active'));
    element.classList.add('active');
}



// Khởi tạo giỏ hàng


function addToCart(id) {
    const p = products.find(i => i.id === id);
    const inCart = cart.find(i => i.id === id);
    if (inCart) inCart.qty++;
    else cart.push({ id: p.id, name: p.name, price: p.price, img: p.img, grade: p.grade, qty: 1 });
    
    saveAndRefresh();
    alert("Đã thêm " + p.name + " vào giỏ hàng!");
}

function updateQty(id, delta) {
    const item = cart.find(i => i.id === id);
    if (item) {
        item.qty += delta;
        if (item.qty <= 0) cart = cart.filter(i => i.id !== id);
        saveAndRefresh();
        showCart();
    }
}

function saveAndRefresh() {
    localStorage.setItem('cart', JSON.stringify(cart));
    updateUI();
}

function updateUI() {
    const cartCount = document.getElementById('cartCount');
    if (cartCount) cartCount.innerText = cart.reduce((s, i) => s + i.qty, 0);
}

// Giao diện Giỏ hàng (Trước khi thanh toán)
function showCart() {
    const banner = document.getElementById('mainCarousel');
    if (banner) banner.style.display = 'none';
    const container = document.getElementById('app-container');
    
    if (cart.length === 0) {
        container.innerHTML = `<div class="text-center py-5"><h3>Giỏ hàng trống</h3><button class="btn btn-danger mt-3" onclick="showHome()">Tiếp tục mua hàng</button></div>`;
        return;
    }

    const total = cart.reduce((s, i) => s + (i.price * i.qty), 0);
    container.innerHTML = `
        <div class="row g-4 animate__animated animate__fadeIn">
            <div class="col-lg-8">
                <div class="cart-wrap bg-white p-4 shadow-sm rounded">
                    <h4 class="fw-bold mb-4 border-bottom pb-2">GIỎ HÀNG CỦA BẠN</h4>
                    <table class="table align-middle">
                        <thead class="table-light"><tr><th>Sản phẩm</th><th>Giá</th><th class="text-center">Số lượng</th><th class="text-end">Tổng</th></tr></thead>
                        <tbody>
                            ${cart.map(item => `
                                <tr>
                                    <td>
                                        <div class="d-flex align-items-center">
                                            <img src="${item.img}" width="50" height="50" class="me-3 border rounded" style="object-fit:cover">
                                            <div><div class="small fw-bold">${item.name}</div><div class="extra-small text-muted">${item.grade}</div></div>
                                        </div>
                                    </td>
                                    <td>${item.price.toLocaleString()}đ</td>
                                    <td>
                                        <div class="d-flex justify-content-center align-items-center border rounded-pill py-1 px-2" style="width: 100px; margin: 0 auto;">
                                            <button class="btn btn-sm p-0 border-0" onclick="updateQty(${item.id}, -1)">-</button>
                                            <span class="mx-3 small fw-bold">${item.qty}</span>
                                            <button class="btn btn-sm p-0 border-0" onclick="updateQty(${item.id}, 1)">+</button>
                                        </div>
                                    </td>
                                    <td class="fw-bold text-danger text-end">${(item.price * item.qty).toLocaleString()}đ</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
            <div class="col-lg-4">
                <div class="summary-box shadow-sm bg-white p-4 rounded border-top border-4 border-danger sticky-top" style="top:20px">
                    <h5 class="fw-bold mb-4">TÓM TẮT ĐƠN HÀNG</h5>
                    <div class="d-flex justify-content-between mb-4"><span class="h5 fw-bold">Tổng cộng:</span><span class="h5 fw-bold text-danger">${total.toLocaleString()}đ</span></div>
                    <button class="btn btn-danger w-100 btn-lg fw-bold py-3 mb-2 shadow" onclick="showCheckout()">TIẾN HÀNH THANH TOÁN</button>
                    <button class="btn btn-outline-secondary w-100" onclick="showHome()">Tiếp tục mua hàng</button>
                </div>
            </div>
        </div>
    `;
}
function showCheckout() {
    const container = document.getElementById('app-container');
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);

    container.innerHTML = `
        <div class="checkout-page animate__animated animate__fadeIn py-5">
            <div class="container">
                <div class="row g-5">
                    <div class="col-lg-7 border-end" id="checkout-left-col">
                        <div class="mb-4">
                            <h4 class="fw-bold mb-3 text-uppercase">Thông tin giao hàng</h4>
                        </div>
                        <div class="row g-3">
                            <div class="col-12"><input type="text" id="input-name" class="form-control py-3" placeholder="Họ và tên"></div>
                            <div class="col-md-8"><input type="email" id="input-email" class="form-control py-3" placeholder="Email"></div>
                            <div class="col-md-4"><input type="tel" id="input-phone" class="form-control py-3" placeholder="Số điện thoại"></div>
                            <div class="col-12"><input type="text" id="input-address" class="form-control py-3" placeholder="Địa chỉ chi tiết (Số nhà, Phường/Xã...)"></div>
                        </div>
                        <div class="d-flex justify-content-between align-items-center mt-5">
                            <a href="#" onclick="showCart()" class="text-primary text-decoration-none small">← Quay lại giỏ hàng</a>
                            <button class="btn btn-primary px-4 py-3 fw-bold" onclick="handleGoToPayment()">TIẾP TỤC ĐẾN PHƯƠNG THỨC THANH TOÁN</button>
                        </div>
                    </div>
                    <div class="col-lg-5 ps-lg-5">
                        <div class="sticky-top" style="top: 20px;">
                            ${renderOrderSummary(cart, subtotal)}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
    window.scrollTo(0, 0);
}

function handleGoToPayment() {
    // Thu thập dữ liệu và lưu vào biến toàn cục trước khi chuyển trang
    globalCustomerInfo = {
        name: document.getElementById('input-name').value,
        email: document.getElementById('input-email').value || "Không có",
        phone: document.getElementById('input-phone').value,
        address: document.getElementById('input-address').value
    };

    if (!globalCustomerInfo.name || !globalCustomerInfo.phone || !globalCustomerInfo.address) {
        alert("Vui lòng nhập đầy đủ Họ tên, Số điện thoại và Địa chỉ!");
        return;
    }

    renderPaymentStepUI();
}

function renderPaymentStepUI() {
    const leftCol = document.getElementById('checkout-left-col');
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
    const totalWithShip = subtotal + 30000;
    
    // Link VietQR khớp với thông tin của bạn
    const qrUrl = `https://img.vietqr.io/image/vietinbank-108880723675-compact2.jpg?amount=${totalWithShip}&addInfo=THANH TOAN DON HANG&accountName=LO XUAN TRUONG`;

    leftCol.innerHTML = `
        <div class="animate__animated animate__fadeInRight">
            <h4 class="fw-bold mb-4 text-uppercase text-primary">Phương thức thanh toán</h4>
            <div class="payment-selection border rounded overflow-hidden shadow-sm bg-white">
                <div class="payment-item p-3 border-bottom">
                    <div class="form-check">
                        <input class="form-check-input" type="radio" name="paymentMethod" id="qrMethod" checked>
                        <label class="form-check-label fw-bold" for="qrMethod">Chuyển khoản VietQR</label>
                    </div>
                    <div id="qr-container" class="mt-3 p-3 bg-light rounded text-center border">
                        <img src="${qrUrl}" class="img-fluid border shadow-sm mb-3" style="max-width: 200px;">
                        <div class="text-start p-2 small">
                            <p class="mb-1">Chủ TK: <b>LO XUAN TRUONG</b></p>
                            <p class="mb-1">Số TK: <b>108880723675</b></p>
                            <p class="mb-0">Số tiền: <b class="text-danger">${totalWithShip.toLocaleString()}đ</b></p>
                        </div>
                    </div>
                </div>
                <div class="payment-item p-3">
                    <div class="form-check">
                        <input class="form-check-input" type="radio" name="paymentMethod" id="codMethod">
                        <label class="form-check-label fw-bold" for="codMethod">Thanh toán khi nhận hàng (COD)</label>
                    </div>
                </div>
            </div>
            <div class="d-flex justify-content-between align-items-center mt-5">
                <a href="#" onclick="showCheckout()" class="text-muted text-decoration-none small">← Quay lại thông tin</a>
                <button class="btn btn-danger px-5 py-3 fw-bold shadow" onclick="finishOrder()">XÁC NHẬN ĐẶT HÀNG</button>
            </div>
        </div>
    `;
}

function renderOrderSummary(cart, subtotal) {
    return `
        <div class="p-3 bg-white rounded border">
            <h5 class="fw-bold mb-4">TÓM TẮT ĐƠN HÀNG</h5>
            ${cart.map(item => `
                <div class="d-flex align-items-center mb-3">
                    <img src="${item.img}" width="50" class="rounded border me-3">
                    <div class="flex-grow-1 small fw-bold">${item.name} (x${item.qty})</div>
                    <div class="fw-bold small">${(item.price * item.qty).toLocaleString()}đ</div>
                </div>
            `).join('')}
            <div class="border-top pt-3 mt-3">
                <div class="d-flex justify-content-between mb-2"><span>Tạm tính</span><b>${subtotal.toLocaleString()}đ</b></div>
                <div class="d-flex justify-content-between mb-3"><span>Phí vận chuyển</span><b>30,000đ</b></div>
                <div class="d-flex justify-content-between align-items-center text-danger h5 fw-bold">
                    <span>TỔNG CỘNG</span><span>${(subtotal + 30000).toLocaleString()}đ</span>
                </div>
            </div>
        </div>
    `;
}

function finishOrder() {
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
    const productDetails = cart.map(item => `- ${item.name} (SL: ${item.qty})`).join('\n');
    
    // Sử dụng dữ liệu đã lưu trong globalCustomerInfo
    const templateParams = {
        from_name: globalCustomerInfo.name,
        customer_phone: globalCustomerInfo.phone,
        customer_address: globalCustomerInfo.address,
        customer_email: globalCustomerInfo.email,
        order_details: productDetails,
        total_price: (subtotal + 30000).toLocaleString() + "đ"
    };

    const btn = event.target;
    btn.disabled = true;
    btn.innerText = "ĐANG GỬI...";

    emailjs.send('service_xu93lcu', 'template_5jhgb99', templateParams)
        .then(function() {
            alert("ĐẶT HÀNG THÀNH CÔNG! Đơn hàng đã được gửi.");
            cart = [];
            localStorage.removeItem('cart');
            location.reload();
        }, function(error) {
            alert("Lỗi: " + error.text);
            btn.disabled = false;
            btn.innerText = "XÁC NHẬN ĐẶT HÀNG";
        });
}

document.addEventListener('DOMContentLoaded', init);