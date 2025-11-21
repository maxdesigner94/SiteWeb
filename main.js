// Registra i plugin GSAP
gsap.registerPlugin(ScrollTrigger);

// =================================================================
// PARTE 1: SETUP THREE.JS
// =================================================================

const canvas = document.querySelector('#webgl-container');
const scene = new THREE.Scene();

// Colore Sfondo: Grigio-Azzurro Tecnico (lo stesso del CSS)
const bgColor = 0xe8ecf0;
scene.background = new THREE.Color(bgColor); 
scene.fog = new THREE.FogExp2(bgColor, 0.002);

const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
};

const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 1000);
camera.position.z = 5;
scene.add(camera);

const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    antialias: true,
    alpha: false 
});
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));


// --- CREAZIONE OGGETTO 3D CON GRADIENTE ---

// 1. Riduciamo il numero per pulizia
const particlesCount = 1200; // <-- RIDOTTO DA 3000 A 1200

const particlesGeometry = new THREE.BufferGeometry();
const posArray = new Float32Array(particlesCount * 3);
const colorsArray = new Float32Array(particlesCount * 3); // Array per i colori individuali

// Definiamo i due colori del gradiente (Stessi del CSS .accent-text)
const colorInside = new THREE.Color(0x0066ff); // Blu Elettrico
const colorOutside = new THREE.Color(0x00c9a7); // Verde Acqua (Teal)

for(let i = 0; i < particlesCount * 3; i+=3) {
    // Posizione X, Y, Z
    // Allarghiamo un po' la X per apprezzare meglio il gradiente
    const x = (Math.random() - 0.5) * 18; 
    const y = (Math.random() - 0.5) * 10;
    const z = (Math.random() - 0.5) * 10;

    posArray[i] = x;
    posArray[i+1] = y;
    posArray[i+2] = z;

    // CALCOLO DEL GRADIENTE
    // Normalizziamo la posizione X tra 0 e 1 (per il mixing)
    let mixedColor = colorInside.clone();
    // Se la particella è a destra (>0), mixa verso il Teal. A sinistra resta Blu.
    // Creiamo una sfumatura basata sulla posizione
    const mixFactor = (x + 9) / 18; // Porta il range da -9/+9 a 0/1
    mixedColor.lerp(colorOutside, mixFactor);

    colorsArray[i] = mixedColor.r;
    colorsArray[i+1] = mixedColor.g;
    colorsArray[i+2] = mixedColor.b;
}

particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
particlesGeometry.setAttribute('color', new THREE.BufferAttribute(colorsArray, 3)); // Inviamo i colori

// Materiale
const particlesMaterial = new THREE.PointsMaterial({
    size: 0.065,     // Dimensione leggermente aumentata per compensare il minor numero
    vertexColors: true, // <-- FONDAMENTALE: Abilita i colori personalizzati per punto
    transparent: true,
    opacity: 1.0,
    blending: THREE.NormalBlending
});

const particlesMesh = new THREE.Points(particlesGeometry, particlesMaterial);
scene.add(particlesMesh);


// --- GESTIONE MOUSE E RESIZE ---

let mouseX = 0;
let mouseY = 0;
let targetX = 0;
let targetY = 0;

window.addEventListener('mousemove', (event) => {
    mouseX = (event.clientX / sizes.width) - 0.5;
    mouseY = (event.clientY / sizes.height) - 0.5;
});

window.addEventListener('resize', () => {
    sizes.width = window.innerWidth;
    sizes.height = window.innerHeight;
    camera.aspect = sizes.width / sizes.height;
    camera.updateProjectionMatrix();
    renderer.setSize(sizes.width, sizes.height);
});

// --- ANIMAZIONE LOOP ---
const clock = new THREE.Clock();

const tick = () => {
    const elapsedTime = clock.getElapsedTime();

    // Rotazione lenta
    particlesMesh.rotation.y = elapsedTime * 0.05;

    // Mouse Parallax
    targetX = mouseX * 0.5;
    targetY = mouseY * 0.5;
    
    particlesMesh.rotation.x += 0.05 * (targetY - particlesMesh.rotation.x);
    particlesMesh.rotation.y += 0.05 * (targetX - particlesMesh.rotation.y);

    renderer.render(scene, camera);
    window.requestAnimationFrame(tick);
};

tick();


// =================================================================
// PARTE 2: GSAP ANIMATIONS
// =================================================================

// 1. HTML Animations
gsap.to('.hero-content', {
    opacity: 1,
    y: 0,
    duration: 1.5,
    ease: 'power3.out',
    delay: 0.5,
    startAt: { y: 100 }
});

const sections = document.querySelectorAll('.scroll-section, #contatti');

sections.forEach(section => {
    const block = section.querySelector('.fade-up');
    
    gsap.fromTo(block, 
        { opacity: 0, y: 100, scale: 0.95 },
        {
            scrollTrigger: {
                trigger: section,
                start: "top 75%",
                end: "top 20%",
                toggleActions: "play none none reverse",
            },
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 1,
            ease: "power3.out"
        }
    );
});

// 2. THREE.JS Scroll Interactions

// Zoom verso "Soluzioni"
gsap.to(particlesMesh.scale, {
    scrollTrigger: {
        trigger: "#soluzioni",
        start: "top bottom",
        end: "top top",
        scrub: 1
    },
    x: 1.4, 
    y: 1.4,
    z: 1.4
});

// Rotazione Extra verso "Contatti"
gsap.to(particlesMesh.rotation, {
    scrollTrigger: {
        trigger: "#contatti",
        start: "top bottom",
        scrub: 2
    },
    z: Math.PI / 2 
});


// 3. Magnetic Buttons
const magneticBtns = document.querySelectorAll('.magnetic');

magneticBtns.forEach(btn => {
    btn.addEventListener('mousemove', (e) => {
        const position = btn.getBoundingClientRect();
        const x = e.clientX - position.left - position.width / 2;
        const y = e.clientY - position.top - position.height / 2;

        gsap.to(btn, {
            x: x * 0.3,
            y: y * 0.5,
            duration: 0.3,
            ease: "power2.out"
        });
    });

    btn.addEventListener('mouseleave', () => {
        gsap.to(btn, {
            x: 0,
            y: 0,
            duration: 0.5,
            ease: "elastic.out(1, 0.3)"
        });
    });
});
