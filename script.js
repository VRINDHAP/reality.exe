// ==========================================
// SOUND EFFECTS ENGINE (Web Audio API)
// ==========================================
let audioCtx;

function initAudio() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  SoundFX.startAmbientDrone();
}

const SoundFX = {
  droneGain: null,
  droneOsc: null,
  droneFilter: null,
  isMuted: false,
  currentDroneVol: 0.1,
  
  startAmbientDrone: () => {
    if (!audioCtx) return;
    try {
      const osc = audioCtx.createOscillator();
      const noiseBuffer = audioCtx.createBuffer(1, audioCtx.sampleRate * 2, audioCtx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      for (let i = 0; i < noiseBuffer.length; i++) { output[i] = Math.random() * 2 - 1; }
      
      const noise = audioCtx.createBufferSource();
      noise.buffer = noiseBuffer;
      noise.loop = true;

      const filter = audioCtx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = 800; 
      SoundFX.droneFilter = filter;
      
      const droneGain = audioCtx.createGain();
      droneGain.gain.value = 0.1; // start calm
      SoundFX.currentDroneVol = 0.1;

      osc.type = 'sine';
      osc.frequency.value = 150; // calm drone
      
      osc.connect(droneGain);
      noise.connect(filter);
      filter.connect(droneGain);
      
      droneGain.connect(audioCtx.destination);
      osc.start();
      noise.start();
      
      SoundFX.droneGain = droneGain;
      SoundFX.droneOsc = osc;
    } catch(e) {}
  },
  triggerPhase: (phase) => {
    if(!SoundFX.droneGain || !audioCtx) return;
    
    if(phase === 2) {
       // tense
       SoundFX.droneOsc.type = 'triangle';
       SoundFX.droneOsc.frequency.exponentialRampToValueAtTime(50, audioCtx.currentTime + 3);
       SoundFX.droneFilter.frequency.exponentialRampToValueAtTime(100, audioCtx.currentTime + 3);
       SoundFX.currentDroneVol = 0.5;
       if(!SoundFX.isMuted) SoundFX.droneGain.gain.exponentialRampToValueAtTime(0.5, audioCtx.currentTime + 3);
    } else if (phase === 3) {
       // darker ambient 
       SoundFX.droneOsc.frequency.exponentialRampToValueAtTime(30, audioCtx.currentTime + 4);
       SoundFX.droneFilter.frequency.exponentialRampToValueAtTime(70, audioCtx.currentTime + 4);
       SoundFX.currentDroneVol = 0.8;
       if(!SoundFX.isMuted) SoundFX.droneGain.gain.exponentialRampToValueAtTime(0.8, audioCtx.currentTime + 4);
    } else if (phase === 4) {
       // Silence
       SoundFX.droneGain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.1);
    }
  },
  rampDrone: (intensity) => {
    if(SoundFX.droneGain && audioCtx && !SoundFX.isMuted) {
       SoundFX.droneGain.gain.exponentialRampToValueAtTime(SoundFX.currentDroneVol * intensity, audioCtx.currentTime + 2);
    }
  },
  playHover: () => {
    if (!audioCtx || SoundFX.isMuted) return;
    try {
      const osc = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      osc.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(400, audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(600, audioCtx.currentTime + 0.05);
      gainNode.gain.setValueAtTime(0.05, audioCtx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.05);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.05);
    } catch(e) {}
  },
  playClick: () => {
    if (!audioCtx || SoundFX.isMuted) return;
    try {
      const osc = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      osc.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      osc.type = 'square';
      osc.frequency.setValueAtTime(150, audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(50, audioCtx.currentTime + 0.1);
      gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.1);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.1);
    } catch(e) {}
  },
  playType: () => {
    if (!audioCtx || SoundFX.isMuted) return;
    try {
      const osc = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      osc.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(800 + Math.random() * 200, audioCtx.currentTime);
      gainNode.gain.setValueAtTime(0.02, audioCtx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.03);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.03);
    } catch(e) {}
  },
  playGlitch: () => {
    if (!audioCtx || SoundFX.isMuted) return;
    try {
      const bufferSize = Math.floor(audioCtx.sampleRate * 0.2); 
      const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
          data[i] = Math.random() * 2 - 1;
      }
      const noise = audioCtx.createBufferSource();
      noise.buffer = buffer;
      const gainNode = audioCtx.createGain();
      gainNode.gain.setValueAtTime(0.2, audioCtx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.2);
      noise.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      noise.start();
    } catch(e) {}
  },
  playLoudGlitch: () => { // bypasses mute for final climax shock
    if (!audioCtx) return; 
    try {
      const bufferSize = Math.floor(audioCtx.sampleRate * 0.8); 
      const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
          data[i] = (Math.random() * 2 - 1) * 3.0; // intense distortion
      }
      const noise = audioCtx.createBufferSource();
      noise.buffer = buffer;
      const filter = audioCtx.createBiquadFilter();
      filter.type = 'highpass';
      filter.frequency.value = 500;
      
      const gainNode = audioCtx.createGain();
      gainNode.gain.setValueAtTime(1.0, audioCtx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.8);
      noise.connect(filter);
      filter.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      noise.start();
    } catch(e) {}
  }
};

