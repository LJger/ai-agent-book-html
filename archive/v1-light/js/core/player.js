/*
 * 播放器：把所有场景的步骤串成一条 GSAP 主时间线。
 * 默认连续播放；可暂停、上一步/下一步、点击或拖动进度条跳转、调速。
 *
 * 场景格式（见 js/scenes/）：
 *   AB.registerScene({ id, chapter, title, source, setup(layer, kit) → refs, steps: [{ narration, build(tl, refs, kit, cue) }] })
 * 每一步的时长 = max(动画时长 + 最短停留, 旁白阅读时间)。
 * cue('某个词') 返回读者按阅读速度读到这个词的时刻，场景用它让画面跟着旁白走。
 */
(function (AB) {
  'use strict';

  const READ_CHARS_PER_SEC = 5; // 旁白阅读速度（字/秒），决定每一步停留多久
  const READ_EXTRA = 1.2; // 每段旁白额外停留（秒）
  const MIN_HOLD = 1.5; // 动画播完后至少停留（秒）
  const SCENE_FADE = 0.6; // 场景切换的淡出/淡入时长（秒）
  const EPS = 1e-3;

  const registry = [];
  AB.registerScene = (scene) => registry.push(scene);

  const readingTime = (s) => s.replace(/\s/g, '').length / READ_CHARS_PER_SEC + READ_EXTRA;

  const fmt = (sec) => {
    const s = Math.max(0, Math.round(sec));
    return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
  };

  class Player {
    constructor(dom) {
      this.dom = dom;
      this.current = -1;
      this.scrubbing = false;
      this.resumeAfterScrub = false;
    }

    build() {
      const master = gsap.timeline({
        paused: true,
        onUpdate: () => this.sync(),
        onComplete: () => { master.pause(); this.sync(); },
      });
      this.master = master;
      this.steps = [];
      this.scenes = [];
      let cursor = 0;

      registry.forEach((scene, si) => {
        const layer = AB.kit.g(this.dom.stage, { 'data-scene': scene.id });
        const refs = scene.setup(layer, AB.kit) || {};
        const sceneStart = cursor;

        if (si === 0) {
          gsap.set(layer, { autoAlpha: 1 });
        } else {
          gsap.set(layer, { autoAlpha: 0 });
          master.to(this.scenes[si - 1].layer, { autoAlpha: 0, duration: SCENE_FADE }, cursor);
          master.to(layer, { autoAlpha: 1, duration: SCENE_FADE }, cursor + SCENE_FADE / 2);
          cursor += SCENE_FADE * 1.5;
        }

        scene.steps.forEach((step, k) => {
          // 先挂到暂停的主时间线上再往里加动画，避免 set() 在搭建阶段就立即生效
          const tl = gsap.timeline();
          master.add(tl, cursor);
          const cue = (word) => {
            const at = step.narration.indexOf(word);
            if (at < 0) {
              console.warn(`[${scene.id}] 旁白中找不到提示词「${word}」，这段动画改为接在末尾`);
              return tl.duration();
            }
            return step.narration.slice(0, at).replace(/\s/g, '').length / READ_CHARS_PER_SEC;
          };
          step.build(tl, refs, AB.kit, cue);
          const buildEnd = cursor + tl.duration();
          const end = Math.max(buildEnd + MIN_HOLD, cursor + readingTime(step.narration));
          this.steps.push({
            scene: si,
            index: k,
            start: k === 0 ? sceneStart : cursor,
            buildEnd,
            end,
            narration: step.narration,
            source: step.source || scene.source,
          });
          cursor = end;
        });

        this.scenes.push({ scene, layer, start: sceneStart, end: cursor });
      });

      master.set({}, {}, cursor); // 让总时长覆盖最后一步的停留
      this.duration = master.duration();
      this.buildMarkers();
      this.bindControls();
      this.sync();
    }

    indexAt(t) {
      let i = 0;
      while (i + 1 < this.steps.length && this.steps[i + 1].start <= t + EPS) i++;
      return i;
    }

    isEnded() {
      return this.master.time() >= this.duration - EPS;
    }

    sync() {
      const t = this.master.time();
      const i = this.indexAt(t);
      if (i !== this.current) {
        this.current = i;
        this.renderStep(this.steps[i]);
      }
      const pct = this.duration ? (t / this.duration) * 100 : 0;
      this.dom.fill.style.width = `${pct}%`;
      this.dom.knob.style.left = `${pct}%`;
      this.dom.time.textContent = `${fmt(t)} / ${fmt(this.duration)}`;
      const ended = this.isEnded();
      this.dom.app.classList.toggle('is-playing', !this.master.paused() && !ended);
      this.dom.app.classList.toggle('is-ended', ended);
    }

    renderStep(s) {
      const { scene } = this.scenes[s.scene];
      const d = this.dom;
      d.chapter.textContent = scene.chapter;
      d.sceneTitle.textContent = scene.title;
      d.stepCount.textContent = `第 ${s.index + 1} / ${scene.steps.length} 步`;
      d.source.textContent = s.source;
      d.narration.textContent = s.narration;
      d.narration.classList.remove('enter');
      void d.narration.offsetWidth; // 重新触发旁白的入场动画
      d.narration.classList.add('enter');
    }

    // ── 播放控制 ──

    start(autoplay = true) {
      this.dom.cover.classList.add('hidden');
      if (autoplay) this.play();
    }

    play() {
      if (this.isEnded()) this.master.restart();
      else this.master.play();
      this.sync();
    }

    pause() {
      this.master.pause();
      this.sync();
    }

    toggle() {
      if (this.master.paused() || this.isEnded()) this.play();
      else this.pause();
    }

    seek(t) {
      this.master.seek(Math.min(this.duration, Math.max(0, t)));
      this.sync();
    }

    // 播放中：跳到下一步开头接着播；暂停时：直接显示下一步动画完成后的画面
    next() {
      const i = this.indexAt(this.master.time());
      if (i + 1 >= this.steps.length) {
        this.seek(this.duration);
        return;
      }
      const s = this.steps[i + 1];
      this.seek(this.master.paused() ? s.buildEnd : s.start);
    }

    prev() {
      const t = this.master.time();
      const i = this.indexAt(t);
      const s = this.steps[i];
      if (this.master.paused() || this.isEnded()) {
        this.seek(i > 0 ? this.steps[i - 1].buildEnd : 0);
      } else if (t - s.start > 2 || i === 0) {
        this.seek(s.start);
      } else {
        this.seek(this.steps[i - 1].start);
      }
    }

    // ── 进度条 ──

    buildMarkers() {
      const box = this.dom.markers;
      const pct = (t) => `${(t / this.duration) * 100}%`;
      box.innerHTML = '';
      let lastChapter = null;
      this.scenes.forEach((info) => {
        const isChapter = info.scene.chapter !== lastChapter;
        lastChapter = info.scene.chapter;
        const m = document.createElement('div');
        m.className = `mk ${isChapter ? 'chapter' : 'scene'}`;
        m.style.left = pct(info.start);
        if (isChapter) {
          const lbl = document.createElement('span');
          lbl.className = 'lbl';
          lbl.textContent = info.scene.chapter.split(' ')[0]; // 只显示"第一章"
          m.appendChild(lbl);
        }
        box.appendChild(m);
      });
      this.steps.forEach((s) => {
        if (s.index === 0) return; // 场景起点已经有刻度
        const dot = document.createElement('div');
        dot.className = 'mk step';
        dot.style.left = pct(s.start);
        box.appendChild(dot);
      });
    }

    showTip(t, clientX) {
      const s = this.steps[this.indexAt(t)];
      const { scene } = this.scenes[s.scene];
      const r = this.dom.timeline.getBoundingClientRect();
      this.dom.tip.textContent = `${scene.title} · 第 ${s.index + 1} 步 · ${fmt(t)}`;
      this.dom.tip.style.left = `${clientX - r.left}px`;
      this.dom.tip.classList.add('show');
    }

    bindControls() {
      const d = this.dom;

      // 鼠标点按钮时不让按钮抢走焦点，空格键就始终用于播放/暂停
      d.app.querySelectorAll('button').forEach((b) => b.addEventListener('mousedown', (e) => e.preventDefault()));
      d.start.addEventListener('click', () => this.start());
      d.play.addEventListener('click', () => this.toggle());
      d.prev.addEventListener('click', () => this.prev());
      d.next.addEventListener('click', () => this.next());
      d.speed.addEventListener('change', () => {
        this.master.timeScale(parseFloat(d.speed.value));
        d.speed.blur(); // 交还焦点，空格键继续用于播放/暂停
      });

      const timeAt = (e) => {
        const r = d.timeline.getBoundingClientRect();
        return Math.min(1, Math.max(0, (e.clientX - r.left) / r.width)) * this.duration;
      };
      d.timeline.addEventListener('pointerdown', (e) => {
        if (!d.cover.classList.contains('hidden')) this.start(false);
        this.scrubbing = true;
        this.resumeAfterScrub = !this.master.paused() && !this.isEnded();
        this.master.pause();
        d.timeline.setPointerCapture(e.pointerId);
        this.seek(timeAt(e));
      });
      d.timeline.addEventListener('pointermove', (e) => {
        const t = timeAt(e);
        this.showTip(t, e.clientX);
        if (this.scrubbing) this.seek(t);
      });
      const endScrub = () => {
        if (!this.scrubbing) return;
        this.scrubbing = false;
        if (this.resumeAfterScrub) this.master.play();
        this.sync();
      };
      d.timeline.addEventListener('pointerup', endScrub);
      d.timeline.addEventListener('pointercancel', endScrub);
      d.timeline.addEventListener('pointerleave', () => d.tip.classList.remove('show'));

      document.addEventListener('keydown', (e) => this.onKey(e));
    }

    onKey(e) {
      const tag = e.target && e.target.tagName;
      if (tag === 'SELECT' || tag === 'INPUT' || tag === 'TEXTAREA') return;
      // 用 Tab 聚焦到按钮时，空格/回车交给按钮本身
      if (tag === 'BUTTON' && (e.key === ' ' || e.key === 'Enter')) return;
      const onCover = !this.dom.cover.classList.contains('hidden');

      if (e.key === ' ') {
        e.preventDefault();
        if (onCover) this.start();
        else this.toggle();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        if (onCover) {
          this.start(false);
          this.seek(this.steps[0].buildEnd);
        } else {
          this.next();
        }
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        if (!onCover) this.prev();
      }
    }
  }

  AB.Player = Player;
})(window.AB = window.AB || {});
