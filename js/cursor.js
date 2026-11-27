// Puntero personalizado:se activa en dispositivos con mouse (no en celulares ni tablets).
(() => {
  if (!matchMedia('(hover: hover) and (pointer: fine)').matches) return;

  const ring = document.createElement('div');
  const dot = document.createElement('div');
  ring.className = 'cursor-ring';
  dot.className = 'cursor-dot';
  ring.setAttribute('aria-hidden', 'true');
  dot.setAttribute('aria-hidden', 'true');
  document.body.append(ring, dot);
  document.documentElement.classList.add('has-cursor');

  const smooth = !matchMedia('(prefers-reduced-motion: reduce)').matches;
  let mx = -100, my = -100, rx = -100, ry = -100;

  addEventListener('mousemove', e => {
    mx = e.clientX; my = e.clientY;
    dot.style.transform = `translate(${mx}px, ${my}px)`;
    if (!smooth) ring.style.transform = `translate(${mx}px, ${my}px)`;
    document.documentElement.classList.remove('cursor-hidden');
  }, { passive: true });

  const loop = () => {
    rx += (mx - rx) * 0.2;
    ry += (my - ry) * 0.2;
    ring.style.transform = `translate(${rx}px, ${ry}px)`;
    requestAnimationFrame(loop);
  };
  if (smooth) loop();

  // Se agranda sobre enlaces y botones
  const interactive = 'a, button, summary, label, input, textarea, select, [role="button"]';
  document.addEventListener('mouseover', e => {
    if (e.target.closest(interactive)) document.documentElement.classList.add('cursor-hover');
  });
  document.addEventListener('mouseout', e => {
    if (e.target.closest(interactive)) document.documentElement.classList.remove('cursor-hover');
  });
  addEventListener('mousedown', () => document.documentElement.classList.add('cursor-down'));
  addEventListener('mouseup', () => document.documentElement.classList.remove('cursor-down'));
  document.addEventListener('mouseleave', () => document.documentElement.classList.add('cursor-hidden'));
})();