document.getElementById('btn-mute').addEventListener('click', (e) => {
  SoundFX.isMuted = !SoundFX.isMuted;
  e.target.innerText = SoundFX.isMuted ? '🔇' : '🔊';
  if(SoundFX.droneGain && audioCtx) {
     SoundFX.droneGain.gain.exponentialRampToValueAtTime(SoundFX.isMuted ? 0.001 : SoundFX.currentDroneVol, audioCtx.currentTime + 0.1);
  }
});


// ==========================================
// GLOBALS & UTILS
// ==========================================
const cursor = document.getElementById('cursor');
const follower = document.getElementById('cursor-follower');
const stages = document.querySelectorAll('.stage');
let currentStageIndex = 0;
let cursorLag = false; 
let mouseX = 0, mouseY = 0;
let cursorX = 0, cursorY = 0;
let followerX = 0, followerY = 0;

document.addEventListener('mousemove', (e) => {
  mouseX = e.clientX;
  mouseY = e.clientY;
  if (!cursorLag) {
    cursor.style.left = `${mouseX}px`;
    cursor.style.top = `${mouseY}px`;
  }
});

function animateCursor() {
  if (cursorLag) {
    cursorX += (mouseX - cursorX) * 0.05;
    cursorY += (mouseY - cursorY) * 0.05;
    cursor.style.left = `${cursorX}px`;
    cursor.style.top = `${cursorY}px`;
  }
  
  followerX += (mouseX - followerX) * 0.1;
  followerY += (mouseY - followerY) * 0.1;
  follower.style.left = `${followerX}px`;
  follower.style.top = `${followerY}px`;
  
  requestAnimationFrame(animateCursor);
}
animateCursor();

document.querySelectorAll('button, input[type="range"]').forEach(el => {
  el.addEventListener('mouseenter', () => {
    document.body.classList.add('cursor-hover');
    SoundFX.playHover();
  });
  el.addEventListener('mouseleave', () => document.body.classList.remove('cursor-hover'));
  el.addEventListener('click', () => SoundFX.playClick());
});

// Particles Generation
const particlesContainer = document.getElementById('particles');
for(let i=0; i<30; i++) {
  let p = document.createElement('div');
  p.classList.add('particle');
  let size = Math.random() * 5 + 2;
  p.style.width = `${size}px`;
  p.style.height = `${size}px`;
  p.style.left = `${Math.random() * 100}vw`;
  p.style.top = `${Math.random() * 100}vh`;
  particlesContainer.appendChild(p);
  
  gsap.to(p, {
    y: `-=${Math.random() * 100 + 50}`,
    x: `+=${(Math.random() - 0.5) * 50}`,
    duration: Math.random() * 10 + 10,
    repeat: -1,
    yoyo: true,
    ease: "sine.inOut"
  });
}

// ==========================================
// SECRET HUD & GLOBAL INTERACTIONS
// ==========================================
const easterEggTexts = [
  "You could leave... but you won't.",
  "You want to see what's next.",
  "Just one more step.",
  "There are no shortcuts."
];

function showSecretHud(msg, duration = 3000) {
  const hud = document.getElementById('secret-hud');
  hud.innerText = msg;
  hud.style.opacity = 1;
  SoundFX.playType();
  setTimeout(() => { hud.style.opacity = 0; }, duration);
}

document.addEventListener('contextmenu', e => {
  e.preventDefault();
  document.body.classList.add('glitch-bg');
  SoundFX.playGlitch();
  setTimeout(() => document.body.classList.remove('glitch-bg'), 200);
  showSecretHud(easterEggTexts[Math.floor(Math.random()*easterEggTexts.length)]);
});

document.addEventListener('dblclick', e => {
  if(e.target.tagName !== 'BUTTON' && e.target.tagName !== 'INPUT') {
    showSecretHud("Why double click? Focus.");
  }
});

let globalIdleTimer;
document.addEventListener('mousemove', () => {
  clearTimeout(globalIdleTimer);
  globalIdleTimer = setTimeout(() => {
    if(currentStageIndex > 0 && currentStageIndex < 20) {
      showSecretHud("Still breathing? Keep going.", 4000);
    }
  }, 10000);
});

// ==========================================
// STAGE MANAGEMENT
// ==========================================
const stageMap = {
  0: 'init', 1: 'entry', 2: 'typing', 3: 'stage2_5', 4: 'analysis',
  5: 'riddle_echo', 6: 'riddle_key', 7: 'riddle', 8: 'stage4_5',
  9: 'memory', 10: 'distortion', 11: 'reaction', 12: 'follow_dot', 
  13: 'gravity', 14: 'inversion', 15: 'control', 16: 'circle', 
  17: 'stage7_5', 18: 'loop', 19: 'personal', 20: 'collapse', 21: 'final'
};

function goToStage(index, delayMs = 1500) {
  if(index < 0 || index >= stages.length) return;
  
  if(index >= 7 && index < 12) SoundFX.triggerPhase(2);
  if(index >= 12 && index < 20) SoundFX.triggerPhase(3);
  
  setTimeout(() => {
    gsap.to(stages[currentStageIndex], {
      opacity: 0,
      duration: 1,
      onComplete: () => {
        stages[currentStageIndex].classList.remove('active');
        currentStageIndex = index;
        stages[currentStageIndex].classList.add('active');
        gsap.fromTo(stages[currentStageIndex], { opacity: 0 }, { opacity: 1, duration: 2 });
        triggerStageLogic(currentStageIndex);
      }
    });
  }, delayMs);
}

