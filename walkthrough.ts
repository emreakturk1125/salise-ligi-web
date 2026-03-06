/**
 * Dynamic User Walkthrough / Onboarding
 * 3-step overlay guide for first-time users.
 */

const STORAGE_KEY = 'sl_walkthrough_done';

interface WalkthroughOptions {
  gameRootSelector?: string;
}

interface Step {
  icon: string;
  title: string;
  description: string;
}

const STEPS: Step[] = [
  { icon: '👆', title: '1/3', description: 'Dokun: Top dönmeye başlar.' },
  { icon: '✋', title: '2/3', description: 'Tekrar dokun: Top durur.' },
  { icon: '🏆', title: '3/3', description: 'Doğru anda durdur: Skor yap ve rekor kır!' },
];

const STYLE = /* css */ `
.wt-overlay {
  position: fixed;
  inset: 0;
  z-index: 99999;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.82);
  backdrop-filter: blur(6px);
  -webkit-backdrop-filter: blur(6px);
  opacity: 0;
  transition: opacity .3s ease;
  padding: 16px;
}
.wt-overlay.wt-visible { opacity: 1; }

.wt-card {
  background: linear-gradient(145deg, rgba(18,61,36,.95), rgba(10,46,26,.98));
  border: 1px solid rgba(0,212,255,.25);
  border-radius: clamp(16px, 4vw, 28px);
  box-shadow: 0 0 40px rgba(0,212,255,.12), 0 8px 32px rgba(0,0,0,.5);
  width: min(420px, 92vw);
  max-height: 90vh;
  overflow-y: auto;
  padding: clamp(24px, 5vw, 40px) clamp(20px, 4vw, 32px);
  text-align: center;
  color: #fff;
  font-family: 'Roboto Condensed', sans-serif;
  animation: wt-pop .35s cubic-bezier(.34,1.56,.64,1) both;
}
@keyframes wt-pop {
  from { transform: scale(.85) translateY(20px); opacity: 0; }
  to   { transform: scale(1)   translateY(0);    opacity: 1; }
}

.wt-icon {
  font-size: clamp(48px, 12vw, 72px);
  margin-bottom: 12px;
  line-height: 1;
}
.wt-step-label {
  font-size: clamp(.75rem, 2.4vw, .9rem);
  color: rgba(0,212,255,.8);
  letter-spacing: 1.6px;
  text-transform: uppercase;
  margin-bottom: 8px;
}
.wt-desc {
  font-size: clamp(1rem, 3.6vw, 1.3rem);
  line-height: 1.5;
  margin-bottom: 24px;
}

/* dots */
.wt-dots { display:flex; justify-content:center; gap:8px; margin-bottom:20px; }
.wt-dot {
  width: 10px; height: 10px; border-radius: 50%;
  background: rgba(255,255,255,.25);
  transition: background .25s, transform .25s;
}
.wt-dot.wt-active { background: #00d4ff; transform: scale(1.3); }

/* buttons row */
.wt-actions {
  display: flex;
  justify-content: center;
  gap: 10px;
  flex-wrap: wrap;
}
.wt-btn {
  font-family: 'Roboto Condensed', sans-serif;
  font-size: clamp(.82rem, 2.8vw, 1rem);
  padding: clamp(8px, 2vw, 12px) clamp(16px, 4vw, 24px);
  border-radius: clamp(8px, 2vw, 14px);
  border: 1px solid rgba(255,255,255,.2);
  background: rgba(255,255,255,.07);
  color: #fff;
  cursor: pointer;
  transition: background .2s, border-color .2s, transform .1s;
  min-height: 40px;
  line-height: 1.2;
}
.wt-btn:active { transform: scale(.96); }
.wt-btn:hover  { background: rgba(255,255,255,.14); }
.wt-btn.wt-primary {
  background: rgba(0,212,255,.18);
  border-color: rgba(0,212,255,.5);
  color: #00d4ff;
}
.wt-btn.wt-primary:hover { background: rgba(0,212,255,.3); }

/* checkbox */
.wt-check-row {
  display: flex; align-items: center; justify-content: center; gap: 8px;
  margin-top: 18px; font-size: clamp(.72rem, 2.2vw, .85rem); color: rgba(255,255,255,.55);
}
.wt-check-row input[type="checkbox"] {
  accent-color: #00d4ff;
  width: 16px; height: 16px; cursor: pointer;
}
.wt-check-row label { cursor: pointer; }
`;

