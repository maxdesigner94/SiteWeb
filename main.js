// Registra i plugin GSAP
gsap.registerPlugin(ScrollTrigger);

// =================================================================
// PARTE 1: SETUP THREE.JS (Lo sfondo 3D interattivo)
// =================================================================

const canvas = document.querySelector('#webgl-container');
const scene = new THREE.Scene();

// Colore di sfondo della scena (matcha il CSS body)
scene.background = new THREE.Color(0xf4f7f6); 
// Nebbia molto leggera per non nascondere i punti lontani
scene.fog = new THREE.FogExp2(0xf4f7f6, 0.001);

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
    alpha: true
});
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

// --- CREAZIONE OGGETTO 3D: Nuvola di Particelle Astratta ---
const particlesGeometry = new THREE.BufferGeometry();
const particlesCount = 3000;

const posArray = new Float32Array(particlesCount * 3);

for(let i = 0; i < particlesCount * 3; i++) {
    // Manteniamo la distribuzione originale che ti piaceva
    posArray[i] = (Math.random() - 0.5) * 15; 
}

particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));

// Materiale delle particelle (MODIFICHE PER VISIBILITÀ MASSIMA)
const particlesMaterial = new THREE.PointsMaterial({
    size: 0.04,      // Dimensione bilanciata: ben visibile ma elegante
    color: 0xff5722, // <-- TORNATO ALL'ARANCIONE CORALLO
    transparent: true,
    opacity: 1.0,    // <-- OPACITÀ MASSIMA (100%)
    // Importante: NormalBlending rende i punti solidi sullo sfondo chiaro, non traslucidi
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

// --- ANIMAZIONE LOOP THREE.JS ---
const clock = new THREE.Clock();

const tick = () => {
    const elapsedTime = clock.getElapsedTime();

    particlesMesh.rotation.y = elapsedTime * 0.05;

    targetX = mouseX * 0.5;
    targetY = mouseY * 0.5;
    
    particlesMesh.rotation.x += 0.05 * (targetY - particlesMesh.rotation.x);
    particlesMesh.rotation.y += 0.05 * (targetX - particlesMesh.rotation.y);

    renderer.render(scene, camera);
    window.requestAnimationFrame(tick);
};

tick();


// =================================================================
// PARTE 2: GSAP ANIMATIONS & SCROLL INTERACTION
// =================================================================

// 1. Animazione Iniziale Hero Section
gsap.to('.hero-content', {
    opacity: 1,
    y: 0,
    duration: 1.5,
    ease: 'power3.out',
    delay: 0.5,
    startAt: { y: 100 }
});

// 2. Animazioni allo Scroll per le Sezioni HTML
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

// 3. COLLEGAMENTO THREE.JS ALLO SCROLL

// Transizione verso la sezione "Soluzioni"
gsap.to(particlesMesh.scale, {
    scrollTrigger: {
        trigger: "#soluzioni",
        start: "top bottom",
        end: "top top",
        scrub: 1
    },
    x: 1.5, 
    y: 1.5,
    z: 1.5
});

// CAMBIO COLORE ALLO SCROLL (Da Arancione a Verde Acqua scuro per visibilità)
gsap.to(particlesMaterial.color, {
    scrollTrigger: {
        trigger: "#soluzioni",
        start: "top center",
        end: "bottom center",
        scrub: 1
    },
    r: 0.0, g: 0.6, b: 0.5 // Un verde acqua un po' più scuro per rimanere visibile
});

// Transizione verso la sezione "Contatti"
gsap.to(particlesMesh.rotation, {
    scrollTrigger: {
        trigger: "#contatti",
        start: "top bottom",
        scrub: 2
    },
    z: Math.PI / 2 
});


// 4. EXTRA: BOTTONI MAGNETICI
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