function processStageTransition(targetIndex, customMsg, delay = 2000) {
   showSecretHud(customMsg || "Processing your brain... still loading...", delay);
   setTimeout(() => goToStage(targetIndex, 0), delay);
}


function triggerStageLogic(index) {
  const stageName = stageMap[index];
  switch(stageName) {
    case 'typing': startTypingStage(); break;
    case 'stage2_5': startStage2_5(); break;
    case 'analysis': startFakeAnalysis(); break;
    case 'riddle_echo': startRiddleEcho(); break;
    case 'riddle_key': startRiddleKey(); break;
    case 'stage4_5': startStage4_5(); break;
    case 'memory': startMemory(); break;
    case 'distortion': startDistortion(); break;
    case 'reaction': startReaction(); break;
    case 'follow_dot': startFollowDot(); break;
    case 'gravity': startAntiGravity(); break;
    case 'inversion': startInversion(); break;
    case 'circle': startCircle(); break;
    case 'stage7_5': startStage7_5(); break;
    case 'personal': startPersonalMessage(); break;
    case 'collapse': startCollapse(); break;
    case 'final': startFinalSequence(); break;
  }
}

// ==========================================
// STAGE SPECIFIC LOGIC
// ==========================================

// STAGE 0: INIT //
document.getElementById('btn-connect').addEventListener('click', () => {
  initAudio();
  goToStage(1, 0); 
});

// STAGE 1: ENTRY //
document.querySelectorAll('.s1-btn').forEach(btn => {
  btn.addEventListener('click', (e) => {
    const choice = e.target.dataset.choice;
    if(choice === 'no') {
      const msg = document.getElementById('s1-response');
      gsap.to(msg, { opacity: 1, duration: 0.5 });
      processStageTransition(2, "Interesting... you clicked 'No' but stayed.", 2500);
    } else {
      processStageTransition(2, "Predictable compliance.", 1500);
    }
  });
});

// STAGE 2: TYPING //
function startTypingStage() {
  const textContainer = document.getElementById('s2-text');
  const text = "Let me understand you...";
  textContainer.innerHTML = '';
  
  let delay = 0;
  text.split('').forEach((char, i) => {
    setTimeout(() => {
      textContainer.innerHTML += char;
      SoundFX.playType();
    }, delay);
    delay += Math.random() * 100 + 50;
  });
  
  setTimeout(() => goToStage(3, 1000), delay + 2500);
}

// STAGE 2.5: DO NOT MOVE //
let didFailMove = false;
function startStage2_5() {
  document.getElementById('s2_5-text').innerText = "Do not move your cursor...";
  gsap.fromTo('#fill-still', {width: '0%'}, {width: '100%', duration: 5, ease: 'linear'});
  didFailMove = false;
  
  const moveHandler = (e) => {
    if (Math.abs(e.movementX) > 2 || Math.abs(e.movementY) > 2) {
      didFailMove = true;
      document.getElementById('s2_5-text').innerText = "You moved. I noticed.";
      SoundFX.playHover();
      document.removeEventListener('mousemove', moveHandler);
      processStageTransition(4, "Patience is lacking.", 2000); 
    }
  };

  setTimeout(() => { document.addEventListener('mousemove', moveHandler); }, 1000);

  setTimeout(() => {
    if(!didFailMove) {
      document.removeEventListener('mousemove', moveHandler);
      document.getElementById('s2_5-text').innerText = "Perfectly still. Good.";
      processStageTransition(4, "Optimal stillness achieved.", 2000);
    }
  }, 5000);
}

// STAGE 3: FAKE ANALYSIS //
function startFakeAnalysis() {
  const tl = gsap.timeline();
  const os = navigator.platform || 'Unknown OS';
  const res = `${window.screen.width}x${window.screen.height}`;
  document.getElementById('client-data').innerHTML = `
    <span class="data-row">OS: ${os}</span>
    <span class="data-row">RES: ${res}</span>
    <span class="data-row">CORES: ${navigator.hardwareConcurrency || 'Hidden'}</span>
  `;

  let currentVal = 0;
  const updateConf = () => {
    if (currentVal >= 98 || currentStageIndex !== 4) return;
    currentVal += Math.floor(Math.random() * 15);
    if(currentVal > 98) currentVal = 98;
    document.getElementById('confidence-val').innerText = currentVal;
    SoundFX.playType();
    if(currentVal < 98) {
      setTimeout(updateConf, Math.random() * 500 + 100);
    }
  };

  tl.to('#scan-1', {opacity: 1, duration: 0.5, delay: 1})
    .to('#fill-1', {width: '100%', duration: 1.5, ease: 'power2.inOut'})
    .to('#scan-2', {opacity: 1, duration: 0.5, delay: 1})
    .to('#fill-2', {width: '100%', duration: 2, ease: 'rough'})
    .to('#scan-3', {opacity: 1, duration: 0.5, delay: 1})
    .to('.system-data', {opacity: 1, duration: 1})
    .to('#scan-result', {opacity: 1, duration: 0.5, onComplete: updateConf})
    .call(() => { setTimeout(() => processStageTransition(5, "Metrics appended.", 2000), 3000); });
}

