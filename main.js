// Registra i plugin GSAP
gsap.registerPlugin(ScrollTrigger);

// =================================================================
// PARTE 1: SETUP THREE.JS (Cubetti 3D + Luce)
// =================================================================

const canvas = document.querySelector('#webgl-container');
const scene = new THREE.Scene();

// Sfondo "GHOST WHITE"
const bgColor = 0xf3f5f8; 
scene.background = new THREE.Color(bgColor); 
scene.fog = new THREE.FogExp2(bgColor, 0.003); 

const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
};

const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 1000);
camera.position.z = 6; 
scene.add(camera);

const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    antialias: true,
    alpha: false 
});
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true; 
renderer.shadowMap.type = THREE.PCFSoftShadowMap;


// --- LUCI ---
const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
scene.add(ambientLight);

const dirLight = new THREE.DirectionalLight(0xffffff, 1);
dirLight.position.set(5, 5, 5); 
scene.add(dirLight);

// Luce d'accento (si abbina al nuovo colore soft)
const spotLight = new THREE.PointLight(0x7393b3, 0.5); // <-- NUOVO COLORE SOFT
spotLight.position.set(-5, -5, 2);
scene.add(spotLight);


// --- CREAZIONE PICCOLE SCATOLE 3D (INSTANCED MESH) ---

const particlesCount = 650; 

// Geometria: Cubo
const geometry = new THREE.BoxGeometry(0.12, 0.12, 0.12); 

// Materiale (reagisce alle luci)
const material = new THREE.MeshStandardMaterial({
    // NUOVO COLORE: AZZURRO POLVERE/DUSTY BLUE (#7393b3)
    color: 0x7393b3, 
    roughness: 0.4,  
    metalness: 0.1   
});

const mesh = new THREE.InstancedMesh(geometry, material, particlesCount);
scene.add(mesh);

// Dobbiamo aggiornare il ciclo per eliminare la logica del gradiente (InstanceColor)
const dummy = new THREE.Object3D(); 

for (let i = 0; i < particlesCount; i++) {
    // Posizione Randomica
    const x = (Math.random() - 0.5) * 25; 
    const y = (Math.random() - 0.5) * 15;
    const z = (Math.random() - 0.5) * 12;

    dummy.position.set(x, y, z);
    
    // Rotazione randomica 
    dummy.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
    
    // Scala leggermente variabile
    const scale = Math.random() * 0.7 + 0.3; 
    dummy.scale.set(scale, scale, scale);

    dummy.updateMatrix();
    mesh.setMatrixAt(i, dummy.matrix);
}

mesh.instanceMatrix.needsUpdate = true; 


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

    mesh.rotation.y = elapsedTime * 0.04; 
    mesh.rotation.x = elapsedTime * 0.02; 

    targetX = mouseX * 0.5;
    targetY = mouseY * 0.5;
    
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
    x: 1.2, 
    y: 1.2,
    z: 1.2
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

// Magnetic Buttons (Invariato)
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
