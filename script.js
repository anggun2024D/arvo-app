// script.js - Main application logic for Arvo

// DOM Elements
const loginModal = document.getElementById('loginModal');
const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');
const showRegister = document.getElementById('showRegister');
const showLogin = document.getElementById('showLogin');
const logoutBtn = document.getElementById('logoutBtn');
const mainContent = document.getElementById('mainContent');
const navLinks = document.querySelectorAll('.nav-link');
const pages = document.querySelectorAll('.page');
const themeToggle = document.getElementById('themeToggle');

// Modal Elements
const editScheduleModal = document.getElementById('editScheduleModal');
const editNoteModal = document.getElementById('editNoteModal');
const editGoalModal = document.getElementById('editGoalModal');
const eventModal = document.getElementById('eventModal');
const closeEventModal = document.getElementById('closeEventModal');

// Calendar Elements
const currentMonthElement = document.getElementById('currentMonth');
const calendarDaysElement = document.getElementById('calendarDays');
const prevMonthBtn = document.getElementById('prevMonth');
const nextMonthBtn = document.getElementById('nextMonth');

// Global variables
let currentUser = null;
let currentDate = new Date();
let currentMonth = currentDate.getMonth();
let currentYear = currentDate.getFullYear();
let editingScheduleId = null;
let editingNoteId = null;
let editingGoalId = null;

// Safe JSON parser: checks content-type and handles HTML/error pages gracefully
function parseJSONSafe(res) {
    const contentType = res.headers.get('content-type') || '';
    if (!res.ok) {
        // Try to parse JSON error body, otherwise return text
        if (contentType.includes('application/json')) {
            return res.json().then(errObj => Promise.reject({ status: res.status, body: errObj }));
        }
        return res.text().then(text => Promise.reject(new Error(`HTTP ${res.status}: ${text.slice(0,300)}`)));
    }

    if (contentType.includes('application/json')) {
        return res.json();
    }

    return res.text().then(text => Promise.reject(new Error('Expected JSON response but got HTML/text: ' + text.slice(0,300))));
}

function initPasswordToggles() {
    console.log('👁️ Initializing password toggles...');
    
    // Find all password inputs yang belum di-wrap
    const passwordInputs = document.querySelectorAll('input[type="password"]');
    
    passwordInputs.forEach(input => {
        // Check if already has toggle wrapper
        if (input.parentElement.classList.contains('password-input-wrapper')) {
            // Already initialized, tapi pastikan button ada
            const existingButton = input.parentElement.querySelector('.password-toggle');
            if (existingButton) {
                console.log('Password toggle already exists for:', input.id);
                return;
            }
        }
        
        // Create wrapper for input and toggle
        const wrapper = document.createElement('div');
        wrapper.className = 'password-input-wrapper';
        
        // Wrap the input
        const parent = input.parentElement;
        parent.replaceChild(wrapper, input);
        wrapper.appendChild(input);
        
        // Create toggle button
        const toggleButton = document.createElement('button');
        toggleButton.type = 'button';
        toggleButton.className = 'password-toggle';
        toggleButton.setAttribute('aria-label', 'Show password');
        toggleButton.innerHTML = '<i class="fas fa-eye"></i>';
        
        // Add toggle button
        wrapper.appendChild(toggleButton);
        
        console.log('✅ Password toggle added for:', input.id || input.name);
        
        // Add toggle functionality
        toggleButton.addEventListener('click', function() {
            const type = input.getAttribute('type') === 'password' ? 'text' : 'password';
            input.setAttribute('type', type);
            
            // Update icon
            const icon = this.querySelector('i');
            if (type === 'text') {
                icon.className = 'fas fa-eye-slash';
                this.setAttribute('aria-label', 'Hide password');
                this.classList.add('active');
            } else {
                icon.className = 'fas fa-eye';
                this.setAttribute('aria-label', 'Show password');
                this.classList.remove('active');
            }
            
            // Focus back on input
            input.focus();
        });
    });
}

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    initApp();
});

function initApp() {
    loadTheme();

    const savedUser = localStorage.getItem("arvo_user");

    if (savedUser) {
        // Validate login with backend
        fetch("backend/profile/get_profile.php")
            .then(parseJSONSafe)
            .then(data => {
                if (data.status === "success") {
                    showMainApp();
                    loadDashboardData();
                    showPage("dashboard");
                } else {
                    showLoginModal();
                    // TAMBAHKAN INI:
                    setTimeout(() => initPasswordToggles(), 100);
                }
            })
            .catch(() => {
                showLoginModal();
                // TAMBAHKAN INI:
                setTimeout(() => initPasswordToggles(), 100);
            });
    } else {
        showLoginModal();
        // TAMBAHKAN INI:
        setTimeout(() => initPasswordToggles(), 100);
    }

    if (!window.location.hash) {
        window.location.hash = "#dashboard";
    }

    setupEventListeners();

    const today = new Date().toISOString().split('T')[0];
    const scheduleDateEl = document.getElementById('scheduleDate');
    if (scheduleDateEl) scheduleDateEl.value = today;
    
    const goalDeadlineEl = document.getElementById('goalDeadline');
    if (goalDeadlineEl) goalDeadlineEl.value = today;

    const progressValueEl = document.getElementById('progressValue');
    if (progressValueEl) progressValueEl.textContent = '0%';
}

