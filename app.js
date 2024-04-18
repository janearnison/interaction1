let audioContext;
let device;
let y;
let x;
let lastTapTime = 0;
const doubleTapThreshold = 300; // Time threshold for double-tap in milliseconds

function setup() {
    createCanvas(windowWidth, windowHeight);
    noCursor();

    colorMode(HSB, 360, 100, 100);
    rectMode(CENTER);
    noStroke();

    audioContext = new (window.AudioContext || window.webkitAudioContext)();

    loadRNBO();

    document.addEventListener("pointermove", updateRNBO);
    window.addEventListener("pointerdown", handlePointerDown); // Listen for pointer down event on the window
}

async function loadRNBO() {
    const { createDevice } = RNBO;

    await audioContext.resume();

    const rawPatcher = await fetch('patch.export.json');
    const patcher = await rawPatcher.json();

    device = await createDevice({ context: audioContext, patcher });
    device.node.connect(audioContext.destination);

    x = device.parametersById.get('x');
    y = device.parametersById.get('y');
}

function startAudioContext() {
    if (audioContext.state === 'suspended') {
        audioContext.resume();
    }
}

function updateRNBO(e) {
    let yValue = map(e.clientY, height, 0, 0, 1); // Normalize mouseY
    let xValue = map(e.clientX, 0, width, 0, 1); // Normalize mouseX

    if (y) {
        y.normalizedValue = yValue;
    }

    if (x) {
        x.normalizedValue = xValue;
    }
}

function handlePointerDown(event) {
    const currentTime = new Date().getTime();
    const isDoubleTap = currentTime - lastTapTime < doubleTapThreshold;

    if (isDoubleTap) {
        toggleAudioContext();
    }

    lastTapTime = currentTime;
}

function toggleAudioContext() {
    if (audioContext.state === 'running') {
        audioContext.suspend();
    } else if (audioContext.state === 'suspended') {
        audioContext.resume();
    }
}

function draw() {
    background(mouseY / 2, 100, 100);
    fill(360 - mouseY / 2, 100, 100);
    rect(360, 360, mouseX + 1);
}

// Prevent refresh and zooming
function preventDefault(event) {
    event.preventDefault();
}

// this prevents dragging screen around
function touchMoved() {
    return false;
}