// STAGE 3.1: ECHO RIDDLE //
function startRiddleEcho() {
  const inp = document.getElementById('input-echo');
  const res = document.getElementById('echo-response');
  let strikes = 0;
  
  inp.addEventListener('keydown', function hndl(e) {
    if(e.key === 'Enter') {
       if(inp.value.toLowerCase().includes('echo')) {
          res.innerText = "Correct.";
          res.style.opacity = 1;
          res.style.color = "var(--neon-cyan)";
          inp.removeEventListener('keydown', hndl);
          processStageTransition(6, "Acceptable intelligence.", 2000);
       } else {
          strikes++;
          if(strikes >= 2) {
             res.innerText = "Pathetic execution. Moving anyway.";
             res.style.opacity = 1;
             res.style.color = "red";
             inp.removeEventListener('keydown', hndl);
             processStageTransition(6, "Forcing bypass...", 2500);
          } else {
             res.innerText = "Wrong. Try again... bro.";
             res.style.opacity = 1;
             res.style.color = "red";
             SoundFX.playGlitch();
             setTimeout(() => res.style.opacity = 0, 2000);
             inp.value = "";
          }
       }
    }
  });
}

// STAGE 3.2: KEYBOARD RIDDLE //
function startRiddleKey() {
  const btns = document.querySelectorAll('.key-btn');
  const res = document.getElementById('key-response');
  let strikes = 0;
  
  const handleKeyClick = (e) => {
     let ans = e.target.dataset.answer;
     if(ans === 'keyboard') {
        res.innerText = "Too obvious, but correct.";
        res.style.opacity = 1;
        btns.forEach(b => b.removeEventListener('click', handleKeyClick));
        processStageTransition(7, "Navigating to core...", 2000);
     } else {
        strikes++;
        if(strikes >= 2) {
           res.innerText = "Pathetic execution. Moving anyway.";
           res.style.opacity = 1;
           btns.forEach(b => b.removeEventListener('click', handleKeyClick));
           processStageTransition(7, "Sigh.", 2500);
        } else {
           res.innerText = "Bold move. Wrong, but bold.";
           res.style.opacity = 1;
           SoundFX.playGlitch();
           setTimeout(() => res.style.opacity = 0, 2000);
        }
     }
  };
  
  btns.forEach(b => b.addEventListener('click', handleKeyClick));
}

// STAGE 4: RIDDLE (Door) //
document.querySelectorAll('.s4-btn').forEach(btn => {
  btn.addEventListener('click', (e) => {
    const choice = e.target.dataset.choice;
    if(choice === 'leave') {
      gsap.to('#s4-response', { opacity: 1, duration: 0.5 });
      processStageTransition(8, "Fear detected.", 2500);
    } else {
      processStageTransition(8, "Doors open both ways.", 2000);
    }
  });
});

// STAGE 4.5: HOLD CLICK //
function startStage4_5() {
  const btn = document.getElementById('btn-hold');
  let holdTimer;
  let success = false;
  
  const startHold = () => {
    if(success) return;
    btn.style.transform = "scale(0.8)";
    btn.style.boxShadow = "none";
    btn.innerText = "HOLDING...";
    SoundFX.playHover();
    holdTimer = setTimeout(() => {
      success = true;
      btn.innerText = "SUCCESS";
      btn.classList.remove('pulsing-btn');
      SoundFX.playClick();
      processStageTransition(9, "Persistence logged.", 1500);
    }, 4000); 
  };
  
  const endHold = () => {
    if(!success) {
      clearTimeout(holdTimer);
      btn.style.transform = "scale(1)";
      btn.innerText = "HOLD";
    }
  };

  btn.addEventListener('mousedown', startHold);
  btn.addEventListener('mouseup', endHold);
  btn.addEventListener('mouseleave', endHold);
}

