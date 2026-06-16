// Shared application state
export let currentTool = 'histogram';
export let isFullscreen = false;

export function setCurrentTool(tool) {
  currentTool = tool;
}

export function setIsFullscreen(val) {
  isFullscreen = val;
}
