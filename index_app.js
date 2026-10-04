// =========================
// GESTIONE LOGOUT
// =========================
async function effettuaLogout() {
  try {
    await clientSupabase.auth.signOut();
  } catch (err) {
    console.error("Errore durante il logout:", err);
  } finally {
    window.location.href = "login.html";
  }
}

// Rimossa la disconnessione automatica prima della chiusura per preservare la sessione tra schede

// =========================
// INIZIALIZZAZIONE PAGINA & CONTROLLO AUTH
// =========================
async function inizializzaPagina() {
  // Verifica autenticazione bloccante prima di qualsiasi carica dati
  const { data: { user } } = await clientSupabase.auth.getUser();

  if (!user) {
    window.location.href = "login.html";
    return;
  }

  await showWelcomeMessage(user);
  await caricaMenuCitta();
  await caricaMenuDisabilita(); 
  await fetchTuttiIDati();
}

async function showWelcomeMessage(user){
  const { data, error } = await clientSupabase
    .from("operatori")
    .select("*")
    .eq("mail", user.email)
    .single();

  if(error){
    console.log("errore:" , error);
    return;
  }

  const now = new Date();
  const giorno = String(now.getDate()).padStart(2, '0');
  const mese = String(now.getMonth() + 1).padStart(2, '0');
  const anno = now.getFullYear();
  const ore = String(now.getHours()).padStart(2, '0');
  const minuti = String(now.getMinutes()).padStart(2, '0');

  const dataFormattata = `${giorno}/${mese}/${anno}`;
  const oraFormattata = `${ore}:${minuti}`;

  document.getElementById("welcomeMessage").innerHTML = `
    Ciao <b>${data.cognome} ${data.nome}</b>, oggi è il <b>${dataFormattata}</b> e sono le <b>${oraFormattata}</b>
  `;
}

async function caricaMenuCitta() {
  try {
    const { data: citta, error } = await clientSupabase
      .from('citta')
      .select('id, citta')
      .order('citta', { ascending: true });

    if (error) throw error;

    const select = document.getElementById('filtro-citta');
    citta.forEach(c => {
      const opt = document.createElement('option');
      opt.value = c.id;
      opt.innerText = c.citta;
      select.appendChild(opt);
    });

  } catch (err) {
    console.error("Errore nel caricamento delle città:", err.message);
  }
}

async function caricaMenuDisabilita() {
  try {
    const { data: disabilita, error } = await clientSupabase
      .from('v_elenco_disabilita')
      .select('disabilita') 
      .order('disabilita', { ascending: true });

    if (error) throw error;

    const select = document.getElementById('filtro-disabilita');
    disabilita.forEach(d => {
      if (!d.disabilita) return;
      const opt = document.createElement('option');
      opt.value = d.disabilita.trim();
      opt.innerText = d.disabilita.trim();
      select.appendChild(opt);
    });

  } catch (err) {
    console.error("Errore nel caricamento del menu disabilità:", err.message);
  }
}

// ============================================================
// CARICAMENTO PARALLELO DELLE VISTE
// ============================================================
async function fetchTuttiIDati() {
  try {
    const [resResidenze, resStanze, resSpazi, resCompleta] = await Promise.all([
      clientSupabase.from('v_residenze').select('*'),
      clientSupabase.from('v_stanze').select('*'),
      clientSupabase.from('v_spazicomuni').select('*'),
      clientSupabase.from('v_residenze_completa').select('*')
    ]);

	
    if (resResidenze.error) throw resResidenze.error;
    if (resStanze.error) throw resStanze.error;
    if (resSpazi.error) throw resSpazi.error;
    if (resCompleta.error) throw resCompleta.error;

    tutteLeResidenzeRaw = resResidenze.data || [];
    tutteLeStanzeRaw = resStanze.data || [];
    tuttiGliSpaziComuniRaw = resSpazi.data || [];
    vistaResidenzeCompletaRaw = resCompleta.data || [];

    applicaFiltro();

  } catch (err) {
    document.getElementById('lista-residenze').innerHTML = 
      `<div class="status-msg" style="color: red;">Errore nel caricamento dati: ${err.message}</div>`;
  }
}

