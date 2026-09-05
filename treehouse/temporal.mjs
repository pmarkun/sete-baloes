// Both visits use the SAME fourth-floor geometry and key/portal positions.
export const PORTAL_X = 190, KEY_X = 125, LEDGE_Y = 160;
export function thiefPose(elapsed) {
  if (elapsed >= 3.4) return null;
  const x = elapsed < 1.4
    ? PORTAL_X + (KEY_X - PORTAL_X) * Math.min(1, elapsed / 1.2)
    : KEY_X + (PORTAL_X - KEY_X) * Math.min(1, (elapsed - 1.4) / 1.4);
  return { x, y: LEDGE_Y, facing: elapsed < 1.4 ? -1 : 1, moving: true, cloak: true };
}

// Your earlier self approaches by the same stairs and lever ledge used on visit one.
const path = [[175,250],[120,250],[120,220],[65,250],[65,160],[125,160],[190,160]];
export function pastSelfPose(elapsed) {
  let remaining = Math.max(0, elapsed - 1) * 55;
  for (let i = 1; i < path.length; i++) {
    const [x,y] = path[i-1], [nx,ny] = path[i];
    const distance = Math.hypot(nx-x,ny-y);
    if (remaining < distance) return {
      x: x+(nx-x)*remaining/distance, y:y+(ny-y)*remaining/distance,
      facing:nx<x?-1:1, moving:true, climbing:nx===x&&ny<y,
    };
    remaining -= distance;
  }
  return {x:190,y:160,facing:1,moving:false};
}