function setupEventListeners() {
    // Login/Register forms
    if (loginForm) loginForm.addEventListener('submit', handleLogin);
    if (registerForm) registerForm.addEventListener('submit', handleRegister);
    if (showRegister) showRegister.addEventListener('click', showRegisterForm);
    if (showLogin) showLogin.addEventListener('click', showLoginForm);
    if (logoutBtn) logoutBtn.addEventListener('click', handleLogout);

    // Theme toggle
    if (themeToggle) themeToggle.addEventListener('click', toggleTheme);

    // Navigation
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const pageName = e.currentTarget.getAttribute('data-page');
            showPage(pageName);
            setActiveNavLink(pageName);
        });
    });

    // Profile dropdown - FIXED
    const profileDropdownBtn = document.querySelector('.drop-btn');
    const profileDropdownContent = document.querySelector('.dropdown-content');
    
    if (profileDropdownBtn && profileDropdownContent) {
        profileDropdownBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            
            // Toggle dropdown
            const isVisible = profileDropdownContent.style.display === 'block';
            
            // Close all other dropdowns
            document.querySelectorAll('.dropdown-content').forEach(dropdown => {
                dropdown.style.display = 'none';
            });
            
            // Toggle current dropdown
            profileDropdownContent.style.display = isVisible ? 'none' : 'block';
        });
    }

    // Close dropdown when clicking outside
    document.addEventListener('click', (e) => {
        // Close profile dropdown if clicking outside
        const profileDropdown = document.querySelector('.dropdown-content');
        const dropBtn = document.querySelector('.drop-btn');
        
        if (profileDropdown && dropBtn && 
            !e.target.closest('.dropdown-content') && 
            !e.target.closest('.drop-btn')) {
            profileDropdown.style.display = 'none';
        }
    });

    // Profile dropdown menu items
    document.querySelectorAll('.dropdown-content a').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            
            // Close dropdown
            const dropdownContent = e.target.closest('.dropdown-content');
            if (dropdownContent) {
                dropdownContent.style.display = 'none';
            }
            
            // Handle navigation
            const pageName = link.getAttribute('data-page');
            if (pageName) {
                showPage(pageName);
                setActiveNavLink(pageName);
            }
            
            // Handle logout
            if (link.id === 'logoutBtn') {
                handleLogout();
            }
        });
    });

    // Hamburger menu untuk mobile
    const navHamburger = document.getElementById('navHamburger');
    if (navHamburger) {
        navHamburger.addEventListener('click', (e) => {
            e.stopPropagation();
            const navMenu = document.querySelector('.nav-menu');
            if (navMenu) {
                navMenu.classList.toggle('show');
                navHamburger.classList.toggle('active');
            }
        });
    }

    // Tutup menu saat klik di luar
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.navbar')) {
            const navMenu = document.querySelector('.nav-menu');
            const navHamburger = document.getElementById('navHamburger');
            if (navMenu && navMenu.classList.contains('show')) {
                navMenu.classList.remove('show');
                if (navHamburger) navHamburger.classList.remove('active');
            }
        }
    });

    // Schedule form
    const scheduleForm = document.getElementById('scheduleForm');
    if (scheduleForm) scheduleForm.addEventListener('submit', handleAddSchedule);
    
    // Edit Schedule Modal
    const editScheduleForm = document.getElementById('editScheduleForm');
    if (editScheduleForm) editScheduleForm.addEventListener('submit', handleUpdateSchedule);
    
    const closeEditScheduleModal = document.getElementById('closeEditScheduleModal');
    if (closeEditScheduleModal) {
        closeEditScheduleModal.addEventListener('click', () => {
            if (editScheduleModal) editScheduleModal.classList.add('hidden');
        });
    }
    
    // Notes form
    const notesForm = document.getElementById('notesForm');
    if (notesForm) notesForm.addEventListener('submit', handleAddNote);
    
    // Edit Note Modal
    const editNoteForm = document.getElementById('editNoteForm');
    if (editNoteForm) editNoteForm.addEventListener('submit', handleUpdateNote);
    
    const closeEditNoteModal = document.getElementById('closeEditNoteModal');
    if (closeEditNoteModal) {
        closeEditNoteModal.addEventListener('click', () => {
            if (editNoteModal) editNoteModal.classList.add('hidden');
        });
    }
    
    // Goals form
    const goalsForm = document.getElementById('goalsForm');
    if (goalsForm) goalsForm.addEventListener('submit', handleAddGoal);
    
    const goalProgress = document.getElementById('goalProgress');
    if (goalProgress) {
        goalProgress.addEventListener('input', (e) => {
            const progressValue = document.getElementById('progressValue');
            if (progressValue) progressValue.textContent = `${e.target.value}%`;
        });
    }
    
    const editGoalForm = document.getElementById('editGoalForm');
    if (editGoalForm) editGoalForm.addEventListener('submit', handleUpdateGoal);
    
    const editGoalProgress = document.getElementById('editGoalProgress');
    if (editGoalProgress) {
        editGoalProgress.addEventListener('input', (e) => {
            const editProgressValue = document.getElementById('editProgressValue');
            if (editProgressValue) editProgressValue.textContent = `${e.target.value}%`;
        });
    }
    
    const closeEditGoalModal = document.getElementById('closeEditGoalModal');
    if (closeEditGoalModal) {
        closeEditGoalModal.addEventListener('click', () => {
            if (editGoalModal) editGoalModal.classList.add('hidden');
        });
    }
    
    // Profile form
    const profileForm = document.getElementById('profileForm');
    if (profileForm) profileForm.addEventListener('submit', handleUpdateProfile);

    // Password form
    const passwordForm = document.getElementById('passwordForm');
    if (passwordForm) passwordForm.addEventListener('submit', handleChangePassword);
    
    // Schedule filters
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const filter = e.currentTarget.getAttribute('data-filter');
            filterSchedules(filter);
            setActiveFilter(e.currentTarget);
        });
    });
    
    // Note search
    const noteSearch = document.getElementById('noteSearch');
    if (noteSearch) noteSearch.addEventListener('input', searchNotes);
    
    // Quick action buttons
    document.querySelectorAll('.btn-hero, .btn-hero-outline, .quick-actions button, .view-all').forEach(button => {
        button.addEventListener('click', (e) => {
            e.preventDefault();
            const pageName = button.getAttribute('data-page');
            if (pageName) {
                showPage(pageName);
                setActiveNavLink(pageName);
            }
        });
    });
    
    // Calendar navigation
    if (prevMonthBtn) prevMonthBtn.addEventListener('click', () => {
        currentMonth--;
        if (currentMonth < 0) {
            currentMonth = 11;
            currentYear--;
        }
        renderCalendar();
    });
    
    if (nextMonthBtn) nextMonthBtn.addEventListener('click', () => {
        currentMonth++;
        if (currentMonth > 11) {
            currentMonth = 0;
            currentYear++;
        }
        renderCalendar();
    });
    
    // Event modal
    if (closeEventModal) {
        closeEventModal.addEventListener('click', () => {
            if (eventModal) eventModal.classList.add('hidden');
        });
    }

    // Export data button
    const exportDataBtn = document.getElementById('exportData');
    if (exportDataBtn) exportDataBtn.addEventListener('click', handleExportData);
    
    // Delete account button
    const deleteAccountBtn = document.getElementById('deleteAccount');
    if (deleteAccountBtn) deleteAccountBtn.addEventListener('click', handleDeleteAccount);
    
    // Initialize dropdown items
    document.querySelectorAll('.dropdown-content a[data-page]').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const pageName = e.currentTarget.getAttribute('data-page');
            if (pageName === 'profile') {
                showPage(pageName);
                setActiveNavLink(pageName);
            }
        });
    });

    // Footer link handlers
    document.querySelectorAll('.footer-link[data-page]').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const pageName = e.currentTarget.getAttribute('data-page');
            showPage(pageName);
            setActiveNavLink(pageName);
        });
    });
}

// Theme Functions
function loadTheme() {
    const theme = localStorage.getItem('arvo-theme') || 'light';
    document.documentElement.setAttribute('data-theme', theme);
    updateThemeButton(theme);
}

function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('arvo-theme', newTheme);
    updateThemeButton(newTheme);
}

function updateThemeButton(theme) {
    if (!themeToggle) return;
    
    const icon = themeToggle.querySelector('i');
    const text = theme === 'light' ? 'Mode Gelap' : 'Mode Terang';
    
    icon.className = theme === 'light' ? 'fas fa-moon' : 'fas fa-sun';
    themeToggle.innerHTML = `<i class="${icon.className}"></i> ${text}`;
}

// Authentication functions
function handleLogin(e) {
    e.preventDefault();

    const formData = new FormData(loginForm);

    fetch("backend/login.php", {
        method: "POST",
        body: formData
    })
    .then(parseJSONSafe)
    .then(data => {
        if (data.status === "success") {
            // simpan user ke localStorage
            localStorage.setItem("arvo_user", JSON.stringify(data.user));
            showMainApp();
            window.location.hash = "#dashboard";
            loadDashboardData();
            showNotification("Login berhasil!", "success");
        } else {
            showNotification(data.message, "error");
        }
    });

    // Log activity
    fetch("backend/activity/add_activity.php")
    .then(res => {
        console.log("Activity API Response status:", res.status);
        return res.json();
    })
    .then(json => {
        console.log("Activity logged result:", json);
        if (json.status !== "success") {
            console.error("Failed to log activity:", json.message);
        }
    })
    .catch(err => {
        console.error("Error calling add_activity.php:", err);
    });
}

function handleRegister(e) {
    e.preventDefault();

    const formData = new FormData(registerForm);

    fetch("backend/register.php", {
        method: "POST",
        body: formData
    })
    .then(parseJSONSafe)
    .then(data => {
        if (data.status === "success") {
            showNotification("Registrasi berhasil!", "success");
            showLoginForm(e);
        } else {
            showNotification(data.message, "error");
        }
    });
}

function handleLogout() {
    localStorage.removeItem("arvo_user");

    fetch("backend/logout.php").catch(() => {});
    
    showLoginModal();
    showNotification("Anda telah logout", "info");
}

// UI Functions
function showLoginModal() {
    if (loginModal) loginModal.style.display = 'flex';
    if (mainContent) mainContent.classList.add('hidden');

    showLoginForm({preventDefault: () => {}});
}

function showMainApp() {
    if (loginModal) loginModal.style.display = 'none';
    if (mainContent) mainContent.classList.remove('hidden');
}

function showLoginForm(e) {
    e.preventDefault();
    if (loginForm) loginForm.classList.remove('hidden');
    if (registerForm) registerForm.classList.add('hidden');

    // Reset forms
    if (loginForm) loginForm.reset();
    if (registerForm) registerForm.reset();

    // Reinitialize password toggles for login form
    setTimeout(() => {
        initPasswordToggles(); // TAMBAHKAN DI SINI
    }, 100); // Tunggu DOM update
}

