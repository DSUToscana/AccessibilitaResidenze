// Helper per aggiornare il dataset quando l'utente rinomina la spaziocomune	
function aggiornaDatasetSpazioComune(inputEl) {
  const nuovoNome = inputEl.value.trim();
  const cardSpazioComune = inputEl.closest('.nodo-spaziocomune');
  if (!cardSpazioComune) return;

  const selects = cardSpazioComune.querySelectorAll('.input-valore-spaziocomune');
  selects.forEach(sel => {
    sel.dataset.nomeSpazioComune = nuovoNome;
  });

  // 👈 AGGIORNAMENTO DINAMICO NOMI NELLE TENDINE DI COPIA
  aggiornaTutteLeSelectSpaziComuni();
}


// ==================================================
// 3. GENERAZIONE UI CARD SPAZIO COMUNE
// ==================================================
function generaCardSpazioComuneOLD(idLivello, pianoSelezionato, idSpazioComune, nomeSpazioComune, livelloNum, mappaValori = {}) {
  const spaziocomuneCard = document.createElement('div');
  spaziocomuneCard.className = 'nodo-spaziocomune spaziocomune-card';
  spaziocomuneCard.dataset.livello = livelloNum;

  if (idSpazioComune) spaziocomuneCard.dataset.idSpazioComune = idSpazioComune;
  if (idLivello) spaziocomuneCard.dataset.idLivello = idLivello;

  // 1. DEFINIZIONE DEL TEMA (Deve stare prima dell'uso nell'Header!)
  const livelloIdx = (parseInt(livelloNum, 10) - 1) % paletteLivelli.length;
  const tema = paletteLivelli[livelloIdx] || paletteLivelli[0];

  spaziocomuneCard.style.backgroundColor = tema.bgCard;
  spaziocomuneCard.style.borderLeft = `6px solid ${tema.border}`;
  spaziocomuneCard.style.borderTop = '1px solid #cbd5e1';
  spaziocomuneCard.style.borderRight = '1px solid #cbd5e1';
  spaziocomuneCard.style.borderBottom = '1px solid #cbd5e1';
  spaziocomuneCard.style.borderRadius = '6px';
  spaziocomuneCard.style.marginBottom = '12px';
  spaziocomuneCard.style.overflow = 'hidden';

  const valoreNomeInput = nomeSpazioComune || '';


  // Assegniamo un ID temporaneo DOM univoco alla card per la mappatura del select di copia
  spaziocomuneCard.dataset.tempId = 'spaziocomune_dom_' + Math.random().toString(36).substr(2, 6);

  // 2. HEADER SPAZIO COMUNE
  const spaziocomuneHeader = document.createElement('div');
  spaziocomuneHeader.className = 'header-livello-0';
  spaziocomuneHeader.style.cssText = 'cursor:pointer; padding:10px 14px; font-weight:bold; display:flex; justify-content:space-between; align-items:center;';
  spaziocomuneHeader.style.backgroundColor = tema.bgHeader;
  spaziocomuneHeader.style.color = tema.testo;


spaziocomuneHeader.innerHTML = `
  <div style="display:flex; align-items:center; gap:8px; flex:1; flex-wrap:wrap;" onclick="event.stopPropagation();">
    <span style="font-weight:600; color:${tema.testo};">🛏️ Livello ${livelloNum} - ${pianoSelezionato} - SpazioComune:</span>
    <input type="text" 
           class="input-nome-spaziocomune" 
           data-id-spaziocomune="${idSpazioComune || ''}" 
           data-id-livello="${idLivello || ''}"
           value="${valoreNomeInput}" 
           placeholder="Digita identificativo spaziocomune"
           style="padding:4px 8px; border-radius:4px; border:1px solid ${tema.border}; background:#ffffff; color:#1e293b; font-weight:600; width:200px;"
           onkeyup="typeof aggiornaDatasetSpazioComune === 'function' && aggiornaDatasetSpazioComune(this)"
           onchange="typeof aggiornaDatasetSpazioComune === 'function' && aggiornaDatasetSpazioComune(this)" />
    


    <!-- 📋 BLOCCO COPIA PRESENTE SU TUTTE LE SPAZI COMUNI (ANCHE LA PRIMA) -->
    <div style="display:flex; align-items:center; gap:4px; margin-left:auto;">
      <select class="select-copia-spaziocomune" 
              onfocus="aggiornaSelectSpaziComuniCopia(this.closest('.nodo-spaziocomune'))"
              style="padding:4px 6px; font-size:0.85em; border-radius:4px; border:1px solid #cbd5e1; background:#ffffff; color:#334155; max-width:180px;">
        <option value="">-- Copia da spaziocomune... --</option>
      </select>

      <button type="button"
              class="btn-copia-spaziocomune"
              title="Copia i valori dalla spaziocomune selezionata"
              onclick="copiaDaSpazioComuneSelezionata(this)"
              style="padding:4px 10px; font-size:0.85em; background:#ffffff; color:#0284c7; border:1px solid #0284c7; border-radius:4px; cursor:pointer; font-weight:600; transition:all 0.2s;">
        📋 Copia
      </button>
    </div>
  </div>
  <span class="icona" style="margin-left:12px; color:${tema.testo};">➕</span>
`;

  // ... resto del codice della funzione (spaziocomuneHeader.onclick, areeDisponibili.forEach, ecc.) invariato
  spaziocomuneHeader.onclick = (e) => {
    if (e.target.tagName !== 'INPUT') {
      toggleLivello(spaziocomuneHeader);
    }
  };

  const spaziocomuneBody = document.createElement('div');
  spaziocomuneBody.className = 'body-livello';
  spaziocomuneBody.style.cssText = 'display:none; padding:10px; background:#f8fafc;';

  const areeDisponibili = Object.keys(alberoIndicatori || {});
  if (areeDisponibili.length === 0) {
    spaziocomuneBody.innerHTML = `<div style="padding:10px; color:#ef4444; font-style:italic;">Nessun indicatore caricato dal database. Verifica la tabella 'indicatori_facilitazioni' per le spazicomuni.</div>`;
    spaziocomuneCard.appendChild(spaziocomuneHeader);
    spaziocomuneCard.appendChild(spaziocomuneBody);
    return spaziocomuneCard;
  }

  // 3. RECUPERO SICURO DELLA SPAZIO COMUNE
  let datiSpazioComuneSalvati = {};

  if (idLivello && mappaValori[idLivello]) {
    const contenitoreLivello = mappaValori[idLivello];
    
    if (Array.isArray(contenitoreLivello)) {
      datiSpazioComuneSalvati = contenitoreLivello.find(s => 
        (idSpazioComune && Number(s.idSpazioComune || s.id_spaziocomune || s.id) === Number(idSpazioComune)) ||
        (valoreNomeInput && (s.nomeSpazioComune || s.nome || s.nome_spaziocomune) === valoreNomeInput)
      ) || {};
    } else if (typeof contenitoreLivello === 'object') {
      datiSpazioComuneSalvati = contenitoreLivello[idSpazioComune] || contenitoreLivello[valoreNomeInput] || {};
    }
  } else if (idSpazioComune && mappaValori[idSpazioComune]) {
    datiSpazioComuneSalvati = mappaValori[idSpazioComune];
  }

  // Estrazione sicura della lista/oggetto degli indicatori salvati
  const sorgenteIndicatori = datiSpazioComuneSalvati.indicatori || 
                             datiSpazioComuneSalvati.valori || 
                             datiSpazioComuneSalvati.scheda_spazicomuni || 
                             datiSpazioComuneSalvati;


  // Costruzione Struttura Albero
  areeDisponibili.forEach(nomeArea => {
    const areaCard = document.createElement('div');
    areaCard.className = 'nodo-area';
    areaCard.style.cssText = 'margin-bottom:8px; border:1px solid #e2e8f0; border-radius:6px; background:#fff;';

    const areaHeader = document.createElement('div');
    areaHeader.className = 'header-livello-1';
	areaHeader.nomearea=nomeArea; 
    areaHeader.style.cssText = 'cursor:pointer; background:#e2e8f0; color:#334155; padding:8px 12px; font-weight:600; display:flex; justify-content:space-between; align-items:center;';

    const areaBody = document.createElement('div');
    areaBody.className = 'body-livello';
    areaBody.style.cssText = 'display:none; padding:8px;';

    const ambiti = alberoIndicatori[nomeArea] || {};
    Object.keys(ambiti).forEach(nomeAmbito => {
      const ambitoCard = document.createElement('div');
      ambitoCard.className = 'nodo-ambito';
      ambitoCard.style.cssText = 'margin-bottom:6px; border-left:4px solid #0284c7; background:#fff; border:1px solid #f1f5f9; border-radius:4px;';

      const ambitoHeader = document.createElement('div');
      ambitoHeader.className = 'header-livello-2';
      ambitoHeader.style.cssText = 'cursor:pointer; background:#f1f5f9; color:#1e293b; padding:6px 10px; font-weight:600; font-size:0.95em; display:flex; justify-content:space-between; align-items:center;';
      ambitoHeader.innerHTML = `<span>📂 AMBITO: ${nomeAmbito}</span> <span class="icona">➕</span>`;
      ambitoHeader.onclick = (e) => { e.stopPropagation(); toggleLivello(ambitoHeader); };
      const ambitoBody = document.createElement('div');
      ambitoBody.className = 'body-livello';
      ambitoBody.style.cssText = 'display:none; padding:8px;';

      const requisiti = ambiti[nomeAmbito] || [];
      requisiti.forEach(req => {
        let valoreSalvato = '';
        let notaSalvata = '';
        let recordIndicatore = null;
        // Ricerca indicatore
        if (Array.isArray(sorgenteIndicatori)) {
          recordIndicatore = sorgenteIndicatori.find(item => 
            Number(item.id_indicatore_facilitazioni || item.id_indicatore || item.idIndicatore || item.id) === Number(req.id)
          );
        } else if (sorgenteIndicatori && typeof sorgenteIndicatori === 'object') {
          recordIndicatore = sorgenteIndicatori[req.id];
        }

        if (recordIndicatore) {
          if (typeof recordIndicatore === 'object') {
            valoreSalvato = recordIndicatore.value || recordIndicatore.valore || recordIndicatore.value_indicatore || '';
            notaSalvata = recordIndicatore.nota || recordIndicatore.note || '';
          } else {
            valoreSalvato = recordIndicatore;
          }
        }

        const reqUniqueId = `info_${idLivello || 'new'}_${req.id}_${Math.random().toString(36).substr(2, 4)}`;
        const reqBox = document.createElement('div');
        reqBox.className = 'nodo-requisito';
        reqBox.style.cssText = 'background:#fff; border:1px solid #e2e8f0; padding:8px 12px; margin-bottom:6px; border-radius:4px; font-size:0.9em;';
        let iconeHtml = '';
        let dettagliPopups = '';
        if (req.caratteristiche) {
          iconeHtml += `<button type="button" onclick="event.stopPropagation(); toggleInfoPopup('${reqUniqueId}_car')" title="Caratteristiche" style="border:none; background:#e0f2fe; color:#0369a1; border-radius:50%; width:24px; height:24px; cursor:pointer; font-size:0.8em; margin-left:4px;">⚙️</button>`;
          dettagliPopups += `<div id="${reqUniqueId}_car" class="info-popup-box" style="display:none; background:#f0f9ff; border:1px solid #bae6fd; color:#0369a1; padding:8px; border-radius:4px; font-size:0.85em; margin-top:4px;"><strong>⚙️ Caratteristiche:</strong> ${req.caratteristiche}</div>`;
        }

        if (req.disabilita) {
          iconeHtml += `<button type="button" onclick="event.stopPropagation(); toggleInfoPopup('${reqUniqueId}_dis')" title="Disabilità target" style="border:none; background:#fef3c7; color:#92400e; border-radius:50%; width:24px; height:24px; cursor:pointer; font-size:0.8em; margin-left:4px;">♿</button>`;
          dettagliPopups += `<div id="${reqUniqueId}_dis" class="info-popup-box" style="display:none; background:#fffbeb; border:1px solid #fde68a; color:#92400e; padding:8px; border-radius:4px; font-size:0.85em; margin-top:4px;"><strong>♿ Disabilità Target:</strong> ${req.disabilita}</div>`;
        }

        if (req.note) {
          iconeHtml += `<button type="button" onclick="event.stopPropagation(); toggleInfoPopup('${reqUniqueId}_not')" title="Note guida" style="border:none; background:#f3e8ff; color:#6b21a8; border-radius:50%; width:24px; height:24px; cursor:pointer; font-size:0.8em; margin-left:4px;">💡</button>`;
          dettagliPopups += `<div id="${reqUniqueId}_not" class="info-popup-box" style="display:none; background:#faf5ff; border:1px solid #e9d5ff; color:#6b21a8; padding:8px; border-radius:4px; font-size:0.85em; margin-top:4px;"><strong>💡 Note Guida:</strong> ${req.note}</div>`;
        }
        reqBox.innerHTML = `
          <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:8px;">
            <div style="display:flex; align-items:center; flex:1; min-width:240px;">
              <span style="font-weight:500; color:#1e293b;">📄 ${req.requisito}</span>
              <div style="display:inline-flex; align-items:center;">
                ${iconeHtml}
              </div>
            </div>
            <div style="display:flex; align-items:center; gap:8px;">
              <select class="input-valore-spaziocomune" 
                      data-id-spaziocomune="${idSpazioComune || ''}"
                      data-id-livello="${idLivello || ''}" 
                      data-nome-spaziocomune="${valoreNomeInput}" 
                      data-id-indicatore="${req.id}"
                      style="padding:4px 8px; border-radius:4px; border:1px solid #cbd5e1; font-size:0.85em; background:#fff;">
                <option value="" ${valoreSalvato === '' ? 'selected' : ''}>-- Non valutato --</option>
                <option value="Conforme" ${valoreSalvato === 'Conforme' ? 'selected' : ''}>Conforme / Presente</option>
                <option value="Non Conforme" ${valoreSalvato === 'Non Conforme' ? 'selected' : ''}>Non Conforme</option>
                <option value="Parziale" ${valoreSalvato === 'Parziale' ? 'selected' : ''}>Parzialmente Conforme</option>
                <option value="Non Applicabile" ${valoreSalvato === 'Non Applicabile' ? 'selected' : ''}>Non Applicabile</option>
              </select>
              <input type="text" 
                     class="input-nota-valore-spaziocomune" 
                     value="${notaSalvata}"
                     placeholder="nota"
                     style="padding:4px 8px; border-radius:4px; border:1px solid #cbd5e1; font-size:0.85em; background:#fff; width:180px;" />
            </div>
          </div>
          ${dettagliPopups}
        `;

        ambitoBody.appendChild(reqBox);
      });

      ambitoCard.appendChild(ambitoHeader);
      ambitoCard.appendChild(ambitoBody);
      areaBody.appendChild(ambitoCard);
    });

    areaCard.appendChild(areaHeader);
    areaCard.appendChild(areaBody);
    spaziocomuneBody.appendChild(areaCard);
  });

  spaziocomuneCard.appendChild(spaziocomuneHeader);
  spaziocomuneCard.appendChild(spaziocomuneBody);

  return spaziocomuneCard;
}