// ============================================================
// COMPOSIZIONE DELL'ALBERO IN MEMORIA (PER CARD)
// ============================================================
function assemblaAlberoResidenze(residenzeGrezze, stanzeGrezze, spaziGrezzi) {
  const mappaResidenze = {};

  residenzeGrezze.forEach(riga => {
   
    const idRes = riga.id_residenza || riga.struttura;
    if (!idRes) return;

    if (!mappaResidenze[idRes]) {
      mappaResidenze[idRes] = {
        id_residenza: riga.id_residenza,
        struttura: riga.struttura,
        telefono: riga.telefono,
        email: riga.email,
        indirizzo: riga.indirizzo,
        cap: riga.cap,
        localita: riga.localita,
        citta: riga.citta,
        id_citta: riga.id_citta,
        scheda: {
          portineria: riga.portineria,
		  num_addetti_emergenze_disabili: riga.num_addetti_emergenze_disabili,
          ascensore: riga.ascensore,
          rampa: riga.rampa_struttura,
          montascale: riga.montascale,
          montapersone: riga.montapersone,
          mensa: riga.mensa,
          num_livelli: riga.num_livelli,
		  num_ospiti: riga.num_ospiti,
          num_stanze: riga.num_stanze,
          num_stanze_disabili: riga.num_stanze_disabili,
          spazi_comuni_struttura: riga.spazi_comuni_struttura
        },
        livelliMap: {}
      };
    }

    const idLivello = riga.id_livello;
    if (idLivello) {
      if (!mappaResidenze[idRes].livelliMap[idLivello]) {
        mappaResidenze[idRes].livelliMap[idLivello] = {
          id_livello: idLivello,
          piano: riga.piano,
          accessibile: riga.accessibile,
          rampa: riga.rampa_livello,
          num_camere: riga.num_camere,
          num_camere_accessibili: riga.num_camere_accessibili,
          spazi_comuni_livello: riga.spazi_comuni_livello,
          nota: riga.nota_livello,
          stanzeMap: {},
          spaziComuniMap: {}
        };
      }
    }
  });

  const mappaLivelliGlobali = {};
  Object.values(mappaResidenze).forEach(res => {
    Object.values(res.livelliMap).forEach(livello => {
      mappaLivelliGlobali[livello.id_livello] = livello;
    });
  });

  stanzeGrezze.forEach(rigaStanza => {
    const livelloObj = mappaLivelliGlobali[rigaStanza.id_livello];
    if (!livelloObj) return;

    const idStanza = rigaStanza.id_stanza || rigaStanza.stanza;
    if (!idStanza) return;

    if (!livelloObj.stanzeMap[idStanza]) {
      livelloObj.stanzeMap[idStanza] = {
        id_stanza: rigaStanza.id_stanza,
        stanza: rigaStanza.stanza,
		// 👈 RECUPERO DEL CAMPO BOOLEANO DALLA VISTA
      bagno: rigaStanza.bagno_in_camera ?? rigaStanza.bagno ?? false, 
        nota: rigaStanza.nota_stanza,
        areeMap: {}
      };
    }

    const stObj = livelloObj.stanzeMap[idStanza];
    const area = rigaStanza.area_indicatore_stanza;
    const ambito = rigaStanza.ambito_indicatore_stanza;
    const requisito = rigaStanza.requisito_indicatore_stanza;

    if (area && ambito && requisito) {
      if (!stObj.areeMap[area]) stObj.areeMap[area] = {};
      if (!stObj.areeMap[area][ambito]) stObj.areeMap[area][ambito] = [];

      stObj.areeMap[area][ambito].push({
        requisito: requisito,
        valore: rigaStanza.valore_indicatore_stanza,
        nota: rigaStanza.nota_indicatore_stanza
      });
    }
  });

  spaziGrezzi.forEach(rigaSpazio => {
    const livelloObj = mappaLivelliGlobali[rigaSpazio.id_livello];
    if (!livelloObj) return;

    const idSpazio = rigaSpazio.id_stanza || rigaSpazio.spaziocomune;
    if (!idSpazio) return;

    if (!livelloObj.spaziComuniMap[idSpazio]) {
      livelloObj.spaziComuniMap[idSpazio] = {
        id_spaziocomune: idSpazio,
        spaziocomune: rigaSpazio.spaziocomune,
        nota: rigaSpazio.nota_spaziocomune,
        areeMap: {}
      };
    }

    const spObj = livelloObj.spaziComuniMap[idSpazio];
    const area = rigaSpazio.area_indicatore_spaziocomune;
    const ambito = rigaSpazio.ambito_indicatore_spaziocomune;
    const requisito = rigaSpazio.requisito_indicatore_spaziocomune;

    if (area && ambito && requisito) {
      if (!spObj.areeMap[area]) spObj.areeMap[area] = {};
      if (!spObj.areeMap[area][ambito]) spObj.areeMap[area][ambito] = [];

      spObj.areeMap[area][ambito].push({
        requisito: requisito,
        valore: rigaSpazio.valore_indicatore_spaziocomune,
        nota: rigaSpazio.nota_indicatore_spaziocomune
      });
    }
  });

  return Object.values(mappaResidenze).map(res => {
    res.livelli = Object.values(res.livelliMap).map(livello => {
      livello.stanze = Object.values(livello.stanzeMap);
      livello.spaziComuni = Object.values(livello.spaziComuniMap);
      delete livello.stanzeMap;
      delete livello.spaziComuniMap;
      return livello;
    });
    delete res.livelliMap;
    return res;
  });
}

