const grid = document.getElementById('grid');
const trendingSection = document.getElementById('trending');
const editorSection = document.getElementById('editor');
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const topInput = document.getElementById('topText');
const bottomInput = document.getElementById('bottomText');
const downloadBtn = document.getElementById('downloadBtn');
const shareBtn = document.getElementById('shareBtn');
const backBtn = document.getElementById('backBtn');

let currentMeme = null;
let currentImg = null;

async function loadTrending() {
  try {
    const res = await fetch('/api/trending');
    const data = await res.json();
    renderGrid(data.memes || []);
  } catch (e) {
    grid.textContent = 'Could not load trending memes. Try refreshing.';
  }
}

function renderGrid(memes) {
  if (!memes.length) {
    grid.textContent = 'No trending memes found right now.';
    return;
  }
  grid.innerHTML = '';
  memes.forEach(meme => {
    const tile = document.createElement('div');
    tile.className = 'tile';
    tile.innerHTML = `<img src="${meme.url}" alt="${meme.name}" loading="lazy"><span>${meme.name}</span>`;
    tile.addEventListener('click', () => openEditor(meme));
    grid.appendChild(tile);
  });
}

function openEditor(meme) {
  currentMeme = meme;
  trendingSection.classList.add('hidden');
  editorSection.classList.remove('hidden');
  topInput.value = '';
  bottomInput.value = '';

  currentImg = new Image();
  currentImg.crossOrigin = 'anonymous';
  currentImg.onload = draw;
  currentImg.src = meme.url;
  draw();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function wrapText(text, maxWidth) {
  const words = text.split(' ');
  const lines = [];
  let line = '';
  words.forEach(word => {
    const test = line ? line + ' ' + word : word;
    if (ctx.measureText(test).width > maxWidth && line) {
      lines.push(line);
      line = word;
    } else {
      line = test;
    }
  });
  if (line) lines.push(line);
  return lines;
}

function drawCaption(text, y, direction) {
  if (!text) return;
  const fontSize = Math.max(28, Math.floor(canvas.width / 10));
  ctx.font = `bold ${fontSize}px Impact, 'Arial Black', sans-serif`;
  ctx.textAlign = 'center';
  ctx.fillStyle = '#fff';
  ctx.strokeStyle = '#000';
  ctx.lineWidth = fontSize / 10;

  const upper = text.toUpperCase();
  const lines = wrapText(upper, canvas.width - 24);
  lines.forEach((line, i) => {
    const lineY = direction === 'top'
      ? y + i * (fontSize + 4)
      : y - (lines.length - 1 - i) * (fontSize + 4);
    ctx.strokeText(line, canvas.width / 2, lineY);
    ctx.fillText(line, canvas.width / 2, lineY);
  });
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  if (currentImg && currentImg.complete && currentImg.naturalWidth) {
    const scale = Math.min(canvas.width / currentImg.naturalWidth, canvas.height / currentImg.naturalHeight);
    const w = currentImg.naturalWidth * scale;
    const h = currentImg.naturalHeight * scale;
    const x = (canvas.width - w) / 2;
    const y = (canvas.height - h) / 2;
    ctx.drawImage(currentImg, x, y, w, h);
  }

  const fontSize = Math.max(28, Math.floor(canvas.width / 10));
  drawCaption(topInput.value, fontSize + 10, 'top');
  drawCaption(bottomInput.value, canvas.height - 16, 'bottom');
}

topInput.addEventListener('input', draw);
bottomInput.addEventListener('input', draw);

downloadBtn.addEventListener('click', () => {
  const link = document.createElement('a');
  link.download = `trendy-meme-${Date.now()}.png`;
  link.href = canvas.toDataURL('image/png');
  link.click();
});

shareBtn.addEventListener('click', () => {
  const text = encodeURIComponent('I made this with Trendy Memes 🔥');
  const url = encodeURIComponent(location.href);
  window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`, '_blank');
});

backBtn.addEventListener('click', () => {
  editorSection.classList.add('hidden');
  trendingSection.classList.remove('hidden');
});

loadTrending();
