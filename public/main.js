// Load points from JSON file
let mapPoints = [];
let avatars = [];
const NUM_AVATARS = 5;

// Animation state for each avatar
let avatarStates = [];

// Popup state
let activePopup = null;

// Avatar information
const avatarInfo = [
  { name: "Explorer 1", description: "Wandering through ancient ruins" },
  { name: "Explorer 2", description: "Searching for hidden treasures" },
  { name: "Explorer 3", description: "Mapping unknown territories" },
  { name: "Explorer 4", description: "Studying ancient artifacts" },
  { name: "Explorer 5", description: "Discovering secret passages" }
];

// Function to load points from JSON
async function loadPoints() {
  try {
    const response = await fetch('points.json');
    const data = await response.json();
    mapPoints = data.points;
    initializeAvatars();
  } catch (error) {
    console.error('Error loading points:', error);
  }
}

// Linear interpolation function
function lerp(start, end, t) {
  return start + (end - start) * t;
}

// Function to create popup
function createPopup(avatar, info) {
  // Remove existing popup if any
  if (activePopup) {
    activePopup.remove();
  }

  const popup = document.createElement('div');
  popup.className = 'popup';
  popup.innerHTML = `
    <button class="popup-close">&times;</button>
    <div class="popup-title">${info.name}</div>
    <div class="popup-content">${info.description}</div>
  `;

  // Position popup above avatar
  const avatarRect = avatar.getBoundingClientRect();
  popup.style.left = avatar.style.left;
  popup.style.top = avatar.style.top;

  // Add close button functionality
  const closeBtn = popup.querySelector('.popup-close');
  closeBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    popup.remove();
    activePopup = null;
  });

  avatar.parentElement.appendChild(popup);
  setTimeout(() => popup.classList.add('active'), 10);
  activePopup = popup;

  // Close popup when clicking outside
  document.addEventListener('click', function closePopup(e) {
    if (!popup.contains(e.target) && e.target !== avatar) {
      popup.remove();
      activePopup = null;
      document.removeEventListener('click', closePopup);
    }
  });
}

// Function to create avatars
function initializeAvatars() {
  const mapContainer = document.querySelector('.map-container');
  const map = document.querySelector('.map');
  
  // Get map dimensions
  const mapWidth = map.offsetWidth;
  const mapHeight = map.offsetHeight;

  // Remove existing avatars
  document.querySelectorAll('.avatar').forEach(avatar => avatar.remove());
  avatars = [];
  avatarStates = [];

  // Create new avatars
  for (let i = 0; i < NUM_AVATARS; i++) {
    const avatar = document.createElement('img');
    avatar.src = `avatars/avatar_${i + 1}.png`;
    avatar.className = 'avatar';
    avatar.id = `avatar${i + 1}`;
    mapContainer.appendChild(avatar);
    avatars.push(avatar);
    
    // Initialize avatar state
    const startPoint = mapPoints[Math.floor(Math.random() * mapPoints.length)];
    avatarStates.push({
      currentX: startPoint.x * mapWidth,
      currentY: startPoint.y * mapHeight,
      targetX: startPoint.x * mapWidth,
      targetY: startPoint.y * mapHeight,
      progress: 1,
      speed: 0.02 + Math.random() * 0.02,
      isMoving: false,
      nextMoveTime: Date.now() + Math.random() * 10000 // Random initial delay
    });
    
    // Set initial position
    updateAvatarPosition(avatar, avatarStates[i].currentX, avatarStates[i].currentY);

    // Add click handler for popup
    avatar.addEventListener('click', (e) => {
      e.stopPropagation();
      createPopup(avatar, avatarInfo[i]);
    });
  }
}

// Function to update avatar position
function updateAvatarPosition(avatar, x, y) {
  avatar.style.left = `${x}px`;
  avatar.style.top = `${y}px`;
}

// Function to set new target for avatar
function setNewAvatarTarget(avatarState, mapWidth, mapHeight) {
  const targetPoint = mapPoints[Math.floor(Math.random() * mapPoints.length)];
  avatarState.targetX = targetPoint.x * mapWidth;
  avatarState.targetY = targetPoint.y * mapHeight;
  avatarState.progress = 0;
  avatarState.isMoving = true;
  // Set next move time to 5-15 seconds after completing this move
  avatarState.nextMoveTime = Date.now() + 5000 + Math.random() * 10000;
}

// Function to animate avatars
function animateAvatars() {
  const map = document.querySelector('.map');
  const mapWidth = map.offsetWidth;
  const mapHeight = map.offsetHeight;
  const currentTime = Date.now();

  avatars.forEach((avatar, index) => {
    const state = avatarStates[index];
    
    // Check if it's time to start moving
    if (!state.isMoving && currentTime >= state.nextMoveTime) {
      setNewAvatarTarget(state, mapWidth, mapHeight);
    }

    // Update position if moving
    if (state.isMoving) {
      state.progress += state.speed;
      
      if (state.progress >= 1) {
        state.progress = 1;
        state.isMoving = false;
      }
      
      state.currentX = lerp(state.currentX, state.targetX, state.progress);
      state.currentY = lerp(state.currentY, state.targetY, state.progress);
      updateAvatarPosition(avatar, state.currentX, state.currentY);

      // Update popup position if it exists
      if (activePopup && activePopup.previousSibling === avatar) {
        activePopup.style.left = avatar.style.left;
        activePopup.style.top = avatar.style.top;
      }
    }
  });
  
  requestAnimationFrame(animateAvatars);
}

// Initialize the system
loadPoints();

// Start animation loop
requestAnimationFrame(animateAvatars);

// Update positions on window resize
window.addEventListener('resize', () => {
  const map = document.querySelector('.map');
  const mapWidth = map.offsetWidth;
  const mapHeight = map.offsetHeight;
  
  avatarStates.forEach((state, index) => {
    const currentPoint = {
      x: state.currentX / state.lastMapWidth || mapWidth,
      y: state.currentY / state.lastMapHeight || mapHeight
    };
    const targetPoint = {
      x: state.targetX / state.lastMapWidth || mapWidth,
      y: state.targetY / state.lastMapHeight || mapHeight
    };
    
    state.currentX = currentPoint.x * mapWidth;
    state.currentY = currentPoint.y * mapHeight;
    state.targetX = targetPoint.x * mapWidth;
    state.targetY = targetPoint.y * mapHeight;
    state.lastMapWidth = mapWidth;
    state.lastMapHeight = mapHeight;
    
    updateAvatarPosition(avatars[index], state.currentX, state.currentY);
  });
});

// Debug click handler
document.querySelector('.map').addEventListener('click', function(event) {
  const x = event.offsetX;
  const y = event.offsetY;
  console.log(`{ x: ${x}, y: ${y} },`);
});