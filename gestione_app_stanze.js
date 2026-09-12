// Helper per aggiornare il dataset quando l'utente rinomina la stanza	
function aggiornaDatasetStanza(inputEl) {

  const nuovoNome = inputEl.value.trim();
  const cardStanza = inputEl.closest('.nodo-stanza');
  if (!cardStanza) return;

  const selects = cardStanza.querySelectorAll('.input-valore-stanza');
  selects.forEach(sel => {
    sel.dataset.nomeStanza = nuovoNome;
  });

  // 👈 AGGIORNAMENTO DINAMICO NOMI NELLE TENDINE DI COPIA
  aggiornaTutteLeSelectStanze();
}


// ==================================================
// 3. GENERAZIONE UI CARD STANZA
// ==================================================
function generaCardStanza(idLivello, pianoSelezionato, idStanza, nomeStanza, livelloNum, bagno, mappaValori = {}) {

  const stanzaCard = document.createElement('div');
  stanzaCard.className = 'nodo-stanza stanza-card';
  stanzaCard.dataset.livello = livelloNum;

  if (idStanza) stanzaCard.dataset.idStanza = idStanza;
  if (idLivello) stanzaCard.dataset.idLivello = idLivello;

  // 1. DEFINIZIONE DEL TEMA (Deve stare prima dell'uso nell'Header!)
  const livelloIdx = (parseInt(livelloNum, 10) - 1) % paletteLivelli.length;
  const tema = paletteLivelli[livelloIdx] || paletteLivelli[0];

  stanzaCard.style.backgroundColor = tema.bgCard;
  stanzaCard.style.borderLeft = `6px solid ${tema.border}`;
  stanzaCard.style.borderTop = '1px solid #cbd5e1';
  stanzaCard.style.borderRight = '1px solid #cbd5e1';
  stanzaCard.style.borderBottom = '1px solid #cbd5e1';
  stanzaCard.style.borderRadius = '6px';
  stanzaCard.style.marginBottom = '12px';
  stanzaCard.style.overflow = 'hidden';

  const valoreNomeInput = nomeStanza || '';
  const valoreBagno = bagno || '';

  // Assegniamo un ID temporaneo DOM univoco alla card per la mappatura del select di copia
  stanzaCard.dataset.tempId = 'stanza_dom_' + Math.random().toString(36).substr(2, 6);

  // 2. HEADER STANZA
  const stanzaHeader = document.createElement('div');
  stanzaHeader.className = 'header-livello-0';
  stanzaHeader.style.cssText = 'cursor:pointer; padding:10px 14px; font-weight:bold; display:flex; justify-content:space-between; align-items:center;';
  stanzaHeader.style.backgroundColor = tema.bgHeader;
  stanzaHeader.style.color = tema.testo;

// Dentro generaCardStanza:
// Dentro generaCardStanza:
stanzaHeader.innerHTML = `
  <div style="display:flex; align-items:center; gap:8px; flex:1; flex-wrap:wrap;" onclick="event.stopPropagation();">
    <span style="font-weight:600; color:${tema.testo};">🛏️ Livello ${livelloNum} - ${pianoSelezionato} - Stanza:</span>
    <input type="text" 
           class="input-nome-stanza" 
           data-id-stanza="${idStanza || ''}" 
           data-id-livello="${idLivello || ''}"
           value="${valoreNomeInput}" 
           placeholder="Digita identificativo stanza"
           style="padding:4px 8px; border-radius:4px; border:1px solid ${tema.border}; background:#ffffff; color:#1e293b; font-weight:600; width:200px;"
           onkeyup="typeof aggiornaDatasetStanza === 'function' && aggiornaDatasetStanza(this)"
           onchange="typeof aggiornaDatasetStanza === 'function' && aggiornaDatasetStanza(this)" />
    
    <label style="display:flex; align-items:center; gap:4px; font-weight:normal; font-size:0.9em; cursor:pointer;">
      <input type="checkbox" class="input-bagno-stanza" ${bagno ? 'checked' : ''} data-id-stanza="${idStanza || ''}" onchange="gestioneBagno(this.checked, '${idStanza || ''}')"> 
      Bagno in Camera
    </label>

    <!-- 📋 BLOCCO COPIA PRESENTE SU TUTTE LE STANZE (ANCHE LA PRIMA) -->
    <div style="display:flex; align-items:center; gap:4px; margin-left:auto;">
      <select class="select-copia-stanza" 
              onfocus="aggiornaSelectStanzeCopia(this.closest('.nodo-stanza'))"
              style="padding:4px 6px; font-size:0.85em; border-radius:4px; border:1px solid #cbd5e1; background:#ffffff; color:#334155; max-width:180px;">
        <option value="">-- Copia da stanza... --</option>
      </select>

      <button type="button"
              class="btn-copia-stanza"
              title="Copia i valori dalla stanza selezionata"
              onclick="copiaDaStanzaSelezionata(this)"
              style="padding:4px 10px; font-size:0.85em; background:#ffffff; color:#0284c7; border:1px solid #0284c7; border-radius:4px; cursor:pointer; font-weight:600; transition:all 0.2s;">
        📋 Copia
      </button>
    </div>
  </div>
  <span class="icona" style="margin-left:12px; color:${tema.testo};">➕</span>
`;

  // ... resto del codice della funzione (stanzaHeader.onclick, areeDisponibili.forEach, ecc.) invariato
  stanzaHeader.onclick = (e) => {
    if (e.target.tagName !== 'INPUT') {
      toggleLivello(stanzaHeader);
    }
  };

  const stanzaBody = document.createElement('div');
  stanzaBody.className = 'body-livello';
  stanzaBody.style.cssText = 'display:none; padding:10px; background:#f8fafc;';

  const areeDisponibili = Object.keys(alberoIndicatori || {});
  if (areeDisponibili.length === 0) {
    stanzaBody.innerHTML = `<div style="padding:10px; color:#ef4444; font-style:italic;">Nessun indicatore caricato dal database. Verifica la tabella 'indicatori_facilitazioni' per le stanze.</div>`;
    stanzaCard.appendChild(stanzaHeader);
    stanzaCard.appendChild(stanzaBody);
    return stanzaCard;
  }

  // 3. RECUPERO SICURO DELLA STANZA
  let datiStanzaSalvati = {};

  if (idLivello && mappaValori[idLivello]) {
    const contenitoreLivello = mappaValori[idLivello];
    
    if (Array.isArray(contenitoreLivello)) {
      datiStanzaSalvati = contenitoreLivello.find(s => 
        (idStanza && Number(s.idStanza || s.id_stanza || s.id) === Number(idStanza)) ||
        (valoreNomeInput && (s.nomeStanza || s.nome || s.nome_stanza) === valoreNomeInput)
      ) || {};
    } else if (typeof contenitoreLivello === 'object') {
      datiStanzaSalvati = contenitoreLivello[idStanza] || contenitoreLivello[valoreNomeInput] || {};
    }
  } else if (idStanza && mappaValori[idStanza]) {
    datiStanzaSalvati = mappaValori[idStanza];
  }

  // Estrazione sicura della lista/oggetto degli indicatori salvati
  const sorgenteIndicatori = datiStanzaSalvati.indicatori || 
                             datiStanzaSalvati.valori || 
                             datiStanzaSalvati.scheda_stanze || 
                             datiStanzaSalvati;


  // Costruzione Struttura Albero
  areeDisponibili.forEach(nomeArea => {
    const areaCard = document.createElement('div');
    areaCard.className = 'nodo-area';
    areaCard.style.cssText = 'margin-bottom:8px; border:1px solid #e2e8f0; border-radius:6px; background:#fff;';

    const areaHeader = document.createElement('div');
    areaHeader.className = 'header-livello-1';
	areaHeader.nomearea=nomeArea; 
    areaHeader.style.cssText = 'cursor:pointer; background:#e2e8f0; color:#334155; padding:8px 12px; font-weight:600; display:flex; justify-content:space-between; align-items:center;';
    
	if (bagno == false && nomeArea == "Bagno") {
		areaHeader.innerHTML = `<span>📐 AREA: ${nomeArea} NON RILEVABILE</span> <span class="icona"></span>`;
        //areaHeader.onclick = (e) => { e.stopPropagation(); toggleLivello(areaHeader); };
	}else{
		areaHeader.innerHTML = `<span>📐 AREA: ${nomeArea}</span> <span class="icona">➕</span>`;
        areaHeader.onclick = (e) => { e.stopPropagation(); toggleLivello(areaHeader); };
	}
	

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
              <select class="input-valore-stanza" 
                      data-id-stanza="${idStanza || ''}"
                      data-id-livello="${idLivello || ''}" 
                      data-nome-stanza="${valoreNomeInput}" 
                      data-id-indicatore="${req.id}"
                      style="padding:4px 8px; border-radius:4px; border:1px solid #cbd5e1; font-size:0.85em; background:#fff;">
                <option value="" ${valoreSalvato === '' ? 'selected' : ''}>-- Non valutato --</option>
                <option value="Conforme" ${valoreSalvato === 'Conforme' ? 'selected' : ''}>Conforme / Presente</option>
                <option value="Non Conforme" ${valoreSalvato === 'Non Conforme' ? 'selected' : ''}>Non Conforme</option>
                <option value="Parziale" ${valoreSalvato === 'Parziale' ? 'selected' : ''}>Parzialmente Conforme</option>
                <option value="Non Applicabile" ${valoreSalvato === 'Non Applicabile' ? 'selected' : ''}>Non Applicabile</option>
              </select>
              <input type="text" 
                     class="input-nota-valore-stanza" 
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
    stanzaBody.appendChild(areaCard);
  });

  stanzaCard.appendChild(stanzaHeader);
  stanzaCard.appendChild(stanzaBody);
  return stanzaCard;
}