// ============================================================
// APPLICAZIONE FILTRI PER ENTRAMBE LE VISTE
// ============================================================
function applicaFiltro() {
  const selectCitta = document.getElementById('filtro-citta');
  const idCittaSelezionata = selectCitta.value;
  const nomeCittaSelezionata = selectCitta.options[selectCitta.selectedIndex] 
    ? selectCitta.options[selectCitta.selectedIndex].text.trim().toLowerCase() 
    : '';
  
  const disabilitaSelezionata = document.getElementById('filtro-disabilita').value.trim().toLowerCase();
  const valoreSelezionato = document.getElementById('filtro-valore').value.trim().toLowerCase();
  
  const inVistaTabella = document.getElementById('btnVistaCard').style.display === 'inline-block';

  if (inVistaTabella) {
    const tabellaFiltrata = vistaResidenzeCompletaRaw.filter(riga => {
      let matchCitta = true;
      if (idCittaSelezionata !== "tutte") {
        if (riga.id_citta !== undefined && riga.id_citta !== null) {
          matchCitta = String(riga.id_citta) === String(idCittaSelezionata);
        } else if (riga.citta) {
          matchCitta = riga.citta.trim().toLowerCase() === nomeCittaSelezionata;
        }
      }

      let matchValore = true;
      if (valoreSelezionato !== "tutti") {
        const valCamp = (riga.valore_indicatore || '').toString().trim().toLowerCase();
        matchValore = (valCamp === valoreSelezionato);
      }

      let matchDisabilita = true;
      if (disabilitaSelezionata !== "tutte") {
        const testoDisabilitaCampo = (
          riga.disabilita_indicatore || 
          riga.disabilita_indicatore_stanza || 
          riga.disabilita_indicatore_spaziocomune || 
          riga.disabilita || 
          ''
        ).toString().toLowerCase();

        matchDisabilita = testoDisabilitaCampo.includes(disabilitaSelezionata);
      }

      return matchCitta && matchValore && matchDisabilita;
    });

    renderTabellaCompleta(tabellaFiltrata);

  } else {
    const stanzeFiltrate = tutteLeStanzeRaw.filter(st => {
      const testoDisabilitaStanza = (
        st.disabilita_indicatore_stanza || 
        st.disabilita_indicatore || 
        st.disabilita || 
        ''
      ).toString().toLowerCase();

      const matchDisabilita = (
        disabilitaSelezionata === "tutte" || 
        testoDisabilitaStanza.includes(disabilitaSelezionata)
      );

      const valoreCampo = (st.valore_indicatore_stanza || '').toString().trim().toLowerCase();
      const matchValore = (valoreSelezionato === "tutti" || valoreCampo === valoreSelezionato);

      return matchDisabilita && matchValore;
    });

    const spaziFiltrati = tuttiGliSpaziComuniRaw.filter(sp => {
      const testoDisabilitaSpazio = (
        sp.disabilita_indicatore_spazicomuni || 
        sp.disabilita_indicatore_spaziocomune || 
        sp.disabilita_indicatore || 
        sp.disabilita || 
        ''
      ).toString().toLowerCase();
      
      const matchDisabilita = (
        disabilitaSelezionata === "tutte" || 
        testoDisabilitaSpazio.includes(disabilitaSelezionata)
      );

      const valoreCampo = (sp.valore_indicatore_spaziocomune || '').toString().trim().toLowerCase();
      const matchValore = (valoreSelezionato === "tutti" || valoreCampo === valoreSelezionato);

      return matchDisabilita && matchValore;
    });

    const idLivelliValidi = new Set([
      ...stanzeFiltrate.map(st => st.id_livello),
      ...spaziFiltrati.map(sp => sp.id_livello)
    ]);

    const residenzeFiltrate = tutteLeResidenzeRaw.filter(res => {
      const matchCitta = (idCittaSelezionata === "tutte" || String(res.id_citta) === String(idCittaSelezionata));
      
      if (disabilitaSelezionata === "tutte" && valoreSelezionato === "tutti") {
        return matchCitta;
      }

      const haLivelloCompatibile = idLivelliValidi.has(res.id_livello);
      return matchCitta && haLivelloCompatibile;
    });

    const alberoStrutturato = assemblaAlberoResidenze(residenzeFiltrate, stanzeFiltrate, spaziFiltrati);
    renderResidenze(alberoStrutturato);
  }
}

