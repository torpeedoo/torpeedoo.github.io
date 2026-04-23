(function () {
  const canvas = document.querySelector(".home-fractal canvas");
  if (!canvas) return;

  const ctx = canvas.getContext("2d", { alpha: false });
  if (!ctx) return;

  const mobileTimeMode = window.matchMedia("(max-width: 720px), (pointer: coarse)").matches;
  const pointer = { x: 0.5, y: 0.5, tx: 0.5, ty: 0.5 };
  const maxIter = 56;
  const zoom = 1.35;
  const size = 54;
  let imageData;
  let pixels;
  let w = 0;
  let h = 0;

  function setupCanvas() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const target = Math.floor(size * dpr);
    if (target === w) return;

    w = target;
    h = target;
    canvas.width = w;
    canvas.height = h;
    imageData = ctx.createImageData(w, h);
    pixels = imageData.data;
  }

  function updatePointer(clientX, clientY) {
    pointer.tx = Math.min(1, Math.max(0, clientX / window.innerWidth));
    pointer.ty = Math.min(1, Math.max(0, clientY / window.innerHeight));
  }

  if (!mobileTimeMode) {
    window.addEventListener(
      "mousemove",
      (e) => updatePointer(e.clientX, e.clientY),
      { passive: true }
    );
    window.addEventListener(
      "touchmove",
      (e) => {
        const t = e.touches[0];
        if (t) updatePointer(t.clientX, t.clientY);
      },
      { passive: true }
    );
  }

  function render() {
    const cx = -0.72 + (pointer.x - 0.5) * 0.22;
    const cy = 0.2 + (pointer.y - 0.5) * 0.22;
    let i = 0;

    for (let py = 0; py < h; py++) {
      const ny = (py / h - 0.5) * zoom * 2;
      for (let px = 0; px < w; px++) {
        const nx = (px / w - 0.5) * zoom * 2;
        let zx = nx;
        let zy = ny;
        let iter = 0;

        while (zx * zx + zy * zy < 4 && iter < maxIter) {
          const x2 = zx * zx - zy * zy + cx;
          zy = 2 * zx * zy + cy;
          zx = x2;
          iter++;
        }

        const value =
          iter >= maxIter ? 0 : Math.floor(255 * Math.pow(1 - iter / maxIter, 0.58));
        pixels[i++] = value;
        pixels[i++] = value;
        pixels[i++] = value;
        pixels[i++] = 255;
      }
    }

    ctx.putImageData(imageData, 0, 0);
  }

  function animate() {
    setupCanvas();

    if (mobileTimeMode) {
      const t = performance.now() * 0.00035;
      pointer.tx = 0.5 + 0.32 * Math.cos(t * 1.7);
      pointer.ty = 0.5 + 0.32 * Math.sin(t * 1.15);
    }

    pointer.x += (pointer.tx - pointer.x) * 0.1;
    pointer.y += (pointer.ty - pointer.y) * 0.1;

    render();
    requestAnimationFrame(animate);
  }

  window.addEventListener("resize", () => {
    w = 0;
    h = 0;
  });

  animate();
})();
