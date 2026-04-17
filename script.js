const APP_STATES = {
    joy: { label: "Joyful State", hue: 50 },
    calm: { label: "Calm State", hue: 200 },
    fear: { label: "Anxious State", hue: 120 }, // green/dark
    angry: { label: "Agitated State", hue: 0 }
};
const ICONS = {
    joy: ['fa-sun', 'fa-star', 'fa-heart', 'fa-face-smile', 'fa-music'],
    calm: ['fa-moon', 'fa-cloud', 'fa-leaf', 'fa-water', 'fa-wind'],
    fear: ['fa-ghost', 'fa-eye', 'fa-spider', 'fa-moon', 'fa-cloud-showers-heavy'],
    angry: ['fa-bolt', 'fa-fire', 'fa-volcano', 'fa-meteor', 'fa-skull']
};
let currentEmotion = 'joy';
let isMuted = true;
let isVisualsIsolated = false;
let showOnlyDreams = false;
let hideBadMemories = false;
let searchQuery = "";
// Audio Engine Context
let audioCtx;
let oscillators = [];
let gainNode;
// Data
const thoughts = [];
const memories = [];
function init() {
    generateThoughts(20);
    generateMemories(15);
    renderThoughts();
    renderMemories();
    renderEmotionBars();
    setEmotion(currentEmotion);
    // Event listeners
    document.getElementById('mute-btn').addEventListener('click', toggleAudio);
    document.getElementById('close-popup').addEventListener('click', closePopup);
    
    // Filters
    document.getElementById('search-input').addEventListener('input', (e) => {
        searchQuery = e.target.value.toLowerCase();
        filterThoughts();
    });
    
    document.getElementById('toggle-bad-memories').addEventListener('change', (e) => {
        hideBadMemories = e.target.checked;
        filterThoughts();
    });
    
    document.getElementById('toggle-dreams').addEventListener('change', (e) => {
        showOnlyDreams = e.target.checked;
        filterThoughts();
    });
    
    document.getElementById('toggle-visuals').addEventListener('change', (e) => {
        isVisualsIsolated = e.target.checked;
        filterThoughts();
    });
}
// Generate random thoughts
function generateThoughts(count) {
    const types = ['memory', 'dream', 'active'];
    const emotions = Object.keys(APP_STATES);
    
    const thoughtDescriptions = {
        memory: {
            joy: "A cherished memory surfacing with warmth and nostalgia. It carries the weight of happiness.",
            calm: "A serene recollection, peaceful and grounding. It anchors you to moments of tranquility.",
            fear: "A troubling memory attempting to resurface. It whispers of past uncertainties.",
            angry: "A memory that still burns. It carries unresolved intensity and passion."
        },
        dream: {
            joy: "A joyful dream fragment—surreal, weightless, full of impossible possibilities.",
            calm: "A meditative dream state. Reality bends gently here, flowing like water.",
            fear: "A nightmare echoing in the background. Familiar yet unsettling and strange.",
            angry: "A turbulent dream of conflict and determination. Raw emotion without restraint."
        },
        active: {
            joy: "A present thought bubbling up with excitement. Your mind is alive and engaged.",
            calm: "A quiet observation drifting through consciousness. Present-moment awareness.",
            fear: "An anxious thought demanding attention. It pulls at your focus with urgency.",
            angry: "An active thought burning with conviction. Your mind is focused and determined."
        }
    };
    
    for (let i = 0; i < count; i++) {
        const emotion = emotions[Math.floor(Math.random() * emotions.length)];
        const iconList = ICONS[emotion];
        const icon = iconList[Math.floor(Math.random() * iconList.length)];
        const type = types[Math.floor(Math.random() * types.length)];
        
        let size = Math.random() * 80 + 40; // 40px to 120px
        let x = Math.random() * 90; // vw
        let y = Math.random() * 70; // vh (keep out of bottom controls)
        
        // Depth simulation
        let z = Math.random() * 300 - 150; // -150 to 150
        
        const desc = thoughtDescriptions[type][emotion];
        const emotionCap = emotion.charAt(0).toUpperCase() + emotion.slice(1);
        const typeCap = type.charAt(0).toUpperCase() + type.slice(1);
        
        thoughts.push({
            id: i,
            emotion,
            icon,
            type,
            title: `${emotionCap} ${typeCap}`,
            desc: desc,
            size, x, y, z,
            driftX: (Math.random() - 0.5) * 100,
            driftY: (Math.random() - 0.5) * 100,
            driftSpeed: Math.random() * 10 + 10 // 10s to 20s
        });
    }
}
// Generate history memories
function generateMemories(count) {
    const memoryDescriptions = {
        joy: [
            "Laughter echoes through a sunlit meadow. Time stands still in this moment of pure bliss.",
            "A warm embrace fills the memory—safety and belonging wrapped in golden light.",
            "Celebration frozen in time. Voices raised in harmony, hearts beating as one.",
            "The taste of sweetness on your tongue. A moment of unexpected delight.",
            "Dancing in the rain, free and alive, water reflecting like liquid diamonds."
        ],
        calm: [
            "Stillness surrounds you. The world breathes slowly, and so do you.",
            "A quiet library of forgotten knowledge, dust particles drift like tiny stars.",
            "The surface of still water mirrors everything perfectly—crystal clear truth.",
            "Deep meditation under moonlight. Your mind is an endless ocean of peace.",
            "Soft whispers of wind through ancient trees. Time moves at its own pace here."
        ],
        fear: [
            "Shadows dance at the edge of perception. Something unseen watches from the darkness.",
            "Your heartbeat echoes loudly. The walls seem closer than they were a moment ago.",
            "A memory of uncertainty—the ground beneath your feet feels unstable.",
            "Voices blur together into an incomprehensible chorus of concern and doubt.",
            "Running through fog, destination unknown. The path keeps shifting beneath you."
        ],
        angry: [
            "Flames rise from the depths of conviction. Passion burns hot and fierce.",
            "Words cut like shards of glass. The air crackles with electric intensity.",
            "A moment demands to be heard. Your voice is a thunderstorm demanding attention.",
            "Fire and determination fuel this memory. Boundaries are being firmly drawn.",
            "The force of conviction pushes against all resistance. Nothing will stop this momentum."
        ]
    };

    const memoryTitles = [
        "The First Beginning",
        "Echoes of What Was",
        "A Turning Point",
        "Whispers in Time",
        "The Forgotten Spring",
        "Yesterday's Dream",
        "A Moment Crystallized",
        "The Silent Witness",
        "Fragments of Then",
        "When Everything Changed",
        "The In-Between",
        "A Fleeting Touch",
        "The Threshold",
        "Residue of Days",
        "The Echo Chamber"
    ];
    
    // Generate simple time nodes
    for (let i = 0; i < count; i++) {
        const emotions = Object.keys(APP_STATES);
        const emotion = emotions[Math.floor(Math.random() * emotions.length)];
        const iconList = ICONS[emotion];
        const icon = iconList[Math.floor(Math.random() * iconList.length)];
        
        const emotionDescriptions = memoryDescriptions[emotion];
        const desc = emotionDescriptions[Math.floor(Math.random() * emotionDescriptions.length)];
        const title = memoryTitles[i % memoryTitles.length];
        
        memories.push({
            id: `mem-${i}`,
            emotion,
            icon,
            age: i, // 0 is newest
            title: title,
            desc: desc
        });
    }
}
function renderThoughts() {
    const container = document.getElementById('thought-network');
    container.innerHTML = '';
    
    thoughts.forEach(t => {
        // filter logic checks
        if (hideBadMemories && (t.emotion === 'fear' || t.emotion === 'angry')) return;
        if (showOnlyDreams && t.type !== 'dream') return;
        if (isVisualsIsolated && !['fa-eye', 'fa-sun', 'fa-cloud'].includes(t.icon)) return;
        if (searchQuery && !t.title.toLowerCase().includes(searchQuery) && !t.desc.toLowerCase().includes(searchQuery)) return;
        
        const node = document.createElement('div');
        node.className = `thought-node ${t.emotion}`;
        node.innerHTML = `<i class="fa-solid ${t.icon}"></i>`;
        
        // Create depth effect: z value determines scale and layer
        // z ranges from -150 to 150, normalize to 0.6 - 1.4 scale
        const depthScale = 0.6 + ((t.z + 150) / 300) * 0.8;
        const depthOpacity = 0.2 + ((t.z + 150) / 300) * 0.8;
        
        // Apply inline styles for 3d scatter
        node.style.width = `${t.size}px`;
        node.style.height = `${t.size}px`;
        node.style.left = `${t.x}vw`;
        node.style.top = `${t.y}vh`;
        node.style.fontSize = `${t.size * 0.4}px`;
        node.style.opacity = depthOpacity;
        node.style.zIndex = Math.round((t.z + 150) / 2);
        
        // CSS vars for animation and depth
        node.style.setProperty('--drift-x', `${t.driftX}px`);
        node.style.setProperty('--drift-y', `${t.driftY}px`);
        node.style.setProperty('--drift-speed', `${t.driftSpeed}s`);
        node.style.setProperty('--depth-scale', depthScale);
        
        // Set dynamic colors based on its own emotion for variety
        node.style.background = `radial-gradient(circle at top left, hsla(${APP_STATES[t.emotion].hue}, 80%, 60%, 0.4), transparent)`;
        
        // Interaction
        node.addEventListener('click', () => {
            openPopup(t);
            // Dynamic emotion shifting: click a thought -> shifts global mind state
            if (currentEmotion !== t.emotion) {
                setEmotion(t.emotion);
            }
        });
        
        container.appendChild(node);
    });
}
function filterThoughts() {
    renderThoughts();
}
function renderMemories() {
    const container = document.getElementById('memory-timeline');
    container.innerHTML = '';
    
    memories.forEach(m => {
        const node = document.createElement('div');
        node.className = 'memory-node';
        node.innerHTML = `<i class="fa-solid ${m.icon}"></i>`;
        
        // Depth/Time effect using transform only (no blur)
        const scaleAmount = Math.max(0.4, 1 - (m.age * 0.05));
        const opacity = Math.max(0.2, 1 - (m.age * 0.08));
        
        node.style.transform = `scale(${scaleAmount})`;
        node.style.opacity = opacity;
        node.style.setProperty('--node-color', `hsla(${APP_STATES[m.emotion].hue}, 80%, 60%, 0.5)`);
        
        node.addEventListener('click', () => {
            openPopup({ ...m, type: 'Memory Stream' });
            if (currentEmotion !== m.emotion) setEmotion(m.emotion);
        });
        
        container.appendChild(node);
    });
}
function renderEmotionBars() {
    const container = document.getElementById('emotion-wave');
    container.innerHTML = '';
    for(let i=0; i<12; i++) {
        const bar = document.createElement('div');
        bar.className = 'bar';
        bar.style.animationDelay = `${Math.random()}s`;
        container.appendChild(bar);
    }
}
function setEmotion(emotionKey) {
    currentEmotion = emotionKey;
    document.documentElement.setAttribute('data-emotion', emotionKey);
    
    const stateLabel = document.getElementById('emotion-label');
    stateLabel.innerText = APP_STATES[emotionKey].label;
    
    updateAudio();
}
function openPopup(data) {
    const popup = document.getElementById('thought-popup');
    document.getElementById('popup-title').innerText = data.title;
    document.getElementById('popup-desc').innerText = data.desc;
    document.querySelector('.popup-icon').innerHTML = `<i class="fa-solid ${data.icon}"></i>`;
    
    // Theme popup to emotion
    document.querySelector('.popup-icon').style.color = `hsl(${APP_STATES[data.emotion].hue}, 80%, 60%)`;
    
    popup.classList.add('active');
}
function closePopup() {
    document.getElementById('thought-popup').classList.remove('active');
}
// Audio Synthesis
function toggleAudio() {
    if (!audioCtx) {
        initAudio();
    }
    
    isMuted = !isMuted;
    
    const btn = document.getElementById('mute-btn');
    if (isMuted) {
        btn.innerHTML = '<i class="fa-solid fa-volume-xmark"></i> Muted';
        gainNode.gain.setTargetAtTime(0, audioCtx.currentTime, 0.5);
    } else {
        btn.innerHTML = '<i class="fa-solid fa-volume-high"></i> Mute Soundscape';
        // start playback
        audioCtx.resume();
        updateAudio(); // set proper volume
    }
}
function initAudio() {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    gainNode = audioCtx.createGain();
    gainNode.gain.value = 0;
    gainNode.connect(audioCtx.destination);
    
    // Create soft drone oscillators
    for(let i=0; i<3; i++) {
        let osc = audioCtx.createOscillator();
        let lfo = audioCtx.createOscillator();
        let oscGain = audioCtx.createGain();
        
        osc.type = 'sine';
        lfo.type = 'sine';
        lfo.frequency.value = 0.1 + (i*0.05); // slow modulation
        
        lfo.connect(oscGain.gain);
        osc.connect(oscGain);
        oscGain.connect(gainNode);
        
        osc.start();
        lfo.start();
        
        oscillators.push({ osc, lfo, oscGain });
    }
}
function updateAudio() {
    if (!audioCtx || isMuted) return;
    
    gainNode.gain.setTargetAtTime(0.3, audioCtx.currentTime, 1);
    
    const baseFreqs = {
        joy: [261.63, 329.63, 392.00], // C major
        calm: [130.81, 196.00, 261.63], // Lower C
        fear: [65.41, 69.30, 98.00], // Dissonant low
        angry: [150, 160, 200] // Sawtooth-like tension
    };
    
    const freqs = baseFreqs[currentEmotion];
    
    oscillators.forEach((item, i) => {
        // Smoothly transition frequencies
        item.osc.frequency.setTargetAtTime(freqs[i], audioCtx.currentTime, 2);
        
        // Change timbre based on emotion
        if (currentEmotion === 'angry') {
            item.osc.type = 'triangle';
        } else if (currentEmotion === 'fear') {
            item.osc.type = 'square';
            item.lfo.frequency.setTargetAtTime(5, audioCtx.currentTime, 0.5); // fast rumble
        } else {
            item.osc.type = 'sine';
            item.lfo.frequency.setTargetAtTime(0.1 + (i*0.05), audioCtx.currentTime, 0.5); // slow breathe
        }
    });
}
// Start app
window.onload = init;