// ============================================================
// HELPER TREE INDICATORI
// ============================================================
function generaHtmlAlberoIndicatori(areeMap, coloreTema = '#0284c7') {
  const nomiAree = Object.keys(areeMap);
  if (nomiAree.length === 0) {
    return '<div style="color: #94a3b8; font-style: italic; font-size:0.8em; margin-top:4px;">Nessun indicatore associato.</div>';
  }

  let htmlAree = '';

  nomiAree.forEach(area => {
    const ambitiMap = areeMap[area];
    let htmlAmbiti = '';

    Object.keys(ambitiMap).forEach(ambito => {
      const requisiti = ambitiMap[ambito];
      let htmlRequisiti = '';

      requisiti.forEach(req => {
        htmlRequisiti += `
          <div style="margin-top: 4px; padding: 4px 6px; background: #ffffff; border-left: 3px solid ${coloreTema}; font-size: 0.8em; border-radius: 2px;">
            <div><strong>📌 Requisito:</strong> ${req.requisito}</div>
            <div style="color: ${coloreTema}; font-weight: bold;">Valore: ${req.valore ?? 'N/D'}</div>
            ${req.nota ? `<div style="color: #64748b; font-style: italic; font-size: 0.9em;">Note: ${req.nota}</div>` : ''}
          </div>
        `;
      });

      htmlAmbiti += `
        <details style="margin-top: 4px; border: 1px solid #e2e8f0; border-radius: 4px;">
          <summary style="padding: 3px 6px; background: #f8fafc; font-size: 0.82em; cursor: pointer; font-weight: 500;">
            📂 Ambito: ${ambito} (${requisiti.length})
          </summary>
          <div style="padding: 4px 6px; background: #f1f5f9;">
            ${htmlRequisiti}
          </div>
        </details>
      `;
    });

    htmlAree += `
      <details style="margin-top: 4px; border: 1px solid #cbd5e1; border-radius: 4px;">
        <summary style="padding: 4px 8px; background: #ffffff; font-size: 0.85em; cursor: pointer; font-weight: 600; color: ${coloreTema};">
          🏷️ Area: ${area}
        </summary>
        <div style="padding: 4px 6px; background: #ffffff;">
          ${htmlAmbiti}
        </div>
      </details>
    `;
  });

  return `
    <details style="margin-top: 6px;">
      <summary style="font-weight: 600; color: ${coloreTema}; cursor: pointer; font-size: 0.85em;">
        📋 Indicatori (${nomiAree.length} Aree)
      </summary>
      <div style="margin-top: 4px; padding-left: 4px;">
        ${htmlAree}
      </div>
    </details>
  `;
}