// STAGE 4.8: DECEPTIVE MEMORY GASLIGHT //
function startMemory() {
   const shapes = ['circle', 'square', 'triangle'];
   const container = document.getElementById('mem-shapes');
   const opts = document.getElementById('mem-options');
   const res = document.getElementById('mem-response');
   
   let seq = [];
   for(let i=0; i<4; i++) {
     let type = shapes[Math.floor(Math.random()*shapes.length)];
     seq.push(type);
     let el = document.createElement('div');
     el.className = `mem-shape shape-${type}`;
     container.appendChild(el);
   }
   
   let shapeEls = document.querySelectorAll('.mem-shape');
   gsap.to(shapeEls, {opacity: 1, duration: 0.5, stagger: 0.2, onComplete: () => {
      // Kept completely clearly visible so the user gains confidence
      setTimeout(() => {
          document.getElementById('mem-instruction').innerText = "Which shape appeared FIRST?";
          opts.style.display = 'flex';
      }, 1500); 
   }});
     
   let active = true;
   
   const handleMemClick = (e) => {
       if(!active) return;
       active = false;
       let clicked = e.target.dataset.shape;
       
       // GASLIGHT TRIGGER 
       if(clicked === seq[0]) {
          SoundFX.playGlitch();
          document.body.classList.add('wobble');
          container.style.filter = "invert(1) blur(2px)";
          
          setTimeout(() => {
             document.body.classList.remove('wobble');
             container.style.filter = "none";
          }, 150);

          // Visually alter DOM to re-order the sequence violently making them unequivocally wrong
          const fakeFirst = shapes.find(s => s !== clicked);
          seq[0] = fakeFirst;
          shapeEls[0].className = `mem-shape shape-${fakeFirst}`;
          
          res.innerText = "Memory isn't as reliable as you think.";
          res.style.opacity = 1;
          res.style.color = "red";
          
          document.querySelectorAll('.mem-btn').forEach(b => b.removeEventListener('click', handleMemClick));
          processStageTransition(10, "Gaslighting successful.", 3500);
          
       } else {
          SoundFX.playGlitch();
          document.body.classList.add('wobble');
          setTimeout(() => document.body.classList.remove('wobble'), 150);
          
          res.innerText = "Memory isn't as reliable as you think.";
          res.style.opacity = 1;
          res.style.color = "red";
          
          document.querySelectorAll('.mem-btn').forEach(b => b.removeEventListener('click', handleMemClick));
          processStageTransition(10, "You trust your memory too much.", 3500);
       }
   };
   
   document.querySelectorAll('.mem-btn').forEach(b => {
      b.addEventListener('click', handleMemClick);
   });
}

// STAGE 5: DISTORTION //
function startDistortion() {
  cursorLag = true;
  cursorX = mouseX;
  cursorY = mouseY;
  
  const runner = document.getElementById('btn-runner');
  const overlay = document.getElementById('vignette');
  let dodgeCount = 0;
  
  let phase = 1;
  let ended = false;
  
  overlay.classList.add('intense');
  SoundFX.rampDrone(2.0); 
  
  const maxW = window.innerWidth - 200;
  const maxH = window.innerHeight - 100;
  
  const quotes = ["You're trying harder now.", "Interesting...", "Just one more attempt.", "You won't catch it."];
  let quoteInt = setInterval(() => {
     if(ended) return;
     let str = quotes[Math.floor(Math.random() * quotes.length)];
     let q = document.createElement('div');
     q.className = 'ambient-quote';
     q.innerText = str;
     q.style.top = (Math.random() * 80 + 10) + '%';
     document.getElementById('ambient-quotes').appendChild(q);
     setTimeout(() => q.remove(), 6000);
  }, 5000);

  setTimeout(() => { if(ended) return; phase = 2; runner.innerText = "Catch me"; }, 5000);
  setTimeout(() => { 
    if(ended) return;
    phase = 3; 
    runner.innerText = "Too slow"; 
    for(let i=0; i<2; i++) {
      let clone = document.createElement('button');
      clone.innerText = "Too slow";
      clone.className = "neon-button runner-btn btn-fake-clone";
      clone.style.left = (Math.random() * maxW) + 'px';
      clone.style.top = (Math.random() * maxH) + 'px';
      clone.style.position = 'absolute';
      
      clone.addEventListener('mouseenter', () => {
         gsap.to(clone, { x: (Math.random() * maxW - maxW/2), y: (Math.random() * maxH - maxH/2), duration: 0.1 });
      });
      clone.addEventListener('click', () => {
         SoundFX.playGlitch();
         document.body.classList.add('glitch-bg');
         setTimeout(() => document.body.classList.remove('glitch-bg'), 100);
         clone.remove();
      });
      document.getElementById('stage5').appendChild(clone);
    }
    SoundFX.rampDrone(3.0);
  }, 10000);
  
  setTimeout(() => { 
     if(ended) return;
     phase = 4; 
     runner.innerText = "Almost..."; 
     SoundFX.rampDrone(4.0);
  }, 16000);

  runner.addEventListener('mouseenter', () => {
    dodgeCount++;
    const rx = Math.random() * maxW - maxW/2;
    const ry = Math.random() * maxH - maxH/2;
    
    let moveDur = 0.2;
    if(phase === 2) moveDur = 0.1; 
    if(phase === 3) {
      SoundFX.playGlitch(); 
      runner.style.opacity = 0;
      setTimeout(() => runner.style.opacity = 1, 100);
      moveDur = 0; 
    }
    if(phase === 4) { moveDur = 0.8; }
    
    gsap.to(runner, { x: rx, y: ry, duration: moveDur });
  });

  const endInteraction = () => {
     if(ended) return;
     ended = true;
     clearInterval(quoteInt);
     SoundFX.playGlitch();
     SoundFX.rampDrone(1.0); 
     overlay.classList.remove('intense');
     
     const blackout = document.getElementById('blackout-screen');
     const blackoutText = document.getElementById('blackout-text');
     blackout.style.opacity = 1;
     blackoutText.innerText = "It let you catch it.";
     blackoutText.dataset.text = "It let you catch it.";
     
     setTimeout(() => {
        blackout.style.opacity = 0;
        document.querySelectorAll('.btn-fake-clone').forEach(el=>el.remove());
        goToStage(11, 0); 
     }, 3000);
  };
  
  runner.addEventListener('click', endInteraction);
  setTimeout(endInteraction, 22000); 
}

