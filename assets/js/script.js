// Forçar o site a iniciar no topo (tela inicial) ao recarregar
    if (window.history && window.history.scrollRestoration) {
      window.history.scrollRestoration = 'manual';
    }
    window.scrollTo(0, 0);

    // ----------------------------------------------------
    // AGENTE 1: Cursor Customizado & Header Morphing
    // ----------------------------------------------------
    const cursorDot = document.getElementById('custom-cursor');
    const cursorRing = document.getElementById('custom-cursor-ring');
    const header = document.getElementById('main-header');

    let mouseX = 0, mouseY = 0;
    let ringX = 0, ringY = 0;
    let mouseInWindow = false;

    // Atualiza dinamicamente a visibilidade e estilo do cursor baseado na largura e foco
    function updateCursorState() {
      const isDesktop = window.innerWidth >= 1024;
      if (isDesktop && mouseInWindow) {
        document.documentElement.classList.add('has-custom-cursor');
        if (cursorDot) cursorDot.style.display = 'block';
        if (cursorRing) cursorRing.style.display = 'block';
      } else {
        document.documentElement.classList.remove('has-custom-cursor');
        if (cursorDot) cursorDot.style.display = 'none';
        if (cursorRing) cursorRing.style.display = 'none';
      }
    }

    document.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      
      if (!mouseInWindow) {
        mouseInWindow = true;
        updateCursorState();
      }
      
      if (cursorDot) {
        cursorDot.style.left = mouseX + 'px';
        cursorDot.style.top = mouseY + 'px';
      }
    });

    document.addEventListener('mouseenter', () => {
      mouseInWindow = true;
      updateCursorState();
    });

    document.addEventListener('mouseleave', () => {
      mouseInWindow = false;
      updateCursorState();
    });

    function updateCursorRing() {
      const ease = 0.15;
      ringX += (mouseX - ringX) * ease;
      ringY += (mouseY - ringY) * ease;

      if (cursorRing) {
        cursorRing.style.left = ringX + 'px';
        cursorRing.style.top = ringY + 'px';
      }

      requestAnimationFrame(updateCursorRing);
    }
    requestAnimationFrame(updateCursorRing);

    function setupHovers() {
      const hoverables = document.querySelectorAll('.hoverable');
      hoverables.forEach(el => {
        el.addEventListener('mouseenter', () => {
          cursorRing.classList.add('cursor-expand');
        });
        el.addEventListener('mouseleave', () => {
          cursorRing.classList.remove('cursor-expand');
        });
      });
    }
    setupHovers();

    window.addEventListener('scroll', () => {
      if (window.scrollY > 50) {
        header.classList.add('scrolled');
      } else {
        header.classList.remove('scrolled');
      }
    });

    const magneticBtn = document.getElementById('magnetic-header-btn');
    if (window.innerWidth >= 1024 && magneticBtn) {
      document.addEventListener('mousemove', (e) => {
        const rect = magneticBtn.getBoundingClientRect();
        const btnX = rect.left + rect.width / 2;
        const btnY = rect.top + rect.height / 2;
        const dist = Math.hypot(e.clientX - btnX, e.clientY - btnY);

        if (dist < 40) {
          magneticBtn.style.transform = `translate(${(e.clientX - btnX) * 0.3}px, ${(e.clientY - btnY) * 0.3}px)`;
        } else {
          magneticBtn.style.transform = 'translate(0, 0)';
        }
      });
    }

    const magneticContactBtn = document.getElementById('magnetic-contact-btn');
    if (window.innerWidth >= 1024 && magneticContactBtn) {
      document.addEventListener('mousemove', (e) => {
        const rect = magneticContactBtn.getBoundingClientRect();
        const btnX = rect.left + rect.width / 2;
        const btnY = rect.top + rect.height / 2;
        const dist = Math.hypot(e.clientX - btnX, e.clientY - btnY);

        if (dist < 50) {
          magneticContactBtn.style.transform = `translate(${(e.clientX - btnX) * 0.25}px, ${(e.clientY - btnY) * 0.25}px)`;
        } else {
          magneticContactBtn.style.transform = 'translate(0, 0)';
        }
      });
    }

