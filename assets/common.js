// Helpers partilhados pelo menu (clientes) e pelo painel de gestão (bar).
// Exposto como window.MRC. Sem dependências.
(function (global) {
  'use strict';

  var MAX_TABLES = 50;
  var DEFAULT_TABLES = 12;

  // Escapa texto para ser inserido em innerHTML.
  function esc(v) {
    return String(v == null ? '' : v).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  function fmt(n) {
    n = Number(n);
    if (!isFinite(n)) n = 0;
    return n.toFixed(2).replace('.', ',') + ' €';
  }

  // Aceita Date, timestamp (ms) ou string ISO. Devolve Date válida ou null.
  function parseTime(v) {
    if (v instanceof Date) return isNaN(v.getTime()) ? null : v;
    if (typeof v === 'number' || typeof v === 'string') {
      var d = new Date(v);
      return isNaN(d.getTime()) ? null : d;
    }
    return null;
  }

  function timeHM(v) {
    var d = parseTime(v);
    return d ? d.toLocaleTimeString('pt', { hour: '2-digit', minute: '2-digit' }) : '—';
  }

  // "YYYY-MM-DD" na hora local (para o arquivo e para a estatística "Hoje").
  function localDateKey(v) {
    var d = parseTime(v) || new Date();
    var m = String(d.getMonth() + 1).padStart(2, '0');
    var day = String(d.getDate()).padStart(2, '0');
    return d.getFullYear() + '-' + m + '-' + day;
  }

  // "2,5", "2.5 €", "€ 2,50", "1.250,00" → número. Lixo → 0.
  function parsePrice(s) {
    if (typeof s === 'number') return isFinite(s) ? s : 0;
    var t = String(s == null ? '' : s).replace(/[^\d,.\-]/g, '');
    var hasC = t.indexOf(',') >= 0, hasP = t.indexOf('.') >= 0;
    if (hasC && hasP) {
      t = t.lastIndexOf(',') > t.lastIndexOf('.') ? t.replace(/\./g, '').replace(',', '.') : t.replace(/,/g, '');
    } else if (hasC) {
      t = t.replace(',', '.');
    }
    var n = parseFloat(t);
    return isFinite(n) ? n : 0;
  }

  // items pode chegar como array ou como JSON string (escrito por terceiros).
  function safeJsonArray(v) {
    if (Array.isArray(v)) return v;
    if (typeof v !== 'string') return [];
    try { var a = JSON.parse(v); return Array.isArray(a) ? a : []; } catch (_) { return []; }
  }

  // ── Mesa ↔ URL: base64 do número da mesa (1-based). Mesa 1 → "MQ==" ──
  function encodeTable(n) { return btoa(String(n)); }

  function decodeTable(s) {
    try {
      s = String(s || '').trim().replace(/-/g, '+').replace(/_/g, '/');
      while (s.length % 4) s += '=';
      var txt = atob(s);
      if (!/^\d+$/.test(txt)) return null;
      var n = parseInt(txt, 10);
      return n >= 1 && n <= MAX_TABLES ? n : null;
    } catch (_) { return null; }
  }

  // ?t=<base64> ou #<base64>. Devolve número da mesa (1-based) ou null.
  function tableFromLocation(loc) {
    loc = loc || global.location;
    var raw = new URLSearchParams(loc.search).get('t') || (loc.hash ? loc.hash.slice(1) : '');
    return raw ? decodeTable(raw) : null;
  }

  function tableNames(count) {
    count = Number(count);
    if (!Number.isInteger(count) || count < 1) count = DEFAULT_TABLES;
    count = Math.min(count, MAX_TABLES);
    var out = [];
    for (var i = 0; i < count; i++) out.push('Mesa ' + (i + 1));
    return out;
  }

  function clampTableCount(v, fallback) {
    v = Number(v);
    return Number.isInteger(v) && v >= 1 ? Math.min(v, MAX_TABLES) : fallback;
  }

  // "https://proj-default-rtdb.europe-west1.firebasedatabase.app" → "proj"
  // "https://proj.firebaseio.com" → "proj"
  function projectIdFromDbUrl(url) {
    try { return new URL(url).hostname.split('.')[0].replace(/-default-rtdb$/, ''); }
    catch (_) { return String(url || '').replace(/^https?:\/\//, '').split('.')[0].replace(/-default-rtdb$/, ''); }
  }

  function withTimeout(promise, ms, msg) {
    var t;
    var timeout = new Promise(function (_, rej) {
      t = setTimeout(function () { rej(new Error(msg || 'Tempo esgotado')); }, ms);
    });
    return Promise.race([promise, timeout]).finally(function () { clearTimeout(t); });
  }

  // Mensagens de erro Firebase legíveis.
  function friendlyError(e) {
    var code = (e && (e.code || '')) + '';
    var msg = (e && e.message) || code || 'Erro desconhecido';
    if (code === 'PERMISSION_DENIED' || /permission_denied/i.test(msg)) return 'Sem permissão (regras da base de dados)';
    if (/network|unavailable|disconnected/i.test(msg)) return 'Sem ligação ao servidor';
    if (code === 'auth/invalid-credential' || code === 'auth/wrong-password' || code === 'auth/user-not-found' || code === 'auth/invalid-email') return 'Email ou palavra-passe incorretos';
    if (code === 'auth/operation-not-allowed') return 'Ativa o método Email/Password em Firebase → Authentication → Sign-in method';
    if (code === 'auth/too-many-requests') return 'Demasiadas tentativas — tenta mais tarde';
    if (code === 'auth/network-request-failed') return 'Sem ligação ao servidor';
    if (code === 'auth/user-disabled') return 'Conta desativada';
    return msg.replace(/^Firebase:\s*/, '').replace(/\s*\(auth\/[^)]+\)\.?$/, '');
  }

  global.MRC = {
    MAX_TABLES: MAX_TABLES, DEFAULT_TABLES: DEFAULT_TABLES,
    esc: esc, fmt: fmt, parseTime: parseTime, timeHM: timeHM, localDateKey: localDateKey,
    parsePrice: parsePrice, safeJsonArray: safeJsonArray,
    encodeTable: encodeTable, decodeTable: decodeTable, tableFromLocation: tableFromLocation,
    tableNames: tableNames, clampTableCount: clampTableCount,
    projectIdFromDbUrl: projectIdFromDbUrl, withTimeout: withTimeout, friendlyError: friendlyError
  };
})(window);