function generaCardSpazioComune(idLivello, pianoSelezionato, idSpazioComune, nomeSpazioComune, livelloNum, mappaValori = {}) {
  const spaziocomuneCard = document.createElement('div');
  spaziocomuneCard.className = 'nodo-spaziocomune spaziocomune-card';
  spaziocomuneCard.dataset.livello = livelloNum;

  if (idSpazioComune) spaziocomuneCard.dataset.idSpazioComune = idSpazioComune;
  if (idLivello) spaziocomuneCard.dataset.idLivello = idLivello;

  // 1. DEFINIZIONE DEL TEMA (Prima dell'uso nell'Header!)
  const livelloIdx = (parseInt(livelloNum, 10) - 1) % paletteLivelli.length;
  const tema = paletteLivelli[livelloIdx] || paletteLivelli[0];

  spaziocomuneCard.style.backgroundColor = tema.bgCard;
  spaziocomuneCard.style.borderLeft = `6px solid ${tema.border}`;
  spaziocomuneCard.style.borderTop = '1px solid #cbd5e1';
  spaziocomuneCard.style.borderRight = '1px solid #cbd5e1';
  spaziocomuneCard.style.borderBottom = '1px solid #cbd5e1';
  spaziocomuneCard.style.borderRadius = '6px';
  spaziocomuneCard.style.marginBottom = '12px';
  spaziocomuneCard.style.overflow = 'hidden';

  const valoreNomeInput = nomeSpazioComune || '';

  // Assegniamo un ID temporaneo DOM univoco alla card per la mappatura del select di copia
  spaziocomuneCard.dataset.tempId = 'spaziocomune_dom_' + Math.random().toString(36).substr(2, 6);

  // 2. HEADER SPAZIO COMUNE
  const spaziocomuneHeader = document.createElement('div');
  spaziocomuneHeader.className = 'header-livello-0';
  spaziocomuneHeader.style.cssText = 'cursor:pointer; padding:10px 14px; font-weight:bold; display:flex; justify-content:space-between; align-items:center;';
  spaziocomuneHeader.style.backgroundColor = tema.bgHeader;
  spaziocomuneHeader.style.color = tema.testo;

  spaziocomuneHeader.innerHTML = `
    <div style="display:flex; align-items:center; gap:8px; flex:1; flex-wrap:wrap;" onclick="event.stopPropagation();">
      <span style="font-weight:600; color:${tema.testo};">🏛️ Livello ${livelloNum} - ${pianoSelezionato} - Spazio Comune:</span>
      <input type="text" 
             class="input-nome-spaziocomune" 
             data-id-spaziocomune="${idSpazioComune || ''}" 
             data-id-livello="${idLivello || ''}"
             value="${valoreNomeInput}" 
             placeholder="Digita identificativo spazio comune"
             style="padding:4px 8px; border-radius:4px; border:1px solid ${tema.border}; background:#ffffff; color:#1e293b; font-weight:600; width:200px;"
             onkeyup="typeof aggiornaDatasetSpazioComune === 'function' && aggiornaDatasetSpazioComune(this)"
             onchange="typeof aggiornaDatasetSpazioComune === 'function' && aggiornaDatasetSpazioComune(this)" />

      <!-- BLOCCO COPIA PER SPAZI COMUNI -->
      <div style="display:flex; align-items:center; gap:4px; margin-left:auto;">
        <select class="select-copia-spaziocomune" 
                onfocus="typeof aggiornaSelectSpaziComuniCopia === 'function' && aggiornaSelectSpaziComuniCopia(this.closest('.nodo-spaziocomune'))"
                style="padding:4px 6px; font-size:0.85em; border-radius:4px; border:1px solid #cbd5e1; background:#ffffff; color:#334155; max-width:180px;">
          <option value="">-- Copia da spazio comune... --</option>
        </select>

        <button type="button"
                class="btn-copia-spaziocomune"
                title="Copia i valori dallo spazio comune selezionato"
                onclick="typeof copiaDaSpazioComuneSelezionata === 'function' && copiaDaSpazioComuneSelezionata(this)"
                style="padding:4px 10px; font-size:0.85em; background:#ffffff; color:#0284c7; border:1px solid #0284c7; border-radius:4px; cursor:pointer; font-weight:600; transition:all 0.2s;">
          📋 Copia
        </button>
      </div>
    </div>
    <span class="icona" style="margin-left:12px; color:${tema.testo};">➕</span>
  `;

  spaziocomuneHeader.onclick = (e) => {
    if (e.target.tagName !== 'INPUT' && e.target.tagName !== 'SELECT' && e.target.tagName !== 'BUTTON') {
      toggleLivello(spaziocomuneHeader);
    }
  };

  const spaziocomuneBody = document.createElement('div');
  spaziocomuneBody.className = 'body-livello';
  spaziocomuneBody.style.cssText = 'display:none; padding:10px; background:#f8fafc;';

  const areeDisponibili = Object.keys(alberoIndicatori || {});
  if (areeDisponibili.length === 0) {
    spaziocomuneBody.innerHTML = `<div style="padding:10px; color:#ef4444; font-style:italic;">Nessun indicatore caricato dal database. Verifica la tabella 'indicatori_facilitazioni' per gli spazi comuni.</div>`;
    spaziocomuneCard.appendChild(spaziocomuneHeader);
    spaziocomuneCard.appendChild(spaziocomuneBody);
    return spaziocomuneCard;
  }

  // 3. RECUPERO SICURO DEGLI SPAZI COMUNI
  let datiSpazioComuneSalvati = {};

  if (idLivello && mappaValori[idLivello]) {
    const contenitoreLivello = mappaValori[idLivello];
    
    if (Array.isArray(contenitoreLivello)) {
      datiSpazioComuneSalvati = contenitoreLivello.find(s => 
        (idSpazioComune && Number(s.idSpazioComune || s.id_spaziocomune || s.id) === Number(idSpazioComune)) ||
        (valoreNomeInput && (s.nomeSpazioComune || s.nome || s.nome_spaziocomune) === valoreNomeInput)
      ) || {};
    } else if (typeof contenitoreLivello === 'object') {
      datiSpazioComuneSalvati = contenitoreLivello[idSpazioComune] || contenitoreLivello[valoreNomeInput] || {};
    }
  } else if (idSpazioComune && mappaValori[idSpazioComune]) {
    datiSpazioComuneSalvati = mappaValori[idSpazioComune];
  }

  // Estrazione sicura della lista/oggetto degli indicatori salvati
  const sorgenteIndicatori = datiSpazioComuneSalvati.indicatori || 
                              datiSpazioComuneSalvati.valori || 
                              datiSpazioComuneSalvati.scheda_spazicomuni || 
                              datiSpazioComuneSalvati;

  // 4. COSTRUZIONE STRUTTURA ALBERO
  areeDisponibili.forEach(nomeArea => {
    const areaCard = document.createElement('div');
    areaCard.className = 'nodo-area';
    areaCard.style.cssText = 'margin-bottom:8px; border:1px solid #e2e8f0; border-radius:6px; background:#fff;';

    const areaHeader = document.createElement('div');
    areaHeader.className = 'header-livello-1';
    areaHeader.nomearea = nomeArea; 
    areaHeader.style.cssText = 'cursor:pointer; background:#e2e8f0; color:#334155; padding:8px 12px; font-weight:600; display:flex; justify-content:space-between; align-items:center;';
    
    // Titolo e toggle per l'Area
    areaHeader.innerHTML = `<span>📁 AREA: ${nomeArea}</span> <span class="icona">➕</span>`;
    areaHeader.onclick = (e) => { e.stopPropagation(); toggleLivello(areaHeader); };

    const areaBody = document.createElement('div');
    areaBody.className = 'body-livello';
    areaBody.style.cssText = 'display:none; padding:8px;';

    const ambiti = alberoIndicatori[nomeArea] || {};
    Object.keys(ambiti).forEach(nomeAmbito => {
      const ambitoCard = document.createElement('div');
      ambitoCard.className = 'nodo-ambito';
      ambitoCard.style.cssText = 'margin-bottom:6px; border-left:4px solid #0284c7; background:#fff; border:1px solid #f1f5f9; border-radius:4px;';

      const ambitoHeader = document.createElement('div');
      ambitoHeader.className = 'header-livello-2';
      ambitoHeader.style.cssText = 'cursor:pointer; background:#f1f5f9; color:#1e293b; padding:6px 10px; font-weight:600; font-size:0.95em; display:flex; justify-content:space-between; align-items:center;';
      ambitoHeader.innerHTML = `<span>📂 AMBITO: ${nomeAmbito}</span> <span class="icona">➕</span>`;
      ambitoHeader.onclick = (e) => { e.stopPropagation(); toggleLivello(ambitoHeader); };

      const ambitoBody = document.createElement('div');
      ambitoBody.className = 'body-livello';
      ambitoBody.style.cssText = 'display:none; padding:8px;';

      const requisiti = ambiti[nomeAmbito] || [];
      requisiti.forEach(req => {
        let valoreSalvato = '';
        let notaSalvata = '';
        let recordIndicatore = null;

        // Ricerca indicatore
        if (Array.isArray(sorgenteIndicatori)) {
          recordIndicatore = sorgenteIndicatori.find(item => 
            Number(item.id_indicatore_facilitazioni || item.id_indicatore || item.idIndicatore || item.id) === Number(req.id)
          );
        } else if (sorgenteIndicatori && typeof sorgenteIndicatori === 'object') {
          recordIndicatore = sorgenteIndicatori[req.id];
        }

        if (recordIndicatore) {
          if (typeof recordIndicatore === 'object') {
            valoreSalvato = recordIndicatore.value || recordIndicatore.valore || recordIndicatore.value_indicatore || '';
            notaSalvata = recordIndicatore.nota || recordIndicatore.note || '';
          } else {
            valoreSalvato = recordIndicatore;
          }
        }

        const reqUniqueId = `info_${idLivello || 'new'}_${req.id}_${Math.random().toString(36).substr(2, 4)}`;
        const reqBox = document.createElement('div');
        reqBox.className = 'nodo-requisito';
        reqBox.style.cssText = 'background:#fff; border:1px solid #e2e8f0; padding:8px 12px; margin-bottom:6px; border-radius:4px; font-size:0.9em;';

        let iconeHtml = '';
        let dettagliPopups = '';
        if (req.caratteristiche) {
          iconeHtml += `<button type="button" onclick="event.stopPropagation(); toggleInfoPopup('${reqUniqueId}_car')" title="Caratteristiche" style="border:none; background:#e0f2fe; color:#0369a1; border-radius:50%; width:24px; height:24px; cursor:pointer; font-size:0.8em; margin-left:4px;">⚙️</button>`;
          dettagliPopups += `<div id="${reqUniqueId}_car" class="info-popup-box" style="display:none; background:#f0f9ff; border:1px solid #bae6fd; color:#0369a1; padding:8px; border-radius:4px; font-size:0.85em; margin-top:4px;"><strong>⚙️ Caratteristiche:</strong> ${req.caratteristiche}</div>`;
        }

        if (req.disabilita) {
          iconeHtml += `<button type="button" onclick="event.stopPropagation(); toggleInfoPopup('${reqUniqueId}_dis')" title="Disabilità target" style="border:none; background:#fef3c7; color:#92400e; border-radius:50%; width:24px; height:24px; cursor:pointer; font-size:0.8em; margin-left:4px;">♿</button>`;
          dettagliPopups += `<div id="${reqUniqueId}_dis" class="info-popup-box" style="display:none; background:#fffbeb; border:1px solid #fde68a; color:#92400e; padding:8px; border-radius:4px; font-size:0.85em; margin-top:4px;"><strong>♿ Disabilità Target:</strong> ${req.disabilita}</div>`;
        }

        if (req.note) {
          iconeHtml += `<button type="button" onclick="event.stopPropagation(); toggleInfoPopup('${reqUniqueId}_not')" title="Note guida" style="border:none; background:#f3e8ff; color:#6b21a8; border-radius:50%; width:24px; height:24px; cursor:pointer; font-size:0.8em; margin-left:4px;">💡</button>`;
          dettagliPopups += `<div id="${reqUniqueId}_not" class="info-popup-box" style="display:none; background:#faf5ff; border:1px solid #e9d5ff; color:#6b21a8; padding:8px; border-radius:4px; font-size:0.85em; margin-top:4px;"><strong>💡 Note Guida:</strong> ${req.note}</div>`;
        }

        // Testo requisito con fallback universale
        const testoRequisito = req.requisito || req.indicatore || req.nome || 'Indicatore #' + req.id;

        reqBox.innerHTML = `
          <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:8px;">
            <div style="display:flex; align-items:center; flex:1; min-width:240px;">
              <span style="font-weight:500; color:#1e293b;">📄 ${testoRequisito}</span>
              <div style="display:inline-flex; align-items:center;">
                ${iconeHtml}
              </div>
            </div>
            <div style="display:flex; align-items:center; gap:8px;">
              <select class="input-valore-spaziocomune" 
                      data-id-spaziocomune="${idSpazioComune || ''}"
                      data-id-livello="${idLivello || ''}" 
                      data-nome-spaziocomune="${valoreNomeInput}" 
                      data-id-indicatore="${req.id}"
                      style="padding:4px 8px; border-radius:4px; border:1px solid #cbd5e1; font-size:0.85em; background:#fff;">
                <option value="" ${valoreSalvato === '' ? 'selected' : ''}>-- Non valutato --</option>
                <option value="Conforme" ${valoreSalvato === 'Conforme' ? 'selected' : ''}>Conforme / Presente</option>
                <option value="Non Conforme" ${valoreSalvato === 'Non Conforme' ? 'selected' : ''}>Non Conforme</option>
                <option value="Parziale" ${valoreSalvato === 'Parziale' ? 'selected' : ''}>Parzialmente Conforme</option>
                <option value="Non Applicabile" ${valoreSalvato === 'Non Applicabile' ? 'selected' : ''}>Non Applicabile</option>
              </select>
              <input type="text" 
                     class="input-nota-valore-spaziocomune" 
                     value="${notaSalvata}"
                     placeholder="nota"
                     style="padding:4px 8px; border-radius:4px; border:1px solid #cbd5e1; font-size:0.85em; background:#fff; width:180px;" />
            </div>
          </div>
          ${dettagliPopups}
        `;

        ambitoBody.appendChild(reqBox);
      });

      ambitoCard.appendChild(ambitoHeader);
      ambitoCard.appendChild(ambitoBody);
      areaBody.appendChild(ambitoCard);
    });

    areaCard.appendChild(areaHeader);
    areaCard.appendChild(areaBody);
    spaziocomuneBody.appendChild(areaCard);
  });

  spaziocomuneCard.appendChild(spaziocomuneHeader);
  spaziocomuneCard.appendChild(spaziocomuneBody);

  return spaziocomuneCard;
}



