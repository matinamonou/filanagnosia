// Load points from JSON file
let mapPoints = [];
let avatars = [];
const NUM_AVATARS = 5;

// Animation state for each avatar
let avatarStates = [];

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
      progress: 1, // 1 means movement is complete
      speed: 0.02 + Math.random() * 0.02 // Random speed between 0.02 and 0.04
    });
    
    // Set initial position
    updateAvatarPosition(avatar, avatarStates[i].currentX, avatarStates[i].currentY);
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
}

// Function to animate avatars
function animateAvatars() {
  const map = document.querySelector('.map');
  const mapWidth = map.offsetWidth;
  const mapHeight = map.offsetHeight;

  avatars.forEach((avatar, index) => {
    const state = avatarStates[index];
    
    // If movement is complete, set new target
    if (state.progress >= 1) {
      setNewAvatarTarget(state, mapWidth, mapHeight);
    }
    
    // Update progress
    state.progress += state.speed;
    if (state.progress > 1) state.progress = 1;
    
    // Calculate new position
    state.currentX = lerp(state.currentX, state.targetX, state.progress);
    state.currentY = lerp(state.currentY, state.targetY, state.progress);
    
    // Update avatar position
    updateAvatarPosition(avatar, state.currentX, state.currentY);
  });
  
  // Continue animation
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
  
  // Update all avatar positions and targets based on new dimensions
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