// ----------------------------------------------------
    // AGENTE 2: Controle da Hero & Limpeza do Carro (Refatorado & Otimizado)
    // ----------------------------------------------------
    
    // Funções Utilitárias Globais de Mapeamento de Imagem
    function getImageMappingParams(w, h, iw, ih) {
      let r = Math.min(w / iw, h / ih);
      let nw = iw * r;
      let nh = ih * r;
      let ar = 1;
      
      if (nw < w) ar = w / nw;
      if (Math.abs(ar - 1) < 1e-14 && nh < h) ar = h / nh;
      nw *= ar;
      nh *= ar;
      
      const cw = iw / (nw / w);
      const ch = ih / (nh / h);
      
      const cx = (iw - cw) * 0.5;
      const cy = (ih - ch) * 0.5;
      
      return { cx, cy, cw, ch };
    }

    function drawImageProp(ctx, img, x, y, w, h, offsetX = 0.5, offsetY = 0.5) {
      var iw = img.width,
          ih = img.height,
          r = Math.min(w / iw, h / ih),
          nw = iw * r,
          nh = img.height * r,
          cx, cy, cw, ch, ar = 1;
    
      if (nw < w) ar = w / nw;
      if (Math.abs(ar - 1) < 1e-14 && nh < h) ar = h / nh;
      nw *= ar;
      nh *= ar;
    
      cw = iw / (nw / w);
      ch = ih / (nh / h);
    
      cx = (iw - cw) * offsetX;
      cy = (ih - ch) * offsetY;
    
      cx = Math.max(0, cx);
      cy = Math.max(0, cy);
      cw = Math.min(iw, cw);
      ch = Math.min(ih, ch);
    
      ctx.drawImage(img, cx, cy, cw, ch, x, y, w, h);
    }

    // Classe Reutilizável de Scratch-off
    class ScratchCleaner {
      constructor({
        canvas,
        listenerElement,
        image,
        brushRadius,
        isActive,
        onMove,
        customActiveCheck,
        isMobilePortrait = false
      }) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.listenerElement = listenerElement;
        this.image = image;
        this.brushRadius = brushRadius;
        this.onMove = onMove;
        this.isActive = isActive;
        this.customActiveCheck = customActiveCheck;
        this.isMobilePortrait = isMobilePortrait;

        this.tempCanvas = document.createElement('canvas');
        this.tempCtx = this.tempCanvas.getContext('2d');
        this.maskCanvas = document.createElement('canvas');
        this.maskCtx = this.maskCanvas.getContext('2d');
        this.trailMaskCanvas = document.createElement('canvas');
        this.trailMaskCtx = this.trailMaskCanvas.getContext('2d');

        this.targetX = null;
        this.targetY = null;
        this.brushX = null;
        this.brushY = null;
        this.isMouseMoving = false;
        this.mouseTimeout = null;
        this.trailPoints = [];
        this.animId = null;
        this.isResetting = false;

        this.setupPatternBound = this.setupPattern.bind(this);
        window.addEventListener('resize', this.setupPatternBound);

        this.bindEvents();
      }

      setupPattern() {
        if (!this.image.complete || !this.image.width) return;
        const w = this.canvas.clientWidth;
        const h = this.canvas.clientHeight;
        if (w === 0 || h === 0) return;

        this.canvas.width = w;
        this.canvas.height = h;
        this.tempCanvas.width = w;
        this.tempCanvas.height = h;
        this.maskCanvas.width = w;
        this.maskCanvas.height = h;
        this.trailMaskCanvas.width = w;
        this.trailMaskCanvas.height = h;

        drawImageProp(this.tempCtx, this.image, 0, 0, w, h, 0.5, 0.5);
        this.redrawMask();
      }

      redrawMask() {
        if (!this.maskCtx || !this.image.width) return;
        this.maskCtx.clearRect(0, 0, this.maskCanvas.width, this.maskCanvas.height);
        const w = this.maskCanvas.width;
        const h = this.maskCanvas.height;
        const params = getImageMappingParams(w, h, this.image.width, this.image.height);

        cleanedPaths.forEach(path => {
          const rx = (((path.px * this.image.width) - params.cx) / params.cw) * w;
          const ry = (((path.py * this.image.height) - params.cy) / params.ch) * h;
          const rad = path.r * (w / params.cw);

          const radGrad = this.maskCtx.createRadialGradient(rx, ry, rad * 0.1, rx, ry, rad);
          radGrad.addColorStop(0, 'rgba(0, 0, 0, 1)');
          radGrad.addColorStop(0.3, 'rgba(0, 0, 0, 0.8)');
          radGrad.addColorStop(0.6, 'rgba(0, 0, 0, 0.2)');
          radGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');

          this.maskCtx.fillStyle = radGrad;
          this.maskCtx.beginPath();
          this.maskCtx.arc(rx, ry, rad, 0, Math.PI * 2);
          this.maskCtx.fill();
        });

        this.renderCleanCar();
      }

      renderCleanCar() {
        if (!this.ctx || !this.maskCanvas || !this.trailMaskCanvas || !this.tempCanvas) return;
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.ctx.drawImage(this.maskCanvas, 0, 0);
        this.ctx.globalCompositeOperation = 'source-in';
        this.ctx.drawImage(this.tempCanvas, 0, 0);
        this.ctx.globalCompositeOperation = 'source-over';

        if (this.trailPoints.length > 0) {
          this.trailMaskCtx.clearRect(0, 0, this.trailMaskCanvas.width, this.trailMaskCanvas.height);
          this.trailPoints.forEach(pt => {
            const alpha = pt.life / pt.maxLife;
            this.trailMaskCtx.save();
            const grad = this.trailMaskCtx.createRadialGradient(pt.x, pt.y, 0, pt.x, pt.y, pt.radius);
            grad.addColorStop(0, `rgba(0, 0, 0, ${alpha * 0.7})`);
            grad.addColorStop(0.5, `rgba(0, 0, 0, ${alpha * 0.25})`);
            grad.addColorStop(1, 'rgba(0, 0, 0, 0)');

            this.trailMaskCtx.fillStyle = grad;
            this.trailMaskCtx.beginPath();
            this.trailMaskCtx.arc(pt.x, pt.y, pt.radius, 0, Math.PI * 2);
            this.trailMaskCtx.fill();
            this.trailMaskCtx.globalCompositeOperation = 'source-in';

            const scaleFactor = 1.0 + 0.04 * alpha;
            const maxOffset = 6;
            let dx = pt.vx * 0.2 * alpha;
            let dy = pt.vy * 0.2 * alpha;
            dx = Math.max(-maxOffset, Math.min(maxOffset, dx));
            dy = Math.max(-maxOffset, Math.min(maxOffset, dy));

            this.trailMaskCtx.translate(pt.x, pt.y);
            this.trailMaskCtx.scale(scaleFactor, scaleFactor);
            this.trailMaskCtx.translate(-pt.x + dx, -pt.y + dy);
            this.trailMaskCtx.drawImage(this.tempCanvas, 0, 0);
            this.trailMaskCtx.restore();
          });
          this.ctx.drawImage(this.trailMaskCanvas, 0, 0);
        }
      }

      startLoop() {
        if (!this.animId) {
          this.loop();
        }
      }

      stopLoop() {
        if (this.animId) {
          cancelAnimationFrame(this.animId);
          this.animId = null;
        }
      }

      loop() {
        if (!this.isActive() || (this.customActiveCheck && !this.customActiveCheck())) {
          this.animId = null;
          return;
        }

        const w = this.canvas.width;
        const h = this.canvas.height;

        if (this.targetX !== null && this.targetY !== null) {
          if (this.brushX === null) {
            this.brushX = this.targetX;
            this.brushY = this.targetY;
          }

          const ease = 0.18;
          const dx = this.targetX - this.brushX;
          const dy = this.targetY - this.brushY;

          this.brushX += dx * ease;
          this.brushY += dy * ease;

          const dist = Math.hypot(dx, dy);

          if (this.isMouseMoving && dist > 0.5) {
            const radiusVal = typeof this.brushRadius === 'function' ? this.brushRadius() : this.brushRadius;
            const params = getImageMappingParams(w, h, this.image.width, this.image.height);
            const px_img = (params.cx + (this.brushX / w) * params.cw) / this.image.width;
            const py_img = (params.cy + (this.brushY / h) * params.ch) / this.image.height;
            const r_img = radiusVal * (params.cw / w);

            cleanedPaths.push({
              px: px_img,
              py: py_img,
              r: r_img
            });

            const radGrad = this.maskCtx.createRadialGradient(this.brushX, this.brushY, radiusVal * 0.1, this.brushX, this.brushY, radiusVal);
            radGrad.addColorStop(0, 'rgba(0, 0, 0, 1)');
            radGrad.addColorStop(0.3, 'rgba(0, 0, 0, 0.8)');
            radGrad.addColorStop(0.6, 'rgba(0, 0, 0, 0.2)');
            radGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');

            this.maskCtx.fillStyle = radGrad;
            this.maskCtx.beginPath();
            this.maskCtx.arc(this.brushX, this.brushY, radiusVal, 0, Math.PI * 2);
            this.maskCtx.fill();

            this.trailPoints.push({
              x: this.brushX,
              y: this.brushY,
              vx: dx,
              vy: dy,
              radius: radiusVal * 1.05,
              life: 25,
              maxLife: 25
            });

            if (this.onMove) this.onMove();
          }
        }

        this.trailPoints.forEach(pt => {
          pt.life--;
          pt.radius *= 0.98;
        });
        this.trailPoints = this.trailPoints.filter(pt => pt.life > 0);

        this.renderCleanCar();
        this.animId = requestAnimationFrame(() => this.loop());
      }

      handleMove(clientX, clientY) {
        if (!this.isActive() || this.isResetting) return;

        let x, y;
        if (this.isMobilePortrait && window.innerHeight > window.innerWidth && window.innerWidth < 1024) {
          const rect = this.canvas.getBoundingClientRect();
          const cx = rect.left + rect.width / 2;
          const cy = rect.top + rect.height / 2;
          const rx = clientX - cx;
          const ry = clientY - cy;
          x = ry + this.canvas.width / 2;
          y = -rx + this.canvas.height / 2;
        } else {
          const rect = this.canvas.getBoundingClientRect();
          x = clientX - rect.left;
          y = clientY - rect.top;
        }

        if (x < 0 || x > this.canvas.width || y < 0 || y > this.canvas.height) return;

        this.targetX = x;
        this.targetY = y;
        this.isMouseMoving = true;

        if (this.mouseTimeout) clearTimeout(this.mouseTimeout);
        this.mouseTimeout = setTimeout(() => {
          this.isMouseMoving = false;
        }, 150);

        this.startLoop();
      }

      handleRelease() {
        this.isMouseMoving = false;
        this.targetX = null;
        this.targetY = null;
        this.brushX = null;
        this.brushY = null;
      }

      bindEvents() {
        const handleMoveBound = (e) => {
          if (e.touches && e.touches.length > 0) {
            this.handleMove(e.touches[0].clientX, e.touches[0].clientY);
          } else {
            this.handleMove(e.clientX, e.clientY);
          }
        };

        const handleReleaseBound = () => this.handleRelease();

        this.listenerElement.addEventListener('mousemove', handleMoveBound);
        this.listenerElement.addEventListener('touchmove', handleMoveBound, { passive: true });
        this.listenerElement.addEventListener('mouseup', handleReleaseBound);
        this.listenerElement.addEventListener('touchend', handleReleaseBound);
        this.listenerElement.addEventListener('mouseleave', handleReleaseBound);
      }

      reset() {
        if (this.isResetting) return;
        this.isResetting = true;
        
        let fadeFrames = 0;
        const maxFadeFrames = 30;
        
        const fadeOutMask = () => {
          if (!this.maskCtx) return;
          
          this.maskCtx.save();
          this.maskCtx.globalCompositeOperation = 'destination-out';
          this.maskCtx.fillStyle = 'rgba(0, 0, 0, 0.08)';
          this.maskCtx.fillRect(0, 0, this.maskCanvas.width, this.maskCanvas.height);
          this.maskCtx.restore();
          
          this.renderCleanCar();
          
          fadeFrames++;
          if (fadeFrames < maxFadeFrames) {
            requestAnimationFrame(fadeOutMask);
          } else {
            cleanedPaths.length = 0;
            this.maskCtx.clearRect(0, 0, this.maskCanvas.width, this.maskCanvas.height);
            this.renderCleanCar();
            
            this.isResetting = false;
            cleanButtonTriggered = false;
            lastCheckLength = 0;
          }
        };
        
        requestAnimationFrame(fadeOutMask);
      }

      destroy() {
        window.removeEventListener('resize', this.setupPatternBound);
      }
    }

    // Variáveis Globais de Controle de Fluxo
    const heroVideo = document.getElementById('hero-video');
    const heroOverlay = document.getElementById('hero-overlay');
    const cleaningCanvas = document.getElementById('cleaning-canvas');
    const heroSection = document.getElementById('hero');
    
    let cleanImageLoaded = false;
    const cleanImage = new Image();
    cleanImage.src = 'assets/img/limpo desktop.webp';
    
    let cleaningActive = false;
    let cleanedPaths = [];
    
    let introEnded = false;
    let heroVisible = true;
    let cleanButtonTriggered = false;
    let lastCheckLength = 0;

    // Inicialização dos Limpadores (Hero e Popup Mobile)
    let heroCleaner = null;
    let popupCleaner = null;
    
    cleanImage.onload = () => {
      cleanImageLoaded = true;
      if (introEnded) {
        if (heroCleaner) heroCleaner.setupPattern();
        if (popupCleaner) popupCleaner.setupPattern();
      }
    };
    
    if (cleanImage.complete) {
      cleanImageLoaded = true;
    }
    
    const fallbackTimeout = setTimeout(() => {
      if (!introEnded) {
        triggerIntroEnded();
      }
    }, 12000);
    
    function triggerIntroEnded() {
      if (introEnded) return;
      introEnded = true;
      clearTimeout(fallbackTimeout);
      document.body.classList.remove('intro-active');
      cleaningCanvas.style.opacity = '1';
      heroOverlay.style.opacity = '1';
      cleaningActive = true;

      // Inicializa instâncias do limpador
      heroCleaner = new ScratchCleaner({
        canvas: cleaningCanvas,
        listenerElement: heroSection,
        image: cleanImage,
        brushRadius: () => (window.innerWidth < 768 ? 40 : 60),
        isActive: () => cleaningActive && window.innerWidth >= 1024,
        customActiveCheck: () => heroVisible,
        onMove: () => {
          if (cleanedPaths.length - lastCheckLength >= 10) {
            lastCheckLength = cleanedPaths.length;
            checkCleanPercentage();
          }
        }
      });
      heroCleaner.setupPattern();

      setTimeout(() => {
        const title = document.getElementById('hero-title');
        if (title) title.classList.remove('opacity-0', 'translate-y-4');
      }, 400);

      setTimeout(() => {
        const cleanBtn = document.getElementById('open-cleaning-popup-btn');
        if (cleanBtn) cleanBtn.classList.remove('opacity-0', 'translate-y-4');
      }, 1000);
    }
    
    heroVideo.addEventListener('ended', triggerIntroEnded);
    heroSection.addEventListener('click', triggerIntroEnded);
    
    const heroObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        heroVisible = entry.isIntersecting;
        if (heroVisible && cleaningActive && heroCleaner) {
          heroCleaner.startLoop();
        } else if (!heroVisible && heroCleaner) {
          heroCleaner.stopLoop();
        }
      });
    }, { threshold: 0.05 });
    
    if (heroSection) {
      heroObserver.observe(heroSection);
    }
 
    function checkCleanPercentage() {
      const activeCleaner = popupActive ? popupCleaner : heroCleaner;
      if (!activeCleaner || !activeCleaner.maskCanvas || !activeCleaner.maskCtx) return;
      
      const w = activeCleaner.maskCanvas.width;
      const h = activeCleaner.maskCanvas.height;
      if (w === 0 || h === 0) return;
      
      try {
        const imgData = activeCleaner.maskCtx.getImageData(0, 0, w, h).data;
        let cleaned = 0;
        let total = 0;
        const step = 15;
        
        const startX = Math.floor(w * 0.15);
        const endX = Math.floor(w * 0.85);
        const startY = Math.floor(h * 0.25);
        const endY = Math.floor(h * 0.75);
        
        for (let y = startY; y < endY; y += step) {
          for (let x = startX; x < endX; x += step) {
            const index = (y * w + x) * 4 + 3;
            if (index < imgData.length) {
              total++;
              if (imgData[index] > 50) {
                cleaned++;
              }
            }
          }
        }
        
        const pct = cleaned / total;
        
        if (pct > 0.05 && !cleanButtonTriggered) {
          cleanButtonTriggered = true;
          const btnContainer = document.getElementById('reset-dirty-container');
          if (btnContainer) {
            btnContainer.classList.remove('opacity-0', 'pointer-events-none');
          }
        }
      } catch (e) {
        console.warn("Erro ao ler pixels do canvas de máscara, ativando fallback CORS:", e);
        if (cleanedPaths.length > 15 && !cleanButtonTriggered) {
          cleanButtonTriggered = true;
          const btnContainer = document.getElementById('reset-dirty-container');
          if (btnContainer) {
            btnContainer.classList.remove('opacity-0', 'pointer-events-none');
          }
        }
      }
    }
 
    document.getElementById('reset-dirty-btn').addEventListener('click', () => {
      const btnContainer = document.getElementById('reset-dirty-container');
      if (btnContainer) {
        btnContainer.classList.add('opacity-0', 'pointer-events-none');
      }
      if (heroCleaner) {
        heroCleaner.reset();
      }
    });

    // ----------------------------------------------------
    // POPUP DE LIMPEZA INTERATIVA (MOBILE ONLY)
    // ----------------------------------------------------
    const openPopupBtn = document.getElementById('open-cleaning-popup-btn');
    const modalCleaning = document.getElementById('modal-cleaning');
    const btnCloseCleaning = document.getElementById('btn-close-cleaning');
    const popupResetBtn = document.getElementById('popup-reset-btn');
    const popupCanvas = document.getElementById('popup-cleaning-canvas');

    let popupActive = false;

    // Abrir o Modal de Limpeza
    openPopupBtn.addEventListener('click', () => {
      document.body.style.overflow = 'hidden';
      document.body.classList.add('popup-active');
      
      modalCleaning.classList.remove('hidden');
      setTimeout(() => {
        modalCleaning.classList.replace('opacity-0', 'opacity-100');
        modalCleaning.classList.replace('pointer-events-none', 'pointer-events-auto');
      }, 50);

      popupActive = true;

      if (!popupCleaner) {
        popupCleaner = new ScratchCleaner({
          canvas: popupCanvas,
          listenerElement: popupCanvas,
          image: cleanImage,
          brushRadius: 45,
          isActive: () => popupActive,
          isMobilePortrait: true,
          onMove: () => {
            if (cleanedPaths.length - lastCheckLength >= 10) {
              lastCheckLength = cleanedPaths.length;
              checkCleanPercentage();
            }
          }
        });
      }
      popupCleaner.setupPattern();
      popupCleaner.startLoop();
    });

    // Fechar o Modal de Limpeza
    function closeCleaningPopup() {
      modalCleaning.classList.replace('opacity-100', 'opacity-0');
      modalCleaning.classList.replace('pointer-events-auto', 'pointer-events-none');
      document.body.classList.remove('popup-active');
      
      setTimeout(() => {
        modalCleaning.classList.add('hidden');
      }, 500);

      popupActive = false;
      if (popupCleaner) {
        popupCleaner.stopLoop();
      }

      document.body.style.overflow = '';

      if (heroCleaner) {
        heroCleaner.redrawMask();
        checkCleanPercentage();
      }
    }

    btnCloseCleaning.addEventListener('click', closeCleaningPopup);

    // Botão de resetar no popup
    popupResetBtn.addEventListener('click', () => {
      cleanedPaths.length = 0;
      if (popupCleaner) {
        popupCleaner.maskCtx.clearRect(0, 0, popupCleaner.maskCanvas.width, popupCleaner.maskCanvas.height);
        popupCleaner.renderCleanCar();
      }
      
      if (heroCleaner) {
        heroCleaner.maskCtx.clearRect(0, 0, heroCleaner.maskCanvas.width, heroCleaner.maskCanvas.height);
        heroCleaner.renderCleanCar();
      }
      cleanButtonTriggered = false;
      lastCheckLength = 0;
      const btnContainer = document.getElementById('reset-dirty-container');
      if (btnContainer) {
        btnContainer.classList.add('opacity-0', 'pointer-events-none');
      }
    });
    // ----------------------------------------------------
    // AGENTE 3: O Manifesto (Dobra 2)
    // ----------------------------------------------------
    const manifestoTextContainer = document.getElementById('manifesto-text-container');
    const manifestoSec = document.getElementById('manifesto');
 
    const copyManifesto = "O tempo é implacável com as superfícies. A poeira das estradas atua como micro-abrasivo, as lavagens convencionais criam marcas e a exposição diária apaga o brilho original da pintura. Na Krypton Car, nós não oferecemos limpezas rápidas. Oferecemos preservação técnica. Cada curva, costura e milímetro do seu veículo é tratado de forma artesanal. Corrigimos imperfeições invisíveis para criar um reflexo espelhado absoluto e duradouro. É a união entre a paixão automotiva e o acabamento perfeito.";
 
    function buildManifesto() {
      if (!manifestoTextContainer) return;
      manifestoTextContainer.innerHTML = '';
      const words = copyManifesto.split(' ');
      words.forEach((w, i) => {
        const span = document.createElement('span');
        span.textContent = w + ' ';
        span.className = 'word-span inline-block text-zinc-800 hoverable mr-2';
        span.dataset.wordIndex = i;
        manifestoTextContainer.appendChild(span);
      });
      setupHovers();
    }
    buildManifesto();
 
    window.addEventListener('scroll', () => {
      if (!manifestoSec || !manifestoTextContainer) return;
      const rect = manifestoSec.getBoundingClientRect();
      const viewHeight = window.innerHeight;
      
      const start = viewHeight * 0.50;
      const end = viewHeight * 0.15;
      
      const totalRange = start - end;
      let progress = 0;
      
      if (rect.top <= start && rect.bottom >= end) {
        const positionInFocus = rect.top - end;
        progress = 1 - (positionInFocus / totalRange);
        progress = Math.max(0, Math.min(1, progress));
      } else if (rect.top > start) {
        progress = 0;
      } else if (rect.bottom < end) {
        progress = 1;
      }
 
      const spans = manifestoTextContainer.querySelectorAll('span');
      const activeIdx = Math.floor(progress * spans.length);
 
      spans.forEach((span, idx) => {
        if (idx < activeIdx) {
          span.style.color = '#DA6815'; // Cobre
          span.style.transform = 'scale(1.0)';
        } else if (idx === activeIdx) {
          span.style.color = '#FFFFFF'; // Foco Branco
          span.style.transform = 'scale(1.05)';
        } else {
          span.style.color = '#1A1A1C'; // Cinza escuro
          span.style.transform = 'scale(1.0)';
        }
      });
    });
 
    const tabTexts = {
      artesanal: "Processos manuais meticulosos, polimento em múltiplas etapas e foco obsessivo nos acabamentos internos e externos.",
      premium: "Aplicação dos melhores revestimentos cerâmicos do mercado mundial, garantindo repelência à água, proteção contra raios UV e facilidade de manutenção."
    };
 
    function switchTab(tabId) {
      const btnArtesanal = document.getElementById('tab-btn-artesanal');
      const btnPremium = document.getElementById('tab-btn-premium');
      const tabContent = document.getElementById('tab-content-text');
      if (!tabContent) return;
 
      tabContent.style.opacity = '0';
 
      setTimeout(() => {
        tabContent.textContent = tabTexts[tabId];
        if (tabId === 'artesanal') {
          if (btnArtesanal) btnArtesanal.className = 'hoverable pb-4 border-b-2 border-kryptonAmber text-white transition-all';
          if (btnPremium) btnPremium.className = 'hoverable pb-4 border-b-2 border-transparent text-mutedPlat hover:text-white transition-all';
        } else {
          if (btnPremium) btnPremium.className = 'hoverable pb-4 border-b-2 border-kryptonAmber text-white transition-all';
          if (btnArtesanal) btnArtesanal.className = 'hoverable pb-4 border-b-2 border-transparent text-mutedPlat hover:text-white transition-all';
        }
        tabContent.style.opacity = '1';
      }, 300);
    }

    // ----------------------------------------------------
    // AGENTE 4: Inspeção Interativa / Anatomia (Dobra 3)
    // ----------------------------------------------------
    const anatomiaSec = document.getElementById('anatomia');
    const anatomiaCarWrapper = document.getElementById('anatomia-car-wrapper');

    function toggleHotspotPopover(event, id) {
      event.stopPropagation();
      const popover = document.getElementById('popover-' + id);
      if (!popover) return;
      const isActive = popover.classList.contains('active');
      
      closeAllPopovers();
      
      if (!isActive) {
        popover.classList.add('active');
      }
    }

    function closeAllPopovers() {
      const popovers = document.querySelectorAll('.hotspot-popover');
      popovers.forEach(p => p.classList.remove('active'));
    }

    document.addEventListener('click', () => {
      closeAllPopovers();
    });

    window.addEventListener('scroll', () => {
      if (!anatomiaSec || !anatomiaCarWrapper) return;
      const rect = anatomiaSec.getBoundingClientRect();
      const viewHeight = window.innerHeight;
      
      const startScroll = viewHeight;
      const endScroll = 0;
      
      if (rect.top <= startScroll && rect.bottom >= 0) {
        let progress = (startScroll - rect.top) / (startScroll - endScroll);
        progress = Math.max(0, Math.min(1, progress));
        
        const isMobile = window.innerWidth < 1024;
        
        if (isMobile) {
          const translateY = 40 - (progress * 40); // vai de 40vh a 0 (parando no centro exato de top: 55%)
          anatomiaCarWrapper.style.transform = 'translate3d(-50%, ' + translateY + 'vh, 0) rotate(-90deg)';
        } else {
          const translateX = -100 + (progress * 100);
          anatomiaCarWrapper.style.transform = 'translate3d(' + translateX + 'vw, 0, 0)';
        }
        
        if (progress >= 0.95) {
          anatomiaSec.classList.add('car-centered');
        } else {
          anatomiaSec.classList.remove('car-centered');
          closeAllPopovers();
        }
      }
    });

    // ----------------------------------------------------
    // AGENTE 5: Rodapé & QA Fallbacks
    // ----------------------------------------------------
    const scrollBtn = document.getElementById('scroll-to-top');
    
    if (scrollBtn) {
      scrollBtn.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });

      if (window.innerWidth >= 1024) {
        document.addEventListener('mousemove', (e) => {
          const rect = scrollBtn.getBoundingClientRect();
          const btnX = rect.left + rect.width / 2;
          const btnY = rect.top + rect.height / 2;
          const dist = Math.hypot(e.clientX - btnX, e.clientY - btnY);

          if (dist < 45) {
            scrollBtn.style.transform = `translate(${(e.clientX - btnX) * 0.3}px, ${(e.clientY - btnY) * 0.3}px)`;
          } else {
            scrollBtn.style.transform = 'translate(0, 0)';
          }
        });
      }
    }

    function handleMobileFallbacks() {
      if (typeof updateCursorState === 'function') {
        updateCursorState();
      }
      
      if (window.innerWidth < 1024) {
        setTimeout(() => {
          const container = document.getElementById('manifesto-text-container');
          if (container) {
            const spans = container.querySelectorAll('span');
            spans.forEach(span => {
              span.style.color = '#DA6815';
            });
          }
        }, 300);
      }
    }

    window.addEventListener('resize', handleMobileFallbacks);
    handleMobileFallbacks();

    // ----------------------------------------------------
    // AGENTE ADICIONAL: Vídeo Loop Cinematográfico
    // ----------------------------------------------------
    const videoSec = document.getElementById('experiencia-cinema');
    const videoContainer = document.getElementById('video-container');
    const loopVideoDesktop = document.getElementById('loop-video-desktop');
    const loopVideoMobile = document.getElementById('loop-video-mobile');

    let videoInitialized = false;

    const videoObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        const isMobile = window.innerWidth < 768;
        const activeVideo = isMobile ? loopVideoMobile : loopVideoDesktop;
        const inactiveVideo = isMobile ? loopVideoDesktop : loopVideoMobile;

        if (entry.isIntersecting) {
          // Ativa o efeito visual de revelação suave na primeira aparição
          if (!videoInitialized) {
            videoContainer.classList.remove('opacity-0', 'scale-105', 'blur-md');
            videoInitialized = true;
          }

          // Garante que o vídeo inativo está pausado
          inactiveVideo.pause();

          // Dá play no vídeo correto
          activeVideo.play().catch(err => {
            console.log("Autoplay bloqueado ou falha na reprodução:", err);
          });
        } else {
          // Pausa os vídeos quando saem da tela para economizar bateria e processamento
          if (videoInitialized) {
            loopVideoDesktop.pause();
            loopVideoMobile.pause();
          }
        }
      });
    }, {
      threshold: 0.15
    });

    if (videoSec) {
      videoObserver.observe(videoSec);
    }

    // ----------------------------------------------------
    // AGENTE ADICIONAL: Seção de Feedbacks (Parallax & Fade-In)
    // ----------------------------------------------------
    const feedbackBg = document.getElementById('feedback-bg');
    const feedbackSec = document.getElementById('feedbacks');
    const feedbackCards = document.querySelectorAll('.feedback-card');
    const avatarBtns = document.querySelectorAll('.avatar-btn');

    let currentFeedbackIndex = 0;
    let feedbackInterval = null;

    // 1. Efeito Parallax Vertical Otimizado (Centralizado)
    function handleFeedbackParallax() {
      if (!feedbackSec || !feedbackBg) return;

      const rect = feedbackSec.getBoundingClientRect();
      const viewHeight = window.innerHeight;

      // Só calcula se a seção estiver minimamente visível na tela
      if (rect.top <= viewHeight && rect.bottom >= 0) {
        // Calcula a porcentagem de scroll da seção
        const totalDistance = viewHeight + rect.height;
        const scrolledDistance = viewHeight - rect.top;
        const scrollPercent = scrolledDistance / totalDistance;

        // Deslocamento Y suave adaptado para posicionamento absoluto -50%
        const translateY = (scrollPercent - 0.5) * 160; // de -80px a 80px
        feedbackBg.style.transform = `translate3d(-50%, calc(-50% + ${translateY}px), 0)`;
      }
    }

    window.addEventListener('scroll', handleFeedbackParallax);

    // 2. Alternador de Depoimentos (Fade-In & Scale)
    function setFeedback(index) {
      if (index === currentFeedbackIndex) return;

      const currentCard = feedbackCards[currentFeedbackIndex];
      const nextCard = feedbackCards[index];
      const currentAvatar = avatarBtns[currentFeedbackIndex];
      const nextAvatar = avatarBtns[index];

      // Oculta o depoimento antigo
      currentCard.classList.replace('opacity-100', 'opacity-0');
      currentCard.classList.replace('scale-100', 'scale-95');
      currentCard.classList.add('translate-y-2', 'pointer-events-none');

      // Exibe o novo depoimento
      nextCard.classList.remove('pointer-events-none', 'translate-y-2');
      // Pequeno timeout para garantir a transição de opacidade/escala fluida
      setTimeout(() => {
        nextCard.classList.replace('opacity-0', 'opacity-100');
        nextCard.classList.replace('scale-95', 'scale-100');
      }, 50);

      // Atualiza o estilo dos seletores em abas horizontais (ativo / inativo)
      currentAvatar.className = 'hoverable avatar-btn pb-1 border-b-2 border-transparent text-mutedPlat hover:text-white transition-all duration-300 outline-none';
      nextAvatar.className = 'hoverable avatar-btn pb-1 border-b-2 border-kryptonAmber text-white transition-all duration-300 outline-none';

      currentFeedbackIndex = index;

      // Reinicia o autoplay após interação do usuário para dar mais tempo de leitura
      startFeedbackAutoplay();
    }

    // 3. Autoplay de Feedbacks
    function startFeedbackAutoplay() {
      stopFeedbackAutoplay();
      feedbackInterval = setInterval(() => {
        let nextIndex = (currentFeedbackIndex + 1) % feedbackCards.length;
        setFeedback(nextIndex);
      }, 7000); // 7 segundos
    }

    function stopFeedbackAutoplay() {
      if (feedbackInterval) {
        clearInterval(feedbackInterval);
      }
    }

    // ----------------------------------------------------
    // AGENTE ADICIONAL: Slotty Cockpit Controller (Agendamento)
    // ----------------------------------------------------
    const inpNome = document.getElementById('inp-nome');
    const inpSobrenome = document.getElementById('inp-sobrenome');
    const inpEmail = document.getElementById('inp-email');
    const inpTelefone = document.getElementById('inp-telefone');
    const selServico = document.getElementById('sel-servico');
    const selProfissional = document.getElementById('sel-profissional');
    
    const calendarMonthYear = document.getElementById('calendar-month-year');
    const calendarGrid = document.getElementById('calendar-grid');
    const hoursGrid = document.getElementById('hours-grid');
    
    const btnPrevMonth = document.getElementById('btn-prev-month');
    const btnNextMonth = document.getElementById('btn-next-month');
    
    const gaugeCircle = document.getElementById('status-gauge-circle');
    const gaugePercent = document.getElementById('gauge-percent');
    const gaugeStatusText = document.getElementById('gauge-status-text');
    
    const checkPilot = document.getElementById('check-pilot').querySelector('.status-indicator');
    const checkCalib = document.getElementById('check-calib').querySelector('.status-indicator');
    const checkAgenda = document.getElementById('check-agenda').querySelector('.status-indicator');
    
    const btnEngineStart = document.getElementById('btn-engine-start');
    const btnShowMyBookings = document.getElementById('btn-show-my-bookings');
    
    const cockpitPanel = document.getElementById('cockpit-panel');
    const voucherPanel = document.getElementById('voucher-panel');
    
    const vouchNome = document.getElementById('vouch-nome');
    const vouchServico = document.getElementById('vouch-servico');
    const vouchProfissional = document.getElementById('vouch-profissional');
    const vouchDataHora = document.getElementById('vouch-data-hora');
    
    const btnVoucherNew = document.getElementById('btn-voucher-new');
    const btnVoucherDownload = document.getElementById('btn-voucher-download');
    
    const modalBookings = document.getElementById('modal-bookings');
    const btnCloseBookings = document.getElementById('btn-close-bookings');
    const bookingsListBody = document.getElementById('bookings-list-body');
    const noBookingsMessage = document.getElementById('no-bookings-message');
    const btnClearBookings = document.getElementById('btn-clear-bookings');

    const todayDate = new Date();
    let currentYear = todayDate.getFullYear();
    let currentMonthIndex = todayDate.getMonth();
    let selectedDate = null;
    let selectedHour = null;
    
    const servicesMap = {
      vitrificacao: "Vitreous Protection (Vitrificação)",
      correcao: "Paint Correction (Polimento Técnico)",
      detalhamento: "Interior Detailing (Detalhamento Interno)"
    };

    const professionalsMap = {
      marcus: "Marcos",
      helena: "Helena",
      dante: "Thiago"
    };

    const professionalsByService = {
      vitrificacao: [
        { id: "marcus", name: "Marcos" },
        { id: "dante", name: "Thiago" }
      ],
      correcao: [
        { id: "marcus", name: "Marcos" },
        { id: "dante", name: "Thiago" }
      ],
      detalhamento: [
        { id: "helena", name: "Helena" },
        { id: "dante", name: "Thiago" }
      ]
    };

    // 1. Controle de Dropdowns Dependentes Customizados
    function initCustomDropdowns() {
      const dropdowns = ['custom-select-servico', 'custom-select-profissional'];
      
      dropdowns.forEach(id => {
        const container = document.getElementById(id);
        if (!container) return;
        
        const trigger = container.querySelector('.dropdown-trigger');
        const list = container.querySelector('.options-container');
        const select = container.querySelector('select');
        
        trigger.addEventListener('click', (e) => {
          e.stopPropagation();
          if (trigger.hasAttribute('disabled')) return;
          
          document.querySelectorAll('.options-container').forEach(c => {
            if (c !== list) c.classList.add('hidden');
          });
          list.classList.toggle('hidden');
        });
        
        container.addEventListener('click', (e) => {
          const option = e.target.closest('.option-item');
          if (!option) return;
          
          const val = option.dataset.value;
          select.value = val;
          
          const textSpan = trigger.querySelector('.selected-text');
          textSpan.textContent = option.textContent;
          textSpan.classList.remove('text-zinc-500');
          textSpan.classList.add('text-white');
          
          list.classList.add('hidden');
          select.dispatchEvent(new Event('change'));
        });
      });
      
      document.addEventListener('click', () => {
        document.querySelectorAll('.options-container').forEach(c => c.classList.add('hidden'));
      });
    }

    selServico.addEventListener('change', () => {
      const val = selServico.value;
      selProfissional.innerHTML = '<option value="" disabled selected>Escolha o profissional...</option>';
      
      const profContainer = document.getElementById('custom-select-profissional');
      if (!profContainer) return;
      
      const profTrigger = profContainer.querySelector('.dropdown-trigger');
      const profList = profContainer.querySelector('.options-container');
      const profText = profTrigger.querySelector('.selected-text');
      
      profList.innerHTML = '';
      
      if (val && professionalsByService[val]) {
        selProfissional.removeAttribute('disabled');
        profTrigger.removeAttribute('disabled');
        profTrigger.classList.remove('opacity-50', 'cursor-not-allowed');
        
        profText.textContent = "Escolha o profissional...";
        profText.className = "selected-text text-zinc-500";
        
        professionalsByService[val].forEach(p => {
          const opt = document.createElement('option');
          opt.value = p.id;
          opt.textContent = p.name;
          selProfissional.appendChild(opt);
          
          const div = document.createElement('div');
          div.className = 'option-item py-2.5 px-4 text-xs text-white/80 hover:bg-kryptonAmber hover:text-black cursor-pointer transition-all';
          div.dataset.value = p.id;
          div.textContent = p.name;
          profList.appendChild(div);
        });
      } else {
        selProfissional.setAttribute('disabled', 'true');
        profTrigger.setAttribute('disabled', 'true');
        profTrigger.classList.add('opacity-50', 'cursor-not-allowed');
        profText.textContent = "Selecione primeiro o serviço...";
        profText.className = "selected-text text-zinc-500";
      }
      
      validateTelemetry();
    });

    selProfissional.addEventListener('change', validateTelemetry);

    // 2. Lógica do Calendário
    const monthNames = [
      "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
      "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
    ];

    function renderCalendar() {
      if (!calendarGrid) return;
      calendarGrid.innerHTML = '';
      
      calendarMonthYear.textContent = `${monthNames[currentMonthIndex]} ${currentYear}`;
      
      const firstDayIndex = new Date(currentYear, currentMonthIndex, 1).getDay();
      const totalDays = new Date(currentYear, currentMonthIndex + 1, 0).getDate();
      
      const today = new Date();
      // Ajuste para testes ou fuso fixo de 2026 se necessário, mas faremos dinâmico
      const comparisonDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      
      // Preencher espaços vazios do início do mês
      for (let i = 0; i < firstDayIndex; i++) {
        const emptyCell = document.createElement('div');
        calendarGrid.appendChild(emptyCell);
      }
      
      // Preencher os dias do mês
      for (let day = 1; day <= totalDays; day++) {
        const cell = document.createElement('button');
        cell.type = 'button';
        cell.textContent = day;
        cell.className = 'hoverable cockpit-calendar-day py-2 rounded text-white/70 bg-transparent text-[11px] focus:outline-none';
        
        const cellDate = new Date(currentYear, currentMonthIndex, day);
        
        // Bloquear dias anteriores a hoje
        if (cellDate < comparisonDate) {
          cell.classList.add('disabled');
          cell.disabled = true;
        } else {
          cell.addEventListener('click', () => {
            selectDay(day, cell);
          });
          
          if (selectedDate && 
              selectedDate.day === day && 
              selectedDate.month === currentMonthIndex && 
              selectedDate.year === currentYear) {
            cell.classList.add('selected');
          }
        }
        
        calendarGrid.appendChild(cell);
      }
      
      setupHovers();
    }

    function selectDay(day, element) {
      document.querySelectorAll('.cockpit-calendar-day').forEach(el => el.classList.remove('selected'));
      element.classList.add('selected');
      
      selectedDate = {
        day: day,
        month: currentMonthIndex,
        year: currentYear
      };
      
      selectedHour = null; // Reinicia hora ao mudar o dia
      renderHours();
      validateTelemetry();
    }

    btnPrevMonth.addEventListener('click', () => {
      currentMonthIndex--;
      if (currentMonthIndex < 0) {
        currentMonthIndex = 11;
        currentYear--;
      }
      renderCalendar();
    });

    btnNextMonth.addEventListener('click', () => {
      currentMonthIndex++;
      if (currentMonthIndex > 11) {
        currentMonthIndex = 0;
        currentYear++;
      }
      renderCalendar();
    });

    // 3. Lógica de Slots de Horários
    const availableHours = ["09:00", "11:00", "14:00", "16:30", "19:00"];

    function renderHours() {
      hoursGrid.innerHTML = '';
      
      if (!selectedDate) {
        hoursGrid.innerHTML = '<div class="text-[10px] font-title text-mutedPlat p-3 border border-white/5 rounded-lg text-center">Selecione o profissional e a data...</div>';
        return;
      }

      // Simulação: Horários pares ou ímpares de dias ficam reservados para simular ocupação
      availableHours.forEach((hour) => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'hoverable py-2 px-3 border rounded text-[10px] uppercase font-title transition-all duration-300 flex flex-col items-center justify-center gap-0.5 focus:outline-none';
        
        // Simulação de horário ocupado (ex: 11h e 19h no Marcus, ou regras com base no dia)
        const isReserved = (selectedDate.day % 2 === 0 && (hour === "11:00" || hour === "19:00")) || 
                           (selectedDate.day % 3 === 0 && (hour === "14:00"));
        
        if (isReserved) {
          btn.className += ' border-white/5 bg-transparent text-white/20 cursor-not-allowed';
          btn.disabled = true;
          btn.innerHTML = `
            <span>${hour}</span>
            <span class="text-[6px] tracking-wider text-white/10 uppercase">Ocupado</span>
          `;
        } else {
          const isSelected = selectedHour === hour;
          if (isSelected) {
            btn.className += ' border-kryptonAmber bg-kryptonAmber/10 text-[#DA6815] shadow-[0_0_10px_rgba(218,104,21,0.15)]';
          } else {
            btn.className += ' border-white/10 hover:border-kryptonAmber/50 hover:bg-white/5 text-white/70';
          }
          
          btn.innerHTML = `
            <span>${hour}</span>
            <span class="text-[6px] tracking-wider text-emerald-500 uppercase font-semibold">Disponível</span>
          `;
          
          btn.addEventListener('click', () => {
            selectHour(hour);
          });
        }
        
        hoursGrid.appendChild(btn);
      });
      
      setupHovers();
    }

    function selectHour(hour) {
      selectedHour = hour;
      renderHours();
      validateTelemetry();
    }

    // 4. Validação e Feedback do Formulário (Gauge Telemetria)
    function validateEmail(email) {
      const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return re.test(String(email).toLowerCase());
    }

    function validateTelemetry() {
      const isNomeValid = inpNome.value.trim().length > 1;
      const isSobrenomeValid = inpSobrenome.value.trim().length > 1;
      const isEmailValid = validateEmail(inpEmail.value);
      const isTelefoneValid = inpTelefone.value.trim().replace(/\D/g, '').length >= 10;
      
      const isServicoValid = selServico.value !== "";
      const isProfissionalValid = selProfissional.value !== "";
      const isCalibValid = isServicoValid && isProfissionalValid;
      
      const isDateValid = selectedDate !== null;
      const isHourValid = selectedHour !== null;
      const isAgendaValid = isDateValid && isHourValid;

      // Atualiza os indicadores textuais da direita
      let pilotCount = (isNomeValid ? 1 : 0) + (isSobrenomeValid ? 1 : 0) + (isEmailValid ? 1 : 0) + (isTelefoneValid ? 1 : 0);
      if (pilotCount === 4) {
        checkPilot.textContent = "ESTÁVEL";
        checkPilot.className = "status-indicator text-emerald-500 font-semibold";
      } else if (pilotCount > 0) {
        checkPilot.textContent = `PARCIAL (${pilotCount}/4)`;
        checkPilot.className = "status-indicator text-yellow-500 font-semibold";
      } else {
        checkPilot.textContent = "PENDENTE";
        checkPilot.className = "status-indicator text-red-500";
      }

      let calibCount = (isServicoValid ? 1 : 0) + (isProfissionalValid ? 1 : 0);
      if (calibCount === 2) {
        checkCalib.textContent = "CALIBRADO";
        checkCalib.className = "status-indicator text-emerald-500 font-semibold";
      } else if (calibCount > 0) {
        checkCalib.textContent = "PARCIAL (1/2)";
        checkCalib.className = "status-indicator text-yellow-500 font-semibold";
      } else {
        checkCalib.textContent = "PENDENTE";
        checkCalib.className = "status-indicator text-red-500";
      }

      let agendaCount = (isDateValid ? 1 : 0) + (isHourValid ? 1 : 0);
      if (agendaCount === 2) {
        checkAgenda.textContent = "AGENDADO";
        checkAgenda.className = "status-indicator text-emerald-500 font-semibold";
      } else if (agendaCount > 0) {
        checkAgenda.textContent = "PARCIAL (1/2)";
        checkAgenda.className = "status-indicator text-yellow-500 font-semibold";
      } else {
        checkAgenda.textContent = "PENDENTE";
        checkAgenda.className = "status-indicator text-red-500";
      }

      // Calcula porcentagem do progresso com base nos 8 parâmetros individuais
      let itemsValidCount = 0;
      if (isNomeValid) itemsValidCount++;
      if (isSobrenomeValid) itemsValidCount++;
      if (isEmailValid) itemsValidCount++;
      if (isTelefoneValid) itemsValidCount++;
      if (isServicoValid) itemsValidCount++;
      if (isProfissionalValid) itemsValidCount++;
      if (isDateValid) itemsValidCount++;
      if (isHourValid) itemsValidCount++;

      let pct = Math.round((itemsValidCount / 8) * 100);

      gaugePercent.textContent = pct + "%";
      
      // Circunferência do círculo = 2 * Math.PI * 42 = 263.89
      const circ = 263.89;
      const offset = circ - (pct / 100 * circ);
      gaugeCircle.style.strokeDashoffset = offset;

      // Status visual do Gauge
      if (pct === 0) {
        gaugeCircle.setAttribute('stroke', '#DA6815');
        gaugeStatusText.textContent = "CALIBRAÇÃO";
        gaugeStatusText.className = "font-title text-[7px] text-kryptonAmber tracking-[0.1em] uppercase font-semibold";
        btnEngineStart.style.animation = 'led-glow 3s infinite ease-in-out';
      } else if (pct < 100) {
        gaugeCircle.setAttribute('stroke', '#DA6815');
        gaugeStatusText.textContent = "SINTONIZANDO";
        gaugeStatusText.className = "font-title text-[7px] text-yellow-500 tracking-[0.1em] uppercase font-semibold";
        btnEngineStart.style.animation = 'led-glow 3s infinite ease-in-out';
      } else {
        // Telemetria 100% Completa
        gaugeCircle.setAttribute('stroke', '#10B981'); // Verde esmeralda
        gaugeStatusText.textContent = "READY";
        gaugeStatusText.className = "font-title text-[7px] text-emerald-500 tracking-[0.1em] uppercase font-semibold animate-pulse";
        
        // Efeito de pulso rápido no botão de ignição para indicar pronto
        btnEngineStart.style.animation = 'led-glow 1s infinite ease-in-out';
      }

      return pct === 100;
    }

    // Ouvintes de digitação
    [inpNome, inpSobrenome, inpEmail].forEach(input => {
      input.addEventListener('input', validateTelemetry);
    });

    inpTelefone.addEventListener('input', (e) => {
      let x = e.target.value.replace(/\D/g, '').match(/(\d{0,2})(\d{0,5})(\d{0,4})/);
      e.target.value = !x[2] ? x[1] : '(' + x[1] + ') ' + x[2] + (x[3] ? '-' + x[3] : '');
      validateTelemetry();
    });

    // 5. Acionador do Botão de Ignição (Engine Start)
    btnEngineStart.addEventListener('click', () => {
      const isReady = validateTelemetry();
      
      if (!isReady) {
        // Vibração física do painel indicando erro
        cockpitPanel.classList.add('animate-shake');
        setTimeout(() => {
          cockpitPanel.classList.remove('animate-shake');
        }, 400);
        return;
      }

      // Ignição autorizada! Efeito flicker visual no painel
      cockpitPanel.classList.add('animate-flicker');
      btnEngineStart.setAttribute('disabled', 'true');
      
      setTimeout(() => {
        cockpitPanel.classList.remove('animate-flicker');
        btnEngineStart.removeAttribute('disabled');
        
        // Criar agendamento
        const resId = 'KRP-' + Math.floor(Math.random() * 90000 + 10000);
        const dataFormatada = `${selectedDate.day} de ${monthNames[selectedDate.month]} de ${selectedDate.year}`;
        const reserva = {
          id: resId,
          nome: inpNome.value.trim(),
          sobrenome: inpSobrenome.value.trim(),
          email: inpEmail.value.trim(),
          telefone: inpTelefone.value.trim(),
          servico: selServico.value,
          profissional: selProfissional.value,
          data: dataFormatada,
          hora: selectedHour,
          timestamp: Date.now()
        };

        // Salvar localmente
        let currentBookings = JSON.parse(localStorage.getItem('krypton_bookings')) || [];
        currentBookings.push(reserva);
        localStorage.setItem('krypton_bookings', JSON.stringify(currentBookings));

        // Preencher dados no Voucher
        vouchNome.textContent = `${reserva.nome} ${reserva.sobrenome}`;
        vouchServico.textContent = servicesMap[reserva.servico];
        vouchProfissional.textContent = professionalsMap[reserva.profissional];
        vouchDataHora.textContent = `${reserva.data} às ${reserva.hora}`;

        // Transição de painéis
        cockpitPanel.classList.add('hidden');
        voucherPanel.classList.remove('hidden');
        setTimeout(() => {
          voucherPanel.classList.replace('opacity-0', 'opacity-100');
          voucherPanel.classList.replace('scale-95', 'scale-100');
          // Rola suavemente a página de volta ao topo da seção de agendamento
          document.getElementById('agendamento').scrollIntoView({ behavior: 'smooth' });
        }, 50);

        setupHovers();
      }, 800);
    });

    // Resetar formulário após confirmação
    function resetCockpitForm() {
      inpNome.value = '';
      inpSobrenome.value = '';
      inpEmail.value = '';
      inpTelefone.value = '';
      selServico.value = '';
      selProfissional.value = '';
      selProfissional.setAttribute('disabled', 'true');
      selectedDate = null;
      selectedHour = null;
      
      const servTriggerText = document.getElementById('custom-select-servico').querySelector('.selected-text');
      if (servTriggerText) {
        servTriggerText.textContent = "Escolha um serviço...";
        servTriggerText.className = "selected-text text-zinc-500";
      }
      
      const profContainer = document.getElementById('custom-select-profissional');
      if (profContainer) {
        const profTrigger = profContainer.querySelector('.dropdown-trigger');
        const profTriggerText = profTrigger.querySelector('.selected-text');
        profTrigger.setAttribute('disabled', 'true');
        profTrigger.classList.add('opacity-50', 'cursor-not-allowed');
        profTriggerText.textContent = "Selecione primeiro o serviço...";
        profTriggerText.className = "selected-text text-zinc-500";
      }
      
      document.querySelectorAll('.cockpit-calendar-day').forEach(el => el.classList.remove('selected'));
      renderHours();
      validateTelemetry();

      voucherPanel.classList.replace('opacity-100', 'opacity-0');
      voucherPanel.classList.replace('scale-100', 'scale-95');
      
      setTimeout(() => {
        voucherPanel.classList.add('hidden');
        cockpitPanel.classList.remove('hidden');
      }, 600);
    }

    btnVoucherNew.addEventListener('click', resetCockpitForm);
    btnVoucherDownload.addEventListener('click', resetCockpitForm);

    // 6. Lógica de Consulta: Meus Agendamentos
    function showBookingsModal() {
      const bookings = JSON.parse(localStorage.getItem('krypton_bookings')) || [];
      bookingsListBody.innerHTML = '';
      
      if (bookings.length === 0) {
        noBookingsMessage.classList.remove('hidden');
      } else {
        noBookingsMessage.classList.add('hidden');
        bookings.forEach(b => {
          const tr = document.createElement('tr');
          tr.className = 'border-b border-white/5 hover:bg-white/5 transition-all';
          tr.innerHTML = `
            <td class="py-3 font-body text-white font-medium">${servicesMap[b.servico] || b.servico}</td>
            <td class="py-3 font-body">${professionalsMap[b.profissional] || b.profissional}</td>
            <td class="py-3 font-body">${b.data} às ${b.hora}</td>
            <td class="py-3 text-right">
              <button onclick="cancelBooking('${b.id}')" class="hoverable px-2.5 py-1 border border-red-500/30 hover:border-red-500 hover:bg-red-500/10 text-red-500 rounded text-[9px] font-title uppercase tracking-widest transition-all">Cancelar</button>
            </td>
          `;
          bookingsListBody.appendChild(tr);
        });
      }

      modalBookings.classList.remove('hidden');
      setTimeout(() => {
        modalBookings.classList.replace('opacity-0', 'opacity-100');
        modalBookings.classList.replace('pointer-events-none', 'pointer-events-auto');
        modalBookings.querySelector('.scale-95').classList.replace('scale-95', 'scale-100');
      }, 50);

      setupHovers();
    }

    function hideBookingsModal() {
      modalBookings.classList.replace('opacity-100', 'opacity-0');
      modalBookings.classList.replace('pointer-events-auto', 'pointer-events-none');
      const modalContent = modalBookings.querySelector('.scale-100');
      if (modalContent) {
        modalContent.classList.replace('scale-100', 'scale-95');
      }
      setTimeout(() => {
        modalBookings.classList.add('hidden');
      }, 500);
    }

    // Expõe a função de cancelamento globalmente para escopo do botão
    window.cancelBooking = function(bookingId) {
      let bookings = JSON.parse(localStorage.getItem('krypton_bookings')) || [];
      bookings = bookings.filter(b => b.id !== bookingId);
      localStorage.setItem('krypton_bookings', JSON.stringify(bookings));
      showBookingsModal();
    };

    btnShowMyBookings.addEventListener('click', showBookingsModal);
    btnCloseBookings.addEventListener('click', hideBookingsModal);
    
    btnClearBookings.addEventListener('click', () => {
      if (confirm("Deseja apagar todos os registros de agendamento neste navegador?")) {
        localStorage.removeItem('krypton_bookings');
        showBookingsModal();
      }
    });

    // Iniciar Calendário na inicialização do script
    renderCalendar();
    initCustomDropdowns();

    // Efeito Gravidade / Tilt 3D nos Cards de Serviços
    document.querySelectorAll('.service-card').forEach(card => {
      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const cardWidth = rect.width;
        const cardHeight = rect.height;
        const mouseX = e.clientX - rect.left - cardWidth / 2;
        const mouseY = e.clientY - rect.top - cardHeight / 2;
        const maxTilt = 12;
        const tiltX = -(mouseY / (cardHeight / 2)) * maxTilt;
        const tiltY = (mouseX / (cardWidth / 2)) * maxTilt;
        card.style.transform = `scale(1.04) rotateX(${tiltX}deg) rotateY(${tiltY}deg)`;
      });
      card.addEventListener('mouseleave', () => {
        card.style.transform = 'scale(1) rotateX(0deg) rotateY(0deg)';
      });
    });

    // Inicialização
    startFeedbackAutoplay();
    // Configura os hovers dos novos botões dinamicamente
    setupHovers();