// ==================================================
// COPIA DA SPAZIO COMUNE PRECEDENTE
// ==================================================
function copiaDaSpazioComunePrecedente(btnEl) {
  // 1. Trova la card della spaziocomune corrente
  const cardCorrente = btnEl.closest('.nodo-spaziocomune');
  if (!cardCorrente) return;

  // 2. Trova la spaziocomune precedente nello stesso contenitore/livello
  const spaziocomunePrecedente = cardCorrente.previousElementSibling;

  if (!spaziocomunePrecedente || !spaziocomunePrecedente.classList.contains('nodo-spaziocomune')) {
    alert("Nessuna spaziocomune precedente trovata in questo livello!");
    return;
  }

  // 3. Recupera i valori dalla spaziocomune precedente usando gli ID degli indicatori
  const selectPrecedenti = spaziocomunePrecedente.querySelectorAll('.input-valore-spaziocomune');
  const notePrecedenti = spaziocomunePrecedente.querySelectorAll('.input-nota-valore-spaziocomune');

  // Mappa dei valori sorgente per ID indicatore
  const mappaMappaValori = {};
  selectPrecedenti.forEach((select, idx) => {
    const idIndicatore = select.dataset.idIndicatore;
    const notaInput = notePrecedenti[idx];
    if (idIndicatore) {
      mappaMappaValori[idIndicatore] = {
        valore: select.value,
        nota: notaInput ? notaInput.value : ''
      };
    }
  });

  // 4. Copia i valori nei campi della spaziocomune corrente
  const selectCorrenti = cardCorrente.querySelectorAll('.input-valore-spaziocomune');
  const noteCorrenti = cardCorrente.querySelectorAll('.input-nota-valore-spaziocomune');

  let contatoreCopiati = 0;

  selectCorrenti.forEach((select, idx) => {
    const idIndicatore = select.dataset.idIndicatore;
    const notaInput = noteCorrenti[idx];

    if (idIndicatore && mappaMappaValori[idIndicatore]) {
      select.value = mappaMappaValori[idIndicatore].valore;
      if (notaInput) {
        notaInput.value = mappaMappaValori[idIndicatore].nota;
      }
      
      // Notifica l'evento di cambio se hai listener attaccati sui select/input
      select.dispatchEvent(new Event('change', { bubbles: true }));
      if (notaInput) notaInput.dispatchEvent(new Event('change', { bubbles: true }));

      contatoreCopiati++;
    }
  });

  // Feedback visivo sul pulsante
  const testoOriginale = btnEl.innerHTML;
  btnEl.innerHTML = "✅ Copiato!";
  btnEl.style.backgroundColor = "#dcfce7";
  btnEl.style.color = "#15803d";
  btnEl.style.borderColor = "#16a34a";

  setTimeout(() => {
    btnEl.innerHTML = testoOriginale;
    btnEl.style.backgroundColor = "#ffffff";
    btnEl.style.color = "#0284c7";
    btnEl.style.borderColor = "#0284c7";
  }, 1800);
}