// STAGE 5.5: REACTION TEST //
function startReaction() {
   const zone = document.getElementById('reaction-zone');
   const text = document.getElementById('reaction-text');
   const res = document.getElementById('reaction-response');
   
   let isBlue = false;
   let strikes = 0;
   let canClick = true;
   
   let wait = Math.random() * 4000 + 4000; 
   setTimeout(() => {
     isBlue = true;
     zone.style.backgroundColor = "rgba(0, 50, 200, 0.5)";
   }, wait);

   zone.addEventListener('mousedown', () => {
      if(!canClick) return;
      if(isBlue) {
         canClick = false;
         res.innerText = "Average reflection time.";
         res.style.opacity = 1;
         res.style.color = "var(--neon-cyan)";
         processStageTransition(12, "Neuro-motor mapping complete.", 2500);
      } else {
         strikes++;
         if(strikes >= 2) {
            canClick = false;
            res.innerText = "Pathetic execution. Moving anyway.";
            res.style.opacity = 1;
            res.style.color = "red";
            processStageTransition(12, "Impulse control zero.", 2500);
         } else {
            res.innerText = "Too early. You're jumpy bro.";
            res.style.opacity = 1;
            res.style.color = "red";
            SoundFX.playGlitch();
            setTimeout(() => res.style.opacity = 0, 2000);
         }
      }
   });
}

// STAGE 5.8: FOLLOW THE DOT (NEW EXTENDED) //
function startFollowDot() {
   const dot = document.getElementById('glow-dot');
   const text = document.getElementById('dot-instruction');
   
   gsap.to(dot, {opacity: 1, duration: 1});
   
   let dotX = window.innerWidth / 2;
   let dotY = window.innerHeight / 2;
   let targetX = dotX;
   let targetY = dotY;
   let speed = 0.02; 
   let ended = false;

   const moveDot = () => {
      if(Math.random() < 0.05) {
         targetX = Math.random() * (window.innerWidth - 100) + 50;
         targetY = Math.random() * (window.innerHeight - 100) + 50;
      }
      
      speed += 0.00003; // precise slow acceleration over a longer 20 second window
      
      dotX += (targetX - dotX) * speed;
      dotY += (targetY - dotY) * speed;
      
      dotY -= 1.5; // intensified anti grav drift
      if(dotY < 0) dotY = window.innerHeight;
      
      dot.style.left = dotX + 'px';
      dot.style.top = dotY + 'px';
      
      // rare teleport
      if(Math.random() < 0.003) {
         dotX = Math.random() * window.innerWidth;
         dotY = Math.random() * window.innerHeight;
         SoundFX.playGlitch();
         document.body.classList.add('wobble');
         setTimeout(() => document.body.classList.remove('wobble'), 100);
      }
      
      if(!ended) requestAnimationFrame(moveDot);
   };
   
   requestAnimationFrame(moveDot);
   
   setTimeout(() => {
      ended = true;
      gsap.to(dot, {opacity: 0, scale: 0, duration: 0.5});
      text.innerText = "You weren't following… you were chasing.";
      SoundFX.playType();
      processStageTransition(13, "That changed quickly.", 3500); 
   }, 20000); // 20s long game
}

// STAGE 6: ANTI-GRAVITY //
let antiGravityActive = false;
let floatTweens = [];
function startAntiGravity() {
  cursorLag = false;
  antiGravityActive = true;
  
  const words = ["ERROR", "VOID", "GRAVITY", "FALLING", "NULL", "UNDEFINED", "DRIFT"];
  for(let i=0; i<10; i++) {
     let frag = document.createElement('div');
     frag.className = "random-frag float-card";
     frag.innerText = words[Math.floor(Math.random()*words.length)];
     frag.dataset.speed = (Math.random() * 3 + 0.5).toString();
     frag.style.left = (Math.random() * 90) + 'vw';
     frag.style.top = (Math.random() * 90) + 'vh';
     gsap.set(frag, { rotation: Math.random() * 360 });
     document.getElementById('stage6').appendChild(frag);
  }
  
  document.querySelectorAll('.float-card').forEach(card => {
    const speed = parseFloat(card.dataset.speed || 1);
    let tw = gsap.to(card, {
      y: -400 * speed,
      x: (Math.random() - 0.5) * 100,
      rotation: "+=30",
      duration: 15 / speed,
      repeat: -1,
      yoyo: true,
      ease: "power1.inOut"
    });
    floatTweens.push({el: card, tw: tw, speed: speed});
  });

  window.addEventListener('wheel', gravityWheelHandler);
  
  setTimeout(() => {
    window.removeEventListener('wheel', gravityWheelHandler);
    antiGravityActive = false;
    floatTweens.forEach(o => o.tw.kill());
    processStageTransition(14, "Recalibrating spatial planes...", 2500);
  }, 14000); 
}

function gravityWheelHandler(e) {
  if(!antiGravityActive) return;
  if(e.deltaY > 0) {
    floatTweens.forEach(o => {
       gsap.to(o.el, { y: `-=${100 * o.speed}`, rotation: `+=${10*o.speed}`, duration: 0.5, ease: "power2.out" });
    });
  }
}

