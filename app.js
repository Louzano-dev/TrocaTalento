(() => {
  'use strict';

  const STORAGE_KEY = 'trocaTalento.demo.v1';
  const currentUser = { offers: ['Design de marcas'], wants: ['Inglês conversação'] };
  const profiles = [
    { id:'marina', name:'Marina Costa', initials:'MC', category:'Design', role:'Designer de marcas', bio:'Transformo ideias em identidades visuais. Gosto de ensinar com projetos práticos e um café por perto.', offers:['Design de marcas','Ilustração'], wants:['Inglês conversação','Fotografia'], level:'Avançado', rating:4.9, reviews:18, trades:12, availability:'Noites e sábados', modalities:['Online','Presencial'], location:'São Paulo, SP', colors:'avatar-maya' },
    { id:'rafael', name:'Rafael Lima', initials:'RL', category:'Idiomas', role:'Professor de inglês', bio:'Inglês sem medo de errar: conversação leve, temas do cotidiano e muita troca cultural.', offers:['Inglês conversação','Espanhol'], wants:['Design de marcas','Fotografia'], level:'Avançado', rating:5.0, reviews:14, trades:9, availability:'Dias úteis à noite', modalities:['Online'], location:'Curitiba, PR', colors:'avatar-rafa' },
    { id:'julia', name:'Júlia Prado', initials:'JP', category:'Tecnologia', role:'Desenvolvedora front-end', bio:'Curiosa por interfaces acessíveis e código bem cuidado. Bora aprender construindo?', offers:['Programação','UX writing'], wants:['Inglês conversação','Marketing'], level:'Intermediário', rating:4.8, reviews:11, trades:8, availability:'Manhãs e fins de semana', modalities:['Online'], location:'Belo Horizonte, MG', colors:'avatar-julia' },
    { id:'caio', name:'Caio Nunes', initials:'CN', category:'Música', role:'Músico e produtor', bio:'Ensino violão para iniciantes com repertório que você escolhe. Também adoro fotografia analógica.', offers:['Violão','Produção musical'], wants:['Fotografia','Edição de vídeo'], level:'Avançado', rating:4.7, reviews:9, trades:7, availability:'Terças e quintas', modalities:['Online','Presencial'], location:'Recife, PE', colors:'avatar-caio' },
    { id:'bia', name:'Beatriz Alves', initials:'BA', category:'Bem-estar', role:'Instrutora de yoga', bio:'Práticas acessíveis para trazer presença ao dia a dia. Cada corpo tem seu ritmo.', offers:['Yoga','Meditação'], wants:['Design de marcas','Inglês conversação'], level:'Avançado', rating:4.9, reviews:21, trades:16, availability:'Manhãs', modalities:['Online','Presencial'], location:'Florianópolis, SC', colors:'avatar-bia' },
    { id:'leo', name:'Leonardo Rocha', initials:'LR', category:'Comunicação', role:'Criador de conteúdo', bio:'Ajudo projetos a encontrarem sua voz. Gosto de boas histórias, estratégia e ideias em movimento.', offers:['Marketing','Edição de vídeo'], wants:['Programação','Violão'], level:'Intermediário', rating:4.6, reviews:7, trades:5, availability:'Fins de semana', modalities:['Online'], location:'Porto Alegre, RS', colors:'avatar-leo' }
  ];
  const defaultState = () => ({ balance:3.5, completed:4, avg:4.9, requests:[], sessions:[{id:'session-welcome',profileId:'bia',name:'Beatriz Alves',initials:'BA',color:'avatar-bia',skill:'Yoga para iniciantes',date:'2026-11-02',time:'10:00',duration:60,modality:'Online',status:'confirmed',creditDone:false,rated:false}], history:[{id:'seed-1',title:'Conversação em inglês · Rafael',date:'2026-10-22',amount:'+1,0',kind:'credit'},{id:'seed-2',title:'Fundamentos de UX · Júlia',date:'2026-10-17',amount:'−0,5',kind:'debit'},{id:'seed-3',title:'Design de marcas · Marina',date:'2026-10-11',amount:'+1,0',kind:'credit'}], ratings:[] });
  const $ = (selector, root=document) => root.querySelector(selector);
  const $$ = (selector, root=document) => [...root.querySelectorAll(selector)];
  const safeParse = (value) => { try { return JSON.parse(value); } catch { return null; } };
  function loadState() {
    let raw=null;try { raw=safeParse(localStorage.getItem(STORAGE_KEY)); } catch { return defaultState(); }
    const fresh = defaultState();
    if (!raw || typeof raw !== 'object') return fresh;
    const state = { ...fresh, ...raw };
    if (!Number.isFinite(state.balance) || state.balance < 0) state.balance = fresh.balance;
    if (!Number.isInteger(state.completed) || state.completed < 0) state.completed = fresh.completed;
    if (!Number.isFinite(state.avg) || state.avg < 0 || state.avg > 5) state.avg = fresh.avg;
    for (const key of ['requests','sessions','history','ratings']) if (!Array.isArray(state[key])) state[key] = fresh[key];
    return state;
  }
  let state = loadState();
  let modalReturnFocus = null;
  let scrollRevealObserver = null;
  let scrollProgressFrame = 0;
  let creditAnimationFrame = 0;
  let highlightedCreditMovementId = null;
  function saveState() { try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch { toast('Não foi possível salvar os dados neste navegador.', 'error'); } }
  function esc(value) { return String(value ?? '').replace(/[&<>"']/g, (ch) => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch])); }
  function slug(value) { return value.toLocaleLowerCase('pt-BR').normalize('NFD').replace(/[\u0300-\u036f]/g,'').trim(); }
  function intersection(a,b) { return a.filter(x => b.some(y => slug(y) === slug(x))); }
  function compatibility(profile) {
    const iTeach = intersection(currentUser.offers, profile.wants);
    const iLearn = intersection(currentUser.wants, profile.offers);
    const score = Math.round((iTeach.length + iLearn.length) / 2 * 100);
    let explanation;
    if (iTeach.length && iLearn.length) explanation = `Você ensina ${iTeach.join(', ')} e ${profile.name.split(' ')[0]} quer aprender. ${profile.name.split(' ')[0]} ensina ${iLearn.join(', ')}, que você procura. A troca é recíproca.`;
    else if (iTeach.length) explanation = `Você pode ensinar ${iTeach.join(', ')}, uma habilidade que ${profile.name.split(' ')[0]} quer aprender. Ainda não há uma habilidade oferecida por essa pessoa que corresponda ao que você procura.`;
    else if (iLearn.length) explanation = `${profile.name.split(' ')[0]} ensina ${iLearn.join(', ')}, algo que você quer aprender. Não identificamos uma habilidade sua que corresponda ao que essa pessoa procura.`;
    else explanation = 'Ainda não encontramos interesses cruzados. Conheça o perfil e proponha uma troca parcial, ou explore outra pessoa.';
    return { iTeach, iLearn, score, explanation, reciprocal: iTeach.length > 0 && iLearn.length > 0 };
  }
  function profileRating(profile) { const received=state.ratings.filter(r=>r.profileId===profile.id); if(!received.length)return {rating:profile.rating,reviews:profile.reviews}; return {rating:(profile.rating*profile.reviews+received.reduce((sum,r)=>sum+r.score,0))/(profile.reviews+received.length),reviews:profile.reviews+received.length}; }
  function toast(message, type='') { const node=document.createElement('div'); node.className=`toast ${type}`; node.textContent=message; $('#toast-region').append(node); setTimeout(()=>node.remove(),3400); }
  function avatar(initials, color='avatar-maya') { return `<span class="avatar ${color}" aria-hidden="true">${esc(initials)}</span>`; }
  function skillTags(items, cls='') { return items.map(item=>`<span class="skill-tag ${cls}">${esc(item)}</span>`).join(''); }

  function observeScrollReveals(root=document) {
    if(!scrollRevealObserver)return;
    const targets=$$('.section-heading,.step-card,.talent-card,.match-demo,.credit-visual,.stat-card,.dashboard-panel,.dashboard-side .side-card,.final-inner',root);
    targets.forEach((element,index)=>{
      if(element.classList.contains('scroll-reveal'))return;
      element.classList.add('scroll-reveal');
      element.style.setProperty('--reveal-delay',`${(index%3)*65}ms`);
      scrollRevealObserver.observe(element);
    });
  }

  function sessionTimelineMarkup(status) {
    const stage=status==='completed'?'completed':status==='confirmed'?'confirmed':'scheduled';
    const activeIndex={requested:0,scheduled:1,confirmed:2,completed:3}[stage];
    const stages=['Solicitada','Agendada','Confirmada','Concluída'];
    return `<ol class="session-timeline stage-${stage}" aria-label="Etapas da troca">${stages.map((label,index)=>`<li class="${index<activeIndex?'is-done':''} ${index===activeIndex?'is-current':''}" ${index===activeIndex?'aria-current="step"':''}><span class="timeline-marker" aria-hidden="true">${index<activeIndex?'✓':index+1}</span><span class="timeline-label">${label}</span></li>`).join('')}</ol>`;
  }

  function animateCreditBalance(from,to) {
    const balance=$('#credit-balance');
    const balanceText=balance.firstChild;
    const card=$('.balance-card');
    if(!balanceText)return;
    if(creditAnimationFrame)cancelAnimationFrame(creditAnimationFrame);
    card.classList.remove('credit-updated');
    if(window.matchMedia('(prefers-reduced-motion: reduce)').matches){
      balanceText.nodeValue=`${to.toFixed(1).replace('.',',')} `;
      return;
    }
    const start=performance.now(),duration=680;
    const animate=now=>{
      const progress=Math.min(1,(now-start)/duration);
      const eased=1-Math.pow(1-progress,3);
      const amount=from+(to-from)*eased;
      balanceText.nodeValue=`${amount.toFixed(1).replace('.',',')} `;
      if(progress<1){creditAnimationFrame=requestAnimationFrame(animate);return;}
      balanceText.nodeValue=`${to.toFixed(1).replace('.',',')} `;
      creditAnimationFrame=0;
    };
    balanceText.nodeValue=`${from.toFixed(1).replace('.',',')} `;
    creditAnimationFrame=requestAnimationFrame(animate);
    requestAnimationFrame(()=>card.classList.add('credit-updated'));
    setTimeout(()=>card.classList.remove('credit-updated'),1100);
  }

  function initScrollEffects() {
    const progress=$('#scroll-progress');
    const updateProgress=()=>{
      if(scrollProgressFrame)return;
      scrollProgressFrame=requestAnimationFrame(()=>{
        const root=document.documentElement;
        const range=root.scrollHeight-window.innerHeight;
        const amount=range>0?Math.min(1,Math.max(0,window.scrollY/range)):0;
        progress.style.transform=`scaleX(${amount})`;
        scrollProgressFrame=0;
      });
    };
    window.addEventListener('scroll',updateProgress,{passive:true});
    window.addEventListener('resize',updateProgress,{passive:true});
    updateProgress();

    if(window.matchMedia('(prefers-reduced-motion: reduce)').matches||!('IntersectionObserver' in window))return;
    document.documentElement.classList.add('has-scroll-reveal');
    scrollRevealObserver=new IntersectionObserver(entries=>{
      entries.forEach(entry=>{
        if(!entry.isIntersecting)return;
        entry.target.classList.add('is-visible');
        scrollRevealObserver.unobserve(entry.target);
      });
    },{threshold:.12,rootMargin:'0px 0px -36px 0px'});
    observeScrollReveals();
  }

  function renderProfiles() {
    const query=slug($('#search-input').value), category=$('#category-filter').value, wanted=$('#offer-filter').value, modality=$('#modality-filter').value, sort=$('#sort-filter').value;
    let visible=profiles.filter(p=>{
      const text=slug([p.name,p.role,p.bio,p.category,...p.offers,...p.wants].join(' '));
      return (!query||text.includes(query))&&(!category||p.category===category)&&(!wanted||p.offers.some(s=>slug(s).includes(slug(wanted))))&&(!modality||p.modalities.includes(modality));
    });
    visible.sort((a,b)=>sort==='rating' ? profileRating(b).rating-profileRating(a).rating : compatibility(b).score-compatibility(a).score || profileRating(b).rating-profileRating(a).rating);
    $('#results-count').textContent=`${visible.length} ${visible.length===1?'perfil encontrado':'perfis encontrados'}`;
    $('#talent-grid').innerHTML=visible.map(p=>{
      const match=compatibility(p);
      const rating=profileRating(p);
      return `<article class="talent-card"><div class="talent-head">${avatar(p.initials,p.colors)}<div class="talent-identity"><h3>${esc(p.name)}</h3><span>${esc(p.role)} · ${esc(p.location)}</span></div><span class="match-pill">✳ ${match.score}%</span></div><p class="talent-bio">${esc(p.bio)}</p><div class="skill-row"><b>Ensina</b><div class="skill-tags">${skillTags(p.offers)}</div></div><div class="skill-row"><b>Quer</b><div class="skill-tags">${skillTags(p.wants,'wanted')}</div></div><div class="talent-meta"><span><span class="stars">★</span> ${rating.rating.toFixed(1)} (${rating.reviews})</span><span>${esc(p.level)} · ${p.trades} trocas</span></div><div class="card-actions"><button class="button button-outline" data-action="profile" data-id="${p.id}" aria-label="Ver perfil de ${esc(p.name)}">Ver perfil</button><button class="button" data-action="request" data-id="${p.id}" aria-label="Solicitar troca com ${esc(p.name)}">Solicitar troca <span aria-hidden="true">↗</span></button></div></article>`;
    }).join('');
    $('#empty-state').classList.toggle('hidden',visible.length!==0);
    $('#talent-grid').classList.toggle('hidden',visible.length===0);
    observeScrollReveals($('#talent-grid'));
  }

  function renderDashboard() {
    $('#credit-balance').innerHTML=`${state.balance.toFixed(1).replace('.',',')} <small>créditos</small>`;
    $('#completed-count').textContent=state.completed;
    $('#average-rating').innerHTML=`${state.avg.toFixed(1).replace('.',',')} <small>/ 5</small>`;
    const sessions=$('#sessions-list');
    const upcoming=state.sessions.filter(s=>s.status==='confirmed'||s.status==='pending');
    sessions.innerHTML=upcoming.length?upcoming.map(s=>`<div class="activity-row session-row">${avatar(s.initials,s.color)}<div class="activity-details"><b>${esc(s.skill)} · ${esc(s.name)}</b><small>${formatDate(s.date)} · ${esc(s.time)} · ${s.duration} min · ${esc(s.modality)}</small></div><span class="status-pill ${s.status==='confirmed'?'status-confirmed':'status-pending'}">${s.status==='confirmed'?'Confirmada':'A combinar'}</span><div class="activity-actions">${s.status==='pending'?`<button data-action="confirm-session" data-id="${esc(s.id)}" aria-label="Confirmar sessão com ${esc(s.name)}">Confirmar</button>`:''}<button data-action="complete-session" data-id="${esc(s.id)}" aria-label="Concluir sessão com ${esc(s.name)}">Concluir</button><button data-action="cancel-session" data-id="${esc(s.id)}" aria-label="Cancelar sessão com ${esc(s.name)}">Cancelar</button></div>${sessionTimelineMarkup(s.status==='pending'?'scheduled':s.status)}</div>`).join(''):`<div class="dashboard-empty">Nenhuma sessão próxima. Que tal propor uma troca?</div>`;
    $('#credit-history').innerHTML=state.history.length?state.history.slice(0,6).map(h=>`<div class="history-row ${h.id===highlightedCreditMovementId?'history-new-credit':''}"><span class="history-symbol ${h.kind==='debit'?'debit':''}">${h.kind==='debit'?'↗':'↙'}</span><span class="history-description">${esc(h.title)}<small>${formatDate(h.date)}</small></span><span class="history-amount ${h.kind==='debit'?'debit':''}">${esc(h.amount)} cr</span></div>`).join(''):`<div class="dashboard-empty">Suas movimentações aparecerão aqui.</div>`;
    highlightedCreditMovementId=null;
    const pending=state.requests.filter(r=>r.status==='pending');
    $('#request-count').textContent=`${pending.length} ${pending.length===1?'pendente':'pendentes'}`;
    $('#requests-list').innerHTML=pending.length?pending.map(r=>`<div class="request-row">${avatar(r.initials,r.color)}<div class="activity-details"><b>${esc(r.name)}</b><small>${esc(r.learn)} · ${r.duration} min</small></div><button class="clear-button" data-action="schedule-request" data-id="${esc(r.id)}" aria-label="Agendar sessão com ${esc(r.name)}">Agendar</button><button class="clear-button" data-action="cancel-request" data-id="${esc(r.id)}" aria-label="Cancelar solicitação para ${esc(r.name)}">Cancelar</button></div>`).join(''):`<div class="request-empty">Sem solicitações pendentes. Encontre alguém para começar.</div>`;
  }
  function formatDate(value) { const d=new Date(`${value}T12:00:00`); return Number.isNaN(d.getTime())?esc(value):new Intl.DateTimeFormat('pt-BR',{day:'2-digit',month:'short'}).format(d); }
  function openModal(content,wide=false) {
    const wasClosed=$('#modal-backdrop').classList.contains('hidden');
    if(wasClosed) modalReturnFocus=document.activeElement;
    $('#modal').classList.toggle('modal-wide',wide); $('#modal-content').innerHTML=content; $('#modal-backdrop').classList.remove('hidden'); document.body.style.overflow='hidden'; $('#modal-close').focus();
  }
  function closeModal() {
    $('#modal-backdrop').classList.add('hidden'); document.body.style.overflow='';
    if(modalReturnFocus?.isConnected) modalReturnFocus.focus();
    else $('#painel h2')?.focus();
    modalReturnFocus=null;
  }
  function profileMarkup(p) {
    const m=compatibility(p);
    const rating=profileRating(p);const comments=state.ratings.filter(r=>r.profileId===p.id&&r.comment);
    const matchConnections=[...m.iTeach.map(skill=>`<div class="match-connection"><span>Você ensina</span><b>${esc(skill)}</b><span>${esc(p.name.split(' ')[0])} quer aprender</span></div>`),...m.iLearn.map(skill=>`<div class="match-connection"><span>${esc(p.name.split(' ')[0])} ensina</span><b>${esc(skill)}</b><span>Você quer aprender</span></div>`)].join('');
    return `<div class="modal-kicker">PERFIL DEMONSTRATIVO</div><div class="profile-modal-head">${avatar(p.initials,p.colors)}<div><h2 id="modal-title">${esc(p.name)}</h2><p>${esc(p.role)} · ${esc(p.location)}</p></div></div><p class="profile-bio">${esc(p.bio)}</p><div class="profile-detail-grid"><div class="detail-box"><b>Ensina</b><p>${p.offers.map(esc).join('<br>')}</p></div><div class="detail-box"><b>Quer aprender</b><p>${p.wants.map(esc).join('<br>')}</p></div><div class="detail-box"><b>Sobre as sessões</b><p>${esc(p.level)}<br>${esc(p.availability)}</p></div><div class="detail-box"><b>Comunidade</b><p>★ ${rating.rating.toFixed(1)} em ${rating.reviews} avaliações<br>${p.trades} trocas concluídas</p></div></div>${comments.map(r=>`<p class="profile-bio"><b>★ ${r.score}/5</b> ${esc(r.comment)}</p>`).join('')}<div class="compatibility-box profile-compatibility"><div class="compatibility-top"><b>Compatibilidade com você</b><b>${m.score}%</b></div><div class="compatibility-meter" role="progressbar" aria-label="Compatibilidade com ${esc(p.name)}" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${m.score}"><span style="--match-width:${m.score}%"></span></div>${matchConnections}<p>${esc(m.explanation)}</p></div><button class="button button-full" data-action="request" data-id="${p.id}">Solicitar uma troca <span>↗</span></button>`;
  }
  function openProfile(profile) {
    openModal(profileMarkup(profile),true);
    const reveal=()=>$('.profile-compatibility')?.classList.add('is-revealed');
    if(window.matchMedia('(prefers-reduced-motion: reduce)').matches)reveal();
    else requestAnimationFrame(reveal);
  }
  function openRequest(profile) {
    const learnOptions=profile.offers.map(x=>`<option value="${esc(x)}">${esc(x)}</option>`).join('');
    const teachOptions=currentUser.offers.map(x=>`<option value="${esc(x)}">${esc(x)}</option>`).join('');
    openModal(`<div class="modal-kicker">UMA TROCA COMEÇA COM UM CONVITE</div><h2 id="modal-title">Propor uma troca</h2><p class="modal-intro">Esta solicitação é demonstrativa e ficará salva apenas neste navegador.</p><div class="request-person">${avatar(profile.initials,profile.colors)}<span><b>${esc(profile.name)}</b><small>${esc(profile.role)} · ${esc(profile.location)}</small></span></div><form class="request-form" id="request-form"><label>Quero aprender<select name="learn" required>${learnOptions}</select></label><label>Posso ensinar<select name="teach"><option value="">Sem troca recíproca definida</option>${teachOptions}</select></label><label>Duração da sessão<select name="duration" required><option value="30">30 minutos · meio crédito</option><option value="60" selected>1 hora · 1 crédito</option><option value="90">1h30 · 1,5 crédito</option></select></label><label>Modalidade<select name="modality" required>${profile.modalities.map(x=>`<option>${esc(x)}</option>`).join('')}</select></label><label>Data preferida<input type="date" name="date" min="${new Date().toISOString().slice(0,10)}" required></label><label>Horário preferido<input type="time" name="time" value="19:00" required></label><label class="full">Mensagem<textarea name="message" minlength="8" maxlength="240" placeholder="Conte um pouco sobre o que gostaria de aprender..." required></textarea></label><button class="button full" type="submit">Enviar solicitação <span aria-hidden="true">↗</span></button></form>`,true);
  }

  document.addEventListener('click',e=>{
    const action=e.target.closest('[data-action]');
    if(action){const id=action.dataset.id, profile=profiles.find(p=>p.id===id);
      if(action.dataset.action==='profile'&&profile)openProfile(profile);
      if(action.dataset.action==='request'&&profile)openRequest(profile);
      if(action.dataset.action==='cancel-request'){
        const request=state.requests.find(r=>r.id===id); if(request?.status==='pending'){request.status='cancelled';saveState();renderDashboard();toast('Solicitação cancelada.');}
      }
      if(action.dataset.action==='schedule-request'){
        const request=state.requests.find(r=>r.id===id);if(request?.status==='pending'&&!state.sessions.some(s=>s.requestId===id)){
          request.status='scheduled';const profile=profiles.find(p=>p.id===request.profileId);
          state.sessions.unshift({id:`session-${Date.now()}`,requestId:id,profileId:request.profileId,name:request.name,initials:request.initials,color:request.color,skill:request.learn,date:request.date,time:request.time,duration:request.duration,modality:request.modality,status:'pending',creditDone:false,rated:false});
          saveState();renderDashboard();toast('Sessão adicionada à agenda. Confirme para continuar.','success');
        }
      }
      if(action.dataset.action==='confirm-session'){
        const session=state.sessions.find(s=>s.id===id);if(session?.status==='pending'){session.status='confirmed';saveState();renderDashboard();toast('Sessão confirmada.');}
      }
      if(action.dataset.action==='cancel-session'){
        const session=state.sessions.find(s=>s.id===id);if(session&&!['completed','cancelled'].includes(session.status)&&confirm(`Cancelar a sessão com ${session.name}?`)){session.status='cancelled';saveState();renderDashboard();toast('Sessão cancelada.');}
      }
      if(action.dataset.action==='complete-session'){
        const session=state.sessions.find(s=>s.id===id);if(session&&session.status==='confirmed') completeSession(session);
      }
    }
  });
  function completeSession(session){
    if(session.status==='completed'||session.creditDone){toast('Esta sessão já foi concluída.','error');return;}
    const balanceBefore=state.balance;
    session.status='completed';session.creditDone=true;state.completed+=1;const amount=session.duration/60;state.balance=Math.round((state.balance+amount)*2)/2;
    const movement={id:`movement-${Date.now()}`,title:`${session.skill} · ${session.name}`,date:new Date().toISOString().slice(0,10),amount:`+${amount.toFixed(1).replace('.',',')}`,kind:'credit'};
    state.history.unshift(movement);highlightedCreditMovementId=movement.id;saveState();renderDashboard();animateCreditBalance(balanceBefore,state.balance);
    openModal(`<div class="modal-kicker">CONHECIMENTO COMPARTILHADO</div><h2 id="modal-title">Sessão concluída!</h2><p class="modal-intro">Sua sessão com ${esc(session.name)} foi registrada. Seu saldo agora é ${state.balance.toFixed(1).replace('.',',')} créditos demonstrativos.</p>${sessionTimelineMarkup('completed')}<div class="compatibility-box"><div class="compatibility-top"><b>Como foi aprender com ${esc(session.name.split(' ')[0])}?</b><b aria-hidden="true">★</b></div><div class="rating-picker" id="rating-picker" role="group" aria-label="Escolha uma nota de 1 a 5">${[1,2,3,4,5].map(n=>`<button type="button" data-rating="${n}" aria-label="Nota ${n}" aria-pressed="false">★</button>`).join('')}</div><label class="field-label" for="rating-comment">Comentário opcional</label><textarea id="rating-comment" maxlength="240" class="request-form" style="width:100%;height:70px;padding:9px;border:1px solid #e7e7ef;border-radius:8px;resize:vertical" placeholder="Compartilhe como foi a experiência"></textarea></div><button class="button button-full" id="submit-rating" data-session="${esc(session.id)}">Salvar avaliação <span aria-hidden="true">↗</span></button><button class="button button-outline button-full" id="skip-rating">Agora não</button>`);
    let selected=0;$('#rating-picker').addEventListener('click',e=>{const b=e.target.closest('[data-rating]');if(!b)return;selected=Number(b.dataset.rating);$$('[data-rating]',$('#rating-picker')).forEach(x=>{const active=Number(x.dataset.rating)<=selected;x.classList.toggle('selected',active);x.setAttribute('aria-pressed',String(Number(x.dataset.rating)===selected));});});
    $('#submit-rating').addEventListener('click',()=>{if(!selected){toast('Escolha uma nota de 1 a 5.','error');return;}if(state.ratings.some(r=>r.sessionId===session.id)){toast('Você já avaliou esta sessão.','error');closeModal();return;}const comment=$('#rating-comment').value.trim();state.ratings.push({sessionId:session.id,profileId:session.profileId||null,score:selected,comment,date:new Date().toISOString().slice(0,10)});saveState();renderDashboard();renderProfiles();closeModal();toast('Avaliação registrada. Obrigado por compartilhar!','success');});
    $('#skip-rating').addEventListener('click',closeModal);
  }

  document.addEventListener('submit',e=>{
    if(e.target.id!=='request-form')return;e.preventDefault();const data=new FormData(e.target);const personName=$('#modal-content .request-person b')?.textContent;const selectedProfile=profiles.find(p=>p.name===personName);if(!selectedProfile)return;
    const duration=Number(data.get('duration')),date=data.get('date'),time=data.get('time'),message=String(data.get('message')||'').trim();if(!data.get('learn')||!date||!time||message.length<8){toast('Preencha os campos e escreva uma mensagem com pelo menos 8 caracteres.','error');return;}if(state.requests.some(r=>r.profileId===selectedProfile.id&&r.status==='pending')){toast('Você já tem uma solicitação pendente para esta pessoa.','error');return;}
    state.requests.unshift({id:`request-${Date.now()}`,profileId:selectedProfile.id,name:selectedProfile.name,initials:selectedProfile.initials,color:selectedProfile.colors,learn:String(data.get('learn')),teach:String(data.get('teach')||''),duration,modality:String(data.get('modality')),date,time,message,status:'pending'});saveState();renderDashboard();openModal(`<div class="match-result"><div class="result-icon">✓</div><div class="modal-kicker">CONVITE ENVIADO</div><h2 id="modal-title">Sua troca está a caminho.</h2><p>O convite demonstrativo para <b>${esc(selectedProfile.name)}</b> já aparece no seu painel. Quando a pessoa confirmar, sua sessão poderá ser combinada.</p><div class="result-skills"><span class="skill-tag">Aprender: ${esc(String(data.get('learn')))}</span><span class="skill-tag wanted">${duration} min · ${esc(String(data.get('modality')))}</span></div><button class="button button-full" id="close-success">Ver meu painel <span>↗</span></button></div>`);$('#close-success').addEventListener('click',()=>{closeModal();location.hash='painel';});
  });

  ['search-input','category-filter','offer-filter','modality-filter','sort-filter'].forEach(id=>$('#'+id).addEventListener(id==='search-input'?'input':'change',renderProfiles));
  function clearFilters(){ $('#search-input').value='';$('#category-filter').value='';$('#offer-filter').value='';$('#modality-filter').value='';$('#sort-filter').value='match';renderProfiles(); }
  $('#clear-filters').addEventListener('click',clearFilters);$('#empty-clear').addEventListener('click',clearFilters);
  $('#modal-close').addEventListener('click',closeModal);$('#modal-backdrop').addEventListener('click',e=>{if(e.target===$('#modal-backdrop'))closeModal();});document.addEventListener('keydown',e=>{
    if($('#modal-backdrop').classList.contains('hidden'))return;
    if(e.key==='Escape'){e.preventDefault();closeModal();return;}
    if(e.key==='Tab'){
      const focusable=$$('#modal button:not([disabled]), #modal a[href], #modal input:not([disabled]), #modal select:not([disabled]), #modal textarea:not([disabled]), #modal [tabindex]:not([tabindex="-1"])').filter(el=>el.getClientRects().length);
      if(!focusable.length){e.preventDefault();$('#modal').focus();return;}
      const first=focusable[0],last=focusable[focusable.length-1];
      if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus();}
      else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}
    }
  });
  $('#menu-toggle').addEventListener('click',()=>{const nav=$('#main-nav'),open=nav.classList.toggle('open');$('#menu-toggle').setAttribute('aria-expanded',String(open));$('#menu-toggle').setAttribute('aria-label',open?'Fechar menu':'Abrir menu');});
  $('#main-nav').addEventListener('click',e=>{if(e.target.closest('a')){$('#main-nav').classList.remove('open');$('#menu-toggle').setAttribute('aria-expanded','false');}});
  $('#reset-demo').addEventListener('click',()=>{if(!confirm('Reiniciar os dados demonstrativos? Suas solicitações, sessões, avaliações e saldo local voltarão ao início.'))return;state=defaultState();saveState();renderDashboard();renderProfiles();toast('Demonstração reiniciada.','success');});
  renderProfiles();renderDashboard();
  initScrollEffects();
})();
