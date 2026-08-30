const KEY='fitnessPlannerV1';
const exercises=['Подъём штанги на бицепс · 3×10','Молотки · 3×10','Разгибание рук на блоке · 3×12','Скручивания · 3×15','Планка · 3×45 сек'];
let state=JSON.parse(localStorage.getItem(KEY)||'null')||{days:{},weights:[],dark:false};
const todayKey=()=>new Date().toISOString().slice(0,10);
function save(){localStorage.setItem(KEY,JSON.stringify(state))}
function dayObj(date){let k=date.toISOString().slice(0,10);return state.days[k]||(state.days[k]={checks:{},status:'PLANNED',completion:0});}
function pct(d){let n=Object.keys(d.checks).length;if(!n)return d.completion||0;return Math.round(Object.values(d.checks).filter(Boolean).length/n*100)}
function header(){let diff=Math.floor((new Date()-new Date('2026-08-10'))/86400000);let week=Math.min(16,Math.max(1,Math.floor(diff/7)+1));document.getElementById('weekLabel').textContent=`Неделя ${week} / 16`}
function render(name='today'){document.querySelectorAll('nav button').forEach(b=>b.classList.toggle('active',b.dataset.screen===name));header();({today,calendar,plan,progress,profile}[name])()}
function today(){let d=dayObj(new Date()), p=pct(d);screen.innerHTML=`
<div class="card hero"><small class="muted">${new Date().toLocaleDateString('ru-RU',{weekday:'long',day:'numeric',month:'long'})}</small><h2>Бег + руки + пресс</h2><p class="muted">Тренировка по текущему этапу программы</p><div class="row"><b>${p}%</b><span>${p===100?'Выполнено':'В процессе'}</span></div><div class="progress"><i style="width:${p}%"></i></div></div>
<div class="card"><div class="section">🏃 Бег</div><div class="row"><span>Лёгкий бег</span><b>30 мин</b></div><button style="margin-top:12px" onclick="run()">Начать бег</button></div>
<div class="card"><div class="section">💪 Силовая</div>${exercises.map((x,i)=>`<label class="check"><input type="checkbox" ${d.checks[i]?'checked':''} onchange="toggle(${i},this.checked)"> <span>${x}</span></label>`).join('')}</div>
<div class="card"><div class="row"><b>Итог</b><span>${p}%</span></div><button class="secondary" style="margin-top:12px" onclick="complete()">Сохранить тренировку</button></div>`}
function toggle(i,v){let d=dayObj(new Date());d.checks[i]=v;save();today()}
function complete(){let d=dayObj(new Date());d.completion=pct(d);d.status=d.completion>=100?'COMPLETED':'PARTIALLY_COMPLETED';save();today()}
function run(){let mins=prompt('Фактическое время бега, минут:', '30');if(mins!==null){let d=dayObj(new Date());d.run={minutes:Number(mins)||0};save();alert('Бег сохранён.');}}
function calendar(){let now=new Date(), y=now.getFullYear(),m=now.getMonth(), first=new Date(y,m,1), days=new Date(y,m+1,0).getDate(),off=(first.getDay()+6)%7;let html=`<div class="row"><button class="secondary" onclick="changeMonth(-1)">‹</button><h2>${now.toLocaleDateString('ru-RU',{month:'long',year:'numeric'})}</h2><button class="secondary" onclick="changeMonth(1)">›</button></div><div class="calendar">${['Пн','Вт','Ср','Чт','Пт','Сб','Вс'].map(x=>`<div class="calhead">${x}</div>`).join('')}`;for(let i=0;i<off;i++)html+='<div></div>';for(let n=1;n<=days;n++){let date=new Date(y,m,n),k=date.toISOString().slice(0,10),d=state.days[k], isTraining=date.getDay()!==0&&date.getDay()!==2;html+=`<div class="day ${isTraining?'training':''} ${(d&&d.status==='COMPLETED')?'done':''} ${k===todayKey()?'today':''}" onclick="selectDay('${k}')">${n}</div>`}screen.innerHTML=html+'</div>'}
let cm=0;function changeMonth(x){cm+=x;let old=Date.now();let n=new Date();n.setMonth(n.getMonth()+cm);let original=Date;Date=function(){return new original(n.getFullYear(),n.getMonth(),arguments[0]||1)};calendar();Date=original}
function selectDay(k){alert(`${new Date(k+'T12:00:00').toLocaleDateString('ru-RU',{weekday:'long',day:'numeric',month:'long'})}\n${state.days[k]?.status==='COMPLETED'?'Тренировка выполнена':'Тренировка запланирована'}`)}
function plan(){screen.innerHTML=`<div class="card"><h2>16-недельная программа</h2><p class="muted">Текущий прототип содержит структуру. Конкретные нагрузки можно заменить твоим реальным планом.</p></div>`+Array.from({length:16},(_,i)=>`<div class="card row"><b>Неделя ${i+1}</b><span>${i===0?'Текущая':'Запланировано'}</span></div>`).join('')}
function progress(){let arr=Object.values(state.days),done=arr.filter(x=>x.status==='COMPLETED').length,all=arr.length;screen.innerHTML=`<div class="card"><small>Выполнение</small><div class="stat">${all?Math.round(done/all*100):0}%</div><p class="muted">${done} завершённых тренировок</p></div><div class="card"><h2>Вес</h2><div class="row"><input id="weight" type="number" step=".1" placeholder="Например 78.5"><button onclick="addWeight()">Сохранить</button></div><p class="muted">${state.weights.length?state.weights.map(x=>x+' кг').join(' · '):'Пока нет измерений'}</p></div>`}
function addWeight(){let v=Number(document.getElementById('weight').value);if(v){state.weights.push(v);save();progress()}}
function profile(){screen.innerHTML=`<div class="card"><h2>Мой профиль</h2><table><tr><td>Возраст</td><td>28 лет</td></tr><tr><td>Рост</td><td>176 см</td></tr><tr><td>Вес</td><td>79 кг</td></tr><tr><td>Режим</td><td>Только на этом устройстве</td></tr></table></div><div class="card"><h2>Данные</h2><button onclick="exportData()">Экспорт JSON</button> <button class="secondary" onclick="resetData()">Сбросить данные</button></div><div class="card"><p class="muted">Приложение работает локально. Данные хранятся в браузере устройства.</p></div>`}
function exportData(){let blob=new Blob([JSON.stringify(state,null,2)],{type:'application/json'}),a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='fitness-backup.json';a.click()}
function resetData(){if(confirm('Удалить все локальные результаты?')){state={days:{},weights:[],dark:false};save();profile()}}
document.getElementById('themeBtn').onclick=()=>{document.body.classList.toggle('dark');state.dark=document.body.classList.contains('dark');save()}
document.querySelectorAll('nav button').forEach(b=>b.onclick=()=>render(b.dataset.screen));
if(state.dark)document.body.classList.add('dark');
const screen=document.getElementById('screen');render();

if ('serviceWorker' in navigator) navigator.serviceWorker.register('./sw.js').catch(()=>{});
