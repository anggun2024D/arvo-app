// animations-simple.js - Animasi sederhana untuk Arvo

document.addEventListener('DOMContentLoaded', function() {
    initAnimations();
});

function initAnimations() {
    // 1. Float animation untuk mascot
    const mascotContainer = document.getElementById('mascotContainer');
    if (mascotContainer) {
        mascotContainer.style.animation = 'float 6s ease-in-out infinite';
    }

    // 2. Random mascot messages
    updateMascotMessage();
    setInterval(updateMascotMessage, 30000);

    // 3. Scroll reveal animation untuk cards
    initScrollReveal();

    // 4. Hover effects untuk cards
    initHoverEffects();

    // 5. Fade in untuk hero section
    fadeInHero();
    
    // 6. Tambahkan event listener untuk tombol animasi
    setupAnimationButtons();
}

function setupAnimationButtons() {
    // Event listener untuk tombol di hero section
    document.querySelectorAll('.btn-hero, .btn-hero-outline').forEach(button => {
        button.addEventListener('click', function() {
            // Tambahkan efek klik
            this.style.transform = 'scale(0.95)';
            setTimeout(() => {
                this.style.transform = '';
            }, 200);
        });
    });
}

function updateMascotMessage() {
    const messages = [
        "Semangat hari ini yaa! 🐻✨",
        "Kamu hebat! Keep going! 💪",
        "Progress sedikit tetap progress! 📈",
        "Jangan lupa istirahat ya! ☕",
        "Kamu bisa! I believe in you! 🌟",
        "Small steps, big dreams! 🚀",
        "Hari yang produktif! 📚",
        "You're doing great! 🎯",
        "Stay awesome! 😎",
        "Belajar itu menyenangkan! 🎓"
    ];
    
    const randomMessage = messages[Math.floor(Math.random() * messages.length)];
    const messageElement = document.getElementById('mascotMessage');
    
    if (messageElement) {
        // Fade out
        messageElement.style.opacity = '0';
        messageElement.style.transform = 'translateY(10px)';
        
        setTimeout(() => {
            messageElement.textContent = randomMessage;
            // Fade in
            messageElement.style.opacity = '1';
            messageElement.style.transform = 'translateY(0)';
        }, 300);
    }
}

function initScrollReveal() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('revealed');
            }
        });
    }, observerOptions);

    // Observe cards
    document.querySelectorAll('.card').forEach(card => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        card.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(card);
        
        card.addEventListener('transitionend', () => {
            if (card.classList.contains('revealed')) {
                card.style.opacity = '1';
                card.style.transform = 'translateY(0)';
            }
        });
    });
}

function initHoverEffects() {
    // Grow effect pada cards
    document.querySelectorAll('.card').forEach(card => {
        card.addEventListener('mouseenter', () => {
            card.style.transform = 'scale(1.02)';
        });
        
        card.addEventListener('mouseleave', () => {
            card.style.transform = 'scale(1)';
        });
    });

    // Pulse effect untuk tombol penting
    document.querySelectorAll('.btn-hero').forEach(btn => {
        btn.addEventListener('mouseenter', () => {
            btn.style.animation = 'pulse 1.5s infinite';
        });
        
        btn.addEventListener('mouseleave', () => {
            btn.style.animation = '';
        });
    });
}

function fadeInHero() {
    const heroSection = document.querySelector('.hero-section');
    if (heroSection) {
        heroSection.style.opacity = '0';
        heroSection.style.transform = 'translateY(30px)';
        
        setTimeout(() => {
            heroSection.style.transition = 'opacity 0.8s ease, transform 0.8s ease';
            heroSection.style.opacity = '1';
            heroSection.style.transform = 'translateY(0)';
        }, 300);
    }
}

// CSS Animation keyframes (dijalankan via JS)
const style = document.createElement('style');
style.textContent = `
    @keyframes pulse {
        0% { transform: scale(1); }
        50% { transform: scale(1.05); }
        100% { transform: scale(1); }
    }
    
    @keyframes float {
        0%, 100% { transform: translateY(0); }
        50% { transform: translateY(-20px); }
    }
    
    .card {
        transition: all 0.3s ease;
    }
    
    .card:hover {
        box-shadow: 0 15px 35px rgba(0,0,0,0.1);
    }
`;
document.head.appendChild(style);