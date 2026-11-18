import { getUser, logout, api } from './api.js';

export const SUBJECTS = [
  'Matematika', 'Fisika', 'Kimia', 'Biologi',
  'Bahasa Indonesia', 'Bahasa Inggris', 'Sejarah', 'Geografi',
  'Ekonomi', 'Sosiologi', 'TIK/Informatika', 'PPKn'
];
export const JENJANGS = ['SD', 'SMP', 'SMA'];

export function fmtDateTime(iso) {
  if (!iso) return '-';
  try {
    const d = new Date(iso);
    return d.toLocaleString('id-ID', {
      weekday: 'short', day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  } catch { return iso; }
}

export function statusChip(status) {
  const map = {
    pending:   { c: 'amber', t: 'Menunggu konfirmasi' },
    confirmed: { c: 'green', t: 'Dikonfirmasi' },
    rejected:  { c: 'red',   t: 'Ditolak' },
    completed: { c: '',      t: 'Selesai' },
    cancelled: { c: 'red',   t: 'Dibatalkan' },
  };
  const m = map[status] || { c: '', t: status };
  return `<span class="chip ${m.c}">${m.t}</span>`;
}

export function stars(n) {
  const r = Math.round(Number(n) || 0);
  return `<span class="rating-stars">${'★'.repeat(r)}<span class="off">${'★'.repeat(5-r)}</span></span>`;
}

export function toast(msg, type = 'info') {
  const el = document.createElement('div');
  el.className = `alert alert-${type === 'error' ? 'error' : type === 'success' ? 'success' : 'info'}`;
  el.style.cssText = 'position:fixed;top:24px;right:24px;z-index:1000;max-width:360px;box-shadow:0 10px 30px rgba(20,35,27,0.15);';
  el.textContent = msg;
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 3800);
}

const SIDEBAR_SISWA = [
  { href: '/pages/dashboard.html', label: 'Dashboard',       icon: svgHome() },
  { href: '/pages/cari-tutor.html', label: 'Cari Tutor',      icon: svgSearch() },
  { href: '/pages/sesi.html',       label: 'Sesi Belajar',    icon: svgCal() },
  { href: '/pages/materi.html',     label: 'Bank Materi',     icon: svgBook() },
  { href: '/pages/progress.html',   label: 'Progress Belajar', icon: svgChart() },
  { href: '/pages/profil.html',     label: 'Profil Saya',     icon: svgUser() },
];
const SIDEBAR_TUTOR = [
  { href: '/pages/dashboard.html',  label: 'Dashboard',        icon: svgHome() },
  { href: '/pages/cari-siswa.html', label: 'Cari Siswa',       icon: svgSearch() },
  { href: '/pages/sesi.html',       label: 'Jadwal Sesi',      icon: svgCal() },
  { href: '/pages/materi.html',     label: 'Bank Materi',      icon: svgBook() },
  { href: '/pages/poin.html',       label: 'Poin & Sertifikat', icon: svgTrophy() },
  { href: '/pages/profil.html',     label: 'Profil Saya',      icon: svgUser() },
];

export function renderSidebar(activeHref) {
  const user = getUser();
  if (!user) return '';
  const items = user.role === 'siswa' ? SIDEBAR_SISWA : SIDEBAR_TUTOR;
  const roleLabel = user.role === 'siswa' ? 'Siswa' : 'Tutor / Volunteer';
  return `
    <aside class="sidebar">
      <a href="/index.html" class="brand">
        <img src="/static/assets/logo-mark.svg" alt="">
        <span>Peerly</span>
      </a>
      <span class="role-chip">${roleLabel}</span>
      <nav style="margin-top:18px;">
        <ul>
          ${items.map(it => `
            <li>
              <a href="${it.href}" class="${activeHref === it.href ? 'active' : ''}">
                <span class="ico">${it.icon}</span>
                <span>${it.label}</span>
              </a>
            </li>`).join('')}
        </ul>
      </nav>
      <div class="user-foot">
        <div class="name">${escapeHtml(user.name)}</div>
        <div>${escapeHtml(user.email)}</div>
        <a href="#" id="logoutBtn" style="margin-top:6px; display:inline-block;">Keluar</a>
      </div>
    </aside>
  `;
}

export function mountShell(activeHref) {
  const shell = document.getElementById('shell');
  if (!shell) return;
  shell.innerHTML = `
    ${renderSidebar(activeHref)}
    <div class="main" id="mainContent"></div>
  `;
  document.getElementById('logoutBtn')?.addEventListener('click', e => {
    e.preventDefault();
    logout();
  });
}

export async function renderNotifBell() {
  try {
    const { notifications } = await api('/api/notifications');
    const unread = notifications.filter(n => !n.read_at).length;
    return `
      <a href="/pages/notifikasi.html" class="notif-bell">
        Notifikasi
        ${unread ? `<span class="dot" title="${unread} belum dibaca"></span>` : ''}
      </a>
    `;
  } catch { return ''; }
}

export function escapeHtml(s) {
  return String(s || '').replace(/[&<>"']/g, c => ({
    '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;'
  }[c]));
}

function svgHome() { return `<svg viewBox="0 0 24 24" fill="none" stroke="#1F3D2E" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M3 11l9-7 9 7v9a2 2 0 0 1-2 2h-4v-7h-6v7H5a2 2 0 0 1-2-2v-9z"/></svg>`; }
function svgSearch() { return `<svg viewBox="0 0 24 24" fill="none" stroke="#1F3D2E" stroke-width="1.6" stroke-linecap="round"><circle cx="11" cy="11" r="6"/><path d="M20 20l-3.5-3.5"/></svg>`; }
function svgCal() { return `<svg viewBox="0 0 24 24" fill="none" stroke="#1F3D2E" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/></svg>`; }
function svgBook() { return `<svg viewBox="0 0 24 24" fill="none" stroke="#1F3D2E" stroke-width="1.6" stroke-linejoin="round" stroke-linecap="round"><path d="M4 5a2 2 0 0 1 2-2h12v18H6a2 2 0 0 1-2-2V5z"/><path d="M8 7h8M8 11h8M8 15h5"/></svg>`; }
function svgChart() { return `<svg viewBox="0 0 24 24" fill="none" stroke="#1F3D2E" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/></svg>`; }
function svgUser() { return `<svg viewBox="0 0 24 24" fill="none" stroke="#1F3D2E" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 4-6 8-6s8 2 8 6"/></svg>`; }
function svgTrophy() { return `<svg viewBox="0 0 24 24" fill="none" stroke="#1F3D2E" stroke-width="1.6" stroke-linejoin="round" stroke-linecap="round"><path d="M7 4h10v4a5 5 0 0 1-10 0V4z"/><path d="M17 6h3v2a3 3 0 0 1-3 3M7 6H4v2a3 3 0 0 0 3 3M9 17h6l1 4H8l1-4zM12 13v4"/></svg>`; }
