const $=s=>document.querySelector(s);
const LBL={DRAFT:'Draf',DEVELOPMENT:'Sedang disusun',REVIEW:'Ditinjau',PUBLISHED:'Terbit',LOCKED:'Terkunci'};
const CP={TERVERIFIKASI:'Terverifikasi',SEKUNDER:'Sumber sekunder',BELUM:'Belum diverifikasi'};
let D,babAktif=null,view='anak',buka=null,ortuOk=false,nama='Anum';
const esc=t=>String(t).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
function db(){return new Promise((ok,no)=>{const r=indexedDB.open('anum-db',1);
r.onupgradeneeded=()=>{const d=r.result;if(!d.objectStoreNames.contains('profil'))d.createObjectStore('profil');if(!d.objectStoreNames.contains('progres'))d.createObjectStore('progres',{keyPath:'id'})};
r.onsuccess=()=>ok(r.result);r.onerror=()=>no(r.error)})}
function kv(k,v){return db().then(d=>new Promise((ok,no)=>{const s=d.transaction('profil',v===undefined?'readonly':'readwrite').objectStore('profil');const q=v===undefined?s.get(k):s.put(v,k);q.onsuccess=()=>ok(q.result);q.onerror=()=>no(q.error)}))}
const stat=m=>({t:m.bab.length,p:m.bab.filter(x=>x.status=='PUBLISHED').length,d:m.bab.filter(x=>x.status=='DEVELOPMENT'||x.status=='REVIEW').length,k:m.bab.filter(x=>x.status=='LOCKED'||x.status=='DRAFT').length});
function anak(){
 if(buka){const m=D.mapel.find(x=>x.id==buka),pub=m.bab.filter(x=>x.status=='PUBLISHED');
  return `<button class="back" onclick="buka=null;render()">← Kembali</button><h2>${esc(m.nama)}</h2>`+(pub.length?pub.map(b=>`<button class="card" onclick="lihat('${b.id}',false)">${esc(b.judul)}</button>`).join(''):`<div class="card muted">Belum ada bab yang siap dipelajari. Sedang disiapkan ya! 🌱</div>`)}
 return `<h2>Halo, ${esc(nama)}! 👋</h2><div class="grid">`+D.mapel.map(m=>{const s=stat(m);return `<button class="card sub" onclick="buka='${m.id}';render()"><b>${esc(m.nama)}</b><small>${s.p?s.p+' bab siap':'Belum ada bab'}</small></button>`}).join('')+`</div>`}
async function lihat(id,pr){let b;D.mapel.forEach(m=>m.bab.forEach(x=>{if(x.id==id)b=x}));if(!b||!b.file)return;
 if(!pr&&b.status!='PUBLISHED')return;try{babAktif={d:await (await fetch(b.file)).json(),pr};render()}catch(e){alert('Bab belum bisa dimuat. Sambungkan internet sekali.')}}
function gerbang(){const a=2+Math.floor(Math.random()*8),b=2+Math.floor(Math.random()*8),j=prompt(`Khusus orang tua. Berapa ${a} + ${b}?`);
 if(j!==null){if(+j===a+b){ortuOk=true;render()}else alert('Jawaban belum tepat.')}}
async function simpanNama(){const v=$('#inNama').value.trim();if(!v)return;nama=v;try{await kv('nama',v);alert('Tersimpan.')}catch(e){alert('Gagal menyimpan di tablet ini.')}render()}
function ortu(){
 if(!ortuOk)return `<div class="card"><p>Bagian ini untuk orang tua.</p><button class="btn" onclick="gerbang()">Masuk</button></div>`;
 let T=0,P=0;const rows=D.mapel.map(m=>{const s=stat(m);T+=s.t;P+=s.p;return `<tr><td>${esc(m.nama)}<br><small>${esc(m.sifat)}</small></td><td>${s.p}/${s.t}</td><td>${s.d}</td><td>${s.k}</td><td>${CP[m.cp]}</td></tr>`}).join('');
 const pct=T?Math.round(P/T*100):0;
 return `<h2>Kelengkapan Konten Kelas ${D.kelas}</h2><div class="card"><b>${pct}%</b> bab terbit (${P} dari ${T} bab yang sudah direncanakan).<br><small>Angka ini hanya menghitung bab yang sudah masuk daftar, bukan seluruh kurikulum.</small></div>
 <div style="overflow-x:auto"><table><tr><th>Mapel</th><th>Terbit</th><th>Disusun</th><th>Draf/Kunci</th><th>CP</th></tr>${rows}</table></div>
 <h3>Pratinjau bab (belum terbit)</h3>${D.mapel.flatMap(m=>m.bab.filter(b=>b.file&&b.status!='PUBLISHED')).map(b=>`<button class="card" onclick="lihat('${b.id}',true)">${esc(b.judul)} <small>(${LBL[b.status]})</small></button>`).join('')||'<p class="muted">Belum ada.</p>'}
 <h3>Profil</h3><input id="inNama" value="${esc(nama)}"> <button class="btn" onclick="simpanNama()">Simpan</button>
 <p><button class="btn" onclick="ortuOk=false;render()">Keluar dari mode orang tua</button></p>`}
function render(){$('#tAnak').className=view=='anak'?'on':'';$('#tOrtu').className=view=='ortu'?'on':'';if(babAktif){$('#app').innerHTML=babHTML(babAktif.d,babAktif.pr);initPapan(babAktif.d.id);return}$('#app').innerHTML=view=='anak'?anak():ortu()}
function net(){const n=$('#net');n.textContent=navigator.onLine?'Online':'Offline';n.className='net'+(navigator.onLine?'':' off')}
$('#tAnak').onclick=()=>{view='anak';babAktif=null;render()};$('#tOrtu').onclick=()=>{view='ortu';babAktif=null;render()};
addEventListener('online',net);addEventListener('offline',net);net();
if('serviceWorker'in navigator)navigator.serviceWorker.register('sw.js').catch(()=>{});
(async()=>{try{nama=(await kv('nama'))||'Anum'}catch(e){}
try{D=await (await fetch('kelas1.json')).json();render()}catch(e){$('#app').textContent='Isi belajar belum bisa dimuat. Coba sambungkan internet sekali, lalu buka lagi.'}})();
