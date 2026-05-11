// script-admin.js - Versión Simple

window.selectPage = function(page) {
  const contentFrame = document.getElementById('contentFrame');
  if (contentFrame) {
    contentFrame.src = page;
    document.getElementById('topbarTitle').textContent = 'Editando: ' + page;
    document.getElementById('btnSave').style.display = 'inline-block';
    document.getElementById('pageOverlay').classList.remove('show');
  }
};

document.addEventListener('DOMContentLoaded', () => {

  const loginWrapper = document.getElementById('loginWrapper');
  const adminWrapper = document.getElementById('adminWrapper');
  const loginForm = document.getElementById('adminLoginForm');
  const loginMsg = document.getElementById('adminLoginMsg');
  const topbarTitle = document.getElementById('topbarTitle');
  const contentFrame = document.getElementById('contentFrame');
  const btnSave = document.getElementById('btnSave');
  const btnLogout = document.getElementById('btnLogout');
  const pageOverlay = document.getElementById('pageOverlay');
  const pageGridContent = document.getElementById('pageGridContent');
  const toastContainer = document.getElementById('toastContainer');

  const ADMIN_EMAIL = 'fixlabcyl@gmail.com';
  const ADMIN_PASS = 'Skibidi67';
  const SESSION_KEY = 'fixlab_admin_session';

  // Toast
  function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = 'toast ' + type;
    toast.innerHTML = '<span>' + message + '</span>';
    if (toastContainer) toastContainer.appendChild(toast);
    setTimeout(() => { if (toast.parentNode) toast.remove(); }, 3000);
  }

  // Login
  if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const email = (e.target.email.value || '').trim().toLowerCase();
      const pass = e.target.password.value || '';
      if (email === ADMIN_EMAIL && pass === ADMIN_PASS) {
        localStorage.setItem(SESSION_KEY, 'true');
        if (loginWrapper) loginWrapper.style.display = 'none';
        if (adminWrapper) adminWrapper.style.display = 'flex';
        if (topbarTitle) topbarTitle.textContent = 'Dashboard';
        if (contentFrame) contentFrame.src = 'index.html';
        showToast('Sesión iniciada', 'success');
      } else {
        if (loginMsg) { loginMsg.textContent = 'Error'; loginMsg.style.color = '#ef4444'; }
      }
    });
  }

  // Logout
  if (btnLogout) {
    btnLogout.addEventListener('click', () => {
      localStorage.removeItem(SESSION_KEY);
      if (adminWrapper) adminWrapper.style.display = 'none';
      if (loginWrapper) loginWrapper.style.display = 'flex';
    });
  }

  // Show page selector
  function showPageSelector() {
    if (!pageGridContent || !pageOverlay) return;

    const pages = [
      { file: 'index.html', name: 'Inicio' },
      { file: 'servicios.html', name: 'Servicios' },
      { file: 'tiendas.html', name: 'Tiendas' },
      { file: 'tienda.html', name: 'Tienda' },
      { file: 'contacto.html', name: 'Contacto' },
      { file: 'servicio-pantalla.html', name: 'Pantalla' },
      { file: 'servicio-bateria.html', name: 'Batería' },
      { file: 'servicio-camara.html', name: 'Cámara' },
      { file: 'servicio-conector.html', name: 'Conector' },
      { file: 'servicio-agua.html', name: 'Agua' },
      { file: 'tienda-rio-shopping.html', name: 'Río Shopping' },
      { file: 'tienda-centro.html', name: 'Centro' },
      { file: 'tienda-burgos.html', name: 'Burgos' }
    ];

    let html = '';
    pages.forEach(p => {
      html += '<div class="page-card" onclick="window.selectPage(\'' + p.file + '\')"><h3>' + p.name + '</h3><p>' + p.file + '</p></div>';
    });

    pageGridContent.innerHTML = html;
    pageOverlay.classList.add('show');
    if (topbarTitle) topbarTitle.textContent = 'Seleccionar página';
  }

  // Navigation
  document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', () => {
      document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
      item.classList.add('active');

      const section = item.dataset.section;
      if (section === 'dashboard') {
        if (topbarTitle) topbarTitle.textContent = 'Dashboard';
        if (contentFrame) contentFrame.src = 'index.html';
        if (pageOverlay) pageOverlay.classList.remove('show');
      } else if (section === 'pages') {
        showPageSelector();
      } else if (section === 'database') {
        if (topbarTitle) topbarTitle.textContent = 'Base de Datos';
        if (pageOverlay) pageOverlay.classList.remove('show');
        if (btnSave) btnSave.style.display = 'none';
        // Load database view with visual tables
        const html = '<!DOCTYPE html><html><head><meta charset="UTF-8"><style>*{box-sizing:border-box;margin:0;padding:0}body{font-family:Inter,Arial;padding:2rem;background:#0f172a;color:#e2e8f0;min-height:100vh}.header{margin-bottom:3rem;text-align:center}.header h2{margin:0 0 0.5rem 0;font-size:2rem;color:#fff}.header p{color:#94a3b8;font-size:1rem}.stats{display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:1.5rem;margin-bottom:3rem}.stat-card{background:linear-gradient(135deg,#1e293b 0%,#334155 100%);padding:1.5rem;border-radius:16px;border:1px solid #334155;display:flex;align-items:center;gap:1rem}.stat-icon{width:48px;height:48px;border-radius:12px;display:flex;align-items:center;justify-content:center;font-size:1.5rem}.stat-icon.users{background:rgba(59,130,246,0.2)}.stat-icon.reservations{background:rgba(16,185,129,0.2)}.stat-icon.session{background:rgba(245,158,11,0.2)}.stat-icon.settings{background:rgba(139,92,246,0.2)}.stat-info{flex:1}.stat-n{font-size:2rem;font-weight:700;color:#fff;line-height:1}.stat-l{font-size:0.85rem;color:#94a3b8;margin-top:0.25rem}.collection{background:#1e293b;border-radius:16px;padding:1.5rem;margin-bottom:2rem;border:1px solid #334155}.collection-header{display:flex;align-items:center;justify-content:space-between;margin-bottom:1.5rem;padding-bottom:1rem;border-bottom:1px solid #334155}.collection-title{display:flex;align-items:center;gap:0.75rem}.collection-title h3{margin:0;font-size:1.1rem;color:#fff}.collection-badge{background:#3d63db;color:#fff;padding:0.25rem 0.75rem;border-radius:20px;font-size:0.8rem;font-weight:600}.visual-table{width:100%;border-collapse:collapse;font-size:0.85rem}.visual-table thead{background:#0f172a}.visual-table th{padding:0.75rem 1rem;text-align:left;border-bottom:2px solid #334155;font-weight:600;color:#94a3b8}.visual-table td{padding:0.75rem 1rem;border-bottom:1px solid #334155;color:#cbd5e1}.visual-table tr:hover td{background:rgba(255,255,255,0.02)}.field-value{color:#e2e8f0}.empty{text-align:center;padding:3rem 1rem;color:#64748b}.empty-icon{font-size:3rem;margin-bottom:1rem}</style></head><body><div class="header"><h2>🗄️ Base de Datos FixLabDB</h2><p>Registros en localStorage</p></div><div id="stats"></div><div id="collections"></div><script>const collections={"USERS":{"key":"fixlab_db_users","icon":"👥","cls":"users"},"RESERVATIONS":{"key":"fixlab_db_reservations","icon":"📋","cls":"reservations"},"SESSION":{"key":"fixlab_db_session","icon":"🔐","cls":"session"},"SETTINGS":{"key":"fixlab_db_settings","icon":"⚙️","cls":"settings"}};let s="";Object.entries(collections).forEach(([n,i])=>{const d=JSON.parse(localStorage.getItem(i.key)||"[]");s+=\'<div class="stat-card"><div class="stat-icon \'+i.cls+\'">\'+i.icon+\'</div><div class="stat-info"><div class="stat-n">\'+d.length+\'</div><div class="stat-l">\'+n+\'</div></div></div>\'});document.getElementById("stats").innerHTML=s;let c="";Object.entries(collections).forEach(([n,i])=>{const d=JSON.parse(localStorage.getItem(i.key)||"[]");c+=\'<div class="collection"><div class="collection-header"><div class="collection-title"><h3>\'+i.icon+\' \'+n+\'</h3><span class="collection-badge">\'+d.length+\' registros</span></div></div>\';if(d.length>0){if(d[0]&&typeof d[0]==="object"){const keys=Object.keys(d[0]);c+=\'<table class="visual-table"><thead><tr>\';keys.forEach(k=>{c+="<th>"+k+"</th>"});c+="</tr></thead><tbody>";d.forEach(item=>{c+="<tr>";keys.forEach(k=>{let v=item[k];if(typeof v==="object")v=JSON.stringify(v);c+=\'<td class="field-value">\'+(v||"-")+\'</td>\'});c+="</tr>"});c+="</tbody></table>"}else{c+=\'<table class="visual-table"><thead><tr><th>Valor</th></tr></thead><tbody>\';d.forEach(item=>{c+=\'<tr><td class="field-value">\'+JSON.stringify(item)+\'</td></tr>\'});c+="</tbody></table>"}}else{c+=\'<div class="empty"><div class="empty-icon">📭</div><p>No hay registros</p></div>\'}c+="</div>"});document.getElementById("collections").innerHTML=c;</script></body></html>';
        if (contentFrame) contentFrame.srcdoc = html;
      }
    });
  });

  // Close overlay
  if (pageOverlay) {
    pageOverlay.addEventListener('click', (e) => {
      if (e.target === pageOverlay) {
        pageOverlay.classList.remove('show');
        if (topbarTitle) topbarTitle.textContent = 'Dashboard';
        if (contentFrame) contentFrame.src = 'index.html';
      }
    });
  }

  // Save
  if (btnSave) {
    btnSave.addEventListener('click', () => {
      showToast('Guardado (simulado)', 'success');
    });
  }

  // Auto-login
  if (localStorage.getItem(SESSION_KEY) === 'true') {
    if (loginWrapper) loginWrapper.style.display = 'none';
    if (adminWrapper) adminWrapper.style.display = 'flex';
    if (topbarTitle) topbarTitle.textContent = 'Dashboard';
    if (contentFrame) contentFrame.src = 'index.html';
  }

});
