// ========== CONFIGURACIÓN ==========
const MOCKAPI_USERS_URL = 'https://69d75f459c5ebb0918c77973.mockapi.io/jxxl/dox/1809284927309381080812098492848102984098120840921/92019301920390129039120/Bsz/User';
const MOCKAPI_POSTS_URL = 'https://69d75f459c5ebb0918c77973.mockapi.io/jxxl/dox/1809284927309381080812098492848102984098120840921/92019301920390129039120/Bsz/post';
const SUPABASE_URL = 'https://tvjmfuaaydjepogtizrx.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR2am1mdWFheWRqZXBvZ3RpenJ4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU3MjI2OTYsImV4cCI6MjA5MTI5ODY5Nn0.sO2FdTEhKSzYQekGU6aFwllv_Uxu1V7_PIjGpilwe54';

let refreshInterval = null;

// ========== SANITIZACIÓN ==========
function sanitizeHTML(str) {
    if (!str) return '';
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;');
}

function formatDescription(text) {
    if (!text) return 'Sin descripción';
    let sanitized = sanitizeHTML(text);
    let formatted = sanitized.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    formatted = formatted.replace(/\n/g, '<br>');
    return formatted;
}

// ========== EFECTOS VISUALES ==========
const canvas = document.getElementById('matrix-bg');
const ctx = canvas.getContext('2d');

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

const chars = 'JXLL01アイウエカキクケ10ABCDEF!@#$%<>?/|[]{}';
const fontSize = 13;
let drops = Array.from({ length: Math.floor(window.innerWidth / fontSize) }, () => Math.random() * -100);

function drawMatrix() {
    ctx.fillStyle = 'rgba(0,0,0,0.05)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.font = fontSize + 'px "Courier New",monospace';
    drops.forEach((y, i) => {
        ctx.fillStyle = Math.random() > 0.95 ? '#FF0000' : '#8B0000';
        ctx.fillText(chars[Math.floor(Math.random() * chars.length)], i * fontSize, y * fontSize);
        if (y * fontSize > canvas.height && Math.random() > 0.975) drops[i] = 0;
        drops[i] += 0.4;
    });
}
setInterval(drawMatrix, 55);

// ========== LOADER ==========
window.addEventListener('load', () => {
    setTimeout(() => {
        const loader = document.getElementById('loader');
        if (loader) loader.classList.add('hide');
    }, 2800);
});

// ========== NAVEGACIÓN ==========
const toggleBtn = document.getElementById('menuToggle');
const navList = document.getElementById('navList');
if (toggleBtn && navList) {
    toggleBtn.addEventListener('click', () => navList.classList.toggle('show'));
}

const avatarLink = document.getElementById('avatarLink');
const avatarMenu = document.getElementById('avatarMenu');
if (avatarLink) {
    avatarLink.addEventListener('click', function(e) {
        e.preventDefault();
        if (avatarMenu) {
            if (avatarMenu.classList.contains('show')) {
                avatarMenu.classList.remove('show');
                setTimeout(() => avatarMenu.style.display = 'none', 250);
            } else {
                avatarMenu.style.display = 'block';
                setTimeout(() => avatarMenu.classList.add('show'), 10);
            }
        }
    });
}
document.addEventListener('click', function(e) {
    if (avatarLink && avatarMenu && !avatarLink.contains(e.target) && !avatarMenu.contains(e.target) && avatarMenu.classList.contains('show')) {
        avatarMenu.classList.remove('show');
        setTimeout(() => avatarMenu.style.display = 'none', 250);
    }
});

