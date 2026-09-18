/**
 * WargaNet Hotspot Portal Logic
 * Supports: Voucher/Member tab toggling, Carousel Slider with Dot Indicators, Marquee Ticker, 
 * Password Show/Hide, QR Scan Auto-detection & Intent redirect, and local offline browser demo simulation.
 */

let switchToVoucherMode;
let switchToMemberMode;

document.addEventListener('DOMContentLoaded', () => {
    // --- Elements ---
    const inputLabel = document.getElementById('input-label-username');
    const usernameInput = document.getElementById('username');
    const passwordContainer = document.getElementById('password-container');
    const passwordInput = document.getElementById('password');
    const loginForm = document.getElementById('login-form');
    
    const togglePasswordBtn = document.getElementById('toggle-password');
    const errorBox = document.getElementById('error-box');

    const tabBtnVoucher = document.getElementById('tab-btn-voucher');
    const tabBtnMember = document.getElementById('tab-btn-member');
    const toggleMemberLogin = document.getElementById('toggle-member-login');

    let currentTab = 'voucher'; // 'voucher' or 'member'

    // --- CAROUSEL SLIDER LOGIC ---
    let currentSlide = 0;
    const slides = document.querySelectorAll('.carousel-slide');
    const dots = document.querySelectorAll('.carousel-dot');
    const slideIntervalTime = 4500; // 4.5 seconds auto play
    let slideInterval;

    function showSlide(index) {
        if (!slides || slides.length === 0) return;
        
        slides.forEach(slide => slide.classList.remove('active'));
        if (dots && dots.length > 0) {
            dots.forEach(dot => dot.classList.remove('active'));
        }
        
        currentSlide = (index + slides.length) % slides.length;
        
        slides[currentSlide].classList.add('active');
        if (dots && dots[currentSlide]) {
            dots[currentSlide].classList.add('active');
        }
    }

    function nextSlide() {
        showSlide(currentSlide + 1);
    }

    function startSlideShow() {
        slideInterval = setInterval(nextSlide, slideIntervalTime);
    }

    function resetSlideShow() {
        clearInterval(slideInterval);
        startSlideShow();
    }

    if (dots && dots.length > 0) {
        dots.forEach((dot, idx) => {
            dot.addEventListener('click', () => {
                showSlide(idx);
                resetSlideShow();
            });
        });
    }

    // Initialize Slider
    if (slides && slides.length > 0) {
        showSlide(0);
        startSlideShow();
    }

    // --- MODE TOGGLE LOGIC ---
    switchToMemberMode = function() {
        currentTab = 'member';
        if (tabBtnMember) tabBtnMember.classList.add('active');
        if (tabBtnVoucher) tabBtnVoucher.classList.remove('active');
        
        if (inputLabel) inputLabel.innerText = "Username Akun";
        if (usernameInput) {
            usernameInput.placeholder = "MASUKKAN USERNAME";
            usernameInput.setAttribute('autocapitalize', 'none');
            usernameInput.classList.remove('uppercase-input');
        }
        if (passwordContainer) passwordContainer.style.display = 'block';
        if (passwordInput) {
            passwordInput.required = true;
        }
        clearError();
        if (usernameInput) usernameInput.focus();
    };

    switchToVoucherMode = function() {
        currentTab = 'voucher';
        if (tabBtnVoucher) tabBtnVoucher.classList.add('active');
        if (tabBtnMember) tabBtnMember.classList.remove('active');
        
        if (inputLabel) inputLabel.innerText = "Kode Voucher";
        if (usernameInput) {
            usernameInput.placeholder = "MASUKKAN KODE VOUCHER";
            usernameInput.setAttribute('autocapitalize', 'characters');
            usernameInput.classList.add('uppercase-input');
        }
        if (passwordContainer) passwordContainer.style.display = 'none';
        if (passwordInput) {
            passwordInput.required = false;
            passwordInput.value = '';
        }
        clearError();
        if (usernameInput) usernameInput.focus();
    };

    if (toggleMemberLogin) {
        toggleMemberLogin.addEventListener('click', (e) => {
            e.preventDefault();
            if (currentTab === 'voucher') {
                switchToMemberMode();
            } else {
                switchToVoucherMode();
            }
        });
    }

    // --- PASSWORD EYE TOGGLE LOGIC ---
    if (togglePasswordBtn && passwordInput) {
        togglePasswordBtn.addEventListener('click', () => {
            const isPassword = passwordInput.type === 'password';
            passwordInput.type = isPassword ? 'text' : 'password';
            
            if (isPassword) {
                togglePasswordBtn.innerHTML = `
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.2" stroke="currentColor" style="width:16px;height:16px;">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                    </svg>
                `;
            } else {
                togglePasswordBtn.innerHTML = `
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.2" stroke="currentColor" style="width:16px;height:16px;">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                        <circle cx="12" cy="12" r="3" />
                    </svg>
                `;
            }
        });
    }

    // --- AUTO-LOGIN VIA URL QUERY PARAMETERS (QR SCAN REDIRECT) ---
    const urlParams = new URLSearchParams(window.location.search);
    const queryUser = urlParams.get('username') || urlParams.get('user');
    const queryPass = urlParams.get('password') || urlParams.get('pass');

    if (queryUser) {
        if (usernameInput) usernameInput.value = '';
        if (passwordInput) passwordInput.value = '';

        const autoLoginOverlay = document.createElement('div');
        autoLoginOverlay.className = 'scanner-modal';
        autoLoginOverlay.style.zIndex = '200000';
        autoLoginOverlay.innerHTML = `
            <div class="scanner-modal-content" style="text-align: center; max-width: 280px; padding: 24px 20px;">
                <h3 style="color: var(--c-forest-800); margin-bottom: 12px; font-size: 14px;">Mendeteksi QR Voucher</h3>
                <div class="loading-dots" style="margin: 16px 0 8px;">
                    <div class="dot"></div>
                    <div class="dot"></div>
                    <div class="dot"></div>
                </div>
                <p style="font-size: 10.5px; color: var(--c-text-muted); font-weight: 600;">Menghubungkan otomatis ke WiFi Warga...</p>
            </div>
        `;
        document.body.appendChild(autoLoginOverlay);

        setTimeout(() => {
            if (queryPass) {
                switchToMemberMode();
                if (usernameInput) usernameInput.value = queryUser;
                if (passwordInput) passwordInput.value = queryPass;
            } else {
                switchToVoucherMode();
                if (usernameInput) usernameInput.value = queryUser;
            }

            setTimeout(() => {
                if (autoLoginOverlay) autoLoginOverlay.remove();
                
                if (loginForm) {
                    if (isDemoEnv()) {
                        simulateLogin(queryPass ? 'Member' : 'Voucher', queryUser);
                    } else {
                        loginForm.submit();
                    }
                }
            }, 1000);
        }, 1200);
    }

    // --- FORM VALIDATION & OFFLINE SIMULATION ---
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            const uVal = usernameInput ? usernameInput.value.trim() : '';
            const pVal = passwordInput ? passwordInput.value.trim() : '';

            if (currentTab === 'voucher') {
                if (!uVal) {
                    e.preventDefault();
                    showError('Silakan masukkan kode voucher Anda!');
                    return;
                }
                if (passwordInput) passwordInput.value = uVal.toUpperCase();
                
                if (isDemoEnv()) {
                    e.preventDefault();
                    simulateLogin('Voucher', uVal.toUpperCase());
                }
            } else {
                if (!uVal || !pVal) {
                    e.preventDefault();
                    showError('Lengkapi username dan password member Anda!');
                    return;
                }
                
                if (isDemoEnv()) {
                    e.preventDefault();
                    simulateLogin('Member', uVal);
                }
            }
        });
    }

    // Helper Functions
    function showError(msg) {
        if (errorBox) {
            errorBox.innerHTML = `<span>⚠️</span> <div>${msg}</div>`;
            errorBox.style.display = 'flex';
        } else {
            alert(msg);
        }
    }

    function clearError() {
        if (errorBox) {
            errorBox.style.display = 'none';
        }
    }

    function isDemoEnv() {
        return window.location.hostname === 'localhost' || 
               window.location.hostname === '127.0.0.1' || 
               window.location.protocol === 'file:';
    }

    function simulateLogin(type, name) {
        localStorage.setItem('warganet_active', 'true');
        localStorage.setItem('warganet_username', name);
        localStorage.setItem('warganet_type', type);
        localStorage.setItem('warganet_ip', '192.168.1.108');
        localStorage.setItem('warganet_mac', '00:1A:2B:3C:4D:5E');
        localStorage.setItem('warganet_login_time', new Date().toLocaleTimeString());
        
        window.location.href = 'redirect.html';
    }

    // --- QR GUIDE & REDIRECT CONTROLLER ---
    const EXTERNAL_QR_SCANNER_URL = "https://templatehotspot.com/scan";

    const scannerModal = document.getElementById('scanner-modal');
    const shortcutScanBtn = document.getElementById('shortcut-scan-btn');
    const navScanBtn = document.getElementById('nav-scan-btn');
    const closeScanner = document.getElementById('close-scanner');
    const closeGuideBtn = document.getElementById('close-guide-btn');

    function handleScanAction(e) {
        if (e) e.preventDefault();
        
        if (EXTERNAL_QR_SCANNER_URL && EXTERNAL_QR_SCANNER_URL.trim() !== "") {
            const currentBase = window.location.href.split('?')[0];
            const baseRedirectParam = `redirect=${encodeURIComponent(currentBase)}`;
            
            const isAndroid = /Android/i.test(navigator.userAgent);
            if (isAndroid) {
                let cleanUrl = EXTERNAL_QR_SCANNER_URL;
                let scheme = 'https';
                if (cleanUrl.startsWith('https://')) {
                    cleanUrl = cleanUrl.slice(8);
                    scheme = 'https';
                } else if (cleanUrl.startsWith('http://')) {
                    cleanUrl = cleanUrl.slice(7);
                    scheme = 'http';
                }
                
                const innerSeparator = cleanUrl.includes('?') ? '&' : '?';
                const fallbackTargetUrl = `${EXTERNAL_QR_SCANNER_URL}${innerSeparator}${baseRedirectParam}`;
                const intentUrl = `intent://${cleanUrl}${innerSeparator}${baseRedirectParam}#Intent;scheme=${scheme};package=com.android.chrome;S.browser_fallback_url=${encodeURIComponent(fallbackTargetUrl)};end`;
                
                window.location.href = intentUrl;
            } else {
                const separator = EXTERNAL_QR_SCANNER_URL.includes('?') ? '&' : '?';
                const redirectUrl = `${EXTERNAL_QR_SCANNER_URL}${separator}${baseRedirectParam}`;
                window.location.href = redirectUrl;
            }
        } else {
            openScannerModal();
        }
    }

    function openScannerModal() {
        if (scannerModal) {
            scannerModal.style.display = 'flex';
        }
    }

    function closeScannerModal() {
        if (scannerModal) {
            scannerModal.style.display = 'none';
        }
    }

    if (shortcutScanBtn) shortcutScanBtn.addEventListener('click', handleScanAction);
    if (navScanBtn) navScanBtn.addEventListener('click', handleScanAction);
    if (closeScanner) closeScanner.addEventListener('click', closeScannerModal);
    if (closeGuideBtn) closeGuideBtn.addEventListener('click', closeScannerModal);

    if (scannerModal) {
        scannerModal.addEventListener('click', (e) => {
            if (e.target === scannerModal) {
                closeScannerModal();
            }
        });
    }
});