// ============================================================
// RENDERING CARD
// ============================================================
function renderResidenze(residenze) {
  const container = document.getElementById('lista-residenze');
  container.className = 'cards-grid';
  container.innerHTML = ''; 

  if (!residenze || residenze.length === 0) {
    container.innerHTML = '<div class="status-msg">Nessuna residenza trovata per i criteri selezionati.</div>';
    return;
  }

  residenze.forEach(residenza => {
    const scheda = residenza.scheda;
    const nomeCitta = residenza.citta || residenza.localita || 'N/D';

    const via = encodeURIComponent((residenza.indirizzo || '').trim());
    const cap = encodeURIComponent((residenza.cap || '').trim());
    const localita = encodeURIComponent((residenza.localita || '').trim());
    const indirizzoFormattato = `${via},${cap},${localita}`.replace(/\s+/g, '+');

    const formattaBooleano = (v) => v === true ? 'Sì' : (v === false ? 'No' : v || 'N/D');

    let htmlLivelli = '';
    const livelli = residenza.livelli || [];

    if (livelli.length > 0) {
      livelli.sort((a, b) => (a.livello || 0) - (b.livello || 0));

      livelli.forEach(p => {

        const etichettaLivello = (p.piano !== null && p.piano !== undefined) ? p.piano : 'N/D';
        const stanze = p.stanze || [];
        const spaziComuni = p.spaziComuni || [];

        let DettagliLivelloHTML = '';


		if (stanze.length > 0) {
		  stanze.forEach(st => {
			if (st.stanza) {
			  // Definizione corretta dell'etichetta del bagno
			  const bagnoincamera = st.bagno === true ? "   (Bagno in Camera)" : "";
			  const htmlIndicatori = generaHtmlAlberoIndicatori(st.areeMap || {}, '#0284c7');
			  
			  DettagliLivelloHTML += `
				<details class="tree-stanza" style="margin-top: 6px; border: 1px solid #cbd5e1; border-radius: 4px; background: #fff;">
				  <summary style="padding: 5px 8px; background: #f8fafc; font-size: 0.85em; cursor: pointer; font-weight: 600;">
					🚪 Stanza: ${st.stanza}${bagnoincamera}
				  </summary>
				  <div style="padding: 6px 8px; font-size: 0.82em; background: #fafafa; border-top: 1px solid #f1f5f9;">
					${st.nota ? `<div style="margin-bottom: 4px;"><strong>Note Stanza:</strong> <em>${st.nota}</em></div>` : ''}
					${htmlIndicatori}
				  </div>
				</details>
			  `;
			}
		  });
		}


        if (spaziComuni.length > 0) {
          spaziComuni.forEach(sp => {
            if (sp.spaziocomune) {
              const htmlIndicatori = generaHtmlAlberoIndicatori(sp.areeMap || {}, '#0369a1');
              DettagliLivelloHTML += `
                <details class="tree-stanza" style="margin-top: 6px; border: 1px solid #bae6fd; border-radius: 4px; background: #fff;">
                  <summary style="padding: 5px 8px; background: #f0f9ff; font-size: 0.85em; cursor: pointer; font-weight: 600; color: #0369a1;">
                    🛋️ Spazio Comune: ${sp.spaziocomune}
                  </summary>
                  <div style="padding: 6px 8px; font-size: 0.82em; background: #f8fafc; border-top: 1px solid #e0f2fe;">
                    ${sp.nota ? `<div style="margin-bottom: 4px;"><strong>Note Spazio:</strong> <em>${sp.nota}</em></div>` : ''}
                    ${htmlIndicatori}
                  </div>
                </details>
              `;
            }
          });
        }

        if (!DettagliLivelloHTML) {
          DettagliLivelloHTML = `<div style="font-size: 0.8em; color: #94a3b8; font-style: italic; padding: 4px 0;">Nessuna stanza o spazio comune censito su questo livello.</div>`;
        }

        htmlLivelli += `
          <details class="tree-livello" style="margin-bottom: 8px; border: 1px solid #cbd5e1; border-radius: 6px; overflow: hidden;">
            <summary style="padding: 6px 10px; background: #f1f5f9; font-weight: bold; font-size: 0.9em; cursor: pointer; display: flex; justify-content: space-between;">
              <span>📐 Livello ${etichettaLivello}</span>
              <span style="font-weight: normal; font-size: 0.8em; color: #64748b;">
                ${stanze.length} 🚪 | ${spaziComuni.length} 🛋️
              </span>
            </summary>
            <div style="padding: 6px 8px; background: #ffffff;">
              ${DettagliLivelloHTML}
            </div>
          </details>
        `;
      });
    } else {
      htmlLivelli = `<div style="background: #fffbeb; color: #b45309; padding: 8px; border-radius: 4px; font-size: 0.85em; border: 1px solid #fef3c7;">
        ⚠️ Nessun dettaglio sui livelli trovato per questa residenza.
      </div>`;
    }

    const cardNode = document.createElement('div');
    cardNode.className = 'card-residenza';

    cardNode.innerHTML = `
      <div class="card-header-title">
        <span>🏢 ${residenza.struttura || 'Senza nome'}</span>
        <span class="badge-info" style="font-size:0.7em;">${nomeCitta}</span>
      </div>

      <div class="info-grid">
        <div><strong>Indirizzo:</strong> ${residenza.indirizzo || 'N/D'} 
          <a href="https://www.google.com/maps/search/?api=1&query=${indirizzoFormattato}" target="_blank" style="text-decoration:none;">📍</a>
        </div>
        <div><strong>CAP / Località:</strong> ${residenza.cap || ''} ${nomeCitta}</div>
        <div><strong>Telefono:</strong> <a href="tel:${residenza.telefono || ''}">${residenza.telefono || 'N/D'} 📞</a></div>
        ${scheda ? `
		<div><strong>Portineria:</strong> ${scheda.portineria}</div>
		<div><strong>Addetti Emergenze:</strong> ${scheda.num_addetti_emergenze_disabili}</div>
		<div><strong>Mensa:</strong> ${formattaBooleano(scheda.mensa)}</div>
		<div><strong>Ascensore:</strong> ${formattaBooleano(scheda.ascensore)}</div>
		<div><strong>Montascale:</strong> ${formattaBooleano(scheda.montascale)}</div>
		<div><strong>Montapersone:</strong> ${formattaBooleano(scheda.montapersone)}</div>
        <div><strong>Rampa Struttura:</strong> ${formattaBooleano(scheda.rampa)}</div>
		
		<div><strong>Ospiti totali:</strong> ${scheda.num_ospiti}</div>
		<div><strong>Livelli totali:</strong> ${scheda.num_livelli}</div>
		<div><strong>Stanze totali:</strong> ${scheda.num_stanze}</div>
		<div><strong>Stanze Disabili:</strong> ${scheda.num_stanze_disabili}</div>
		<div><strong>Spazi Comuni totali:</strong> ${scheda.spazi_comuni_struttura}</div>
        ` : ''}
      </div>

      <div class="section-title">Livelli e Struttura Interna:</div>
      <div class="livelli-container">
        ${htmlLivelli}
      </div>
    `;

    container.appendChild(cardNode);
  });
}