function showRegisterForm(e) {
    e.preventDefault();
    if (loginForm) loginForm.classList.add('hidden');
    if (registerForm) registerForm.classList.remove('hidden');

    // Reset forms
    if (loginForm) loginForm.reset();
    if (registerForm) registerForm.reset();

    // Reinitialize password toggles for register form
    setTimeout(() => {
        initPasswordToggles(); // TAMBAHKAN DI SINI
    }, 100);
}

function showPage(pageName) {
    console.log('Menampilkan halaman:', pageName);
    
    // Sembunyikan semua halaman
    pages.forEach(page => {
        page.classList.remove('active');
    });
    
    // Tampilkan halaman yang dipilih
    const pageElement = document.getElementById(pageName);
    if (pageElement) {
        pageElement.classList.add('active');
        
        // Scroll ke atas
        window.scrollTo({ top: 0, behavior: 'smooth' });
        
        // Load page-specific data
        switch(pageName) {
            case 'dashboard':
                loadDashboardData();
                break;
            case 'schedule':
                loadSchedules();
                // Reset filter ke "Semua"
                document.querySelectorAll('.filter-btn').forEach(btn => {
                    btn.classList.remove('active');
                });
                const allFilterBtn = document.querySelector('.filter-btn[data-filter="all"]');
                if (allFilterBtn) {
                    allFilterBtn.classList.add('active');
                    filterSchedules('all');
                }
                break;
            case 'calendar':
                renderCalendar();
                break;
            case 'notes':
                loadNotes();
                // Reset pencarian
                const noteSearch = document.getElementById('noteSearch');
                if (noteSearch) noteSearch.value = '';
                break;
            case 'goals':
                loadGoals();
                break;
            case 'profile':
                loadProfile();
                setTimeout(() => {
                    initPasswordToggles();
                }, 300); // Tunggu form load
                break;
        }
    }
}

function setActiveNavLink(pageName) {
    console.log('Set active nav untuk:', pageName);
    
    // Remove active class from all nav links
    navLinks.forEach(link => {
        link.classList.remove('active');
    });
    
    // Add active class to clicked nav link
    const activeLink = document.querySelector(`.nav-link[data-page="${pageName}"]`);
    if (activeLink) {
        activeLink.classList.add('active');
    }
}

function setActiveFilter(activeFilter) {
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    if (activeFilter) activeFilter.classList.add('active');
}

// Data Management Functions
function handleAddSchedule(e) {
    e.preventDefault();

    const user = JSON.parse(localStorage.getItem("arvo_user"));
    if (!user) {
        showNotification("Silakan login terlebih dahulu!", "error");
        return;
    }

    const formData = new FormData(e.target);

    fetch("backend/schedule/add_schedule.php", {
        method: "POST",
        body: formData
    })
    .then(parseJSONSafe)
    .then(data => {
        if (data.status === "success") {
            showNotification("Jadwal berhasil ditambahkan!", "success");
            e.target.reset();
            loadSchedules();
            renderCalendar();
            loadDashboardData();
        } else {
            showNotification(data.message || "Gagal menambahkan jadwal", "error");
        }
    })
    .catch(err => {
        console.error("Error adding schedule:", err);
        showNotification("Terjadi kesalahan: " + (err.message || err), "error");
    });
}

function openEditScheduleModal(id) {
    const user = JSON.parse(localStorage.getItem("arvo_user"));
    if (!user) return;

    fetch("backend/schedule/get_schedule.php?id=" + id)
    .then(parseJSONSafe)
    .then(data => {
        console.log("Schedule data response:", data); // DEBUG
        
        if (data.status !== "success" || !data.schedule) {
            console.error("Failed to load schedule:", data.message);
            showNotification("Gagal memuat data jadwal untuk diedit: " + (data.message || "Data tidak ditemukan"), "error");
            return;
        }

        const sch = data.schedule;
        console.log("Schedule object:", sch); // DEBUG

        editingScheduleId = id;
        
        const elId = document.getElementById("editScheduleId");
        if (elId) elId.value = sch.id || id;
        
        const editTitle = document.getElementById("editScheduleTitle");
        if (editTitle) editTitle.value = sch.title || "";
        
        const editDate = document.getElementById("editScheduleDate");
        if (editDate) editDate.value = sch.date || "";
        
        const editTime = document.getElementById("editScheduleTime");
        if (editTime) editTime.value = sch.time || "";
        
        const editType = document.getElementById("editScheduleType");
        if (editType) editType.value = sch.type || "";
        
        const editPriority = document.getElementById("editSchedulePriority");
        if (editPriority) editPriority.value = sch.priority || "";
        
        const editDesc = document.getElementById("editScheduleDescription");
        if (editDesc) editDesc.value = sch.description || "";
        
        const editCompleted = document.getElementById("editScheduleCompleted");
        if (editCompleted) editCompleted.checked = sch.completed == 1;

        if (editScheduleModal) {
            editScheduleModal.classList.remove("hidden");
        }
    })
    .catch(err => {
        console.error('Error loading schedule for edit:', err);
        showNotification('Gagal memuat jadwal: ' + (err.message || err), 'error');
    });
}

// Jadikan fungsi openEditScheduleModal tersedia secara global
window.openEditScheduleModal = openEditScheduleModal;

function handleUpdateSchedule(e) {
    e.preventDefault();
    // Build FormData with backend-expected field names
    const formData = new FormData();
    const id = document.getElementById('editScheduleId') ? document.getElementById('editScheduleId').value : '';
    formData.append('id', id);
    
    const editTitle = document.getElementById('editScheduleTitle');
    if (editTitle) formData.append('title', editTitle.value || '');
    
    const editDate = document.getElementById('editScheduleDate');
    if (editDate) formData.append('date', editDate.value || '');
    
    const editTime = document.getElementById('editScheduleTime');
    if (editTime) formData.append('time', editTime.value || '');
    
    const editType = document.getElementById('editScheduleType');
    if (editType) formData.append('type', editType.value || '');
    
    const editPriority = document.getElementById('editSchedulePriority');
    if (editPriority) formData.append('priority', editPriority.value || '');
    
    const editDesc = document.getElementById('editScheduleDescription');
    if (editDesc) formData.append('description', editDesc.value || '');
    
    const editCompleted = document.getElementById('editScheduleCompleted');
    if (editCompleted) formData.append('completed', editCompleted.checked ? 1 : 0);

    fetch("backend/schedule/edit_schedule.php", {
        method: "POST",
        body: formData
    })
    .then(parseJSONSafe)
    .then(data => {
        if (data.status === "success") {
            showNotification("Jadwal berhasil diperbarui!", "success");
            if (editScheduleModal) editScheduleModal.classList.add("hidden");
            loadSchedules();
            renderCalendar();
            loadDashboardData();
        } else {
            showNotification(data.message || "Gagal memperbarui jadwal", "error");
        }
    })
    .catch(err => {
        console.error('Error updating schedule:', err);
        showNotification('Terjadi kesalahan: ' + (err.message || err), 'error');
    });
}

function toggleScheduleCompleted(id) {
    const formData = new FormData();
    formData.append("id", id);

    fetch("backend/schedule/toggle_completed.php", {
        method: "POST",
        body: formData
    })
    .then(r => r.json())
    .then(data => {
        loadSchedules();
        loadDashboardData();
        showNotification("Status jadwal diperbarui", "success");
    });
}

function handleAddNote(e) {
    e.preventDefault();

    const user = JSON.parse(localStorage.getItem("arvo_user"));
    if (!user) {
        showNotification("Silakan login terlebih dahulu!", "error");
        return;
    }

    const formData = new FormData(e.target);

    fetch("backend/notes/add_note.php", {
        method: "POST",
        body: formData
    })
    .then(parseJSONSafe)
    .then(data => {
        if (data.status === "success") {
            showNotification("Notulensi berhasil ditambahkan!", "success");
            e.target.reset();
            loadNotes();
            loadDashboardData();
        } else {
            showNotification(data.message || "Gagal menambahkan notulensi", "error");
        }
    })
    .catch(err => {
        console.error("Error adding note:", err);
        showNotification("Terjadi kesalahan: " + (err.message || err), "error");
    });
}

