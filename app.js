/* Hiya's 18th — interactions: stars, surprise gate, confetti, candles, reveals */
(function(){
'use strict';

function $(id){ return document.getElementById(id); }

/* ---------- twinkling stars ---------- */
(function stars(){
  var box = $('stars');
  if(!box) return;
  var n = 70;
  for(var i = 0; i < n; i++){
    var s = document.createElement('div');
    s.className = 'star';
    var sz = (Math.random() * 2 + 1).toFixed(1);
    s.style.width = s.style.height = sz + 'px';
    s.style.left = (Math.random() * 100) + '%';
    s.style.top = (Math.random() * 100) + '%';
    s.style.animationDelay = (Math.random() * 3).toFixed(2) + 's';
    box.appendChild(s);
  }
})();

/* ---------- confetti (dependency-free canvas) ---------- */
var confetti = (function(){
  var cv = $('confetti'), ctx = cv.getContext('2d'), parts = [], raf = null;
  var rafFn = window.requestAnimationFrame || function(fn){ return setTimeout(fn, 16); };
  var COLORS = ['#a8823c','#d4af6a','#1c1a17','#e8e4de','#c48a8a','#8a9a5b'];
  function size(){ cv.width = window.innerWidth; cv.height = window.innerHeight; }
  size();
  window.addEventListener('resize', size);
  function burst(x, y, count){
    if(!ctx) return;
    for(var i = 0; i < (count || 90); i++){
      parts.push({
        x: x === undefined ? Math.random() * cv.width : x,
        y: y === undefined ? -20 : y,
        vx: (Math.random() - 0.5) * 9,
        vy: Math.random() * 5 + 2.5,
        w: Math.random() * 8 + 4, h: Math.random() * 5 + 3,
        r: Math.random() * Math.PI, vr: (Math.random() - 0.5) * 0.3,
        c: COLORS[(Math.random() * COLORS.length) | 0],
        life: 1, decay: Math.random() * 0.006 + 0.004
      });
    }
    if(!raf) tick();
  }
  function tick(){
    ctx.clearRect(0, 0, cv.width, cv.height);
    parts = parts.filter(function(p){ return p.life > 0 && p.y < cv.height + 40; });
    parts.forEach(function(p){
      p.x += p.vx; p.y += p.vy; p.vy += 0.12; p.r += p.vr; p.life -= p.decay;
      ctx.save();
      ctx.globalAlpha = Math.max(p.life, 0);
      ctx.translate(p.x, p.y); ctx.rotate(p.r);
      ctx.fillStyle = p.c;
      ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
      ctx.restore();
    });
    raf = parts.length ? rafFn(tick) : null;
    if(!raf) ctx.clearRect(0, 0, cv.width, cv.height);
  }
  return { burst: burst };
})();

/* ---------- surprise gate ---------- */
var opened = false;
function openSurprise(){
  if(opened) return;
  opened = true;
  $('gate').classList.add('gone');
  $('main').classList.remove('hidden');
  window.scrollTo(0, 0);
  // celebration!
  confetti.burst();
  setTimeout(function(){ confetti.burst(); }, 700);
  setTimeout(function(){ confetti.burst(); }, 1400);
}
$('openBtn').addEventListener('click', openSurprise);
$('giftBtn').addEventListener('click', openSurprise);

/* ---------- candles: tap to blow out ---------- */
var candlesOut = 0;
var candles = Array.prototype.slice.call(document.querySelectorAll('.candle'));
candles.forEach(function(c){
  c.addEventListener('click', function(ev){
    ev.stopPropagation();
    if(c.classList.contains('out')) return;
    c.classList.add('out');
    candlesOut++;
    var left = candles.length - candlesOut;
    if(left > 0){
      $('wishHint').textContent = left === 1 ? 'One more candle…' : left + ' candles to go…';
    } else {
      $('wishHint').classList.add('hidden');
      $('wishDone').classList.remove('hidden');
      var r = c.getBoundingClientRect();
      confetti.burst(r.left + r.width / 2, r.top, 70);
      setTimeout(function(){ confetti.burst(); }, 500);
    }
  });
});

/* ---------- scroll reveals + XP bar ---------- */
var xpDone = false;
function onSeen(el){
  el.classList.add('seen');
  if(el.querySelector && el.querySelector('#xpFill') && !xpDone){
    xpDone = true;
    setTimeout(function(){ $('xpFill').style.width = '100%'; }, 350);
  }
}
if('IntersectionObserver' in window){
  var io = new IntersectionObserver(function(entries){
    entries.forEach(function(e){
      if(e.isIntersecting){ onSeen(e.target); io.unobserve(e.target); }
    });
  }, { threshold: 0.18 });
  Array.prototype.forEach.call(document.querySelectorAll('.card'), function(c){ io.observe(c); });
} else {
  Array.prototype.forEach.call(document.querySelectorAll('.card'), onSeen);
}

/* ---------- replay ---------- */
$('replayBtn').addEventListener('click', function(){
  confetti.burst();
  setTimeout(function(){ confetti.burst(); }, 600);
  // relight candles for another wish
  candles.forEach(function(c){ c.classList.remove('out'); });
  candlesOut = 0;
  $('wishDone').classList.add('hidden');
  var wh = $('wishHint');
  wh.classList.remove('hidden');
  wh.textContent = 'Make another wish… then tap each candle to blow it out 🕯️';
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

/* ---------- service worker ---------- */
if('serviceWorker' in navigator){
  window.addEventListener('load', function(){
    navigator.serviceWorker.register('sw.js').catch(function(){});
  });
}
})();