// STAGE 6.5: CONTROL INVERSION (NEW) //
function startInversion() {
   const area = document.getElementById('inversion-area');
   const obj = document.getElementById('inv-object');
   const target = document.getElementById('inv-target');
   const res = document.getElementById('inversion-response');
   
   let objX = 200;
   let objY = 200;
   
   let invertX = -1;
   let invertY = -1;
   let swapAxes = false;
   
   let scrambleInt = setInterval(() => {
      invertX = Math.random() > 0.5 ? 1 : -1;
      invertY = Math.random() > 0.5 ? 1 : -1;
      swapAxes = Math.random() > 0.5;
   }, 3500);

   const hndl = (e) => {
      let mx = swapAxes ? e.movementY : e.movementX;
      let my = swapAxes ? e.movementX : e.movementY;
      
      objX += mx * invertX * 1.5;
      objY += my * invertY * 1.5;
      
      if(objX < 0) objX = 0;
      if(objX > 370) objX = 370;
      if(objY < 0) objY = 0;
      if(objY > 370) objY = 370;
      
      obj.style.left = objX + 'px';
      obj.style.top = objY + 'px';
      
      let dx = (objX+15) - 90;
      let dy = (objY+15) - 90;
      let dist = Math.sqrt(dx*dx + dy*dy);
      
      if(dist < 40) { 
         clearInterval(scrambleInt);
         document.removeEventListener('mousemove', hndl);
         res.innerText = "Adaptation complete.";
         res.style.opacity = 1;
         res.style.color = "var(--neon-cyan)";
         SoundFX.playClick();
         obj.style.background = "var(--neon-cyan)";
         processStageTransition(15, "Still trying to control it?", 3000);
      }
   };
   
   document.addEventListener('mousemove', hndl);
}

// STAGE 7: CONTROL PANEL //
const sStability = document.getElementById('slide-stability');
const sChaos = document.getElementById('slide-chaos');
const sReality = document.getElementById('slide-reality');
const vStability = document.getElementById('val-stability');
const vChaos = document.getElementById('val-chaos');
const vReality = document.getElementById('val-reality');

function updatePanel() {
  vStability.innerText = sStability.value + '%';
  vChaos.innerText = sChaos.value + '%';
  vReality.innerText = sReality.value + '%';
  
  const chaosVal = parseInt(sChaos.value);
  if(chaosVal > 50) {
    document.body.style.filter = `hue-rotate(${chaosVal}deg) contrast(${100 + chaosVal/2}%)`;
  } else {
    document.body.style.filter = 'none';
  }

  if(chaosVal >= 90 || parseInt(sStability.value) <= 10 || parseInt(sReality.value) <= 10) {
    document.body.style.filter = 'none';
    processStageTransition(16, "Controls bypassed.", 2000);
  }
}
sStability.addEventListener('input', updatePanel);
sChaos.addEventListener('input', updatePanel);
sReality.addEventListener('input', updatePanel);

sChaos.addEventListener('click', () => {
  sStability.value = Math.max(0, sStability.value - 20);
  updatePanel();
});


// STAGE 7.2: CIRCLE CHALLENGE //
function startCircle() {
   const circle = document.getElementById('target-circle');
   const res = document.createElement('p');
   res.className = "hidden-message mt-2";
   circle.parentElement.appendChild(res);

   let inside = false;
   let time = 0;
   let strikes = 0;
   let interval;

   const mouseEnterHandler = () => { inside = true; circle.classList.add('active'); };
   const mouseLeaveHandler = () => { 
      inside = false; 
      circle.classList.remove('active'); 
      if(time > 0 && time < 30) { 
         time = 0;
         strikes++;
         if(strikes >= 2) {
            res.innerText = "Pathetic execution. Moving anyway.";
            res.style.opacity = 1;
            res.style.color = "red";
            clearInterval(interval);
            circle.removeEventListener('mouseenter', mouseEnterHandler);
            circle.removeEventListener('mouseleave', mouseLeaveHandler);
            processStageTransition(17, "Motor skills degraded.", 2500);
         } else {
            res.innerText = "You slipped out. Restarting... bro.";
            res.style.opacity = 1;
            res.style.color = "red";
            SoundFX.playGlitch();
            setTimeout(() => res.style.opacity = 0, 1500);
         }
      }
   };

   circle.addEventListener('mouseenter', mouseEnterHandler);
   circle.addEventListener('mouseleave', mouseLeaveHandler);

   interval = setInterval(() => {
      if(inside) {
         time++;
         if(time >= 30) {
            clearInterval(interval);
            res.innerText = "Steady. Good.";
            res.style.opacity = 1;
            res.style.color = "var(--neon-cyan)";
            circle.removeEventListener('mouseenter', mouseEnterHandler);
            circle.removeEventListener('mouseleave', mouseLeaveHandler);
            processStageTransition(17, "Precision noted.", 2500);
         }
      }
   }, 100);
}