function openEditNoteModal(noteId) {
    fetch("backend/notes/get_note.php?id=" + noteId)
    .then(parseJSONSafe)
    .then(data => {
        if (data.status !== "success" || !data.note) {
            console.error("Failed to load schedule:", data.message);
            showNotification("Gagal memuat notulensi untuk diedit: " + (data.message || "Data tidak ditemukan"), "error");
            return;
        }

        const note = data.note;
        editingNoteId = noteId;

        const elId = document.getElementById("editNoteId"); 
        if (elId) elId.value = note.id || noteId;
        
        const editTitle = document.getElementById("editNoteTitle");
        if (editTitle) editTitle.value = note.title || "";
        
        const editCategory = document.getElementById("editNoteCategory");
        if (editCategory) editCategory.value = note.category || "";
        
        const editContent = document.getElementById("editNoteContent");
        if (editContent) editContent.value = note.content || "";

        if (editNoteModal) {
            editNoteModal.classList.remove("hidden");
        }
    })
    .catch(err => {
        console.error('Error loading note for edit:', err);
        showNotification('Gagal memuat notulensi: ' + (err.message || err), 'error');
    });
}

// Jadikan fungsi openEditNoteModal tersedia secara global
window.openEditNoteModal = openEditNoteModal;

function handleUpdateNote(e) {
    e.preventDefault();
    
    console.log("📝 Starting note update...");
    
    // Build FormData mapping to backend fields
    const formData = new FormData();
    const id = document.getElementById('editNoteId') ? document.getElementById('editNoteId').value : '';
    formData.append('id', id);
    
    const editTitle = document.getElementById('editNoteTitle');
    if (editTitle) formData.append('title', editTitle.value || '');
    
    const editCategory = document.getElementById('editNoteCategory');
    if (editCategory) formData.append('category', editCategory.value || '');
    
    const editContent = document.getElementById('editNoteContent');
    if (editContent) formData.append('content', editContent.value || '');
    
    // Log data being sent
    console.log("📤 Sending note data:", {
        id: id,
        title: editTitle?.value,
        category: editCategory?.value,
        content: editContent?.value
    });

    fetch("backend/notes/edit_note.php", {
        method: "POST",
        body: formData
    })
    .then(res => {
        console.log("📡 Edit note response status:", res.status, res.statusText);
        console.log("📡 Response headers:", [...res.headers.entries()]);
        return parseJSONSafe(res);
    })
    .then(data => {
        console.log("✅ Edit note success:", data);
        if (data.status === "success") {
            showNotification("Notulensi berhasil diperbarui!", "success");
            if (editNoteModal) editNoteModal.classList.add("hidden");
            loadNotes();
            loadDashboardData();
        } else {
            console.error("❌ Edit note API error:", data);
            showNotification(data.message || "Gagal memperbarui notulensi", "error");
        }
    })
    .catch(err => {
        console.error('❌ Error updating note:', err);
        console.error('Full error object:', err);
        
        // Try to get more details
        if (err.message && err.message.includes('JSON')) {
            showNotification('Server mengembalikan response tidak valid. Cek error di console.', 'error');
        } else {
            showNotification('Terjadi kesalahan: ' + (err.message || err), 'error');
        }
    });
}

function handleAddGoal(e) {
    e.preventDefault();

    const user = JSON.parse(localStorage.getItem("arvo_user"));
    if (!user) {
        showNotification("Silakan login terlebih dahulu!", "error");
        return;
    }

    const formData = new FormData(e.target);

    fetch("backend/goals/add_goal.php", {
        method: "POST",
        body: formData
    })
    .then(parseJSONSafe)
    .then(data => {
        if (data.status === "success") {
            showNotification("Target berhasil disimpan!", "success");
            e.target.reset();
            loadGoals();
            loadDashboardData();
        } else {
            showNotification(data.message || "Gagal menambahkan target", "error");
        }
    })
    .catch(err => {
        console.error("Error adding goal:", err);
        showNotification("Terjadi kesalahan: " + err.message, "error");
    });
}

function openEditGoalModal(goalId) {
    fetch("backend/goals/get_goal.php?id=" + goalId)
    .then(parseJSONSafe)
    .then(data => {
        if (data.status !== "success" || !data.goal) {
            console.error("Failed to load schedule:", data.message);
            showNotification("Gagal memuat target untuk diedit: " + (data.message || "Data tidak ditemukan"), "error");
            return;
        }

        const goal = data.goal;
        editingGoalId = goalId;

        // Gunakan optional chaining untuk semua element
        const editGoalIdEl = document.getElementById("editGoalId");
        if (editGoalIdEl) editGoalIdEl.value = goal.id || goalId;
        
        const editGoalTitleEl = document.getElementById("editGoalTitle");
        if (editGoalTitleEl) editGoalTitleEl.value = goal.title || "";
        
        const editGoalDescEl = document.getElementById("editGoalDescription");
        if (editGoalDescEl) editGoalDescEl.value = goal.description || "";
        
        const editGoalProgressEl = document.getElementById("editGoalProgress");
        if (editGoalProgressEl) editGoalProgressEl.value = goal.progress || 0;
        
        const editProgressValueEl = document.getElementById("editProgressValue");
        if (editProgressValueEl) editProgressValueEl.textContent = `${goal.progress || 0}%`;
        
        // TAMBAHKAN untuk mengisi field yang baru:
        const typeEl = document.getElementById('editGoalType');
        if (typeEl) typeEl.value = goal.type || 'semester';
        
        const deadlineEl = document.getElementById('editGoalDeadline');
        if (deadlineEl && goal.deadline) {
            deadlineEl.value = goal.deadline;
        }

        if (editGoalModal) {
            editGoalModal.classList.remove("hidden");
        }
    })
    .catch(err => {
        console.error('Error loading goal for edit:', err);
        showNotification('Gagal memuat target: ' + (err.message || err), 'error');
    });
}

// Jadikan fungsi openEditGoalModal tersedia secara global
window.openEditGoalModal = openEditGoalModal;

function handleUpdateGoal(e) {
    e.preventDefault();
    // Build FormData mapping to backend fields - PERBAIKAN DI SINI!
    const formData = new FormData();
    const id = document.getElementById('editGoalId') ? document.getElementById('editGoalId').value : '';
    
    formData.append('id', id);
    
    const editTitle = document.getElementById('editGoalTitle');
    if (editTitle) formData.append('title', editTitle.value || '');
    
    const editDesc = document.getElementById('editGoalDescription');
    if (editDesc) formData.append('description', editDesc.value || '');
    
    const editProgress = document.getElementById('editGoalProgress');
    if (editProgress) formData.append('progress', editProgress.value || 0);
    
    // HAPUS DUPLIKASI - hanya satu kali append
    const typeEl = document.getElementById('editGoalType');
    if (typeEl) formData.append('type', typeEl.value || 'semester');
    
    const deadlineEl = document.getElementById('editGoalDeadline');
    if (deadlineEl) formData.append('deadline', deadlineEl.value || '');

    fetch("backend/goals/edit_goal.php", {
        method: "POST",
        body: formData
    })
    .then(parseJSONSafe)
    .then(data => {
        if (data.status === "success") {
            showNotification("Target berhasil diperbarui!", "success");
            if (editGoalModal) editGoalModal.classList.add("hidden");
            loadGoals();
            loadDashboardData();
        } else {
            showNotification(data.message || "Gagal memperbarui target", "error");
        }
    })
    .catch(err => {
        console.error('Error updating goal:', err);
        showNotification('Terjadi kesalahan: ' + (err.message || err), 'error');
    });
}