// ============================================================
// SWITCH VISTE E TABELLA DATATABLES
// ============================================================
function mostraTabella() {
  document.getElementById('btnVistaTabella').style.display = 'none';
  document.getElementById('btnVistaCard').style.display = 'inline-block';
  
  const container = document.getElementById('lista-residenze');
  container.classList.remove('cards-grid');
  container.classList.add('vista-tabella-full');

  applicaFiltro();
}

function mostraCard() {
  document.getElementById('btnVistaTabella').style.display = 'inline-block';
  document.getElementById('btnVistaCard').style.display = 'none';

  const container = document.getElementById('lista-residenze');
  container.classList.remove('vista-tabella-full');
  container.classList.add('cards-grid');

  applicaFiltro();
}

function renderTabellaCompleta(datiGrezzi) {
  const container = document.getElementById('lista-residenze');

  if ($.fn.DataTable.isDataTable('#tabellaCompleta')) {
    $('#tabellaCompleta').DataTable().destroy();
    $('#tabellaCompleta').empty();
  }

  if (!datiGrezzi || datiGrezzi.length === 0) {
    container.innerHTML = '<div class="status-msg">Nessun dato disponibile per i filtri selezionati.</div>';
    return;
  }

  let html = `<table id="tabellaCompleta" class="display nowrap" style="width:100%"><thead><tr>`;
  const colonne = Object.keys(datiGrezzi[0]);
  
  const campiDaNascondere = ['id_citta', 'id_residenza', 'id_livello', 'id_stanza', 'id_spaziocomune'];

  colonne.forEach(c => {
    html += `<th>${c.replaceAll('_', ' ').toUpperCase()}</th>`;
  });
  html += `</tr></thead><tbody>`;

  datiGrezzi.forEach(r => {
    html += '<tr>';
    colonne.forEach(c => {
      let v = r[c];
      if (v === true) v = 'SI';
      if (v === false) v = 'NO';
      if (v === null || v === undefined) v = '';
      html += `<td>${v}</td>`;
    });
    html += '</tr>';
  });

  html += '</tbody></table>';
  container.innerHTML = html;

  const indiciDaNascondere = colonne
    .map((nomeColonna, index) => campiDaNascondere.includes(nomeColonna) ? index : -1)
    .filter(index => index !== -1);

  $('#tabellaCompleta').DataTable({
    scrollX: true,
    autoWidth: false,
    pageLength: 25,
    columnDefs: [
      {
        targets: indiciDaNascondere,
        visible: false,
        searchable: true
      }
    ],
    dom: '<"dt-top-container"B<"dt-search-length"fl>>rt<"dt-bottom-container"ip>',
    buttons: [
      {
        extend: 'excelHtml5',
        text: '📄 Excel',
        title: 'Export_Residenze',
        exportOptions: { columns: ':visible' }
      },
      {
        extend: 'csvHtml5',
        text: '📊 CSV',
        title: 'Export_Residenze',
        exportOptions: { columns: ':visible' }
      },
      {
        extend: 'copyHtml5',
        text: '📋 Copia',
        exportOptions: { columns: ':visible' }
      },
      {
        extend: 'print',
        text: '🖨️ Stampa',
        exportOptions: { columns: ':visible' }
      }
    ],
    language: {
      search: "🔍 Cerca:",
      lengthMenu: "Mostra _MENU_ righe",
      info: "Da _START_ a _END_ di _TOTAL_ righe",
      paginate: { previous: "←", next: "→" }
    }
  });
}