// --- OFFLINE SIMULATOR FOR STATUS PAGE ---
function initStatusPage() {
    const active = localStorage.getItem('warganet_active') || localStorage.getItem('maduranet_active');
    
    const isLocal = window.location.hostname === 'localhost' || 
                    window.location.hostname === '127.0.0.1' || 
                    window.location.protocol === 'file:';
                    
    if (active !== 'true' && isLocal) {
        window.location.href = 'login.html';
        return;
    }

    const username = localStorage.getItem('warganet_username') || localStorage.getItem('maduranet_username') || 'Warga-01';
    const type = localStorage.getItem('warganet_type') || localStorage.getItem('maduranet_type') || 'Voucher';
    const ip = localStorage.getItem('warganet_ip') || localStorage.getItem('maduranet_ip') || '192.168.1.108';
    const mac = localStorage.getItem('warganet_mac') || localStorage.getItem('maduranet_mac') || '00:1A:2B:3C:4D:5E';

    const userEl = document.getElementById('stat-username');
    const ipEl = document.getElementById('stat-ip');
    const macEl = document.getElementById('stat-mac');
    const uptimeEl = document.getElementById('stat-uptime');
    const typeEl = document.getElementById('stat-type');
    
    if (userEl) userEl.textContent = username;
    if (ipEl) ipEl.textContent = ip;
    if (macEl) macEl.textContent = mac;
    if (typeEl) typeEl.textContent = type;

    let count = 0;
    setInterval(() => {
        count++;
        let hrs = Math.floor(count / 3600);
        let mins = Math.floor((count % 3600) / 60);
        let secs = count % 60;
        
        let hrsStr = hrs > 0 ? hrs + 'j ' : '';
        let minsStr = mins > 0 ? mins + 'm ' : '';
        let secsStr = secs + 's';
        
        if (uptimeEl) uptimeEl.textContent = hrsStr + minsStr + secsStr;
    }, 1000);

    const logoutForm = document.getElementById('logout-form');
    if (logoutForm && isLocal) {
        logoutForm.addEventListener('submit', (e) => {
            e.preventDefault();
            localStorage.clear();
            window.location.href = 'logout.html';
        });
    }
}