// ========== FUNCIONES SUPABASE ==========
async function supabaseRequest(endpoint, options = {}) {
    const url = `${SUPABASE_URL}/rest/v1/${endpoint}`;
    const headers = {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation',
        ...options.headers
    };
    const response = await fetch(url, { ...options, headers });
    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Supabase error: ${response.status} - ${errorText}`);
    }
    return response.json();
}

async function saveToSupabase(userData) {
    try {
        const guardarpostString = JSON.stringify(userData.guardarpost);
        const supabaseData = {
            fechaCreacion: new Date().toISOString().split('T')[0],
            name: userData.name,
            password: userData.password,
            img: userData.img,
            "post-titulo": userData["post-titulo"] || "null",
            guardarpost: guardarpostString,
            seguidos: parseInt(userData.seguidos) || 0,
            seguidores: parseInt(userData.seguidores) || 0,
            "nick-seguidos": userData["nick-seguidos"] || "null",
            "url-portada": userData["url-portada"] || "",
            descripcionuser: userData.descripcionuser || "",
            etiquetasuser: userData.etiquetasuser || "#Bsz"
        };
        return await supabaseRequest('Dato', { method: 'POST', body: JSON.stringify(supabaseData) });
    } catch (error) {
        console.error('Error guardando en Supabase:', error);
        throw error;
    }
}

async function checkUserNameExistsInSupabase(name) {
    try {
        const users = await supabaseRequest(`Dato?name=eq.${encodeURIComponent(name)}`, { method: 'GET' });
        return users && users.length > 0;
    } catch { return false; }
}

async function saveToMockAPI(userData) {
    try {
        const publicData = {
            name: userData.name,
            img: userData.img,
            "post-titulo": userData["post-titulo"] || "null",
            guardarpost: userData.guardarpost,
            seguidos: userData.seguidos,
            seguidores: userData.seguidores,
            "nick-seguidos": userData["nick-seguidos"] || "null",
            "url-portada": userData["url-portada"] || "",
            descripcionuser: userData.descripcionuser || "",
            etiquetasuser: userData.etiquetasuser || "#Bsz"
        };
        const response = await fetch(MOCKAPI_USERS_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
            body: JSON.stringify(publicData)
        });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        return await response.json();
    } catch (error) {
        console.error('Error guardando en MockAPI:', error);
        throw error;
    }
}

// ========== GESTIÓN DE USUARIOS ==========
async function checkUser() {
    const storedUser = localStorage.getItem('user');
    const al = document.getElementById('avatarLink');
    const ll = document.getElementById('loginLink');
    if (!al || !ll) return;
    
    if (storedUser) {
        try {
            const user = JSON.parse(storedUser);
            const res = await fetch(MOCKAPI_USERS_URL);
            const data = await res.json();
            const found = data.find(u => u.name === user.name);
            if (found) {
                al.innerHTML = `<img src="${sanitizeHTML(found.img) || 'https://files.catbox.moe/cqgdde.png'}" alt="Avatar"> ${sanitizeHTML(found.name)}`;
                al.style.display = 'inline';
                ll.style.display = 'none';
                return true;
            }
            localStorage.removeItem('user');
        } catch {
            al.style.display = 'none';
            ll.style.display = 'inline';
            return false;
        }
    } else {
        al.style.display = 'none';
        ll.style.display = 'inline';
        return false;
    }
}

function getCurrentUser() {
    const s = localStorage.getItem('user');
    return s ? JSON.parse(s) : null;
}

async function getUserProfile(uid, uname) {
    try {
        const res = await fetch(MOCKAPI_USERS_URL);
        const users = await res.json();
        if (uid) return users.find(x => x.id == uid);
        if (uname) return users.find(x => x.name === uname);
        return null;
    } catch { return null; }
}

// ========== MOSTRAR REDES SOCIALES ==========
function renderSocialLinks(social) {
    if (!social) return '';
    
    const networks = [
        { name: 'Instagram', icon: 'fa-brands fa-instagram', key: 'instagram', urlPrefix: 'https://instagram.com/' },
        { name: 'Twitter', icon: 'fa-brands fa-twitter', key: 'twitter', urlPrefix: 'https://twitter.com/' },
        { name: 'Facebook', icon: 'fa-brands fa-facebook', key: 'facebook', urlPrefix: 'https://facebook.com/' },
        { name: 'GitHub', icon: 'fa-brands fa-github', key: 'github', urlPrefix: 'https://github.com/' },
        { name: 'YouTube', icon: 'fa-brands fa-youtube', key: 'youtube', urlPrefix: 'https://youtube.com/@' },
        { name: 'TikTok', icon: 'fa-brands fa-tiktok', key: 'tiktok', urlPrefix: 'https://tiktok.com/@' },
        { name: 'Telegram', icon: 'fa-brands fa-telegram', key: 'telegram', urlPrefix: 'https://t.me/' },
        { name: 'Discord', icon: 'fa-brands fa-discord', key: 'discord', urlPrefix: '' }
    ];
    
    let html = '<div class="social-links">';
    let hasAnySocial = false;
    
    for (const network of networks) {
        let value = social[network.key];
        if (value && value !== 'null' && value !== '' && value !== 'undefined') {
            hasAnySocial = true;
            let url = '';
            if (network.key === 'discord') {
                url = value;
            } else if (value.startsWith('http')) {
                url = value;
            } else {
                url = network.urlPrefix + value.replace('@', '');
            }
            html += `<a href="${sanitizeHTML(url)}" target="_blank" rel="noopener noreferrer" class="social-link"><i class="${network.icon}"></i> ${sanitizeHTML(network.name)}</a>`;
        }
    }
    
    html += '</div>';
    return hasAnySocial ? html : '';
}

// ========== PERFIL COMPLETO ==========
function showUserProfile(user) {
    const profile = document.getElementById('userProfile');
    const postsBody = document.getElementById('user-posts-body');
    if (!profile) return;
    if (postsBody) postsBody.innerHTML = '';
    
    console.log('Mostrando perfil de:', user.name);
    
    document.getElementById('profileName').textContent = user.name ? sanitizeHTML(user.name) : '—';
    
    const avatarUrl = user.img ? sanitizeHTML(user.img) : 'https://files.catbox.moe/cqgdde.png';
    document.getElementById('profileAvatar').src = avatarUrl;
    
    document.getElementById('seguidoresCount').textContent = user.seguidores || '0';
    document.getElementById('seguidosCount').textContent = user.seguidos || '0';
    
    const descElement = document.getElementById('profileDesc');
    descElement.innerHTML = (user.descripcionuser && user.descripcionuser !== 'null') ? formatDescription(user.descripcionuser) : 'Sin descripción';
    
    document.getElementById('profileTags').textContent = user.etiquetasuser ? sanitizeHTML(user.etiquetasuser) : '#Bsz';
    
    const genderElement = document.getElementById('profileGender');
    genderElement.textContent = (user.gender && user.gender !== 'null' && user.gender !== '') ? sanitizeHTML(user.gender) : '—';
    
    const locationElement = document.getElementById('profileLocation');
    locationElement.textContent = (user.location && user.location !== 'null' && user.location !== '') ? sanitizeHTML(user.location) : '—';
    
    const wsEl = document.getElementById('profileWebsite');
    if (user.social && user.social.website && user.social.website !== 'null' && user.social.website !== '') {
        let websiteUrl = sanitizeHTML(user.social.website);
        if (!websiteUrl.startsWith('http://') && !websiteUrl.startsWith('https://')) {
            websiteUrl = 'https://' + websiteUrl;
        }
        wsEl.innerHTML = `<a href="${websiteUrl}" target="_blank" rel="noopener noreferrer" style="color:#FF0000; text-decoration:underline;">${sanitizeHTML(user.social.website)}</a>`;
    } else {
        wsEl.innerHTML = '—';
    }
    
    const socialHtml = renderSocialLinks(user.social);
    const socialItem = document.getElementById('socialNetworksItem');
    const profileSocial = document.getElementById('profileSocial');
    
    if (socialHtml && socialHtml !== '<div class="social-links"></div>') {
        profileSocial.innerHTML = socialHtml;
        socialItem.style.display = 'flex';
    } else {
        socialItem.style.display = 'none';
    }
    
    const cover = document.getElementById('profileCover');
    if (user['url-portada'] && user['url-portada'] !== 'null' && user['url-portada'] !== '') {
        cover.src = sanitizeHTML(user['url-portada']);
        cover.style.background = 'none';
    } else {
        cover.src = '';
        cover.style.background = 'linear-gradient(135deg,#0a0000 0%,#3a0000 100%)';
    }
    
    let posts = [];
    if (user.guardarpost && Array.isArray(user.guardarpost)) {
        posts = user.guardarpost.filter(p => p && p['post-titulo']);
    }
    document.getElementById('postsCount').textContent = posts.length;
    document.getElementById('totalPosts').textContent = posts.length;
    
    if (postsBody) {
        postsBody.innerHTML = '';
        if (posts.length === 0) {
            const r = document.createElement('tr');
            const c = document.createElement('td');
            c.colSpan = 2;
            c.textContent = 'Sin posts';
            c.style.textAlign = 'center';
            c.style.color = '#555';
            r.appendChild(c);
            postsBody.appendChild(r);
        } else {
            posts.forEach(post => {
                const r = document.createElement('tr');
                const tc = document.createElement('td');
                tc.textContent = post['post-titulo'] ? sanitizeHTML(post['post-titulo']) : 'N/A';
                r.appendChild(tc);
                const uc = document.createElement('td');
                if (post.url && post.url !== 'null' && post.url !== '' && post.url !== 'undefined') {
                    const b = document.createElement('button');
                    b.className = 'url-btn';
                    b.textContent = 'Ver URL';
                    b.onclick = () => {
                        const url = post.url;
                        if (url && url !== 'null' && url !== '') {
                            window.open(url, '_blank');
                        } else {
                            alert('Sin URL disponible');
                        }
                    };
                    uc.appendChild(b);
                } else {
                    uc.textContent = 'N/A';
                }
                r.appendChild(uc);
                postsBody.appendChild(r);
            });
        }
    }
    
    profile.classList.add('show');
    profile.style.display = 'block';
}

document.getElementById('closeProfile')?.addEventListener('click', () => {
    const p = document.getElementById('userProfile');
    if (p) {
        p.classList.remove('show');
        setTimeout(() => p.style.display = 'none', 300);
    }
});

function initializeProfileButton() {
    const btn = document.getElementById('verperfil');
    if (!btn) return;
    btn.addEventListener('click', async function(e) {
        e.preventDefault();
        e.stopPropagation();
        const cu = getCurrentUser();
        if (!cu) {
            alert('Debes iniciar sesión para ver tu perfil');
            return;
        }
        try {
            const up = await getUserProfile(cu.id, cu.name);
            if (up) showUserProfile(up);
            else alert('No se encontró tu perfil');
        } catch (err) {
            alert('Error al cargar perfil: ' + err.message);
        }
    });
}

// ========== AUTENTICACIÓN ==========
const loginLink = document.getElementById('loginLink');
const overlay = document.getElementById('overlay');
const registrationForm = document.getElementById('registrationForm');
const loginForm = document.getElementById('loginForm');
const toggleForm = document.getElementById('toggleForm');
const toggleForm2 = document.getElementById('toggleForm2');

if (loginLink) {
    loginLink.addEventListener('click', (e) => {
        e.preventDefault();
        if (overlay) overlay.classList.add('show');
    });
}

if (toggleForm) {
    toggleForm.addEventListener('click', function(e) {
        e.preventDefault();
        if (registrationForm) registrationForm.style.display = 'none';
        if (loginForm) loginForm.style.display = 'block';
    });
}

if (toggleForm2) {
    toggleForm2.addEventListener('click', function(e) {
        e.preventDefault();
        if (registrationForm) registrationForm.style.display = 'block';
        if (loginForm) loginForm.style.display = 'none';
    });
}

async function handleImageUpload() {
    const input = document.getElementById('img');
    if (!input || input.files.length === 0) return null;
    const file = input.files[0];
    const fd = new FormData();
    fd.append('reqtype', 'fileupload');
    fd.append('fileToUpload', file);
    try {
        const proxy = 'https://cors-anywhere.herokuapp.com/';
        const res = await fetch(proxy + 'https://catbox.moe/user/api.php', { method: 'POST', body: fd });
        const url = await res.text();
        if (url.startsWith('https://')) return url;
        return null;
    } catch { return null; }
}

if (registrationForm) {
    registrationForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const name = document.getElementById('name').value.trim();
        const password = document.getElementById('password').value;
        
        if (!name || !password) { alert('Completa todos los campos'); return; }
        if (name.length < 3) { alert('Nombre mínimo 3 caracteres'); return; }
        if (password.length < 4) { alert('Contraseña mínima 4 caracteres'); return; }
        
        try {
            const cr = await fetch(MOCKAPI_USERS_URL);
            const eu = await cr.json();
            if (eu.find(u => u.name === name)) {
                alert('❌ Nombre de usuario ya registrado');
                return;
            }
        } catch (err) {
            alert('Error de conexión: ' + err.message);
            return;
        }
        
        const existsInSupabase = await checkUserNameExistsInSupabase(name);
        if (existsInSupabase) {
            alert('❌ Nombre de usuario ya registrado');
            return;
        }
        
        let imgUrl = 'https://files.catbox.moe/cqgdde.png';
        if (document.getElementById('img').files.length > 0) {
            const uploaded = await handleImageUpload();
            if (uploaded) imgUrl = uploaded;
        }
        
        const userData = {
            name: name, password: password, img: imgUrl,
            "post-titulo": "null",
            guardarpost: [{ "post-titulo": `Registro: ${new Date().toLocaleDateString()}`, "url": "null" }],
            seguidos: "0", seguidores: "0", "nick-seguidos": "null",
            "url-portada": "", descripcionuser: "Edita tu descripción", etiquetasuser: "#Bsz"
        };
        
        try {
            await saveToSupabase(userData);
            const mockApiResult = await saveToMockAPI(userData);
            localStorage.setItem('user', JSON.stringify({ id: mockApiResult.id, name: userData.name, img: userData.img }));
            if (overlay) overlay.classList.remove('show');
            await checkUser();
            alert('✅ Registro exitoso!');
            registrationForm.reset();
            await refreshAllData();
        } catch (err) {
            alert('Error al registrar: ' + err.message);
        }
    });
}

if (loginForm) {
    loginForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        const name = document.getElementById('loginName').value.trim();
        const password = document.getElementById('loginPassword').value;
        if (!name || !password) { alert('Completa todos los campos'); return; }
        
        try {
            const supabaseUsers = await supabaseRequest(`Dato?name=eq.${encodeURIComponent(name)}`, { method: 'GET' });
            const validUser = supabaseUsers.find(u => u.name === name && u.password === password);
            if (validUser) {
                const mockRes = await fetch(MOCKAPI_USERS_URL);
                const mockUsers = await mockRes.json();
                const publicUser = mockUsers.find(u => u.name === name);
                localStorage.setItem('user', JSON.stringify({ id: publicUser?.id || validUser.id, name: validUser.name, img: validUser.img }));
                alert('✅ Sesión iniciada');
                if (overlay) overlay.classList.remove('show');
                loginForm.reset();
                await checkUser();
                await refreshAllData();
            } else {
                alert('❌ Usuario o contraseña incorrectos');
            }
        } catch (err) {
            alert('Error de conexión: ' + err.message);
        }
    });
}

const logoutLink = document.getElementById('logoutLink');
if (logoutLink) {
    logoutLink.addEventListener('click', function(e) {
        e.preventDefault();
        localStorage.removeItem('user');
        checkUser();
        alert('Sesión cerrada');
    });
}

// ========== FUNCIÓN DE ACTUALIZACIÓN AUTOMÁTICA ==========
async function refreshAllData() {
    const indicator = document.getElementById('refreshIndicator');
    if (indicator) {
        indicator.style.opacity = '1';
        indicator.textContent = '🔄 Actualizando datos...';
        setTimeout(() => {
            indicator.style.opacity = '0.5';
        }, 1000);
    }
    
    try {
        await Promise.all([fetchPosts(), loadUsers(), cargarEstadisticas(), checkUser()]);
        if (indicator) {
            indicator.textContent = '✅ Datos actualizados';
            setTimeout(() => {
                indicator.textContent = '🔄 Próxima actualización en 5min';
            }, 2000);
        }
        console.log('✅ Datos actualizados correctamente');
    } catch (err) {
        console.error('Error al actualizar:', err);
        if (indicator) {
            indicator.textContent = '⚠️ Error al actualizar';
            setTimeout(() => {
                indicator.textContent = '🔄 Actualizando cada 5min';
            }, 3000);
        }
    }
}

function startAutoRefresh() {
    if (refreshInterval) clearInterval(refreshInterval);
    refreshInterval = setInterval(refreshAllData, 300000);
    console.log('🔄 Auto-refresh activado (cada 5 minutos)');
}

// ========== DATOS - API DE POSTS (MUESTRA TODOS LOS POSTS SIN FILTRAR) ==========
async function fetchPosts() {
    try {
        const res = await fetch(MOCKAPI_POSTS_URL);
        const data = await res.json();
        const tbody = document.getElementById('data-table-body');
        if (!tbody) return;
        tbody.innerHTML = '';
        
        let postsCount = 0;
        
        console.log('Datos recibidos de la API:', data);
        
        // Recorrer CADA objeto del array principal
        for (let i = 0; i < data.length; i++) {
            const item = data[i];
            
            // Verificar si tiene postgeneral y es un array
            if (item.postgeneral && Array.isArray(item.postgeneral) && item.postgeneral.length > 0) {
                console.log(`Procesando ID ${item.id || i} con ${item.postgeneral.length} posts`);
                
                // Recorrer CADA post dentro del array postgeneral - SIN FILTROS
                for (let j = 0; j < item.postgeneral.length; j++) {
                    const post = item.postgeneral[j];
                    
                    // Verificar que el post tenga título (mostrar todos, incluso el doxeo)
                    if (post && post['post-titulo'] && post['post-titulo'] !== 'null' && post['post-titulo'] !== '') {
                        
                        postsCount++;
                        
                        const r = document.createElement('tr');
                        
                        // Columna Título
                        const tc = document.createElement('td');
                        // Truncar título largo para mejor visualización
                        let titulo = post['post-titulo'];
                        if (titulo.length > 60) {
                            titulo = titulo.substring(0, 60) + '...';
                        }
                        tc.textContent = titulo;
                        tc.title = post['post-titulo']; // Tooltip con título completo
                        r.appendChild(tc);
                        
                        // Columna URL con botón
                        const uc = document.createElement('td');
                        if (post.shareLink && post.shareLink !== 'null' && post.shareLink !== '' && post.shareLink !== 'undefined') {
                            const ub = document.createElement('button');
                            ub.className = 'url-btn';
                            ub.textContent = 'Ver URL';
                            ub.onclick = (function(shareLink) {
                                return function() { 
                                    if (shareLink && shareLink !== 'null' && shareLink !== '') {
                                        window.open(shareLink, '_blank');
                                    } else {
                                        alert('Sin URL disponible');
                                    }
                                };
                            })(post.shareLink);
                            uc.appendChild(ub);
                        } else {
                            uc.textContent = 'Sin URL';
                        }
                        r.appendChild(uc);
                        
                        // Columna Autor
                        const cc = document.createElement('td');
                        cc.textContent = post['post-user'] || 'N/A';
                        cc.style.cursor = 'pointer';
                        cc.style.color = '#FF0000';
                        cc.style.textDecoration = 'underline';
                        cc.onclick = async () => {
                            try {
                                const usersRes = await fetch(MOCKAPI_USERS_URL);
                                const users = await usersRes.json();
                                const userFound = users.find(u => u.name === post['post-user']);
                                if (userFound) {
                                    showUserProfile(userFound);
                                } else {
                                    alert('Perfil no encontrado');
                                }
                            } catch (err) {
                                console.error('Error al buscar perfil:', err);
                                alert('Error al buscar el perfil');
                            }
                        };
                        r.appendChild(cc);
                        
                        tbody.appendChild(r);
                    }
                }
            }
        }
        
        console.log(`Total de posts mostrados: ${postsCount}`);
        
        if (tbody.children.length === 0) {
            const r = document.createElement('tr');
            const c = document.createElement('td');
            c.colSpan = 3;
            c.textContent = 'No hay posts disponibles';
            c.style.textAlign = 'center';
            c.style.color = '#555';
            r.appendChild(c);
            tbody.appendChild(r);
        }
    } catch (err) { 
        console.error('Error fetchPosts:', err);
        const tbody = document.getElementById('data-table-body');
        if (tbody) {
            tbody.innerHTML = '<tr><td colspan="3" style="text-align:center;color:#555;">Error al cargar posts: ' + err.message + '</td></tr>';
        }
    }
}

async function loadUsers() {
    try {
        const res = await fetch(MOCKAPI_USERS_URL);
        const data = await res.json();
        const ul = document.getElementById('userList');
        if (!ul) return;
        ul.innerHTML = '';
        data.forEach(user => {
            const li = document.createElement('li');
            li.classList.add('user');
            const uimg = document.createElement('img');
            uimg.src = user.img || 'https://files.catbox.moe/cqgdde.png';
            uimg.alt = user.name;
            const un = document.createElement('p');
            un.textContent = user.name;
            li.appendChild(uimg);
            li.appendChild(un);
            ul.appendChild(li);
            li.addEventListener('click', () => showUserProfile(user));
        });
    } catch (err) { console.error('Error loadUsers:', err); }
}

async function cargarEstadisticas() {
    try {
        const [usersRes, postsRes] = await Promise.all([
            fetch(MOCKAPI_USERS_URL),
            fetch(MOCKAPI_POSTS_URL)
        ]);
        const users = await usersRes.json();
        const postsData = await postsRes.json();
        
        let totalPosts = 0;
        for (let i = 0; i < postsData.length; i++) {
            const item = postsData[i];
            if (item.postgeneral && Array.isArray(item.postgeneral)) {
                totalPosts += item.postgeneral.filter(p => 
                    p && p['post-titulo'] && p['post-titulo'] !== 'null' && p['post-titulo'] !== ''
                ).length;
            }
        }
        
        const totalUsers = users.length;
        
        const svs = document.querySelectorAll('.stat-value');
        if (svs[0]) svs[0].textContent = Math.floor(Math.random() * 10) + 1;
        if (svs[1]) svs[1].textContent = totalPosts;
        if (svs[2]) svs[2].textContent = totalUsers;
        
        console.log(`Estadísticas: ${totalPosts} posts, ${totalUsers} usuarios`);
    } catch (err) {
        console.error('Error en estadísticas:', err);
        document.querySelectorAll('.stat-value').forEach(s => { s.textContent = '—'; });
    }
}

// ========== PERMISOS CORS ==========
function checkAndRequestCorsAccess() {
    if (localStorage.getItem('hasSeenCorsMessage') === 'true') return;
    const permisosOverlay = document.getElementById('permisosOverlay');
    if (permisosOverlay) permisosOverlay.style.display = 'block';
}

async function requestCorsPermission() {
    try {
        const res = await fetch('https://cors-anywhere.herokuapp.com/https://jxll.org/Editor/Perfil/0.0.0.html', { method: 'GET', mode: 'cors' });
        if (res.ok) {
            const vm = document.getElementById('validationMessage');
            if (vm) vm.style.display = 'block';
            localStorage.setItem('hasSeenCorsMessage', 'true');
            setTimeout(() => {
                if (vm) vm.style.display = 'none';
                const po = document.getElementById('permisosOverlay');
                if (po) po.style.display = 'none';
            }, 2000);
        }
    } catch { alert('No se pudo validar. Intenta manualmente.'); }
}

const enableCorsBtn = document.getElementById('enableCorsBtn');
if (enableCorsBtn) enableCorsBtn.addEventListener('click', requestCorsPermission);

const clearCacheBtn = document.getElementById('clearCacheBtn');
if (clearCacheBtn) {
    clearCacheBtn.addEventListener('click', () => {
        localStorage.clear();
        sessionStorage.clear();
        alert('Caché limpiado');
        window.location.reload();
    });
}

const editProfileLink = document.getElementById('editProfileLink');
if (editProfileLink) {
    editProfileLink.addEventListener('click', function(e) {
        e.preventDefault();
        window.location.href = 'https://jxll.org/Editor/Perfil/0.0.0.html';
    });
}
 
// ========== INICIALIZACIÓN ==========
document.addEventListener('DOMContentLoaded', async () => {
    await checkUser();
    await refreshAllData();
    checkAndRequestCorsAccess();
    initializeProfileButton();
    startAutoRefresh();
});
setInterval(checkUser, 10000);