function handleUpdateProfile(e) {
    e.preventDefault();

    const formData = new FormData();
    const profileName = document.getElementById("profileName");
    if (profileName) formData.append("profileName", profileName.value);
    
    const profileEmail = document.getElementById("profileEmail");
    if (profileEmail) formData.append("profileEmail", profileEmail.value);
    
    const profileInstitution = document.getElementById("profileInstitution");
    if (profileInstitution) formData.append("profileInstitution", profileInstitution.value);
    
    const profileMajor = document.getElementById("profileMajor");
    if (profileMajor) formData.append("profileMajor", profileMajor.value);
    
    const profileBio = document.getElementById("profileBio");
    if (profileBio) formData.append("profileBio", profileBio.value);

    fetch("backend/profile/update_profile.php", {
        method: "POST",
        body: formData
    })
    .then(parseJSONSafe)
    .then(data => {
        if (data.status === "success") {
            showNotification("Profil berhasil diperbarui!", "success");
        } else {
            showNotification(data.message || "Gagal memperbarui profil", "error");
        }
    })
    .catch(err => {
        console.error('Error updating profile:', err);
        showNotification('Terjadi kesalahan: ' + (err.message || err), 'error');
    });
}

function handleChangePassword(e) {
    e.preventDefault();

    const formData = new FormData();
    const currentPassword = document.getElementById("currentPassword");
    if (currentPassword) formData.append("currentPassword", currentPassword.value);
    
    const newPassword = document.getElementById("newPassword");
    if (newPassword) formData.append("newPassword", newPassword.value);
    
    const confirmPassword = document.getElementById("confirmPassword");
    if (confirmPassword) formData.append("confirmPassword", confirmPassword.value);

    fetch("backend/profile/change_password.php", {
        method: "POST",
        body: formData
    })
    .then(parseJSONSafe)
    .then(data => {
        if (data.status === "success") {
            showNotification("Password berhasil diganti!", "success");
        } else {
            showNotification(data.message || "Gagal mengganti password", "error");
        }
    })
    .catch(err => {
        console.error('Error changing password:', err);
        showNotification('Terjadi kesalahan: ' + (err.message || err), 'error');
    });
}

function handleExportData() {
    const user = JSON.parse(localStorage.getItem("arvo_user"));
    if (!user) {
        showNotification("Silakan login terlebih dahulu!", "error");
        return;
    }

    // Langsung download file export dari backend
    window.location.href = "backend/export_data.php?user_id=" + user.id;

    showNotification("Data sedang diunduh...", "info");
}

function handleDeleteAccount() {
    const user = JSON.parse(localStorage.getItem("arvo_user"));
    if (!user) {
        showNotification("Silakan login terlebih dahulu!", "error");
        return;
    }
    if (!confirm("Apakah Anda yakin ingin menghapus akun Anda? Tindakan ini tidak dapat dibatalkan.")) {
        return;
    }

    const formData = new FormData();

    fetch("backend/delete_account.php", {
        method: "POST",
        body: formData
    })
    .then(parseJSONSafe)
    .then(data => {
        if (data.status === "success") {
            localStorage.removeItem("arvo_user");
            showLoginModal();
            showNotification("Akun Anda telah dihapus.", "info");
        } else {
            showNotification(data.message || "Gagal menghapus akun", "error");
        }
    })
    .catch(err => {
        console.error('Error deleting account:', err);
        showNotification('Terjadi kesalahan: ' + (err.message || err), 'error');
    });
}

// Data Loading Functions
function loadDashboardData() {
    const user = JSON.parse(localStorage.getItem("arvo_user"));
    if (!user) return;

    // Update navbar username
    const navUser = document.getElementById("navUsername");
    if (navUser) navUser.textContent = user.username;

    // Update hero section username
    const userNameElement = document.getElementById("userName");
    if (userNameElement) userNameElement.textContent = user.username;

    // Load statistik via backend
    fetch("backend/get_stats.php")
        .then(parseJSONSafe)
        .then(data => {
            console.log("Stats API Response:", data); // DEBUG
            
            if (data.status === "success") {
                const stats = data.stats;
                
                const totalSchedulesEl = document.getElementById("totalSchedules");
                if (totalSchedulesEl) totalSchedulesEl.textContent = stats.totalSchedules || 0;
                
                const totalNotesEl = document.getElementById("totalNotes");
                if (totalNotesEl) totalNotesEl.textContent = stats.totalNotes || 0;
                
                const completedTasksEl = document.getElementById("completedTasks");
                if (completedTasksEl) completedTasksEl.textContent = stats.completedTasks || 0;
                
                const activeDaysEl = document.getElementById("activeDays");
                if (activeDaysEl) activeDaysEl.textContent = stats.activeDays || 0;
                
                const highPriorityTasksEl = document.getElementById("highPriorityTasks");
                if (highPriorityTasksEl) highPriorityTasksEl.textContent = stats.highPrioritySchedules || 0;
                
                const goalsProgressEl = document.getElementById("goalsProgress");
                if (goalsProgressEl) goalsProgressEl.textContent = (stats.averageGoalProgress || 0) + "%";

                loadTodayActivities();
                updateProgress(); // Panggil fungsi update progress tambahan
                updateAnalytics(); // Panggil fungsi analytics
            } else {
                console.error("Stats API error:", data.message);
            }
        })
        .catch(err => {
            console.error("Error loading stats:", err);
        });

    // Today's date
    const todayDateElement = document.getElementById("todayDate");
    if (todayDateElement) {
        todayDateElement.textContent = formatDate(new Date());
    }

    loadMiniCalendar();
    setDailyQuote();
}

function loadSchedules() {
    const user = JSON.parse(localStorage.getItem("arvo_user"));
    if (!user) return;

    fetch("backend/schedule/get_schedule.php")
        .then(parseJSONSafe)
        .then(data => {
            const schedules = data.schedules || [];
            const scheduleList = document.getElementById("scheduleList");

            if (!scheduleList) return;

            if (schedules.length === 0) {
                scheduleList.innerHTML = `
                    <div class="no-activities">
                        <i class="fas fa-calendar-plus"></i>
                        <p>Belum ada jadwal</p>
                        <p class="text-muted">Tambahkan jadwal pertama Anda!</p>
                    </div>`;
                return;
            }

            // Sort logic
            schedules.sort((a, b) => {
                if (a.completed !== b.completed) return a.completed ? 1 : -1;
                const order = { high: 0, medium: 1, low: 2 };
                if (order[a.priority] !== order[b.priority]) return order[a.priority] - order[b.priority];
                return a.date.localeCompare(b.date) || a.time.localeCompare(b.time);
            });

            scheduleList.innerHTML = schedules.map(s => `
                <div class="schedule-item ${s.completed ? 'completed' : ''}" data-type="${s.type}">
                    <div class="schedule-header">
                        <h4>${s.title}
                        ${s.completed ? '<i class="fas fa-check-circle" style="color: green;"></i>' : ''}
                        </h4>
                        <span class="schedule-date">${formatDate(new Date(s.date))} • ${formatTime(s.time)}</span>
                        <span class="priority-badge">${getPriorityLabel(s.priority)}</span>
                    </div>

                    <div class="schedule-type ${s.type}">${getTypeLabel(s.type)}</div>
                    ${s.description ? `<p class="schedule-description">${s.description}</p>` : ''}

                    <div class="schedule-actions">
                        <button onclick="toggleScheduleCompleted(${s.id})" class="btn-outline btn-small">
                            ${s.completed ? "Batal Selesai" : "Tandai Selesai"}
                        </button>
                        <button onclick="openEditScheduleModal(${s.id})" class="btn-outline btn-small">
                            <i class="fas fa-edit"></i> Edit
                        </button>
                        <button onclick="deleteSchedule(${s.id})" class="btn-outline btn-small">
                            <i class="fas fa-trash"></i> Hapus
                        </button>
                    </div>
                </div>
            `).join('');
        });
}