export class Walkthrough {
  private overlay: HTMLDivElement | null = null;
  private step = 0;
  private gameRoot: HTMLElement | null = null;
  private gameRootSelector: string;
  private styleEl: HTMLStyleElement | null = null;
  private dontShowAgain = false;

  constructor(opts?: WalkthroughOptions) {
    this.gameRootSelector = opts?.gameRootSelector ?? '#app';
  }

  /** Check if walkthrough should be shown (first time only). */
  shouldShow(): boolean {
    try {
      return localStorage.getItem(STORAGE_KEY) !== 'true';
    } catch {
      return true; // private browsing etc.
    }
  }

  /** Show the walkthrough overlay. */
  show(): void {
    if (this.overlay) return; // already visible
    this.step = 0;
    this.dontShowAgain = false;
    this.injectStyle();
    this.lockGame(true);
    this.buildOverlay();
  }

  /** Hide & clean up. */
  hide(): void {
    if (!this.overlay) return;
    this.overlay.classList.remove('wt-visible');
    setTimeout(() => {
      this.overlay?.remove();
      this.overlay = null;
    }, 300);
    this.lockGame(false);
    if (this.dontShowAgain) {
      this.markDone();
    }
  }

  /** Finish walkthrough: always mark done & hide. */
  private finish(): void {
    this.markDone();
    this.hide();
  }

  // ── internal ──────────────────────────────────────────

  private markDone(): void {
    try { localStorage.setItem(STORAGE_KEY, 'true'); } catch { /* noop */ }
  }

  private lockGame(lock: boolean): void {
    this.gameRoot = document.querySelector(this.gameRootSelector);
    if (this.gameRoot) {
      this.gameRoot.style.pointerEvents = lock ? 'none' : '';
    }
  }

  private injectStyle(): void {
    if (this.styleEl) return;
    this.styleEl = document.createElement('style');
    this.styleEl.textContent = STYLE;
    document.head.appendChild(this.styleEl);
  }

  private buildOverlay(): void {
    this.overlay = document.createElement('div');
    this.overlay.className = 'wt-overlay';
    this.overlay.addEventListener('click', (e) => {
      if (e.target === this.overlay) return; // ignore backdrop clicks
    });
    document.body.appendChild(this.overlay);
    // trigger reflow then add visible class for animation
    void this.overlay.offsetWidth;
    this.overlay.classList.add('wt-visible');
    this.render();
  }

  private render(): void {
    if (!this.overlay) return;
    const s = STEPS[this.step];
    const isFirst = this.step === 0;
    const isLast = this.step === STEPS.length - 1;

    const dots = STEPS.map((_, i) =>
      `<span class="wt-dot${i === this.step ? ' wt-active' : ''}"></span>`
    ).join('');

    this.overlay.innerHTML = `
      <div class="wt-card">
        <div class="wt-icon">${s.icon}</div>
        <div class="wt-step-label">${s.title}</div>
        <div class="wt-desc">${s.description}</div>
        <div class="wt-dots">${dots}</div>
        <div class="wt-actions">
          ${!isFirst ? '<button class="wt-btn" data-wt="prev">◀ Geri</button>' : ''}
          <button class="wt-btn" data-wt="skip">Atla</button>
          ${isLast
            ? '<button class="wt-btn wt-primary" data-wt="finish">Bitir ✓</button>'
            : '<button class="wt-btn wt-primary" data-wt="next">İleri ▶</button>'}
        </div>
        <div class="wt-check-row">
          <input type="checkbox" id="wt-no-show" ${this.dontShowAgain ? 'checked' : ''} />
          <label for="wt-no-show">Bir daha gösterme</label>
        </div>
      </div>`;

    // Bind actions
    this.overlay.querySelector('[data-wt="prev"]')?.addEventListener('click', () => {
      this.step--;
      this.render();
    });
    this.overlay.querySelector('[data-wt="next"]')?.addEventListener('click', () => {
      this.step++;
      this.render();
    });
    this.overlay.querySelector('[data-wt="skip"]')?.addEventListener('click', () => this.hide());
    this.overlay.querySelector('[data-wt="finish"]')?.addEventListener('click', () => this.finish());
    this.overlay.querySelector<HTMLInputElement>('#wt-no-show')?.addEventListener('change', (e) => {
      this.dontShowAgain = (e.target as HTMLInputElement).checked;
    });
  }
}
