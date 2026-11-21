let K={},PAPAN={},adaPen=false;
function simpanProgres(r){return db().then(d=>new Promise((ok,no)=>{const q=d.transaction('progres','readwrite').objectStore('progres').put(r);q.onsuccess=()=>ok();q.onerror=()=>no(q.error)}))}
function kuis(id,items){K={id,items,done:{},s:0};
 return items.map((q,i)=>`<div class="card" id="q${i}"><p><b>${i+1}.</b> ${esc(q.q)}</p>`+(q.t=='isi'?`<input id="in${i}" type="number" inputmode="numeric"> <button class="btn" onclick="jwb(${i},document.getElementById('in${i}').value)">Periksa</button>`:q.o.map((o,j)=>`<button class="btn opt" onclick="jwb(${i},${j})">${esc(o)}</button>`).join(' '))+`<p id="fb${i}"></p></div>`).join('')+`<div id="hasil" class="card muted">Selesaikan semua soal ya.</div>`}
function jwb(i,v){if(K.done[i]!==undefined||v==='')return;const q=K.items[i],ok=q.t=='isi'?+v===q.a:v===q.a;
 K.done[i]=ok;if(ok)K.s++;
 document.querySelectorAll('#q'+i+' button,#q'+i+' input').forEach(e=>e.disabled=true);
 $('#fb'+i).textContent=ok?'Hebat! 🌟':'Ayo lihat bersama: '+q.e;
 const n=K.items.length;if(Object.keys(K.done).length==n){const r=K.s/n;
  $('#hasil').innerHTML=`<b>Hasil: ${K.s} dari ${n}</b><br>`+(r>=.7?'Kamu sudah paham. Mantap! 🎉':'Belum apa-apa, ayo ulangi pelan-pelan. Kamu pasti bisa! 💪');
  simpanProgres({id:'kuis-'+K.id,skor:K.s,total:n,waktu:Date.now()}).catch(()=>{})}}
function papan(){return `<div class="card"><canvas id="cv" width="800" height="360" style="width:100%;touch-action:none;background:#fff;border-radius:12px"></canvas>
<div class="tools"><button class="btn" onclick="PAPAN.undo()">↩ Urung</button><button class="btn" onclick="PAPAN.redo()">↪ Ulang</button><button class="btn" onclick="PAPAN.hapus()">🧽 Hapus</button><button class="btn" onclick="PAPAN.clear()">🗑 Bersihkan</button><button class="btn" onclick="PAPAN.simpan()">💾 Simpan</button>
<span><button class="btn" onclick="PAPAN.warna('#27384d')">⚫</button><button class="btn" onclick="PAPAN.warna('#d9534f')">🔴</button><button class="btn" onclick="PAPAN.warna('#2d7dd2')">🔵</button><button class="btn" onclick="PAPAN.warna('#3a9d5d')">🟢</button></span>
<select onchange="PAPAN.tebal(this.value)"><option value="3">Tipis</option><option value="6" selected>Sedang</option><option value="12">Tebal</option></select></div></div>`}
function initPapan(babId){const c=$('#cv');if(!c)return;const x=c.getContext('2d');let g=false,w='#27384d',t=6,h=false,S=[],R=[],cur=null;
 const pos=e=>{const r=c.getBoundingClientRect();return[(e.clientX-r.left)*c.width/r.width,(e.clientY-r.top)*c.height/r.height]};
 function gam(){x.fillStyle='#fff';x.fillRect(0,0,c.width,c.height);[...S,...(cur?[cur]:[])].forEach(s=>{x.strokeStyle=s.w;x.lineWidth=s.t;x.lineCap='round';x.lineJoin='round';x.beginPath();s.p.forEach((q,i)=>i?x.lineTo(q[0],q[1]):x.moveTo(q[0],q[1]));if(s.p.length==1)x.lineTo(s.p[0][0]+.1,s.p[0][1]);x.stroke()})}
 c.onpointerdown=e=>{if(e.pointerType=='pen')adaPen=true;if(e.pointerType=='touch'&&adaPen)return;c.setPointerCapture(e.pointerId);g=true;R=[];cur={w:h?'#ffffff':w,t:h?t*3:t,p:[pos(e)]}};
 c.onpointermove=e=>{if(!g)return;cur.p.push(pos(e));gam()};
 c.onpointerup=c.onpointercancel=()=>{if(!g)return;g=false;S.push(cur);cur=null;gam()};
 PAPAN={undo:()=>{if(S.length){R.push(S.pop());gam()}},redo:()=>{if(R.length){S.push(R.pop());gam()}},clear:()=>{S=[];R=[];gam()},warna:v=>{w=v;h=false},tebal:v=>{t=+v},hapus:()=>{h=true},
  simpan:()=>simpanProgres({id:'papan-'+babId,gambar:c.toDataURL('image/png'),waktu:Date.now()}).then(()=>alert('Tersimpan di tablet.')).catch(()=>alert('Gagal menyimpan.'))};
 gam()}
function babHTML(b,pr){const L=a=>`<ul>${a.map(x=>`<li>${esc(x)}</li>`).join('')}</ul>`;
 return `<button class="back" onclick="babAktif=null;render()">← Kembali</button>`+(pr?`<div class="card" style="background:var(--b)"><b>PRATINJAU untuk orang tua.</b> Bab ini belum terbit dan rujukannya belum diverifikasi penuh.<br><small>${esc(b.rujukan)}</small></div>`:'')+
 `<h2>${esc(b.judul)}</h2><h3>Tujuan belajar</h3>${L(b.tujuan)}<p>${esc(b.pengantar)}</p><h3>Penjelasan</h3>${b.penjelasan.map(p=>`<div class="card">${esc(p)}</div>`).join('')}<h3>Contoh</h3>${b.contoh.map(p=>`<div class="card">${esc(p)}</div>`).join('')}
 <h3>Ayo mencoba</h3><p>${esc(b.aktivitas)}</p>${papan()}<h3>Latihan</h3>${kuis(b.id,b.latihan)}<h3>Ringkasan</h3><div class="card">${esc(b.ringkasan)}</div><h3>Belum paham?</h3><div class="card">${esc(b.remedial)}</div><h3>Tantangan</h3><div class="card">${esc(b.pengayaan)}</div>`}