// Popola (o aggiorna) la select delle spazicomuni disponibili per la copia dentro una card
function aggiornaSelectSpaziComuniCopia(cardSpazioComune) {
  const selectCopia = cardSpazioComune.querySelector('.select-copia-spaziocomune');
  if (!selectCopia) return;

  const valoreAttuale = selectCopia.value;
  const tutteLeSpaziComuni = document.querySelectorAll('.nodo-spaziocomune.spaziocomune-card');
  
  // Svuota e inserisci opzione di default
  selectCopia.innerHTML = '<option value="">-- Copia da spaziocomune... --</option>';

  tutteLeSpaziComuni.forEach((altraCard, idx) => {
    // Ignora la spaziocomune corrente
    if (altraCard === cardSpazioComune) return;

    const inputNome = altraCard.querySelector('.input-nome-spaziocomune');
    const nomeSpazioComune = inputNome ? inputNome.value.trim() : '';
    const livelloNum = altraCard.dataset.livello || '';

    // Genera un ID univo di tracciamento per il DOM se manca
    if (!altraCard.dataset.tempId) {
      altraCard.dataset.tempId = 'spaziocomune_dom_' + Math.random().toString(36).substr(2, 6);
    }
    const targetId = altraCard.dataset.tempId;

    const etichetta = nomeSpazioComune 
      ? `L${livelloNum}: ${nomeSpazioComune}` 
      : `L${livelloNum}: SpazioComune #${idx + 1}`;

    const option = document.createElement('option');
    option.value = targetId;
    option.textContent = etichetta;
    selectCopia.appendChild(option);
  });

  // Ripristina il valore selezionato se ancora presente
  selectCopia.value = valoreAttuale;
}

