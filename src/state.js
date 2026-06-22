// Shared application state
export let currentTool = 'home';
export let isFullscreen = false;

export function setCurrentTool(tool) {
  currentTool = tool;
}

export function setIsFullscreen(val) {
  isFullscreen = val;
}
