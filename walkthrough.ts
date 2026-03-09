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
  background: linear-gradient(160deg, rgba(6, 12, 18, 0.92) 0%, rgba(12, 24, 32, 0.88) 100%);
  backdrop-filter: blur(12px) saturate(1.2);
  -webkit-backdrop-filter: blur(12px) saturate(1.2);
  opacity: 0;
  transition: opacity 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  padding: 20px;
}
.wt-overlay.wt-visible { opacity: 1; }

.wt-card {
  background: linear-gradient(165deg,
    rgba(255, 255, 255, 0.08) 0%,
    rgba(255, 255, 255, 0.03) 50%,
    rgba(255, 255, 255, 0.06) 100%);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 24px;
  box-shadow:
    0 24px 48px rgba(0, 0, 0, 0.4),
    0 0 0 1px rgba(255, 255, 255, 0.05) inset,
    0 1px 0 rgba(255, 255, 255, 0.08);
  width: min(440px, 94vw);
  max-height: 90vh;
  overflow: hidden;
  padding: 0;
  text-align: center;
  color: #e8edf2;
  font-family: system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif;
  animation: wt-pop 0.5s cubic-bezier(0.34, 1.2, 0.64, 1) both;
}
@keyframes wt-pop {
  from { transform: scale(0.92) translateY(24px); opacity: 0; }
  to   { transform: scale(1) translateY(0); opacity: 1; }
}

.wt-card-inner {
  padding: clamp(28px, 6vw, 44px) clamp(24px, 5vw, 36px);
}

.wt-icon-wrap {
  width: 80px;
  height: 80px;
  margin: 0 auto 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(145deg, rgba(255,255,255,0.12), rgba(255,255,255,0.04));
  border-radius: 20px;
  border: 1px solid rgba(255,255,255,0.08);
  font-size: 40px;
  line-height: 1;
  animation: wt-icon-in 0.4s cubic-bezier(0.34, 1.2, 0.64, 1) 0.15s both;
}
@keyframes wt-icon-in {
  from { transform: scale(0.6); opacity: 0; }
  to   { transform: scale(1); opacity: 1; }
}

.wt-step-label {
  font-size: 0.7rem;
  font-weight: 600;
  color: rgba(100, 200, 255, 0.9);
  letter-spacing: 2px;
  text-transform: uppercase;
  margin-bottom: 10px;
  animation: wt-fade-up 0.35s ease both;
}
.wt-desc {
  font-size: clamp(1rem, 3.2vw, 1.2rem);
  line-height: 1.55;
  color: rgba(232, 237, 242, 0.92);
  margin-bottom: 28px;
  font-weight: 450;
  animation: wt-fade-up 0.35s ease 0.05s both;
}
@keyframes wt-fade-up {
  from { opacity: 0; transform: translateY(10px); }
  to   { opacity: 1; transform: translateY(0); }
}

/* progress bar + dots */
.wt-progress-wrap {
  margin-bottom: 24px;
}
.wt-progress-bar {
  height: 4px;
  background: rgba(255,255,255,0.08);
  border-radius: 2px;
  overflow: hidden;
  margin-bottom: 14px;
}
.wt-progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #5eb8f0, #7dd3fc);
  border-radius: 2px;
  transition: width 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}
.wt-dots {
  display: flex;
  justify-content: center;
  gap: 10px;
}
.wt-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: rgba(255,255,255,0.2);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
.wt-dot.wt-active {
  background: linear-gradient(135deg, #5eb8f0, #7dd3fc);
  transform: scale(1.35);
  box-shadow: 0 0 12px rgba(94, 184, 240, 0.5);
}

/* buttons */
.wt-actions {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}
.wt-btn {
  font-family: inherit;
  font-size: clamp(0.875rem, 2.6vw, 1rem);
  font-weight: 500;
  padding: 12px 22px;
  border-radius: 14px;
  border: 1px solid rgba(255,255,255,0.15);
  background: rgba(255,255,255,0.06);
  color: rgba(255,255,255,0.95);
  cursor: pointer;
  transition: all 0.2s ease;
  min-height: 44px;
  line-height: 1.2;
}
.wt-btn:active { transform: scale(0.97); }
.wt-btn:hover {
  background: rgba(255,255,255,0.12);
  border-color: rgba(255,255,255,0.2);
}
.wt-btn.wt-primary {
  background: linear-gradient(135deg, rgba(94, 184, 240, 0.35), rgba(125, 211, 252, 0.25));
  border-color: rgba(125, 211, 252, 0.4);
  color: #e0f4ff;
  box-shadow: 0 2px 12px rgba(94, 184, 240, 0.2);
}
.wt-btn.wt-primary:hover {
  background: linear-gradient(135deg, rgba(94, 184, 240, 0.5), rgba(125, 211, 252, 0.35));
  box-shadow: 0 4px 16px rgba(94, 184, 240, 0.3);
}

/* checkbox */
.wt-check-row {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  margin-top: 22px;
  padding-top: 20px;
  border-top: 1px solid rgba(255,255,255,0.06);
  font-size: 0.8rem;
  color: rgba(255,255,255,0.5);
}
.wt-check-row input[type="checkbox"] {
  accent-color: #5eb8f0;
  width: 18px;
  height: 18px;
  cursor: pointer;
  border-radius: 4px;
}
.wt-check-row label { cursor: pointer; user-select: none; }
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
    const progressPercent = ((this.step + 1) / STEPS.length) * 100;

    this.overlay.innerHTML = `
      <div class="wt-card">
        <div class="wt-card-inner">
          <div class="wt-icon-wrap">${s.icon}</div>
          <div class="wt-step-label">${s.title}</div>
          <div class="wt-desc">${s.description}</div>
          <div class="wt-progress-wrap">
            <div class="wt-progress-bar">
              <div class="wt-progress-fill" style="width: ${progressPercent}%"></div>
            </div>
            <div class="wt-dots">${dots}</div>
          </div>
          <div class="wt-actions">
            ${!isFirst ? '<button class="wt-btn" data-wt="prev">← Geri</button>' : ''}
            <button class="wt-btn" data-wt="skip">Atla</button>
            ${isLast
              ? '<button class="wt-btn wt-primary" data-wt="finish">Başla</button>'
              : '<button class="wt-btn wt-primary" data-wt="next">İleri →</button>'}
          </div>
          <div class="wt-check-row">
            <input type="checkbox" id="wt-no-show" ${this.dontShowAgain ? 'checked' : ''} />
            <label for="wt-no-show">Bir daha gösterme</label>
          </div>
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