// Aggiorna le tendine di TUTTE le spazicomuni presenti nella pagina
function aggiornaTutteLeSelectSpaziComuni() {
  const tutteLeSpaziComuni = document.querySelectorAll('.nodo-spaziocomune.spaziocomune-card');
  tutteLeSpaziComuni.forEach(card => aggiornaSelectSpaziComuniCopia(card));
}

// Esegue la copia dei dati dalla spaziocomune selezionata nella tendina
function copiaDaSpazioComuneSelezionata(btnEl) {
  const cardCorrente = btnEl.closest('.nodo-spaziocomune');
  if (!cardCorrente) return;

  const selectCopia = cardCorrente.querySelector('.select-copia-spaziocomune');
  const tempIdSpazioComuneSorgente = selectCopia ? selectCopia.value : '';

  if (!tempIdSpazioComuneSorgente) {
    alert("Seleziona prima una spaziocomune da cui copiare!");
    return;
  }

  // Trova la card della spaziocomune sorgente
  const spaziocomuneSorgente = document.querySelector(`.nodo-spaziocomune[data-temp-id="${tempIdSpazioComuneSorgente}"]`);

  if (!spaziocomuneSorgente) {
    alert("SpazioComune sorgente non trovata!");
    return;
  }

  // Mappa i valori della spaziocomune sorgente
  const selectSorgenti = spaziocomuneSorgente.querySelectorAll('.input-valore-spaziocomune');
  const noteSorgenti = spaziocomuneSorgente.querySelectorAll('.input-nota-valore-spaziocomune');

  const mappaValori = {};
  selectSorgenti.forEach((select, idx) => {
    const idIndicatore = select.dataset.idIndicatore;
    const notaInput = noteSorgenti[idx];
    if (idIndicatore) {
      mappaValori[idIndicatore] = {
        valore: select.value,
        nota: notaInput ? notaInput.value : ''
      };
    }
  });



  // Inserisci i valori nella spaziocomune corrente
  const selectCorrenti = cardCorrente.querySelectorAll('.input-valore-spaziocomune');
  const noteCorrenti = cardCorrente.querySelectorAll('.input-nota-valore-spaziocomune');

  selectCorrenti.forEach((select, idx) => {
    const idIndicatore = select.dataset.idIndicatore;
    const notaInput = noteCorrenti[idx];

    if (idIndicatore && mappaValori[idIndicatore]) {
      select.value = mappaValori[idIndicatore].valore;
      if (notaInput) {
        notaInput.value = mappaValori[idIndicatore].nota;
      }

      select.dispatchEvent(new Event('change', { bubbles: true }));
      if (notaInput) notaInput.dispatchEvent(new Event('change', { bubbles: true }));
    }
  });

  // Feedback visivo sul pulsante
  const testoOriginale = btnEl.innerHTML;
  btnEl.innerHTML = "✅ Copiato!";
  btnEl.style.backgroundColor = "#dcfce7";
  btnEl.style.color = "#15803d";
  btnEl.style.borderColor = "#16a34a";

  setTimeout(() => {
    btnEl.innerHTML = testoOriginale;
    btnEl.style.backgroundColor = "#ffffff";
    btnEl.style.color = "#0284c7";
    btnEl.style.borderColor = "#0284c7";
  }, 1800);
}






