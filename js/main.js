const canvas = document.getElementById('canvas-container');
const ctx = canvas.getContext('2d');
let width, height;
let particles = [];
const particleCount = 150;

// 3D Camera / Perspective settings
let fov = 250;
const viewDistance = 200;

let mouse = { x: -1000, y: -1000 }; // Initialize off-screen
let targetMouse = { x: 0, y: 0 };

// Theme Definitions
const THEMES = {
    DEFAULT: 0, // Original 2D Effect
    NET: 1,     // Constellation Net (Boss Alarm)
    FIREFLIES: 2, // Fireflies (BoheHub)
    SNOW: 3     // Snow Blizzard (nPlaceUp)
};

let currentTheme = Math.floor(Math.random() * 4);
let time = 0;

window.addEventListener('resize', resize);
window.addEventListener('mousemove', (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;

    // Normalize for 3D
    targetMouse.x = (e.clientX - width / 2) / (width / 2);
    targetMouse.y = (e.clientY - height / 2) / (height / 2);
});

function resize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
    fov = Math.min(width, height);
}

class Particle {
    constructor() {
        // 2D Properties
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.vx = (Math.random() - 0.5) * 0.5;
        this.vy = (Math.random() - 0.5) * 0.5;

        // 3D Properties - Responsive Spread
        this.x3d = (Math.random() - 0.5) * width;
        this.y3d = (Math.random() - 0.5) * height;
        this.z3d = (Math.random() - 0.5) * width; // Depth proportional to width

        this.vx3d = (Math.random() - 0.5) * 2;
        this.vy3d = (Math.random() - 0.5) * 2;
        this.vz3d = (Math.random() - 0.5) * 2;

        this.size = Math.random() * 2;
        this.color = { r: 255, g: 255, b: 255 };
        this.alpha = Math.random() * 0.5 + 0.1;
    }

    // Project 3D coordinates to 2D screen space
    project() {
        const scale = fov / (fov + this.z3d + viewDistance);
        const x2d = this.x3d * scale + width / 2;
        const y2d = this.y3d * scale + height / 2;
        return { x: x2d, y: y2d, scale: scale };
    }

    update() {
        switch (currentTheme) {
            case THEMES.DEFAULT: // Original 2D Effect
                this.updateDefault();
                break;
            case THEMES.NET: // Constellation Net (Boss Alarm)
                this.updateNet();
                break;
            case THEMES.FIREFLIES: // Fireflies (BoheHub)
                this.updateFireflies();
                break;
            case THEMES.SNOW: // Snow Blizzard (nPlaceUp)
                this.updateSnow();
                break;
        }
    }

    // Original 2D Logic
    updateDefault() {
        this.x += this.vx;
        this.y += this.vy;

        if (this.x < 0) this.x = width;
        if (this.x > width) this.x = 0;
        if (this.y < 0) this.y = height;
        if (this.y > height) this.y = 0;

        let dx = mouse.x - this.x;
        let dy = mouse.y - this.y;
        let distance = Math.sqrt(dx * dx + dy * dy);
        const mouseDistance = 150;

        if (distance < mouseDistance) {
            const forceDirectionX = dx / distance;
            const forceDirectionY = dy / distance;
            const force = (mouseDistance - distance) / mouseDistance;
            this.x -= forceDirectionX * force * 2;
            this.y -= forceDirectionY * force * 2;
        }
        this.color = { r: 255, g: 255, b: 255 };
    }

    // Theme 13: Constellation Net (Boss Alarm)
    updateNet() {
        this.x3d += this.vx3d;
        this.y3d += this.vy3d;
        this.z3d += this.vz3d;

        // Responsive limits
        const limitX = width / 2;
        const limitY = height / 2;
        const limitZ = width / 2;

        if (Math.abs(this.x3d) > limitX) this.vx3d *= -1;
        if (Math.abs(this.y3d) > limitY) this.vy3d *= -1;
        if (Math.abs(this.z3d) > limitZ) this.vz3d *= -1;

        // Gentle rotation
        const rotX = targetMouse.y * 0.01;
        const rotY = targetMouse.x * 0.01;
        this.rotate(rotX, rotY, 0);

        this.color = { r: 56, g: 189, b: 248 }; // Blue
    }

    // Theme 6: Fireflies (BoheHub)
    updateFireflies() {
        // Gentle floating motion
        this.x3d += Math.sin(time * 0.01 + this.y3d) * 0.5;
        this.y3d += Math.cos(time * 0.01 + this.x3d) * 0.5;
        this.z3d += Math.sin(time * 0.02 + this.z3d) * 0.5;

        // Mouse interaction: Gentle drift/parallax
        this.x3d += targetMouse.x * 3;
        this.y3d += targetMouse.y * 3;

        // Responsive limits
        const limitX = width / 2;
        const limitY = height / 2;
        const limitZ = width / 2;

        if (this.x3d > limitX) this.x3d = -limitX;
        if (this.x3d < -limitX) this.x3d = limitX;
        if (this.y3d > limitY) this.y3d = -limitY;
        if (this.y3d < -limitY) this.y3d = limitY;
        if (this.z3d > limitZ) this.z3d = -limitZ;
        if (this.z3d < -limitZ) this.z3d = limitZ;

        // Glow effect handled in draw
        this.color = { r: 200, g: 255, b: 50 }; // Realistic Firefly Yellow-Green
    }

