// HACKED TOGETHER BY ANOCH JEYAKANTHAN
var _a, _b;
var canvas = document.getElementById('canvas');
var ctx = canvas.getContext('2d');
// Set canvas dimensions
canvas.width = ((_a = canvas.parentElement) === null || _a === void 0 ? void 0 : _a.clientWidth) || 0;
canvas.height = ((_b = canvas.parentElement) === null || _b === void 0 ? void 0 : _b.clientHeight) || 0;
function randomColor() {
    return '#' + (Math.random() * 0xFFFFFF << 0).toString(16).padStart(6, '0');
}
var interactionTable = {};
function GenerateInteractionTable(count) {
    interactionTable = {};
    var colors = [];
    for (var i = 0; i < count; i++) {
        var c = randomColor();
        if (interactionTable[c]) {
            count++;
            continue;
        }
        ;
        colors.push(c);
    }
    for (var _i = 0, colors_1 = colors; _i < colors_1.length; _i++) {
        var c1 = colors_1[_i];
        interactionTable[c1] = {};
        for (var _a = 0, colors_2 = colors; _a < colors_2.length; _a++) {
            var c2 = colors_2[_a];
            interactionTable[c1][c2] = (Math.random() - 0.5) * 0.5;
        }
    }
    return colors;
}
function generateSliders(interactionTable) {
    var interactionTableDiv = document.getElementById("interaction-table");
    interactionTableDiv.innerHTML = "";
    Object.keys(interactionTable).forEach(function (color1) {
        Object.keys(interactionTable[color1]).forEach(function (color2) {
            var sliderContainer = document.createElement("div");
            sliderContainer.classList.add("fundamental-section");
            var colorBox1 = document.createElement("div");
            colorBox1.classList.add("color-box");
            colorBox1.style.backgroundColor = color1;
            sliderContainer.appendChild(colorBox1);
            var colorBox2 = document.createElement("div");
            colorBox2.classList.add("color-box");
            colorBox2.style.backgroundColor = color2;
            sliderContainer.appendChild(colorBox2);
            var slider = document.createElement("input");
            slider.type = "range";
            slider.min = "-0.1";
            slider.max = "0.1";
            slider.step = "0.01";
            slider.value = "".concat(interactionTable[color1][color2]);
            slider.classList.add("color-slider");
            sliderContainer.appendChild(slider);
            var thumb = document.createElement("div");
            thumb.classList.add("color-slider-thumb");
            sliderContainer.appendChild(thumb);
            slider.addEventListener("input", function () {
                interactionTable[color1][color2] = parseFloat(slider.value);
            });
            interactionTableDiv.appendChild(sliderContainer);
        });
    });
}
var config = {
    particleCount: 500,
    colorCount: 5,
    friction: 0.3
};
var particleCountInput = document.getElementById("particle-count");
var frictionInput = document.getElementById("friction");
var numberOfColorsInput = document.getElementById("colour-count");
var randomizeButton = document.getElementById("randomize");
var colors = GenerateInteractionTable(config.colorCount);
generateSliders(interactionTable);
function updateConfig(property, value) {
    //@ts-ignore
    config[property] = value;
}
function updateSimulation() {
    colors = GenerateInteractionTable(config.colorCount);
    generateSliders(interactionTable);
    particles = generateParticles(config.particleCount);
}
numberOfColorsInput.addEventListener("change", function () {
    updateConfig("colorCount", parseFloat(numberOfColorsInput.value));
    updateSimulation();
});
randomizeButton.addEventListener("click", function () {
    updateSimulation();
});
// Update friction accordingly
frictionInput.addEventListener("change", function () {
    updateConfig("friction", parseFloat(frictionInput.value));
});
var clamp = function (num, min, max) { return Math.max(min, Math.min(max, num)); };
// Particle class
var Particle = /** @class */ (function () {
    function Particle(position, radius, color) {
        this.position = position;
        this.radius = radius;
        this.color = color;
        this.velocity = { x: 0, y: 0 };
    }
    Particle.prototype.draw = function () {
        ctx.beginPath();
        ctx.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2, false);
        ctx.fillStyle = this.color;
        ctx.fill();
        ctx.closePath();
    };
    Particle.prototype.update = function (particles) {
        this.draw();
        var force = { x: 0, y: 0 };
        for (var i = 0; i < particles.length; i++) {
            var particle = particles[i];
            if (particle === this)
                continue;
            var attractionForce = interactionTable[this.color][particle.color];
            var dx = this.position.x - particle.position.x;
            var dy = this.position.y - particle.position.y;
            var distanceSqr = dx * dx + dy * dy;
            if (distanceSqr >= 200 * 200 || Number.isNaN(distanceSqr))
                continue;
            var distance = Math.sqrt(distanceSqr);
            attractionForce = distance <= this.radius * 2 + 10 ? 2 : attractionForce; // repelling force to stop particles from coming too close together
            var f = attractionForce / distance;
            force.x += f * dx;
            force.y += f * dy;
        }
        // Added friction to slow down the particles
        this.velocity.x = (this.velocity.x + force.x) * config.friction;
        this.velocity.y = (this.velocity.y + force.y) * config.friction;
        this.position.x += this.velocity.x;
        this.position.y += this.velocity.y;
        this.position.x = clamp(this.position.x, 0, canvas.width); //(this.position.x + canvas.width) % canvas.width;
        this.position.y = clamp(this.position.y, 0, canvas.height); //(this.position.y + canvas.height) % canvas.height;
    };
    return Particle;
}());
function generateParticles(count) {
    var particles = [];
    for (var i = 0; i < count; i++) {
        var position = { x: Math.random() * canvas.width, y: Math.random() * canvas.height };
        var radius = 5;
        var color = colors[Math.floor(Math.random() * colors.length)];
        var particle = new Particle(position, radius, color);
        particles.push(particle);
    }
    return particles;
}
var particles = generateParticles(config.particleCount); // default at 500
particleCountInput.addEventListener("change", function () {
    updateConfig("particleCount", parseFloat(particleCountInput.value));
    particles = generateParticles(config.particleCount);
});
// Run animation
function animate() {
    requestAnimationFrame(animate);
    ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear canvas on each frame
    particles.forEach(function (particle) {
        particle.update(particles);
    });
}
animate();