// --------------------------------------------------
// 1. RIGENERA DETTAGLI SPAZI COMUNI 
// --------------------------------------------------
async function rigeneraDettagliSpaziComuni() {
  try {
    console.log("🚀 [DEBUG] Avvio rigeneraDettagliSpaziComuni...");

    const containerSpaziComuni = document.getElementById('contenitore-spazi-comuni');
    const sezioneSpaziComuni = document.getElementById('sezione-dettaglio-spazi-comuni');
    
    if (!containerSpaziComuni || !sezioneSpaziComuni) {
      console.error("❌ Manca 'contenitore-spazi-comuni' o 'sezione-dettaglio-spazi-comuni' nell'HTML!");
      return;
    }
    containerSpaziComuni.innerHTML = '';

    if (!alberoIndicatori || Object.keys(alberoIndicatori).length === 0) {
      console.warn("⚠️ Albero indicatori non pronto, tentato ricaricamento...");
      if (typeof caricaIndicatoriSpaziComuni === 'function') {
        await caricaIndicatoriSpaziComuni();
      }
    }
    const righeLivelli = document.querySelectorAll('#corpo-tabella-livelli tr');
    const idLivelliPresenti = [];
    righeLivelli.forEach(rowLivello => {
      if (rowLivello.dataset && rowLivello.dataset.idLivelloDb) {
        idLivelliPresenti.push(parseInt(rowLivello.dataset.idLivelloDb, 10));
      }
    });

    let mappaValori = {};
    if (idLivelliPresenti.length > 0 && typeof caricaDatiSpaziComuniConValori === 'function') {
      mappaValori = await caricaDatiSpaziComuniConValori(idLivelliPresenti) || {};
    }
    let totaleSpaziComuniAcc = 0;

    righeLivelli.forEach(rowLivello => {
      const selectPianoElem = rowLivello.querySelector('.livello-piano');
      const pianoSelezionato = selectPianoElem ? selectPianoElem.options[selectPianoElem.selectedIndex].text : '';
      const numeroLivello = rowLivello.dataset?.livello || "1";
      const idLivelloDb = rowLivello.dataset?.idLivelloDb || null;
      const inputSpaziComuni = rowLivello.querySelector('.livello-spazi-comuni');
      const numSpaziComuni = inputSpaziComuni ? (parseInt(inputSpaziComuni.value, 10) || 0) : 0;

      if (numSpaziComuni > 0) {
        totaleSpaziComuniAcc += numSpaziComuni;
        const spazicomuniLivello = (idLivelloDb && mappaValori[idLivelloDb]) ? mappaValori[idLivelloDb] : [];

        for (let s = 1; s <= numSpaziComuni; s++) {
          let idSpazioComuneDb = null;
          let nomeSpazioComuneEffettivo = `SpazioComune_p${numeroLivello}_s${s}`;

          const spaziocomuneSalvata = spazicomuniLivello[s - 1];

          if (spaziocomuneSalvata && typeof spaziocomuneSalvata === 'object') {
            idSpazioComuneDb = spaziocomuneSalvata.idSpazioComune || spaziocomuneSalvata.id || null;
            nomeSpazioComuneEffettivo = spaziocomuneSalvata.nomeSpazioComune || spaziocomuneSalvata.spaziocomune || nomeSpazioComuneEffettivo;
          }

          console.log(`➡️ Creo SpazioComune ${s} per Livello ${numeroLivello}:`, { idLivelloDb, idSpazioComuneDb, nomeSpazioComuneEffettivo });

          if (typeof generaCardSpazioComune === 'function') {
            const card = generaCardSpazioComune(idLivelloDb, pianoSelezionato, idSpazioComuneDb, nomeSpazioComuneEffettivo, numeroLivello, mappaValori);
            if (card) containerSpaziComuni.appendChild(card);
          }
        }
      }
    });


	  // Popola tutte le select di copia appena terminato il rendering delle card
	  aggiornaTutteLeSelectSpaziComuni();

	  sezioneSpaziComuni.style.display = totaleSpaziComuniAcc > 0 ? 'block' : 'none';
	} catch (err) {
	  console.error("💥 ERRORE IN rigeneraDettagliSpaziComuni:", err);
	}


}