function loadNotes() {
    fetch("backend/notes/get_note.php")
        .then(parseJSONSafe)
        .then(data => {
            const notes = data.notes || [];
            const notesList = document.getElementById("notesList");
            const noteCount = document.getElementById("noteCount");

            if (!notesList || !noteCount) return;

            noteCount.textContent = `${notes.length} notulensi ditemukan`;

            if (notes.length === 0) {
                notesList.innerHTML = `
                    <div class="no-activities">
                        <i class="fas fa-sticky-note"></i>
                        <p>Belum ada notulensi</p>
                        <p class="text-muted">Buat notulensi pertama Anda!</p>
                    </div>`;
                return;
            }

            notes.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

            notesList.innerHTML = notes.map(n => `
                <div class="note-item" data-category="${n.category}">
                    <div class="note-header">
                        <h4>${n.title}</h4>
                        <span class="note-category">${getCategoryLabel(n.category)}</span>
                    </div>
                    <div class="note-date">${formatDateTime(new Date(n.created_at))}</div>
                    <div class="note-content">${n.content}</div>
                    <div class="note-actions">
                        <button onclick="openEditNoteModal(${n.id})" class="btn-outline btn-small">
                            <i class="fas fa-edit"></i> Edit
                        </button>
                        <button onclick="deleteNote(${n.id})" class="btn-outline btn-small">
                            <i class="fas fa-trash"></i> Hapus
                        </button>
                    </div>
                </div>
            `).join('');
        });
}

function loadGoals() {
    fetch("backend/goals/get_goal.php")
        .then(parseJSONSafe)
        .then(data => {
            const goals = data.goals || [];
            const goalsList = document.getElementById("goalsList");

            if (!goalsList) return;

            if (goals.length === 0) {
                goalsList.innerHTML = `
                    <div class="no-activities">
                        <i class="fas fa-bullseye"></i>
                        <p>Belum ada target</p>
                        <p class="text-muted">Buat target pertama Anda!</p>
                    </div>`;
                return;
            }

            goalsList.innerHTML = goals.map(g => `
                <div class="goal-item">
                    <div class="goal-header">
                        <div class="goal-title">${g.title}</div>
                        <span class="goal-type ${g.type}">${getGoalTypeLabel(g.type)}</span>
                    </div>

                    <div class="goal-description">${g.description}</div>

                    ${g.deadline ? `<div class="goal-deadline">Tenggat: ${formatDate(new Date(g.deadline))}</div>` : ''}

                    <div class="goal-progress-container">
                        <div class="goal-progress-info">
                            <span>Progress: ${g.progress}%</span>
                        </div>

                        <div class="progress-bar">
                            <div class="progress-fill" style="width:${g.progress}%"></div>
                        </div>
                    </div>

                    <div class="goal-actions">
                        <button onclick="openEditGoalModal(${g.id})" class="btn-outline btn-small">
                            <i class="fas fa-edit"></i> Edit
                        </button>
                        <button onclick="deleteGoal(${g.id})" class="btn-outline btn-small">
                            <i class="fas fa-trash"></i> Hapus
                        </button>
                    </div>
                </div>
            `).join('');
        });
}

function loadProfile() {
    fetch("backend/profile/get_profile.php")
        .then(parseJSONSafe)
        .then(data => {
            if (data.status !== "success") {
                showNotification("Gagal memuat profil!", "error");
                return;
            }

            // Response dari backend adalah {status, user: {...}}
            const user = data.user; // Penting! Backend mengembalikan "user" bukan "profile"
            
            if (!user) {
                showNotification("Data profil tidak lengkap!", "error");
                return;
            }

            const profileName = document.getElementById("profileName");
            if (profileName) profileName.value = user.username || "";
            
            const profileEmail = document.getElementById("profileEmail");
            if (profileEmail) profileEmail.value = user.email || "";
            
            const profileInstitution = document.getElementById("profileInstitution");
            if (profileInstitution) profileInstitution.value = user.institution || "";
            
            const profileMajor = document.getElementById("profileMajor");
            if (profileMajor) profileMajor.value = user.major || "";
            
            const profileBio = document.getElementById("profileBio");
            if (profileBio) profileBio.value = user.bio || "";
        })
        .catch(err => {
            console.error("Error loading profile:", err);
            showNotification("Gagal memuat profil: " + err.message, "error");
        });
}

function loadTodayActivities() {
    const user = JSON.parse(localStorage.getItem("arvo_user"));
    if (!user) return;

    const today = new Date().toISOString().split("T")[0]; // format YYYY-MM-DD
    const activitiesList = document.getElementById("todayActivities");

    if (!activitiesList) return;

    // Ambil semua jadwal user
    fetch("backend/schedule/get_schedule.php")
        .then(parseJSONSafe)
        .then(data => {
            if (data.status !== "success") {
                activitiesList.innerHTML = `
                    <div class="no-activities">
                        <i class="fas fa-times-circle"></i>
                        <p>Gagal memuat jadwal hari ini</p>
                    </div>`;
                return;
            }

            // Filter jadwal hari ini
            const todaySchedules = data.schedules.filter(s => s.date === today);

            // Jika kosong
            if (todaySchedules.length === 0) {
                activitiesList.innerHTML = `
                    <div class="no-activities">
                        <i class="fas fa-calendar-check"></i>
                        <p>Tidak ada kegiatan hari ini</p>
                    </div>`;
                return;
            }

            // Sort berdasarkan waktu
            todaySchedules.sort((a, b) => a.time.localeCompare(b.time));

            // Render list
            activitiesList.innerHTML = todaySchedules.map(schedule => {
                const priorityClass = `priority-${schedule.priority}`;
                const priorityText =
                    schedule.priority === "high" ? "Tinggi" :
                    schedule.priority === "medium" ? "Sedang" : "Rendah";

                return `
                    <div class="activity-item ${schedule.completed ? "completed" : ""}">
                        <div class="activity-time">${formatTime(schedule.time)}</div>

                        <div class="activity-details">
                            <div class="activity-title">
                                ${schedule.title}
                                ${
                                    schedule.completed
                                        ? '<i class="fas fa-check-circle" style="color:#4CAF50;"></i>'
                                        : ""
                                }
                                <span class="priority-badge ${priorityClass}">${priorityText}</span>
                            </div>

                            <div class="activity-type">${getTypeLabel(schedule.type)}</div>
                        </div>
                    </div>
                `;
            }).join('');
        });
}

// Calendar Functions
function renderCalendar() {
    if (!currentMonthElement || !calendarDaysElement) return;

    const user = JSON.parse(localStorage.getItem("arvo_user"));
    if (!user) return;

    // Update month header
    const monthNames = [
        'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
        'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
    ];

    // PASTIKAN currentMonth dan currentYear sudah didefinisikan
    if (typeof currentMonth === 'undefined') {
        const now = new Date();
        currentMonth = now.getMonth();
        currentYear = now.getFullYear();
    }

    currentMonthElement.textContent = `${monthNames[currentMonth]} ${currentYear}`;

    // Calculate calendar layout
    const firstDay = new Date(currentYear, currentMonth, 1);
    const lastDay = new Date(currentYear, currentMonth + 1, 0);
    const totalDays = lastDay.getDate();
    const firstDayIndex = firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1; // Adjust for Monday=0

    // Fetch schedules from backend
    fetch("backend/schedule/get_schedule.php")
        .then(parseJSONSafe)
        .then(data => {
            let schedules = [];
            if (data.status === "success" && data.schedules) {
                schedules = data.schedules;
            }

            // Build calendar HTML
            let calendarHTML = '';

            // Previous month days
            const prevMonthLastDay = new Date(currentYear, currentMonth, 0).getDate();
            for (let i = firstDayIndex; i > 0; i--) {
                calendarHTML += `<div class="calendar-day other-month"><div class="day-number">${prevMonthLastDay - i + 1}</div></div>`;
            }

            // Today checker
            const today = new Date();
            const isToday = (day) =>
                today.getDate() === day &&
                today.getMonth() === currentMonth &&
                today.getFullYear() === currentYear;

            // Current month days
            for (let day = 1; day <= totalDays; day++) {
                const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                const daySchedules = schedules.filter(s => s.date === dateStr);

                let className = "calendar-day";
                if (isToday(day)) className += " today";
                if (daySchedules.length > 0) className += " has-event";

                calendarHTML += `
                    <div class="${className}" data-date="${dateStr}">
                        <div class="day-number">${day}</div>
                        ${daySchedules.length > 0 ? `
                            <div class="event-dots">
                                ${daySchedules.map(s => `<div class="event-dot ${s.type}"></div>`).join('')}
                            </div>` : ''}
                    </div>
                `;
            }

            // Next month days
            const totalCells = 42;
            const remainingCells = totalCells - (firstDayIndex + totalDays);
            for (let i = 1; i <= remainingCells; i++) {
                calendarHTML += `<div class="calendar-day other-month"><div class="day-number">${i}</div></div>`;
            }

            calendarDaysElement.innerHTML = calendarHTML;

            // Add day click event
            document.querySelectorAll('.calendar-day:not(.other-month)').forEach(day => {
                day.addEventListener('click', () => {
                    const date = day.getAttribute("data-date");
                    showEventsForDate(date);
                });
            });
        })
        .catch(err => {
            console.error('Error fetching schedules:', err);
            // Render calendar tanpa event jika fetch gagal
            let calendarHTML = '';
            const prevMonthLastDay = new Date(currentYear, currentMonth, 0).getDate();
            for (let i = firstDayIndex; i > 0; i--) {
                calendarHTML += `<div class="calendar-day other-month"><div class="day-number">${prevMonthLastDay - i + 1}</div></div>`;
            }
            const today = new Date();
            const isToday = (day) =>
                today.getDate() === day &&
                today.getMonth() === currentMonth &&
                today.getFullYear() === currentYear;
            for (let day = 1; day <= totalDays; day++) {
                let className = "calendar-day";
                if (isToday(day)) className += " today";
                const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                calendarHTML += `<div class="${className}" data-date="${dateStr}"><div class="day-number">${day}</div></div>`;
            }
            const totalCells = 42;
            const remainingCells = totalCells - (firstDayIndex + totalDays);
            for (let i = 1; i <= remainingCells; i++) {
                calendarHTML += `<div class="calendar-day other-month"><div class="day-number">${i}</div></div>`;
            }
            calendarDaysElement.innerHTML = calendarHTML;
        });
}