// ==================================================
// COPIA DA STANZA PRECEDENTE
// ==================================================
function copiaDaStanzaPrecedente(btnEl) {

  // 1. Trova la card della stanza corrente
  const cardCorrente = btnEl.closest('.nodo-stanza');
  if (!cardCorrente) return;

  // 2. Trova la stanza precedente nello stesso contenitore/livello
  const stanzaPrecedente = cardCorrente.previousElementSibling;

  if (!stanzaPrecedente || !stanzaPrecedente.classList.contains('nodo-stanza')) {
    alert("Nessuna stanza precedente trovata in questo livello!");
    return;
  }

  // 3. Recupera i valori dalla stanza precedente usando gli ID degli indicatori
  const selectPrecedenti = stanzaPrecedente.querySelectorAll('.input-valore-stanza');
  const notePrecedenti = stanzaPrecedente.querySelectorAll('.input-nota-valore-stanza');

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

  // 4. Copia i valori nei campi della stanza corrente
  const selectCorrenti = cardCorrente.querySelectorAll('.input-valore-stanza');
  const noteCorrenti = cardCorrente.querySelectorAll('.input-nota-valore-stanza');

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



// Popola (o aggiorna) la select delle stanze disponibili per la copia dentro una card
function aggiornaSelectStanzeCopia(cardStanza) {

  const selectCopia = cardStanza.querySelector('.select-copia-stanza');
  if (!selectCopia) return;

  const valoreAttuale = selectCopia.value;
  const tutteLeStanze = document.querySelectorAll('.nodo-stanza.stanza-card');
  
  // Svuota e inserisci opzione di default
  selectCopia.innerHTML = '<option value="">-- Copia da stanza... --</option>';

  tutteLeStanze.forEach((altraCard, idx) => {
    // Ignora la stanza corrente
    if (altraCard === cardStanza) return;

    const inputNome = altraCard.querySelector('.input-nome-stanza');
    const nomeStanza = inputNome ? inputNome.value.trim() : '';
    const livelloNum = altraCard.dataset.livello || '';

    // Genera un ID univo di tracciamento per il DOM se manca
    if (!altraCard.dataset.tempId) {
      altraCard.dataset.tempId = 'stanza_dom_' + Math.random().toString(36).substr(2, 6);
    }
    const targetId = altraCard.dataset.tempId;

    const etichetta = nomeStanza 
      ? `L${livelloNum}: ${nomeStanza}` 
      : `L${livelloNum}: Stanza #${idx + 1}`;

    const option = document.createElement('option');
    option.value = targetId;
    option.textContent = etichetta;
    selectCopia.appendChild(option);
  });

  // Ripristina il valore selezionato se ancora presente
  selectCopia.value = valoreAttuale;
}

// Aggiorna le tendine di TUTTE le stanze presenti nella pagina
function aggiornaTutteLeSelectStanze() {

  const tutteLeStanze = document.querySelectorAll('.nodo-stanza.stanza-card');
  tutteLeStanze.forEach(card => aggiornaSelectStanzeCopia(card));
}

// Esegue la copia dei dati dalla stanza selezionata nella tendina
function copiaDaStanzaSelezionata(btnEl) {

  const cardCorrente = btnEl.closest('.nodo-stanza');
  if (!cardCorrente) return;

  const selectCopia = cardCorrente.querySelector('.select-copia-stanza');
  const tempIdStanzaSorgente = selectCopia ? selectCopia.value : '';

  if (!tempIdStanzaSorgente) {
    alert("Seleziona prima una stanza da cui copiare!");
    return;
  }

  // Trova la card della stanza sorgente
  const stanzaSorgente = document.querySelector(`.nodo-stanza[data-temp-id="${tempIdStanzaSorgente}"]`);

  if (!stanzaSorgente) {
    alert("Stanza sorgente non trovata!");
    return;
  }

  // Mappa i valori della stanza sorgente
  const selectSorgenti = stanzaSorgente.querySelectorAll('.input-valore-stanza');
  const noteSorgenti = stanzaSorgente.querySelectorAll('.input-nota-valore-stanza');

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

  // Copia anche lo stato del Bagno in Camera (se presente)
  const chkBagnoSorgente = stanzaSorgente.querySelector('.input-bagno-stanza');
  const chkBagnoCorrente = cardCorrente.querySelector('.input-bagno-stanza');
  if (chkBagnoSorgente && chkBagnoCorrente) {
    chkBagnoCorrente.checked = chkBagnoSorgente.checked;
    // Scatena l'evento di gestione visibilità bagno
    const idStanzaCorrente = cardCorrente.dataset.idStanza;
    if (typeof gestioneBagno === 'function') {
      gestioneBagno(chkBagnoCorrente.checked, idStanzaCorrente);
    }
  }

  // Inserisci i valori nella stanza corrente
  const selectCorrenti = cardCorrente.querySelectorAll('.input-valore-stanza');
  const noteCorrenti = cardCorrente.querySelectorAll('.input-nota-valore-stanza');

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
// 1. RIGENERA DETTAGLI STANZE 
// --------------------------------------------------
async function rigeneraDettagliStanze() {

 try {
    console.log("🚀 [DEBUG] Avvio rigeneraDettagliStanze...");

    const containerStanze = document.getElementById('contenitore-stanze');
    const sezioneStanze = document.getElementById('sezione-dettaglio-stanze');
    
    if (!containerStanze || !sezioneStanze) {
      console.error("❌ Manca 'contenitore-stanze' o 'sezione-dettaglio-stanze' nell'HTML!");
      return;
    }

    containerStanze.innerHTML = '';

    if (!alberoIndicatori || Object.keys(alberoIndicatori).length === 0) {
      console.warn("⚠️ Albero indicatori non pronto, tentato ricaricamento...");
      if (typeof caricaIndicatoriStanze === 'function') {
        await caricaIndicatoriStanze();
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
    if (idLivelliPresenti.length > 0 && typeof caricaDatiStanzeConValori === 'function') {
      mappaValori = await caricaDatiStanzeConValori(idLivelliPresenti) || {};
    }

    let totaleStanzeAcc = 0;

    righeLivelli.forEach(rowLivello => {
      const selectPianoElem = rowLivello.querySelector('.livello-piano');
      const pianoSelezionato = selectPianoElem ? selectPianoElem.options[selectPianoElem.selectedIndex].text : '';
      const numeroLivello = rowLivello.dataset?.livello || "1";
      const idLivelloDb = rowLivello.dataset?.idLivelloDb || null;
      const inputStanzeAcc = rowLivello.querySelector('.livello-stanze-acc');
      const numStanzeAcc = inputStanzeAcc ? (parseInt(inputStanzeAcc.value, 10) || 0) : 0;

      if (numStanzeAcc > 0) {
        totaleStanzeAcc += numStanzeAcc;

        const stanzeLivello = (idLivelloDb && mappaValori[idLivelloDb]) ? mappaValori[idLivelloDb] : [];

        for (let s = 1; s <= numStanzeAcc; s++) {
          let idStanzaDb = null;
          let nomeStanzaEffettivo = `Stanza_p${numeroLivello}_s${s}`;
          let bagnoCamera = true; // Default a true se la stanza è nuova

          const stanzaSalvata = stanzeLivello[s - 1];

          if (stanzaSalvata && typeof stanzaSalvata === 'object') {
            idStanzaDb = stanzaSalvata.idStanza || stanzaSalvata.id || null;
            nomeStanzaEffettivo = stanzaSalvata.nomeStanza || stanzaSalvata.stanza || nomeStanzaEffettivo;
            // Estrazione sicura del valore booleano del bagno dal DB
            bagnoCamera = stanzaSalvata.bagnoStanza !== undefined ? Boolean(stanzaSalvata.bagnoStanza) : true;
          }

          console.log(`➡️ Creo Stanza ${s} per Livello ${numeroLivello}:`, { idLivelloDb, idStanzaDb, nomeStanzaEffettivo, bagnoCamera });

          if (typeof generaCardStanza === 'function') {
            const card = generaCardStanza(idLivelloDb, pianoSelezionato, idStanzaDb, nomeStanzaEffettivo, numeroLivello, bagnoCamera, mappaValori);
            if (card) containerStanze.appendChild(card);
          }
        }
      }
    });


	  // Popola tutte le select di copia appena terminato il rendering delle card
	  aggiornaTutteLeSelectStanze();

	  sezioneStanze.style.display = totaleStanzeAcc > 0 ? 'block' : 'none';
	} catch (err) {
	  console.error("💥 ERRORE IN rigeneraDettagliStanze:", err);
	}


}



// --------------------------------------------------
// GESTIONE VISIBILITÀ E COMPILAZIONE AREA BAGNO
// --------------------------------------------------
async function gestioneBagno(bagno, idStanza) {

  console.log(`🛁 [gestioneBagno] Stato: ${bagno} | ID Stanza: ${idStanza}`);

  // 1. Selezioniamo tutte le card stanza presenti nel DOM
  const cardStanze = document.querySelectorAll('.nodo-stanza.stanza-card');

  cardStanze.forEach(stanzaCard => {
    // Recuperiamo l'ID della stanza corrente (usiamo String per confronto sicuro)
    const idStanzaCard = stanzaCard.dataset.idStanza;

    // Proseguiamo solo se la card corrisponde alla stanza su cui l'utente ha cliccato
    if (String(idStanzaCard) === String(idStanza)) {

      // 2. Cerchiamo i nodi area dentro questa specifica card
      const nodiArea = stanzaCard.querySelectorAll('.nodo-area');

      nodiArea.forEach(areaEl => {
        const areaHeader = areaEl.querySelector('.header-livello-1');
        if (!areaHeader) return;

        // Recuperiamo il nome dell'area (supporta sia attributo personalizzato che dataset)
        const nomeArea = areaHeader.nomearea || areaHeader.dataset.nomeArea;

        // Verifichiamo se l'area corrente è quella del Bagno
        if (nomeArea && nomeArea.toLowerCase() === "bagno") {
          const areaBody = areaEl.querySelector('.body-livello');

          if (!bagno) {
            // ==========================================
            // CASO FALSE: BAGNO NON PRESENTE / NON RILEVABILE
            // ==========================================
            // A. Aggiorna l'header e rimuove l'icona
            areaHeader.innerHTML = `<span>📐 AREA: Bagno NON RILEVABILE</span> <span class="icona"></span>`;
            
            // B. Rimuove l'evento click e disabilita il puntatore
            areaHeader.onclick = null;
            areaHeader.style.cursor = 'default';
            areaHeader.style.opacity = '0.7';

            // C. Chiude il corpo dell'area se aperto
            if (areaBody) {
              areaBody.style.display = 'none';
            }

            // D. Setta tutti gli indicatori del bagno su "Non Applicabile" E azzera le note
            const nodiRequisito = areaEl.querySelectorAll('.nodo-requisito');
            
            nodiRequisito.forEach(reqBox => {
              const selectEl = reqBox.querySelector('.input-valore-stanza');
              const inputNota = reqBox.querySelector('.input-nota-valore-stanza');

              // Imposta il select su "Non Applicabile"
              if (selectEl) {
                selectEl.value = 'Non Applicabile';
                selectEl.dispatchEvent(new Event('change', { bubbles: true }));
              }

              // Svuota il campo nota
              if (inputNota) {
                inputNota.value = '';
                inputNota.dispatchEvent(new Event('change', { bubbles: true }));
              }
            });

          } else {
            // ==========================================
            // CASO TRUE: BAGNO PRESENTE E COMPILABILE
            // ==========================================
            // A. Ripristina l'header standard con icona
            areaHeader.innerHTML = `<span>📐 AREA: Bagno</span> <span class="icona">➕</span>`;
            
            // B. Ripristina l'evento di espansione al click
            areaHeader.onclick = (e) => {
              e.stopPropagation();
              if (typeof toggleLivello === 'function') {
                toggleLivello(areaHeader);
              }
            };
            areaHeader.style.cursor = 'pointer';
            areaHeader.style.opacity = '1';
          }
        }
      });
    }
  });
}




// ==================================================
// 2. INIZIALIZZAZIONE E CARICAMENTO DATI
// ==================================================

/**
 * Carica la struttura gerarchica degli indicatori da Supabase
 */
async function caricaIndicatoriStanze() {

  console.log("Tentativo di recupero indicatori stanze da Supabase...");

  try {
    const { data, error } = await clientSupabase
      .from('indicatori_facilitazioni')
      .select('id, area, ambito, requisito, caratteristiche, disabilita, note')
	  .eq('stanza', true)
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
 * Legge dal DOM le info delle card stanza e prepara il payload per Supabase
 */
function raccogliDatiStanzePerDB(mappaLivelliId) {

  const listaRecord = [];

  // 1. Selezioniamo tutte le card stanza presenti nella pagina
  const cardStanze = document.querySelectorAll('.nodo-stanza.stanza-card');

  cardStanze.forEach(stanzaCard => {
    // 2. Recuperiamo il nome della stanza dall'input text nell'header
    const inputNome = stanzaCard.querySelector('.input-nome-stanza');
    if (!inputNome) return;

    const nomeStanza = inputNome.value.trim();
    if (!nomeStanza) return;
	

    // 3. Recuperiamo il numero del livello impostato sul data-livello dell'elemento stanzaCard
    const livelloNum = stanzaCard.getAttribute('data-livello');
    if (livelloNum === null || livelloNum === undefined) {
      console.warn(`⚠️ Attenzione: Impossibile trovare data-livello per la stanza "${nomeStanza}"`);
      return;
    }

    // 4. Mappiamo il numero del livello all'ID REALE del database generato da Supabase
    const idDatabaseLivello = mappaLivelliId[parseInt(livelloNum,10)];
    if (!idDatabaseLivello) {
      console.warn(`⚠️ Nessun ID database trovato per il livello numero: ${livelloNum}`);
      return;
    }

    // 5. Scansioniamo tutte le select degli indicatori presenti dentro QUESTA stanza
    const selectsIndicatore = stanzaCard.querySelectorAll('.input-valore-stanza');

    selectsIndicatore.forEach(selectEl => {
      const idIndicatoreRaw = selectEl.dataset.idIndicatore;
      if (!idIndicatoreRaw) return;

      const idIndicatore = parseInt(idIndicatoreRaw, 10);
      const valoreSelezionato = selectEl.value; // Es. "Conforme", "Non Conforme", ""



	// Troviamo il campo nota associato nello stesso blocco (.nodo-requisito)
      const reqBox = selectEl.closest('.nodo-requisito');
      const inputNota = reqBox ? reqBox.querySelector('.input-nota-valore-stanza') : null;
      const notaTesto = inputNota ? inputNota.value.trim() : '';

      // Salva se c'è un valore selezionato o una nota presente
      if ((valoreSelezionato && valoreSelezionato !== '') || notaTesto !== '') {
		// All'interno di raccogliDatiStanzePerDB():
		listaRecord.push({
		  id_livello: idDatabaseLivello,
		  id_stanza: idStanza, // 👈 Usa 'id_stanza' come nome chiave per Supabase
		  id_indicatore_facilitazioni: idIndicatore,
		  value: valoreSelezionato || null,
		  nota: notaTesto || null
		});
		
		
		
      }
    });
  });

  console.log("✅ Record Stanze generati per il salvataggio:", listaRecord);
  return listaRecord;
}





// ==================================================
// SALVA I DATI SUL DB
// ==================================================
/**
 * Salva prima le stanze nella tabella 'stanze', recupera gli ID generati 
 * e successivamente salva le schede indicatori in 'scheda_stanze'.
 * 
 * @param {Object} mappaLivelliId - Oggetto che mappa numero_livello -> id_livello_db
 */
async function salvaStanzeESchede(mappaLivelliId) {

  const cardStanze = document.querySelectorAll('.nodo-stanza.stanza-card');
  if (!cardStanze || cardStanze.length === 0) return true;

  try {
    for (const stanzaCard of cardStanze) {
      // 1. Nome stanza
      const inputNome = stanzaCard.querySelector('.input-nome-stanza');
      if (!inputNome) continue;

      const nomeStanza = inputNome.value.trim();
      if (!nomeStanza) continue;


		const inputBagnoStanza = stanzaCard.querySelector('.input-bagno-stanza').checked;
		
      // 2. Numero livello e ID Livello DB
      const livelloNum = stanzaCard.getAttribute('data-livello');
      if (livelloNum === null || livelloNum === undefined) continue;

      const idDatabaseLivello = mappaLivelliId[parseInt(livelloNum, 10)];
      if (!idDatabaseLivello) {
        console.warn(`⚠️ Nessun ID livello database trovato per livello: ${livelloNum}`);
        continue;
      }

      // Check se abbiamo già un id_stanza memorizzato sul DOM
      const idStanzaEsistente = inputNome.dataset.idStanza || stanzaCard.dataset.idStanza || null;

      // STEP 1: Salva o Aggiorna nella tabella 'stanze'
      const payloadStanza = {
        id_livello: idDatabaseLivello,
        stanza: nomeStanza,
		bagno: inputBagnoStanza
      };

      if (idStanzaEsistente && !isNaN(parseInt(idStanzaEsistente, 10))) {
        payloadStanza.id = parseInt(idStanzaEsistente, 10);
      }

      const { data: stanzaSalvata, error: errStanza } = await clientSupabase
        .from('stanze')
        .upsert(payloadStanza)
        .select('id, stanza')
        .single();

      if (errStanza) {
        console.error(`❌ Errore salvataggio stanza "${nomeStanza}":`, errStanza);
        continue;
      }

      const idStanzaGenerato = stanzaSalvata.id;
      
      // Salva ID nel DOM per futuri salvataggi senza refresh
      inputNome.dataset.idStanza = idStanzaGenerato;
      stanzaCard.dataset.idStanza = idStanzaGenerato;

      // STEP 2: Raccogli indicatori per 'scheda_stanze'
      const recordSchedeIndicatori = [];
      const selectsIndicatore = stanzaCard.querySelectorAll('.input-valore-stanza');

      selectsIndicatore.forEach(selectEl => {
        const idIndicatoreRaw = selectEl.dataset.idIndicatore;
        if (!idIndicatoreRaw) return;

        const idIndicatore = parseInt(idIndicatoreRaw, 10);
        const valoreSelezionato = selectEl.value;

        const reqBox = selectEl.closest('.nodo-requisito');
        const inputNota = reqBox ? reqBox.querySelector('.input-nota-valore-stanza') : null;
        const notaTesto = inputNota ? inputNota.value.trim() : '';

        if ((valoreSelezionato && valoreSelezionato !== '') || notaTesto !== '') {
          recordSchedeIndicatori.push({
            id_stanza: idStanzaGenerato, // FK verso stanze.id
            id_indicatore_facilitazioni: idIndicatore,
            value: valoreSelezionato || null,
            nota: notaTesto || null
          });
        }
      });

      // Salva in 'scheda_stanze'
      if (recordSchedeIndicatori.length > 0) {
        // Rimuove vecchi valori per questa stanza prima dell'inserimento
        await clientSupabase
          .from('scheda_stanze')
          .delete()
          .eq('id_stanza', idStanzaGenerato);

        const { error: errSchede } = await clientSupabase
          .from('scheda_stanze')
          .insert(recordSchedeIndicatori);

        if (errSchede) {
          console.error(`❌ Errore inserimento scheda_stanze per ID ${idStanzaGenerato}:`, errSchede);
        }
      }
    }

    return true;
  } catch (err) {
    console.error("❌ Errore in salvaStanzeESchede:", err);
    return false;
  }
}

	
	
	
// --------------------------------------------------
// 1. CARICAMENTO DATI STANZE DAL DB (LEFT JOIN)
// --------------------------------------------------

/**
 * Recupera le stanze e le relative valutazioni degli indicatori per un insieme di livelli.
 * 
 * @param {Array<number>} idLivelli - Array contenente gli ID reali del DB dei livelli
 * @returns {Promise<Object>} Mappa strutturata: { [id_livello]: { [id_stanza]: { nome: string, valori: { [id_indicatore]: { value, nota } } } } }
 */
async function caricaDatiStanzeConValori(idLivelli) {

  if (!idLivelli || idLivelli.length === 0) return {};

  try {
    // -----------------------------------------------------------------
    // 1. Recuperiamo tutte le stanze legate ai livelli specificati
    // -----------------------------------------------------------------
    const { data: stanzeData, error: errStanze } = await clientSupabase
      .from('stanze')
      .select('id, id_livello, stanza, bagno, nota')
      .in('id_livello', idLivelli);

    if (errStanze) {
      console.error("❌ Errore durante il recupero della tabella 'stanze':", errStanze);
      return {};
    }

    if (!stanzeData || stanzeData.length === 0) {
      console.log("ℹ️ Nessuna stanza trovata per i livelli selezionati." , idLivelli);
      return {};
    }

    // Estraiamo tutti gli ID primari delle stanze trovate
    const idsStanze = stanzeData.map(s => s.id);

    // -----------------------------------------------------------------
    // 2. Recuperiamo le valutazioni dalla tabella 'scheda_stanze'
    // -----------------------------------------------------------------
    const { data: schedeData, error: errSchede } = await clientSupabase
      .from('scheda_stanze')
      .select('id, id_stanza, id_indicatore_facilitazioni, value, nota')
      .in('id_stanza', idsStanze);

    if (errSchede) {
      console.error("❌ Errore durante il recupero di 'scheda_stanze':", errSchede);
      return {};
    }

    // -----------------------------------------------------------------
    // 3. Strutturiamo la mappa dei dati
    // -----------------------------------------------------------------
    // Struttura finale:
    // {
    //   [id_livello]: [
    //     {
    //       idStanza: 10,
    //       nomeStanza: "Camera 101",
    //       indicatori: {
    //         [id_indicatore]: { value: "Conforme", nota: "..." }
    //       }
    //     }
    //   ]
    // }
    const mappaStanzePerLivello = {};

    // Inizializziamo le stanze nella mappa organizzate per id_livello
    const mappaStanzeById = {};

    stanzeData.forEach(stanzaObj => {
      const idLivello = stanzaObj.id_livello;
      if (!mappaStanzePerLivello[idLivello]) {
        mappaStanzePerLivello[idLivello] = [];
      }

      const nuovaStanza = {
        idStanza: stanzaObj.id,
        nomeStanza: stanzaObj.stanza,
		bagnoStanza: stanzaObj.bagno,
        notaStanza: stanzaObj.nota || '',
        indicatori: {} // qui metteremo gli indicatori con la loro risposta
      };

      mappaStanzePerLivello[idLivello].push(nuovaStanza);
      mappaStanzeById[stanzaObj.id] = nuovaStanza;
    });

    // Popoliamo gli indicatori per ogni stanza
    if (schedeData && schedeData.length > 0) {
      schedeData.forEach(item => {
        const stanzaRef = mappaStanzeById[item.id_stanza];
        if (stanzaRef) {
          stanzaRef.indicatori[item.id_indicatore_facilitazioni] = {
            value: item.value,
            nota: item.nota
          };
        }
      });
    }

    console.log("✅ Dati stanze caricati e mappati con successo:", mappaStanzePerLivello);
    return mappaStanzePerLivello;

  } catch (err) {
    console.error("❌ Errore imprevisto in caricaDatiStanzeConValori:", err);
    return {};
  }
}

	