// ==================================================
// 2. INIZIALIZZAZIONE E CARICAMENTO DATI
// ==================================================

/**
 * Carica la struttura gerarchica degli indicatori da Supabase
 */
async function caricaIndicatoriSpaziComuni() {
  console.log("Tentativo di recupero indicatori spazicomuni da Supabase...");

  try {
    const { data, error } = await clientSupabase
      .from('indicatori_facilitazioni')
      .select('id, area, ambito, requisito, caratteristiche, disabilita, note')
	  .eq('spaziocomune', true)
      .order('area')
      .order('ambito')
      .order('requisito');

    if (error) {
      console.error("❌ ERRORE SUPABASE indicatori_facilitazioni:", error);
      return;
    }

    if (!data || data.length === 0) {
      console.warn("⚠️ LA TABELLA 'indicatori_facilitazioni' È VUOTA O BLOCCATA DA RLS!");
      return;
    }

    // Riorganizzazione ad albero: Area -> Ambito -> Array di Requisiti
    alberoIndicatori = data.reduce((acc, item) => {
      const area = item.area || 'Generale';
      const ambito = item.ambito || 'Generale';

      if (!acc[area]) acc[area] = {};
      if (!acc[area][ambito]) acc[area][ambito] = [];

      acc[area][ambito].push(item);
      return acc;
    }, {});

    console.log("✅ Albero indicatori caricato con successo! Elementi:", data.length);

  } catch (err) {
    console.error("❌ Errore imprevisto durante il caricamento:", err);
  }
}



// ==================================================
// 5. ESTRAZIONE DATI PER SUPABASE
// ==================================================

/**
 * Legge dal DOM le info delle card spaziocomune e prepara il payload per Supabase
 */
function raccogliDatiSpaziComuniPerDB(mappaLivelliId) {
  const listaRecord = [];

  // 1. Selezioniamo tutte le card spaziocomune presenti nella pagina
  const cardSpaziComuni = document.querySelectorAll('.nodo-spaziocomune.spaziocomune-card');

  cardSpaziComuni.forEach(spaziocomuneCard => {
    // 2. Recuperiamo il nome della spaziocomune dall'input text nell'header
    const inputNome = spaziocomuneCard.querySelector('.input-nome-spaziocomune');
    if (!inputNome) return;

    const nomeSpazioComune = inputNome.value.trim();
    if (!nomeSpazioComune) return;
	

    // 3. Recuperiamo il numero del livello impostato sul data-livello dell'elemento spaziocomuneCard
    const livelloNum = spaziocomuneCard.getAttribute('data-livello');
    if (livelloNum === null || livelloNum === undefined) {
      console.warn(`⚠️ Attenzione: Impossibile trovare data-livello per la spaziocomune "${nomeSpazioComune}"`);
      return;
    }

    // 4. Mappiamo il numero del livello all'ID REALE del database generato da Supabase
    const idDatabaseLivello = mappaLivelliId[parseInt(livelloNum,10)];
    if (!idDatabaseLivello) {
      console.warn(`⚠️ Nessun ID database trovato per il livello numero: ${livelloNum}`);
      return;
    }

    // 5. Scansioniamo tutte le select degli indicatori presenti dentro QUESTA spaziocomune
    const selectsIndicatore = spaziocomuneCard.querySelectorAll('.input-valore-spaziocomune');

    selectsIndicatore.forEach(selectEl => {
      const idIndicatoreRaw = selectEl.dataset.idIndicatore;
      if (!idIndicatoreRaw) return;

      const idIndicatore = parseInt(idIndicatoreRaw, 10);
      const valoreSelezionato = selectEl.value; // Es. "Conforme", "Non Conforme", ""



	// Troviamo il campo nota associato nello stesso blocco (.nodo-requisito)
      const reqBox = selectEl.closest('.nodo-requisito');
      const inputNota = reqBox ? reqBox.querySelector('.input-nota-valore-spaziocomune') : null;
      const notaTesto = inputNota ? inputNota.value.trim() : '';

      // Salva se c'è un valore selezionato o una nota presente
      if ((valoreSelezionato && valoreSelezionato !== '') || notaTesto !== '') {
		// All'interno di raccogliDatiSpaziComuniPerDB():
		listaRecord.push({
		  id_livello: idDatabaseLivello,
		  id_spaziocomune: idSpazioComune, // 👈 Usa 'id_spaziocomune' come nome chiave per Supabase
		  id_indicatore_facilitazioni: idIndicatore,
		  value: valoreSelezionato || null,
		  nota: notaTesto || null
		});
		
		
		
      }
    });
  });

  console.log("✅ Record SpaziComuni generati per il salvataggio:", listaRecord);
  return listaRecord;
}





// ==================================================
// SALVA I DATI SUL DB
// ==================================================
/**
 * Salva prima le spazicomuni nella tabella 'spazicomuni', recupera gli ID generati 
 * e successivamente salva le schede indicatori in 'scheda_spazicomuni'.
 * 
 * @param {Object} mappaLivelliId - Oggetto che mappa numero_livello -> id_livello_db
 */