function showEventsForDate(date) {
    const user = JSON.parse(localStorage.getItem("arvo_user"));
    if (!user) return;

    fetch("backend/schedule/get_schedule.php")
        .then(parseJSONSafe)
        .then(data => {
            let schedules = [];
            if (data.status === "success") {
                schedules = data.schedules.filter(s => s.date === date)
                    .sort((a, b) => a.time.localeCompare(b.time));
            }

            const modalTitle = document.getElementById("eventModalTitle");
            const modalBody = document.getElementById("eventModalBody");

            if (!modalTitle || !modalBody) return;

            if (schedules.length === 0) {
                modalTitle.textContent = `Tidak ada kegiatan pada ${formatDate(new Date(date))}`;
                modalBody.innerHTML = `
                    <div class="no-activities">
                        <i class="fas fa-calendar-times"></i>
                        <p>Tidak ada kegiatan pada tanggal ini</p>
                    </div>`;
            } else {
                modalTitle.textContent = `Kegiatan pada ${formatDate(new Date(date))}`;
                modalBody.innerHTML = `
                    <div class="event-list">
                        ${schedules.map(schedule => `
                            <div class="event-item" data-type="${schedule.type}">
                                <h4>${schedule.title} 
                                    ${schedule.completed ? '<i class="fas fa-check-circle" style="color:#4CAF50;"></i>' : ''}
                                </h4>

                                <div class="schedule-type ${schedule.type}">
                                    ${getTypeLabel(schedule.type)}
                                </div>

                                <p><strong>Waktu:</strong> ${formatTime(schedule.time)}</p>
                                <p><strong>Prioritas:</strong> ${getPriorityLabel(schedule.priority)}</p>

                                ${schedule.description ? `
                                    <p><strong>Deskripsi:</strong> ${schedule.description}</p>` : ""}
                            </div>
                        `).join("")}
                    </div>
                `;
            }

            if (eventModal) {
                eventModal.classList.remove("hidden");
            }
        });
}

// Analytics Functions 
function updateAnalytics() {
    console.log("🔄 Memulai update analytics...");
    
    fetch("backend/schedule/get_schedule.php")
        .then(parseJSONSafe)
        .then(data => {
            console.log("📊 Data analytics:", data);
            
            if (data.status !== "success") {
                console.error("❌ Gagal mengambil data jadwal untuk analytics:", data.message);
                return;
            }

            const schedules = data.schedules || [];
            const totalSchedules = schedules.length;
            console.log("📈 Total jadwal:", totalSchedules);

            // Kategori yang akan ditampilkan
            const categories = ['kuliah', 'organisasi', 'tugas', 'pribadi'];
            
            // Reset semua terlebih dahulu
            categories.forEach(category => {
                const countElement = document.getElementById(`${category}Count`);
                if (countElement) countElement.textContent = '0';
                
                const fillElement = document.getElementById(`${category}Fill`);
                if (fillElement) {
                    fillElement.style.width = '0%';
                    fillElement.setAttribute("data-percent", "0");
                }
            });

            if (totalSchedules === 0) {
                console.log("ℹ️ Tidak ada jadwal untuk dianalisa");
                return;
            }

            // Hitung untuk setiap kategori
            categories.forEach(category => {
                const count = schedules.filter(s => s.type === category).length;
                const percent = totalSchedules > 0 ? Math.round((count / totalSchedules) * 100) : 0;
                
                console.log(`📊 ${category}: ${count} jadwal (${percent}%)`);

                const countElement = document.getElementById(`${category}Count`);
                const fillElement = document.getElementById(`${category}Fill`);
                
                if (countElement) {
                    countElement.textContent = count;
                }
                
                if (fillElement) {
                    // Set width untuk progress bar dengan delay untuk animasi
                    setTimeout(() => {
                        fillElement.style.width = `${percent}%`;
                        fillElement.setAttribute("data-percent", percent);
                        fillElement.setAttribute("data-category", category); // Pastikan atribut ada
                    }, 100);
                }
            });
            
            console.log("✅ Analytics berhasil diupdate");
        })
        .catch(err => {
            console.error("❌ Error fetching schedules for analytics:", err);
            
            // Fallback: tampilkan 0 untuk semua
            const categories = ['kuliah', 'organisasi', 'tugas', 'pribadi'];
            categories.forEach(category => {
                const countElement = document.getElementById(`${category}Count`);
                if (countElement) countElement.textContent = '0';
                
                const fillElement = document.getElementById(`${category}Fill`);
                if (fillElement) {
                    fillElement.style.width = '0%';
                    fillElement.setAttribute("data-percent", "0");
                }
            });
        });
}

// Utility Functions
function updateProgress() {
    Promise.all([
        fetch("backend/schedule/get_schedule.php").then(parseJSONSafe),
        fetch("backend/notes/get_note.php").then(parseJSONSafe),
        fetch("backend/goals/get_goal.php").then(parseJSONSafe)
    ])
    .then(([sch, nt, gl]) => {
        const schedules = sch.status === "success" ? sch.schedules : [];
        const notes = nt.status === "success" ? nt.notes : [];
        const goals = gl.status === "success" ? gl.goals : [];

        const totalSchedules = schedules.length;
        const completedSchedules = schedules.filter(s => s.completed == 1).length;
        const progress = totalSchedules ? Math.round((completedSchedules / totalSchedules) * 100) : 0;

        const overallProgress = document.getElementById("overallProgress");
        if (overallProgress) overallProgress.style.width = `${progress}%`;
        
        const progressText = document.getElementById("progressText");
        if (progressText) progressText.textContent = `${progress}% Progress Keseluruhan`;
        
        const completedSchedulesEl = document.getElementById("completedSchedules");
        if (completedSchedulesEl) completedSchedulesEl.textContent = `${completedSchedules}/${totalSchedules}`;
        
        const activeNotes = document.getElementById("activeNotes");
        if (activeNotes) activeNotes.textContent = notes.length;
        
        const activeDaysCount = document.getElementById("activeDaysCount");
        if (activeDaysCount) activeDaysCount.textContent = calculateActiveDays(schedules);
        
        const semesterProgress = document.getElementById("semesterProgress");
        if (semesterProgress) semesterProgress.textContent = calculateGoalsProgress(goals);
    });
}

function calculateActiveDays(schedules) {
    const uniqueDays = new Set(schedules.map(s => s.date));
    return uniqueDays.size;
}

