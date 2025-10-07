document.addEventListener('DOMContentLoaded', () => {
  const navToggle = document.querySelector('.nav-toggle');
  const navLinks = document.querySelector('.nav-links');
  const yearEl = document.getElementById('year');
  const form = document.getElementById('contact-form');
  const statusEl = document.querySelector('.form-status');

  if (yearEl) yearEl.textContent = new Date().getFullYear();

  if (navToggle && navLinks) {
    navToggle.addEventListener('click', () => {
      const open = navLinks.classList.toggle('open');
      navToggle.setAttribute('aria-expanded', String(open));
    });

    navLinks.addEventListener('click', (e) => {
      const target = e.target;
      if (target && target.tagName === 'A' && navLinks.classList.contains('open')) {
        navLinks.classList.remove('open');
        navToggle.setAttribute('aria-expanded', 'false');
      }
    });
  }

  if (form && statusEl) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const data = new FormData(form);
      const name = String(data.get('name') || '').trim();
      const email = String(data.get('email') || '').trim();
      const message = String(data.get('message') || '').trim();

      if (!name || !email || !message) {
        statusEl.textContent = 'Por favor, completa todos los campos.';
        statusEl.style.color = '#ff6b6b';
        return;
      }

      statusEl.textContent = '¡Gracias! Tu mensaje ha sido enviado (demo).';
      statusEl.style.color = '#9fb0c3';
      form.reset();
    });
  }

  // Smooth scroll for internal links
  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener('click', (e) => {
      const href = link.getAttribute('href');
      if (href && href.length > 1) {
        const target = document.querySelector(href);
        if (target) {
          e.preventDefault();
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }
    });
  });

  // Logo background removal with robust loading and graceful fallback
  const canvas = document.getElementById('logoCanvas');
  if (canvas && canvas.getContext) {
    const ctx = canvas.getContext('2d');

    const drawImageFitted = (img) => {
      const maxW = canvas.width;
      const maxH = canvas.height;
      const scale = Math.min(maxW / img.width, maxH / img.height);
      const w = Math.floor(img.width * scale);
      const h = Math.floor(img.height * scale);
      const x = Math.floor((maxW - w) / 2);
      const y = Math.floor((maxH - h) / 2);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, x, y, w, h);
    };

    const processTransparency = () => {
      try {
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        for (let i = 0; i < data.length; i += 4) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];
          if (r > 240 && g > 240 && b > 240) {
            data[i + 3] = 0;
          }
        }
        for (let i = 0; i < data.length; i += 4) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];
          const brightness = (r + g + b) / 3;
          if (brightness > 225 && brightness <= 240) {
            const factor = (brightness - 225) / (240 - 225);
            data[i + 3] = Math.max(0, data[i + 3] * (1 - factor));
          }
        }
        ctx.putImageData(imageData, 0, 0);
      } catch (err) {
        // If we cannot read pixels (security), keep the drawn image as-is
      }
    };

    const loadLogo = async () => {
      try {
        const res = await fetch('assets/logo.png', { cache: 'no-store' });
        if (!res.ok) throw new Error('Logo not found');
        const blob = await res.blob();
        const bitmap = await createImageBitmap(blob);
        // Draw bitmap (faster than Image element)
        drawImageFitted(bitmap);
        processTransparency();
      } catch (e) {
        // Fallback to <img> load
        const img = new Image();
        img.onload = () => {
          drawImageFitted(img);
          processTransparency();
        };
        img.onerror = () => {
          // leave canvas empty
        };
        img.src = 'assets/logo.png?' + Date.now();
      }
    };

    loadLogo();
  }
});