async function salvaSpaziComuniESchede(mappaLivelliId) {
  const cardSpaziComuni = document.querySelectorAll('.nodo-spaziocomune.spaziocomune-card');
  if (!cardSpaziComuni || cardSpaziComuni.length === 0) return true;

  try {
    for (const spaziocomuneCard of cardSpaziComuni) {
      // 1. Nome spaziocomune
      const inputNome = spaziocomuneCard.querySelector('.input-nome-spaziocomune');
      if (!inputNome) continue;

      const nomeSpazioComune = inputNome.value.trim();
      if (!nomeSpazioComune) continue;

		
      // 2. Numero livello e ID Livello DB
      const livelloNum = spaziocomuneCard.getAttribute('data-livello');
      if (livelloNum === null || livelloNum === undefined) continue;

      const idDatabaseLivello = mappaLivelliId[parseInt(livelloNum, 10)];
      if (!idDatabaseLivello) {
        console.warn(`⚠️ Nessun ID livello database trovato per livello: ${livelloNum}`);
        continue;
      }

      // Check se abbiamo già un id_spaziocomune memorizzato sul DOM
      const idSpazioComuneEsistente = inputNome.dataset.idSpazioComune || spaziocomuneCard.dataset.idSpazioComune || null;

      // STEP 1: Salva o Aggiorna nella tabella 'spazicomuni'
      const payloadSpazioComune = {
        id_livello: idDatabaseLivello,
        spaziocomune: nomeSpazioComune
      };

      if (idSpazioComuneEsistente && !isNaN(parseInt(idSpazioComuneEsistente, 10))) {
        payloadSpazioComune.id = parseInt(idSpazioComuneEsistente, 10);
      }

      const { data: spaziocomuneSalvata, error: errSpazioComune } = await clientSupabase
        .from('spazicomuni')
        .upsert(payloadSpazioComune)
        .select('id, spaziocomune')
        .single();

      if (errSpazioComune) {
        console.error(`❌ Errore salvataggio spaziocomune "${nomeSpazioComune}":`, errSpazioComune);
        continue;
      }

      const idSpazioComuneGenerato = spaziocomuneSalvata.id;
      
      // Salva ID nel DOM per futuri salvataggi senza refresh
      inputNome.dataset.idSpazioComune = idSpazioComuneGenerato;
      spaziocomuneCard.dataset.idSpazioComune = idSpazioComuneGenerato;

      // STEP 2: Raccogli indicatori per 'scheda_spazicomuni'
      const recordSchedeIndicatori = [];
      const selectsIndicatore = spaziocomuneCard.querySelectorAll('.input-valore-spaziocomune');

      selectsIndicatore.forEach(selectEl => {
        const idIndicatoreRaw = selectEl.dataset.idIndicatore;
        if (!idIndicatoreRaw) return;

        const idIndicatore = parseInt(idIndicatoreRaw, 10);
        const valoreSelezionato = selectEl.value;

        const reqBox = selectEl.closest('.nodo-requisito');
        const inputNota = reqBox ? reqBox.querySelector('.input-nota-valore-spaziocomune') : null;
        const notaTesto = inputNota ? inputNota.value.trim() : '';

        if ((valoreSelezionato && valoreSelezionato !== '') || notaTesto !== '') {
          recordSchedeIndicatori.push({
            id_spaziocomune: idSpazioComuneGenerato, // FK verso spazicomuni.id
            id_indicatore_facilitazioni: idIndicatore,
            value: valoreSelezionato || null,
            nota: notaTesto || null
          });
        }
      });

      // Salva in 'scheda_spazicomuni'
      if (recordSchedeIndicatori.length > 0) {
        // Rimuove vecchi valori per questa spaziocomune prima dell'inserimento
        await clientSupabase
          .from('scheda_spazicomuni')
          .delete()
          .eq('id_spaziocomune', idSpazioComuneGenerato);

        const { error: errSchede } = await clientSupabase
          .from('scheda_spazicomuni')
          .insert(recordSchedeIndicatori);

        if (errSchede) {
          console.error(`❌ Errore inserimento scheda_spazicomuni per ID ${idSpazioComuneGenerato}:`, errSchede);
        }
      }
    }

    return true;
  } catch (err) {
    console.error("❌ Errore in salvaSpaziComuniESchede:", err);
    return false;
  }
}

	
	
	
// --------------------------------------------------
// 1. CARICAMENTO DATI SPAZI COMUNI DAL DB (LEFT JOIN)
// --------------------------------------------------

/**
 * Recupera le spazicomuni e le relative valutazioni degli indicatori per un insieme di livelli.
 * 
 * @param {Array<number>} idLivelli - Array contenente gli ID reali del DB dei livelli
 * @returns {Promise<Object>} Mappa strutturata: { [id_livello]: { [id_spaziocomune]: { nome: string, valori: { [id_indicatore]: { value, nota } } } } }
 */
async function caricaDatiSpaziComuniConValori(idLivelli) {
  if (!idLivelli || idLivelli.length === 0) return {};

  try {
    // -----------------------------------------------------------------
    // 1. Recuperiamo tutte le spazicomuni legate ai livelli specificati
    // -----------------------------------------------------------------
    const { data: spazicomuniData, error: errSpaziComuni } = await clientSupabase
      .from('spazicomuni')
      .select('id, id_livello, spaziocomune, nota')
      .in('id_livello', idLivelli);

    if (errSpaziComuni) {
      console.error("❌ Errore durante il recupero della tabella 'spazicomuni':", errSpaziComuni);
      return {};
    }

    if (!spazicomuniData || spazicomuniData.length === 0) {
      console.log("ℹ️ Nessuna spaziocomune trovata per i livelli selezionati." , idLivelli);
      return {};
    }

    // Estraiamo tutti gli ID primari delle spazicomuni trovate
    const idsSpaziComuni = spazicomuniData.map(s => s.id);

    // -----------------------------------------------------------------
    // 2. Recuperiamo le valutazioni dalla tabella 'scheda_spazicomuni'
    // -----------------------------------------------------------------
    const { data: schedeData, error: errSchede } = await clientSupabase
      .from('scheda_spazicomuni')
      .select('id, id_spaziocomune, id_indicatore_facilitazioni, value, nota')
      .in('id_spaziocomune', idsSpaziComuni);

    if (errSchede) {
      console.error("❌ Errore durante il recupero di 'scheda_spazicomuni':", errSchede);
      return {};
    }

    // -----------------------------------------------------------------
    // 3. Strutturiamo la mappa dei dati
    // -----------------------------------------------------------------
    // Struttura finale:
    // {
    //   [id_livello]: [
    //     {
    //       idSpazioComune: 10,
    //       nomeSpazioComune: "Camera 101",
    //       indicatori: {
    //         [id_indicatore]: { value: "Conforme", nota: "..." }
    //       }
    //     }
    //   ]
    // }
    const mappaSpaziComuniPerLivello = {};

    // Inizializziamo le spazicomuni nella mappa organizzate per id_livello
    const mappaSpaziComuniById = {};

    spazicomuniData.forEach(spaziocomuneObj => {
      const idLivello = spaziocomuneObj.id_livello;
      if (!mappaSpaziComuniPerLivello[idLivello]) {
        mappaSpaziComuniPerLivello[idLivello] = [];
      }

      const nuovaSpazioComune = {
        idSpazioComune: spaziocomuneObj.id,
        nomeSpazioComune: spaziocomuneObj.spaziocomune,
        notaSpazioComune: spaziocomuneObj.nota || '',
        indicatori: {} // qui metteremo gli indicatori con la loro risposta
      };

      mappaSpaziComuniPerLivello[idLivello].push(nuovaSpazioComune);
      mappaSpaziComuniById[spaziocomuneObj.id] = nuovaSpazioComune;
    });

    // Popoliamo gli indicatori per ogni spaziocomune
    if (schedeData && schedeData.length > 0) {
      schedeData.forEach(item => {
        const spaziocomuneRef = mappaSpaziComuniById[item.id_spaziocomune];
        if (spaziocomuneRef) {
          spaziocomuneRef.indicatori[item.id_indicatore_facilitazioni] = {
            value: item.value,
            nota: item.nota
          };
        }
      });
    }

    console.log("✅ Dati spazicomuni caricati e mappati con successo:", mappaSpaziComuniPerLivello);
    return mappaSpaziComuniPerLivello;

  } catch (err) {
    console.error("❌ Errore imprevisto in caricaDatiSpaziComuniConValori:", err);
    return {};
  }
}

	