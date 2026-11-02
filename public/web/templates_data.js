/* Datos de plantillas de memes generadas con Canvas (dominio visual, sin
   acceso a estado ni DOM: cada fn(ctx,w,h) pinta sobre el contexto dado).
   Se usan con puntos de referencia orientativos para el usuario; el buscador
   de plantillas online (Imgflip/Reddit) las complementa. */

export const DEFAULT_MEME_TEMPLATES = [
  {
    n: 'Drake Hotline', w: 900, h: 900,
    fn: (ctx, w, h) => {
      const g = ctx.createLinearGradient(0, 0, w, h);
      g.addColorStop(0, '#121826');
      g.addColorStop(1, '#1d4ed8');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = '#fff';
      ctx.font = '700 52px Arial';
      ctx.fillText('NOPE', 90, 180);
      ctx.fillText('SI', 660, 720);
      ctx.fillStyle = '#fbbf24';
      ctx.fillRect(70, 240, w - 140, 340);
      ctx.fillStyle = '#1f2937';
      ctx.fillRect(70, 320, w - 140, 240);
      ctx.fillStyle = '#fff';
      ctx.fillText('Me gusta', 120, 380);
      ctx.fillText('Me gusta', 120, 440);
      ctx.fillStyle = '#d1d5db';
      ctx.fillRect(120, 560, w - 240, 6);
    }
  },
  {
    n: 'Woman yelling', w: 900, h: 900,
    fn: (ctx, w, h) => {
      ctx.fillStyle = '#f3f3f3';
      ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = '#facc15';
      ctx.fillRect(0, 0, w, h * .45);
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, h * .45, w, h * .55);
      ctx.fillStyle = '#fff';
      ctx.font = '700 46px Arial';
      ctx.fillText('Mujer', 90, 140);
      ctx.fillText('gritando', 90, 190);
      ctx.fillText('Gato', 540, 760);
      ctx.fillText('calmado', 540, 810);
    }
  },
  {
    n: 'Success Kid', w: 900, h: 900,
    fn: (ctx, w, h) => {
      ctx.fillStyle = '#f5d0a9';
      ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = '#f59e0b';
      ctx.beginPath();
      ctx.arc(440, 360, 220, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#111827';
      ctx.fillRect(250, 520, 400, 180);
      ctx.fillStyle = '#fff';
      ctx.font = '700 58px Arial';
      ctx.fillText('¡ÉXITO!', 280, 170);
    }
  },
  {
    n: 'One does not simply', w: 900, h: 900,
    fn: (ctx, w, h) => {
      const sky = ctx.createLinearGradient(0, 0, 0, h);
      sky.addColorStop(0, '#2d2d34');
      sky.addColorStop(1, '#111827');
      ctx.fillStyle = sky;
      ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = '#d1d5db';
      ctx.fillRect(110, 160, 680, 520);
      ctx.fillStyle = '#111827';
      ctx.font = '700 42px Arial';
      ctx.fillText('ONE DOES NOT', 140, 220);
      ctx.fillText('SIMPLY', 250, 280);
      ctx.fillText('Meme', 330, 700);
    }
  },
  {
    n: 'This is fine', w: 900, h: 900,
    fn: (ctx, w, h) => {
      ctx.fillStyle = '#facc15';
      ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = '#1f2937';
      ctx.fillRect(220, 220, 460, 430);
      ctx.fillStyle = '#fbbf24';
      ctx.fillRect(260, 310, 130, 130);
      ctx.fillRect(500, 310, 130, 130);
      ctx.fillStyle = '#111827';
      ctx.fillRect(390, 510, 120, 70);
      ctx.font = '700 56px Arial';
      ctx.fillText('THIS IS FINE', 120, 180);
    }
  },
  {
    n: 'Expanding brain', w: 900, h: 900,
    fn: (ctx, w, h) => {
      ctx.fillStyle = '#1f2937';
      ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = '#f59e0b';
      ctx.fillRect(100, 120, 200, 200);
      ctx.fillRect(320, 180, 200, 200);
      ctx.fillRect(540, 240, 200, 220);
      ctx.fillStyle = '#fff';
      ctx.font = '700 38px Arial';
      ctx.fillText('Idea', 160, 200);
      ctx.fillText('Más', 390, 260);
      ctx.fillText('¡Boom!', 590, 330);
    }
  }
];

export const CINEMATIC_MEME_TEMPLATES = [
  {
    n: 'Cine brutal', w: 900, h: 900,
    fn: (ctx, w, h) => {
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = '#f8fafc';
      ctx.font = '700 52px Arial';
      ctx.fillText('SOLO', 130, 170);
      ctx.fillText('UN POCO', 250, 710);
      ctx.fillStyle = '#ef4444';
      ctx.fillRect(120, 220, 660, 300);
    }
  },
  {
    n: 'Plot twist', w: 900, h: 900,
    fn: (ctx, w, h) => {
      ctx.fillStyle = '#111827';
      ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = '#fbbf24';
      ctx.fillRect(0, 0, w, 140);
      ctx.fillStyle = '#fff';
      ctx.font = '700 48px Arial';
      ctx.fillText('PLOT TWIST', 200, 220);
      ctx.fillText('Meme', 300, 700);
    }
  },
  {
    n: 'Drama', w: 900, h: 900,
    fn: (ctx, w, h) => {
      ctx.fillStyle = '#1f2937';
      ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = '#fcd34d';
      ctx.fillRect(80, 160, 740, 540);
      ctx.fillStyle = '#111827';
      ctx.font = '700 54px Arial';
      ctx.fillText('DRAMA', 280, 300);
    }
  }
];