function calculateGoalsProgress(goals) {
    if (goals.length === 0) return '0%';
    
    const totalProgress = goals.reduce((sum, goal) => sum + (goal.progress || 0), 0);
    const averageProgress = Math.round(totalProgress / goals.length);
    return `${averageProgress}%`;
}

function filterSchedules(filter) {
    const scheduleItems = document.querySelectorAll('.schedule-item');
    
    scheduleItems.forEach(item => {
        const type = item.getAttribute('data-type');
        const isCompleted = item.classList.contains('completed');
        const priorityElement = item.querySelector('.priority-badge');
        const priority = priorityElement ? priorityElement.textContent : '';
        
        let show = false;
        
        switch (filter) {
            case 'all':
                show = true;
                break;
            case 'kuliah':
            case 'organisasi':
            case 'tugas':
            case 'pribadi':
                show = type === filter;
                break;
            case 'high':
                show = priority === 'Tinggi';
                break;
            case 'completed':
                show = isCompleted;
                break;
            case 'incomplete':
                show = !isCompleted;
                break;
            default:
                show = true;
        }
        
        item.style.display = show ? 'block' : 'none';
    });
}

function searchNotes() {
    const searchTerm = document.getElementById('noteSearch').value.toLowerCase();
    const noteItems = document.querySelectorAll('.note-item');
    let visibleCount = 0;
    
    noteItems.forEach(item => {
        const titleElement = item.querySelector('h4');
        const contentElement = item.querySelector('.note-content');
        
        const title = titleElement ? titleElement.textContent.toLowerCase() : '';
        const content = contentElement ? contentElement.textContent.toLowerCase() : '';
        
        if (title.includes(searchTerm) || content.includes(searchTerm)) {
            item.style.display = 'block';
            visibleCount++;
        } else {
            item.style.display = 'none';
        }
    });
    
    const noteCountElement = document.getElementById('noteCount');
    if (noteCountElement) noteCountElement.textContent = `${visibleCount} notulensi ditemukan`;
}

function loadMiniCalendar() {
    const today = new Date();
    const weekDays = document.getElementById('weekCalendar');

    if (!weekDays) {
        console.warn("Element weekCalendar tidak ditemukan");
        return;
    }

    // Tampilkan hari-hari dalam seminggu
    const dayNames = ['Ming', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];

    fetch("backend/schedule/get_schedule.php")
        .then(parseJSONSafe)
        .then(data => {
            const schedules = data.status === "success" ? data.schedules : [];
            let html = "";

            for (let i = -3; i <= 3; i++) {
                const date = new Date(today);
                date.setDate(today.getDate() + i);

                const dateStr = date.toISOString().split("T")[0];
                const dayName = dayNames[date.getDay()];
                const dayNumber = date.getDate();
                const hasEvent = schedules.some(s => s.date === dateStr);

                const isToday = i === 0;

                let className = "week-day";
                if (isToday) className += " today";
                if (hasEvent) className += " has-event";

                html += `
                    <div class="${className}" data-date="${dateStr}">
                        <span class="day-name">${dayName}</span>
                        <span class="day-date">${dayNumber}</span>
                    </div>
                `;
            }

            if (html) {
                weekDays.innerHTML = html;
            } else {
                weekDays.innerHTML = '<p>Tidak ada data minggu ini</p>';
            }

            // Click Event
            document.querySelectorAll(".week-day.has-event").forEach(day => {
                day.addEventListener("click", () => {
                    const date = day.getAttribute("data-date");
                    showPage("calendar");
                    setActiveNavLink("calendar");

                    const d = new Date(date);
                    currentMonth = d.getMonth();
                    currentYear = d.getFullYear();
                    renderCalendar();

                    setTimeout(() => showEventsForDate(date), 100);
                });
            });
        })
        .catch(err => {
            console.error('Error loading mini calendar:', err);
            weekDays.innerHTML = '<p>Tidak dapat memuat kalender minggu ini</p>';
        })
}

function setDailyQuote() {
    const quotes = [
        { text: "The only way to do great work is to love what you do.", author: "Steve Jobs" },
        { text: "Don't watch the clock; do what it does. Keep going.", author: "Sam Levenson" },
        { text: "Believe you can and you're halfway there.", author: "Theodore Roosevelt" },
        { text: "The future depends on what you do today.", author: "Mahatma Gandhi" },
        { text: "It always seems impossible until it's done.", author: "Nelson Mandela" },
        { text: "Success is not final, failure is not fatal: it is the courage to continue that counts.", author: "Winston Churchill" },
        { text: "The way to get started is to quit talking and begin doing.", author: "Walt Disney" },
        { text: "Your time is limited, so don't waste it living someone else's life.", author: "Steve Jobs" }
    ];
    
    const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
    const dailyQuoteElement = document.getElementById('dailyQuote');
    if (dailyQuoteElement) dailyQuoteElement.textContent = `"${randomQuote.text}"`;
    
    const quoteAuthorElement = document.querySelector('.quote-author');
    if (quoteAuthorElement) quoteAuthorElement.textContent = `- ${randomQuote.author}`;
}

function showNotification(message, type) {
    // Remove existing notifications
    document.querySelectorAll('.notification').forEach(notification => notification.remove());
    
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <span>${message}</span>
        <button onclick="this.parentElement.remove()">&times;</button>
    `;
    
    document.body.appendChild(notification);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (notification.parentElement) {
            notification.remove();
        }
    }, 5000);
}

// Helper Functions
function formatDate(date) {
    if (!date) return '';
    try {
        return date.toLocaleDateString('id-ID', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    } catch (e) {
        return '';
    }
}

function formatDateTime(date) {
    if (!date) return '';
    try {
        return date.toLocaleDateString('id-ID', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    } catch (e) {
        return '';
    }
}

function formatTime(timeStr) {
    if (!timeStr) return '';
    const [hours, minutes] = timeStr.split(':');
    return `${hours}:${minutes}`;
}

function getTypeLabel(type) {
    const labels = {
        'kuliah': 'Kuliah',
        'organisasi': 'Organisasi',
        'tugas': 'Tugas',
        'pribadi': 'Pribadi'
    };
    return labels[type] || type;
}

function getCategoryLabel(category) {
    const labels = {
        'kuliah': 'Kuliah',
        'organisasi': 'Organisasi',
        'pribadi': 'Pribadi',
        'lainnya': 'Lainnya'
    };
    return labels[category] || category;
}

function getPriorityLabel(priority) {
    const labels = {
        'low': 'Rendah',
        'medium': 'Sedang',
        'high': 'Tinggi'
    };
    return labels[priority] || priority;
}

function getGoalTypeLabel(type) {
    const labels = {
        'semester': 'Target Semester',
        'academic': 'Target Akademik',
        'career': 'Target Karir',
        'personal': 'Target Pribadi'
    };
    return labels[type] || type;
}

function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// Global functions for delete operations
window.deleteSchedule = function(id){
    if (!confirm("Hapus jadwal ini?")) return;

    const formData = new FormData();
    formData.append("id", id);

    fetch("backend/schedule/delete_schedule.php", {
        method: "POST",
        body: formData
    })
    .then(r => r.json())
    .then(data => {
        loadSchedules();
        loadDashboardData();
        showNotification("Jadwal dihapus", "success");
    });
}

window.deleteNote = function(id){
    if (!confirm("Hapus notulensi ini?")) return;

    const formData = new FormData();
    formData.append("id", id);

    fetch("backend/notes/delete_note.php", {
        method: "POST",
        body: formData
    })
    .then(r => r.json())
    .then(data => {
        loadNotes();
        loadDashboardData();
        showNotification("Notulensi dihapus", "success");
    });
}

window.deleteGoal = function(id){
    if (!confirm("Hapus target ini?")) return;

    const formData = new FormData();
    formData.append("id", id);

    fetch("backend/goals/delete_goal.php", {
        method: "POST",
        body: formData
    })
    .then(r => r.json())
    .then(data => {
        loadGoals();
        loadDashboardData();
        showNotification("Target dihapus", "success");
    });
}