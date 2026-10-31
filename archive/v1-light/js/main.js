/* 入口：等字体就绪后再搭时间线（场景布局需要实测文字宽度） */
(function () {
  'use strict';

  const $ = (id) => document.getElementById(id);

  function boot() {
    const player = new AB.Player({
      app: document.querySelector('.app'),
      stage: $('stage'),
      cover: $('cover'),
      start: $('btn-start'),
      chapter: $('crumb-chapter'),
      sceneTitle: $('crumb-scene'),
      stepCount: $('step-count'),
      source: $('source'),
      narration: $('narration-text'),
      play: $('btn-play'),
      prev: $('btn-prev'),
      next: $('btn-next'),
      time: $('time'),
      timeline: $('timeline'),
      fill: $('fill'),
      knob: $('knob'),
      markers: $('markers'),
      tip: $('tip'),
      speed: $('speed'),
    });
    player.build();
  }

  const ready = document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve();
  ready.then(boot);
})();
