// HACKED TOGETHER BY ANOCH JEYAKANTHAN

const canvas = document.getElementById('canvas') as HTMLCanvasElement;
const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;

// Set canvas dimensions
canvas.width = canvas.parentElement?.clientWidth || 0;
canvas.height = canvas.parentElement?.clientHeight || 0;

type Vector2 = {
    x: number,
    y: number
}

type InteractionTable = {
    [key: string]: {
        [key: string]: number
    }
}

type Config = {
    particleCount: number,
    colorCount: number,
    friction: number
}

function randomColor() {
    return '#'+(Math.random() * 0xFFFFFF << 0).toString(16).padStart(6, '0');
}

let interactionTable: InteractionTable = {}

function GenerateInteractionTable(count: number) {
    interactionTable = {}
    const colors: string[] = [];
    for (let i = 0; i < count; i++) {
        const c = randomColor();
        if (interactionTable[c]) {count++; continue};
        colors.push(c);
    }

    for (const c1 of colors) {
        interactionTable[c1] = {};
    
        for (const c2 of colors) {
            interactionTable[c1][c2] = (Math.random() - 0.5) * 0.5
        }
    }
    
    return colors;
}

function generateSliders(interactionTable: InteractionTable) {
    const interactionTableDiv = document.getElementById("interaction-table") as HTMLDivElement;
    interactionTableDiv.innerHTML = "";

    Object.keys(interactionTable).forEach(color1 => {
        Object.keys(interactionTable[color1]).forEach(color2 => {
            const sliderContainer = document.createElement("div");
            sliderContainer.classList.add("fundamental-section");

            const colorBox1 = document.createElement("div");
            colorBox1.classList.add("color-box");
            colorBox1.style.backgroundColor = color1;
            sliderContainer.appendChild(colorBox1);

            const colorBox2 = document.createElement("div");
            colorBox2.classList.add("color-box");
            colorBox2.style.backgroundColor = color2;
            sliderContainer.appendChild(colorBox2);

            const slider = document.createElement("input");
            slider.type = "range";
            slider.min = "-0.1";
            slider.max = "0.1";
            slider.step = "0.01";
            slider.value = `${interactionTable[color1][color2]}`;
            slider.classList.add("color-slider");
            sliderContainer.appendChild(slider);

            const thumb = document.createElement("div");
            thumb.classList.add("color-slider-thumb");
            sliderContainer.appendChild(thumb);

            slider.addEventListener("input", () => {
                interactionTable[color1][color2] = parseFloat(slider.value);
            });

            interactionTableDiv.appendChild(sliderContainer);
        });
    });
}

const config: Config = {
    particleCount: 500,
    colorCount: 5,
    friction: 0.3
};

const particleCountInput = document.getElementById("particle-count") as HTMLInputElement;
const frictionInput = document.getElementById("friction") as HTMLInputElement;
const numberOfColorsInput = document.getElementById("colour-count") as HTMLInputElement;
const randomizeButton = document.getElementById("randomize") as HTMLButtonElement;

let colors = GenerateInteractionTable(config.colorCount);
generateSliders(interactionTable);

function updateConfig(property: string, value: number | string) {
    //@ts-ignore
    config[property] = value;
}

function updateSimulation() {
    colors = GenerateInteractionTable(config.colorCount);
    generateSliders(interactionTable);
    particles = generateParticles(config.particleCount);
}

numberOfColorsInput.addEventListener("change", () => {
    updateConfig("colorCount", parseFloat(numberOfColorsInput.value));
    updateSimulation();
});

randomizeButton.addEventListener("click", () => {
    updateSimulation();
});

// Update friction accordingly
frictionInput.addEventListener("change", () => {
    updateConfig("friction", parseFloat(frictionInput.value));
});

const clamp = (num: number, min: number, max: number) => Math.max(min, Math.min(max, num));
// Particle class
class Particle {
    position: Vector2;
    velocity: Vector2;
    radius: number;
    color: string;

    constructor(position: Vector2, radius: number, color: string) {
        this.position = position;
        this.radius = radius;
        this.color = color;
        this.velocity = { x: 0, y: 0 };
    }

    draw() {
        ctx.beginPath();
        ctx.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2, false);
        ctx.fillStyle = this.color;
        ctx.fill();
        ctx.closePath();
    }

    update(particles: Particle[]) {
        this.draw();
        
        const force = { x: 0, y: 0 };
    
        for (let i = 0; i < particles.length; i++) {
            const particle = particles[i];
            if (particle === this) continue;
            let attractionForce = interactionTable[this.color][particle.color]
    
            const dx = this.position.x - particle.position.x;
            const dy = this.position.y - particle.position.y;
            const distanceSqr = dx * dx + dy * dy;
    
            if (distanceSqr >= 200*200 || Number.isNaN(distanceSqr)) continue;
            const distance = Math.sqrt(distanceSqr);
            attractionForce = distance <= this.radius*2 + 10 ? 2 : attractionForce // repelling force to stop particles from coming too close together

            const f = attractionForce / distance;
            force.x += f * dx;
            force.y += f * dy;
        }

        // Added friction to slow down the particles
        this.velocity.x = (this.velocity.x + force.x) * config.friction;
        this.velocity.y = (this.velocity.y + force.y) * config.friction;
    
        this.position.x += this.velocity.x;
        this.position.y += this.velocity.y;
    
        this.position.x = clamp(this.position.x, 0, canvas.width)//(this.position.x + canvas.width) % canvas.width;
        this.position.y = clamp(this.position.y, 0, canvas.height)//(this.position.y + canvas.height) % canvas.height;
    }
}

function generateParticles(count: number) {
    const particles: Particle[] = [];
    for (let i = 0; i < count; i++) {
        const position = { x: Math.random() * canvas.width, y: Math.random() * canvas.height };
        const radius = 5;
        const color = colors[Math.floor(Math.random() * colors.length)]
        const particle = new Particle(position, radius, color);

        particles.push(particle);
    }
    return particles;
}

let particles = generateParticles(config.particleCount); // default at 500
particleCountInput.addEventListener("change", () => {
    updateConfig("particleCount", parseFloat(particleCountInput.value));
    particles = generateParticles(config.particleCount);
});

// Run animation
function animate() {
    requestAnimationFrame(animate);
    ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear canvas on each frame
    particles.forEach(particle => {
        particle.update(particles);
    });
}

animate();