// STAGE 7.5: WAIT PARANOIA EXTENDED //
function startStage7_5() {
  let waitTm;
  let fakeInt;
  let failCount = 0;
  
  const targetText = document.getElementById('s7_5-text');
  targetText.innerText = "Do nothing for 5 seconds.";
  
  const resetWait = () => {
    clearTimeout(waitTm);
    if(currentStageIndex === 17) {
      if(waitTm) failCount++;
      waitTm = setTimeout(() => {
        clearInterval(fakeInt);
        targetText.classList.remove('fading-text');
        
        if(failCount > 3) {
           targetText.innerText = "You struggle with stillness.";
        } else {
           targetText.innerText = "Patience detected.";
        }
        
        SoundFX.playType(); 
        document.removeEventListener('mousemove', resetWait);
        processStageTransition(18, "Moving past stasis.", 2500);
      }, 7000); // secretly 7 seconds
    }
  };
  
  // Random paranoia flickers
  fakeInt = setInterval(() => {
     if(Math.random() > 0.4) {
         SoundFX.playGlitch();
         let g = document.createElement('div');
         g.className = "fake-distraction";
         g.style.width = "100%"; g.style.height = "100%";
         document.body.appendChild(g);
         gsap.fromTo(g, {opacity: Math.random()*0.3+0.3}, {opacity: 0, duration: 0.2, onComplete: () => g.remove()});
     }
  }, 1200);

  resetWait();
  document.addEventListener('mousemove', resetWait);
}


// STAGE 8: TIME LOOP //
let loopCount = 0;
document.getElementById('btn-loop').addEventListener('click', () => {
  loopCount++;
  document.body.classList.add('wobble');
  SoundFX.playGlitch();
  setTimeout(() => document.body.classList.remove('wobble'), 150);

  if(loopCount === 1) {
    document.getElementById('loop-subtitle').style.opacity = 1;
  } else if (loopCount === 2) {
    document.getElementById('loop-title').innerText = "Why repeat it?";
    document.getElementById('btn-loop').innerText = "Escape";
  } else if (loopCount >= 3) {
    processStageTransition(19, "Breaking loop mechanism.", 2000);
  }
});

// STAGE 9: PERSONAL MESSAGE //
function startPersonalMessage() {
  const d = new Date();
  let timeStr = d.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
  let msg = `You’re still here at ${timeStr}…`;
  
  const textContainer = document.getElementById('s9-text');
  textContainer.innerHTML = '';
  
  let delay = 0;
  msg.split('').forEach((char, i) => {
    setTimeout(() => {
      textContainer.innerHTML += char;
      SoundFX.playType();
    }, delay);
    delay += 200; 
  });
  
  setTimeout(() => goToStage(20, 0), delay + 4000); 
}

// STAGE 10: COLLAPSE CLIMAX OVERHAUL //
function startCollapse() {
  SoundFX.triggerPhase(4); 
  
  // Engage visual tearing and deep shakes
  document.body.classList.add('horizontal-tear'); 
  document.body.classList.add('shake');
  
  let scratch = document.getElementById('scratch-fx');
  gsap.to(scratch, {opacity: 0.8, duration: 0.1, yoyo: true, repeat: 25});
  
  SoundFX.playGlitch(); 
  
  setTimeout(() => {
    SoundFX.playClick();
    gsap.to('#error-dialog', {opacity: 1, scale: 1, duration: 0.1});
  }, 3500); 
}

document.getElementById('btn-error-close').addEventListener('click', () => {
  document.body.classList.remove('shake');
  gsap.to('#error-dialog', {opacity: 0, scale: 0.5, duration: 0.2});
  
  const blackout = document.getElementById('blackout-screen');
  const blackoutText = document.getElementById('blackout-text');
  const scratch = document.getElementById('scratch-fx');
  
  blackout.style.opacity = 1;
  blackoutText.innerText = "";
  
  SoundFX.playLoudGlitch(); 
  scratch.style.opacity = 1;
  document.body.classList.add('glitch-bg');
  
  setTimeout(() => {
     document.body.classList.remove('glitch-bg');
     document.body.classList.remove('horizontal-tear');
     scratch.style.opacity = 0; 
     
     setTimeout(() => {
        blackout.style.opacity = 0; 
        goToStage(21, 0);
     }, 2000);
  }, 800);
});

// FINAL STAGE: DEAD TYPEWRITER SEQUENCE //
function startFinalSequence() {
   const d1 = document.getElementById('dead-1');
   const d2 = document.getElementById('dead-2');
   const d3 = document.getElementById('dead-3');
   const d4 = document.getElementById('dead-4');
   const btn = document.getElementById('btn-restart');
   
   const typeLine = (el, text, delayOffset, cb) => {
      setTimeout(() => {
         let delay = 0;
         text.split('').forEach((char) => {
           setTimeout(() => { 
                el.innerHTML += char; 
                SoundFX.playType(); 
           }, delay);
           delay += 100;
         });
         if(cb) setTimeout(cb, delay + 1000);
      }, delayOffset);
   };
   
   typeLine(d1, "You stayed.", 1000, () => {
      typeLine(d2, "You played.", 500, () => {
         typeLine(d3, "You believed you were in control.", 500, () => {
            setTimeout(() => {
               gsap.to(d4, {opacity: 1, duration: 2}); 
               setTimeout(() => gsap.to(btn, {opacity: 1, pointerEvents: "all", duration: 1}), 2000);
            }, 3000); // massive pause
         });
      });
   });
}

document.getElementById('btn-restart').addEventListener('click', () => {
  location.reload();
});