    // Theme 9: Snow Blizzard (nPlaceUp)
    updateSnow() {
        // Falling and swirling
        this.y3d += 2; // Fall down
        this.x3d += Math.sin(time * 0.05 + this.z3d * 0.01) * 2; // Swirl X
        this.z3d += Math.cos(time * 0.05 + this.x3d * 0.01) * 2; // Swirl Z

        // Reset to top
        if (this.y3d > height / 2) {
            this.y3d = -height / 2;
            this.x3d = (Math.random() - 0.5) * width;
            this.z3d = (Math.random() - 0.5) * width;
        }

        // Mouse interaction: wind
        this.x3d += targetMouse.x * 5;
        this.z3d += targetMouse.y * 5;

        this.color = { r: 200, g: 230, b: 255 }; // Icy Blue
    }

    rotate(rotX, rotY, rotZ) {
        const cosX = Math.cos(rotX), sinX = Math.sin(rotX);
        const cosY = Math.cos(rotY), sinY = Math.sin(rotY);

        let x1 = this.x3d * cosY - this.z3d * sinY;
        let z1 = this.z3d * cosY + this.x3d * sinY;

        let y1 = this.y3d * cosX - z1 * sinX;
        let z2 = z1 * cosX + this.y3d * sinX;

        this.x3d = x1;
        this.y3d = y1;
        this.z3d = z2;
    }

    draw() {
        if (currentTheme === THEMES.DEFAULT) {
            // 2D Draw
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(${this.color.r}, ${this.color.g}, ${this.color.b}, ${this.alpha})`;
            ctx.fill();
        } else {
            // 3D Draw
            const p = this.project();
            if (p.scale <= 0) return; // Safety check

            let alpha = Math.max(0, Math.min(1, (p.scale * 0.8)));

            // Firefly pulse
            if (currentTheme === THEMES.FIREFLIES) {
                alpha *= (0.5 + Math.sin(time * 0.05 + this.x3d) * 0.5);
            }

            ctx.beginPath();
            ctx.arc(p.x, p.y, Math.max(0, this.size * p.scale), 0, Math.PI * 2);
            ctx.fillStyle = `rgba(${this.color.r}, ${this.color.g}, ${this.color.b}, ${alpha})`;
            ctx.fill();
        }
    }
}

function init() {
    particles = [];
    for (let i = 0; i < particleCount; i++) {
        particles.push(new Particle());
    }
}

function animate() {
    ctx.clearRect(0, 0, width, height);
    time++;

    // Sort only for 3D modes
    if (currentTheme !== THEMES.DEFAULT) {
        particles.sort((a, b) => b.z3d - a.z3d);
    }

    for (let i = 0; i < particles.length; i++) {
        particles[i].update();
        particles[i].draw();

        // Connections logic
        if (currentTheme === THEMES.DEFAULT) {
            // 2D Connections
            for (let j = i; j < particles.length; j++) {
                let dx = particles[i].x - particles[j].x;
                let dy = particles[i].y - particles[j].y;
                let distance = Math.sqrt(dx * dx + dy * dy);
                if (distance < 100) {
                    ctx.beginPath();
                    ctx.strokeStyle = `rgba(255, 255, 255, ${0.1 - distance / 100 * 0.1})`;
                    ctx.lineWidth = 0.5;
                    ctx.moveTo(particles[i].x, particles[i].y);
                    ctx.lineTo(particles[j].x, particles[j].y);
                    ctx.stroke();
                }
            }
        } else if (currentTheme === THEMES.NET) {
            // 3D Connections (only for Net theme)
            for (let j = i; j < particles.length; j++) {
                const dx = particles[i].x3d - particles[j].x3d;
                const dy = particles[i].y3d - particles[j].y3d;
                const dz = particles[i].z3d - particles[j].z3d;
                const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);

                if (dist < 150) { // Increased connection distance
                    const p1 = particles[i].project();
                    const p2 = particles[j].project();

                    if (p1.scale > 0 && p2.scale > 0) {
                        const alpha = (1 - dist / 150) * 0.2;
                        ctx.beginPath();
                        ctx.strokeStyle = `rgba(56, 189, 248, ${alpha})`;
                        ctx.lineWidth = 0.5;
                        ctx.moveTo(p1.x, p1.y);
                        ctx.lineTo(p2.x, p2.y);
                        ctx.stroke();
                    }
                }
            }
        }
    }
    requestAnimationFrame(animate);
}

resize();
init();
animate();
