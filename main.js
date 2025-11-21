// Registra i plugin GSAP
gsap.registerPlugin(ScrollTrigger);

// =================================================================
// PARTE 1: SETUP THREE.JS (REAL 3D + LIGHTING)
// =================================================================

const canvas = document.querySelector('#webgl-container');
const scene = new THREE.Scene();

// 1. NUOVO SFONDO "GHOST WHITE"
const bgColor = 0xf3f5f8; 
scene.background = new THREE.Color(bgColor); 
scene.fog = new THREE.FogExp2(bgColor, 0.003); // Nebbia leggermente più densa per fondere le sfere lontane

const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
};

const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 1000);
camera.position.z = 6; // Camera leggermente più indietro per vedere il volume
scene.add(camera);

const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    antialias: true,
    alpha: false 
});
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true; // Abilitiamo le ombre
renderer.shadowMap.type = THREE.PCFSoftShadowMap;


// --- LUCI (ESSENZIALI PER IL 3D) ---
// Senza luci, le sfere sembrerebbero cerchi piatti.

// Luce Ambientale (Base luminosa morbida)
const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
scene.add(ambientLight);

// Luce Direzionale (Come il sole: crea luci e ombre sulle sfere)
const dirLight = new THREE.DirectionalLight(0xffffff, 1);
dirLight.position.set(5, 5, 5); // La luce arriva da in alto a destra
scene.add(dirLight);

// Luce d'accento bluastra dal basso (per effetto "Tech")
const spotLight = new THREE.PointLight(0x0066ff, 0.5);
spotLight.position.set(-5, -5, 2);
scene.add(spotLight);


// --- CREAZIONE SFERE 3D (INSTANCED MESH) ---
// Usiamo InstancedMesh per renderizzare 1000 sfere vere senza rallentare il PC

const particlesCount = 1000; // Numero ottimale per sfere 3D

// Geometria: Vera sfera
const geometry = new THREE.SphereGeometry(0.08, 16, 16); 

// Materiale: MeshStandardMaterial reagisce alla luce (Shading, Riflessi)
const material = new THREE.MeshStandardMaterial({
    color: 0xffffff, // Il colore base è bianco, lo tingeremo dopo
    roughness: 0.4,  // Un po' lucido (0 = specchio, 1 = opaco)
    metalness: 0.1   // Leggero effetto metallico
});

const mesh = new THREE.InstancedMesh(geometry, material, particlesCount);
scene.add(mesh);

// --- POSIZIONAMENTO E COLORAZIONE (GRADIENTE) ---

const dummy = new THREE.Object3D(); // Oggetto temporaneo per calcolare le posizioni
const colorInside = new THREE.Color(0x0066ff); // Blu
const colorOutside = new THREE.Color(0x00c9a7); // Teal

for (let i = 0; i < particlesCount; i++) {
    // Posizione Randomica
    const x = (Math.random() - 0.5) * 20;
    const y = (Math.random() - 0.5) * 12;
    const z = (Math.random() - 0.5) * 10;

    dummy.position.set(x, y, z);
    
    // Rotazione randomica per variare i riflessi
    dummy.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, 0);
    
    // Scala leggermente variabile per naturalezza
    const scale = Math.random() * 0.5 + 0.5; 
    dummy.scale.set(scale, scale, scale);

    dummy.updateMatrix();
    mesh.setMatrixAt(i, dummy.matrix);

    // CALCOLO GRADIENTE
    const mixFactor = (x + 10) / 20; // Normalizza da 0 a 1 basato su X
    const finalColor = colorInside.clone().lerp(colorOutside, mixFactor);
    
    mesh.setColorAt(i, finalColor);
}

mesh.instanceMatrix.needsUpdate = true; // Importante: notifica Three.js che le matrici sono pronte
mesh.instanceColor.needsUpdate = true; // Importante: notifica i colori


// --- GESTIONE MOUSE ---

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

    // Rotazione lenta dell'intera nuvola
    mesh.rotation.y = elapsedTime * 0.05;
    mesh.rotation.x = elapsedTime * 0.02; // Leggera rotazione anche su X per mostrare il 3D

    // Mouse Parallax
    targetX = mouseX * 0.5;
    targetY = mouseY * 0.5;
    
    // Interpolazione fluida
    mesh.rotation.x += 0.05 * (targetY - mesh.rotation.x);
    mesh.rotation.y += 0.05 * (targetX - mesh.rotation.y);

    renderer.render(scene, camera);
    window.requestAnimationFrame(tick);
};

tick();


// =================================================================
// PARTE 2: GSAP ANIMATIONS
// =================================================================

// 1. HTML Animations (Invariato)
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

// Effetto "Esplosione/Zoom" verso Soluzioni
gsap.to(mesh.scale, {
    scrollTrigger: {
        trigger: "#soluzioni",
        start: "top bottom",
        end: "top top",
        scrub: 1
    },
    x: 1.3, 
    y: 1.3,
    z: 1.3
});

// Rotazione accentuata
gsap.to(mesh.rotation, {
    scrollTrigger: {
        trigger: "#contatti",
        start: "top bottom",
        scrub: 2
    },
    z: Math.PI / 2 
});

// Magnetic Buttons
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
        gsap.to(btn, { x: 0, y: 0, duration: 0.5, ease: "elastic.out(1, 0.3)" });
    });
});
        
