async function showWelcomeMessage(){

  // =========================
  // UTENTE LOGGATO
  // =========================

  const {
    data: { user }
  } = await clientSupabase.auth.getUser();


  // se non loggato
  if(!user){

    window.location.href = "/";

    return;
  }


  // =========================
  // CERCA OPERATORE
  // =========================

  const { data, error } =
    await clientSupabase
      .from("operatori")
      .select("*")
      .eq("mail", user.email)
      .single();


  console.log(data, error);


  if(error){

    console.log(error);

    return;
  }


  // =========================
  // DATA E ORA
  // =========================

  const now = new Date();

  const giorno =
    String(now.getDate()).padStart(2, '0');

  const mese =
    String(now.getMonth() + 1).padStart(2, '0');

  const anno =
    now.getFullYear();

  const ore =
    String(now.getHours()).padStart(2, '0');

  const minuti =
    String(now.getMinutes()).padStart(2, '0');


  const dataFormattata =
    `${giorno}/${mese}/${anno}`;

  const oraFormattata =
    `${ore}:${minuti}`;

console.log(dataFormattata);
console.log(oraFormattata);

  // =========================
  // MESSAGGIO
  // =========================

  document
    .getElementById("welcomeMessage")
    .innerHTML =

    `
      Ciao
      <b>${data.cognome} ${data.nome}</b>,
      oggi è il
      <b>${dataFormattata}</b>
      e sono le
      <b>${oraFormattata}</b>
    `;

}






















    async function caricaCitta() {
      const { data, error } = await clientSupabase.from('citta').select('id, citta').order('citta');
      if (error) return mostraMessaggio("Errore caricamento città", true);
      
      const select = document.getElementById('select-citta');
      data.forEach(c => {
        let opt = document.createElement('option');
        opt.value = c.id;
        opt.innerText = c.citta;
        select.appendChild(opt);
      });
    }

    async function gestisciCambioCitta() {
      const idCitta = document.getElementById('select-citta').value;
      const selectRes = document.getElementById('select-residenza');
      const formDati = document.getElementById('form-dati-scheda');
      
      formDati.style.display = "none";
      selectRes.innerHTML = '<option value="">-- Scegli Residenza --</option>';
      
      if (!idCitta) {
        selectRes.disabled = true;
        return;
      }

      const { data, error } = await clientSupabase.from('residenze').select('id, struttura, telefono, indirizzo, cap, localita').eq('id_citta', idCitta);
      if (error) return mostraMessaggio("Errore caricamento residenze", true);

      tutteLeResidenze = data;
      data.forEach(r => {
        let opt = document.createElement('option');
        opt.value = r.id;
        opt.innerText = r.struttura;
        selectRes.appendChild(opt);
      });
      selectRes.disabled = false;
    }













// --------------------------------------------------
// 1. CARICAMENTO DATI SCHEDA_STANZE DAL DB (LEFT JOIN)
// --------------------------------------------------
async function caricaDatiStanzeConValori(pianiIds) {
  if (!pianiIds || pianiIds.length === 0) return {};

  const { data, error } = await clientSupabase
    .from('indicatori_facilitazioni')
    .select(`
      id, area, ambito, requisito, caratteristiche, disabilita, note,
      scheda_stanze (
	    id,
        id_piano,
        nome_stanza,
        value,
        nota
      )
    `)
    .order('area')
    .order('ambito')
    .order('requisito');

  if (error) {
    console.error("Errore caricamento dati stanze:", error);
    return {};
  }

  // Mappa i valori salvati: mappaValori[idPiano][nomeStanza][idIndicatore] = { value: "...", nota: "..." }
  const mappaValori = {};
  data.forEach(item => {
    const listaStanzeSalvate = item.scheda_stanze || [];
    listaStanzeSalvate.forEach(s => {
	  const id = s.id;
      const idPiano = s.id_piano;

      // Filtriamo solo se appartiene ai piani che ci interessano
      if (pianiIds.includes(idPiano)) {
        const stanza = s.nome_stanza;
        if (!mappaValori[idPiano]) mappaValori[idPiano] = {};
        if (!mappaValori[idPiano][stanza]) mappaValori[idPiano][stanza] = {};
        
        // Salviamo sia il valore che la nota
        mappaValori[idPiano][stanza][item.id] = {
          value: s.value || '',
          nota: s.nota || ''
        };
      }
    });
  });

  return mappaValori;
}





























    async function caricaDatiResidenzaSelezionata() {
      const idResidenza = document.getElementById('select-residenza').value;
      const formDati = document.getElementById('form-dati-scheda');
      
      if (!idResidenza) {
	    document.getElementById('box-last-update').style.display = "none";
        document.getElementById('box-telefono').style.display = "none";
		document.getElementById('box-indirizzo').style.display = "none";
		
        formDati.style.display = "none";
        return;
      }

      const boxTelefono = document.getElementById('box-telefono');
      const testoTelefono = document.getElementById('testo-telefono');
      
      const residenzaSelezionata = tutteLeResidenze.find(r => r.id === parseInt(idResidenza));
      
      if (residenzaSelezionata && residenzaSelezionata.telefono) {
        const numTel = residenzaSelezionata.telefono.trim();
        testoTelefono.innerHTML = `<a href="tel:${numTel}" style="color: #0284c7; text-decoration: none;">${numTel} 📞 </a>`;
        boxTelefono.style.display = "block";
      } else {
        testoTelefono.innerHTML = `<span style="color: #666; font-style: italic;">Nessun telefono registrato</span>`;
        boxTelefono.style.display = "block";
      }
	  
	  
	  
	  // 1. Seleziona gli elementi corretti presenti nel tuo HTML
		const boxIndirizzo = document.querySelector('.address-box'); // Seleziona il div contenitore
		const spanIndirizzo = document.getElementById('box-indirizzo'); // Lo span del testo
		const mapsButton = document.getElementById('mapsButton'); // Il pulsante di Maps

		if (residenzaSelezionata && residenzaSelezionata.indirizzo && residenzaSelezionata.cap && residenzaSelezionata.localita) {
			const via = encodeURIComponent(residenzaSelezionata.indirizzo.trim());
			const cap = encodeURIComponent(residenzaSelezionata.cap.trim());
			const localita = encodeURIComponent(residenzaSelezionata.localita.trim());

		  
		  // 2. Aggiorna il testo visibile dell'indirizzo
		   spanIndirizzo.textContent = residenzaSelezionata.indirizzo.trim() + ','+ residenzaSelezionata.cap.trim() + ','+ residenzaSelezionata.localita.trim();
		  // 3. Genera l'URL dinamico codificato per Google Maps
			const indirizzoCompleto = via + ','+ cap + ','+ localita;
			// Sostituisce tutti gli spazi con il carattere '+'
			const indirizzoFormattato = indirizzoCompleto.trim().replace(/\s+/g, '+');
			// Assegna l'URL corretto al pulsante Maps
			mapsButton.href = `https://www.google.com/maps/search/?api=1&query=${indirizzoFormattato}`;
		  // 4. Mostra il contenitore dell'indirizzo
		  boxIndirizzo.style.display = "block";
		  
		} else {
		  // Se l'indirizzo manca, mostra un avviso o nascondi il box
		  spanIndirizzo.innerHTML = `<span style="color: #666; font-style: italic;">Nessun indirizzo registrato</span>`;
		  mapsButton.href = "#"; // Disabilita il link di Maps
		}

	  
	  
	  

      schedaEsistenteId = null;
      pianosCaricatiInMemoria = [];
	  document.getElementById('check-mensa').checked = false;
	  document.getElementById('check-spazi-esterni').checked = false;
	  document.getElementById('check-spazi-comuni').checked = false;
      document.getElementById('check-ascensore').checked = false;
	  document.getElementById('check-montascale').checked = false;
	  document.getElementById('check-montapersone').checked = false;
      document.getElementById('check-rampa').checked = false;
	  document.getElementById('input-num-ospiti').value = 1;
	  document.getElementById('input-num-stanze').value = 1;
	  document.getElementById('input-num-stanze-disabili').value = 0;
      document.getElementById('input-piani').value = 1;

      const { data: schedaData, error: schedaError } = await clientSupabase
        .from('scheda_residenze')
        .select('id, id_residenza, last_update, mensa, spazi_esterni, spazi_comuni, ascensore, montascale, montapersone, rampa, num_ospiti,num_stanze, num_stanze_disabili, piani, portineria')
        .eq('id_residenza', idResidenza);

      if (schedaError) return mostraMessaggio("Errore caricamento scheda: " + schedaError.message, true);

      formDati.style.display = "block";

      if (schedaData && schedaData.length > 0) {
        const scheda = schedaData[0];
        schedaEsistenteId = scheda.id;
		console.log(scheda.last_update);

		
		const ts = scheda.last_update;
		const date = new Date(ts);

		const data_leggibile = new Intl.DateTimeFormat('it-IT', {
		  day: '2-digit',
		  month: '2-digit',
		  year: '2-digit',
		  hour: '2-digit',
		  minute: '2-digit',
		  hour12: false
		}).format(date).replace(',', '');

		console.log(data_leggibile);
		
		
		if (scheda.last_update) {
        const numTel = residenzaSelezionata.telefono.trim();
        document.getElementById('testo-last-update').innerHTML = `<span style="color: #666; font-style: italic;">${data_leggibile} </span>`;
        boxTelefono.style.display = "block";
      } else {
        document.getElementById('testo-last-update').innerHTML = `<span style="color: #666; font-style: italic;">Nessuna informazione registrata</span>`;
        boxTelefono.style.display = "block";
      }
		
		
		
		document.getElementById('box-last-update').style.display = "block";
		document.getElementById('select-portineria').value = scheda.portineria;
		document.getElementById('check-mensa').checked = scheda.mensa;
		document.getElementById('check-spazi-esterni').checked = scheda.spazi_esterni;
		document.getElementById('check-spazi-comuni').checked = scheda.spazi_comuni;
        document.getElementById('check-ascensore').checked = scheda.ascensore;
		document.getElementById('check-montascale').checked = scheda.montascale;
		document.getElementById('check-montapersone').checked = scheda.montapersone;
        document.getElementById('check-rampa').checked = scheda.rampa;
		document.getElementById('input-num-ospiti').value = scheda.num_ospiti || 1;
		document.getElementById('input-num-stanze').value = scheda.num_stanze || 1;
		document.getElementById('input-num-stanze-disabili').value = scheda.num_stanze_disabili || 0;
        document.getElementById('input-piani').value = scheda.piani || 1;

        const { data: pianiData, error: pianiError } = await clientSupabase
          .from('piani')
          .select('*')
          .eq('id_residenza', schedaEsistenteId)
          .order('piano');

        if (pianiError) console.warn("Errore caricamento piani correlati:", pianiError.message);

        pianosCaricatiInMemoria = pianiData || [];
        generaRighePiani(pianosCaricatiInMemoria);
      } else {
        generaRighePiani([]);
      }
    }
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	




































async function salvaTutto() {
	// scheda_residenze
  const idResidenzaVal = document.getElementById('select-residenza').value;
  const mensa = document.getElementById('check-mensa').checked;
  const spazi_esterni = document.getElementById('check-spazi-esterni').checked;
  const spazi_comuni = document.getElementById('check-spazi-comuni').checked;
  const ascensore = document.getElementById('check-ascensore').checked;
  const montascale = document.getElementById('check-montascale').checked;
  const montapersone = document.getElementById('check-montapersone').checked;
  const rampa = document.getElementById('check-rampa').checked;
  const num_ospiti = parseInt(document.getElementById('input-num-ospiti').value) || 0;
  const num_stanze = parseInt(document.getElementById('input-num-stanze').value) || 0;
  const num_stanze_disabili = parseInt(document.getElementById('input-num-stanze-disabili').value) || 0;
  const num_piani = parseInt(document.getElementById('input-piani').value) || 0;
  const portineria = document.getElementById('select-portineria').value;

  if (!idResidenzaVal) {
    return mostraMessaggio("Seleziona prima una residenza.", true);
  }

  const idResidenzaId = parseInt(idResidenzaVal);

  const datiSchedaResidenze = { 
    id_residenza: idResidenzaId, 
    portineria : portineria,
    spazi_esterni : spazi_esterni,
    spazi_comuni : spazi_comuni,
    mensa: mensa, 
    ascensore: ascensore, 
    montascale: montascale, 
    montapersone: montapersone, 
    rampa: rampa, 
    num_ospiti: num_ospiti,
    num_stanze: num_stanze,
    num_stanze_disabili: num_stanze_disabili,
    piani: num_piani 
  };

  try {
    let idSchedaResidenzeId = null;

    const { data: schedaVerifica, error: erroreVerifica } = await clientSupabase
      .from('scheda_residenze')
      .select('id')
      .eq('id_residenza', idResidenzaId);

    if (erroreVerifica) throw erroreVerifica;

    if (schedaVerifica && schedaVerifica.length > 0) {
      idSchedaResidenzeId = schedaVerifica[0].id;
      const { error: erroreUpdate } = await clientSupabase
        .from('scheda_residenze')
        .update(datiSchedaResidenze)
        .eq('id', idSchedaResidenzeId);

      if (erroreUpdate) throw erroreUpdate;
    } else {
      const { data: nuovaScheda, error: erroreInsert } = await clientSupabase
        .from('scheda_residenze')
        .insert(datiSchedaResidenze)
        .select();

      if (erroreInsert) throw erroreInsert;
      idSchedaResidenzeId = nuovaScheda[0].id;
    }

    if (!idSchedaResidenzeId) throw new Error("ID scheda non valido.");



	  

	// piani
    const righeTR = document.querySelectorAll('#corpo-tabella-piani tr');
    
    // Mappa temporanea per associare l'indice/numero del piano al suo ID di database reale
    const mappaPianiId = {};

    for (const tr of righeTR) {
      const numeroPianoCorrente = parseInt(tr.dataset.piano);
      const pianoEsistenteNelDB = pianosCaricatiInMemoria.find(p => p.piano === numeroPianoCorrente);

      const datiPiano = {
        id_residenza: idResidenzaId,
        piano: numeroPianoCorrente,
        accessibile: tr.querySelector('.piano-accessibile').value,
        rampa: tr.querySelector('.piano-rampa').checked,
        num_camere: parseInt(tr.querySelector('.piano-stanze').value) || 0,
        num_camere_accessibili: parseInt(tr.querySelector('.piano-stanze-acc').value) || 0,
        nota: tr.querySelector('.piano-nota').value
      };

	console.log("Mucci Inserimento datiPiano per idresidenza...", idResidenzaId);
		
      if (pianoEsistenteNelDB && pianoEsistenteNelDB.id) {
        console.log(`Aggiorno piano ${numeroPianoCorrente} sulla riga ID: ${pianoEsistenteNelDB.id}`);
        
        const { error: errorUpdatePiano } = await clientSupabase
          .from('piani')
          .update(datiPiano)
          .eq('id', pianoEsistenteNelDB.id);

        if (errorUpdatePiano) throw errorUpdatePiano;
        
        // Salvo l'ID esistente nella mappa
        mappaPianiId[numeroPianoCorrente] = pianoEsistenteNelDB.id;

      } else {
        console.log(`Inserisco nuovo piano ${numeroPianoCorrente} per la scheda: ${idResidenzaId}`);
        
        // Aggiunto .select() per recuperare l'ID appena autogenerato
        const { data: nuovoPianoInserito, error: errorInsertPiano } = await clientSupabase
          .from('piani')
          .insert(datiPiano)
          .select();

        if (errorInsertPiano) throw errorInsertPiano;
        
        // Salvo il nuovo ID generato nella mappa
        mappaPianiId[numeroPianoCorrente] = nuovoPianoInserito[0].id;
      }
    }
	
    // scheda_stanze
    const datiStanze = raccogliDatiStanzePerDB(mappaPianiId);

    // 1. Recuperiamo gli ID di tutti i piani salvati/aggiornati
    const arrayIdPiani = Object.values(mappaPianiId);

    if (arrayIdPiani.length > 0) {
      // 2. Cancelliamo i vecchi valori associati a questi piani per evitare duplicati o residui da rinomina
      const { error: errorDelete } = await clientSupabase
        .from('stanze')
        .delete()
        .in('id_piano', arrayIdPiani);

      if (errorDelete) throw errorDelete;
    }

    // 3. Inseriamo i nuovi record con i nomi e i valori aggiornati dal DOM
    if (datiStanze.length > 0) {
      console.log("Inserimento nuovi indicatori stanze...", datiStanze);
      const { error: errorStanze } = await clientSupabase
        .from('stanze')
        .insert(datiStanze); // Semplice insert, niente upsert/onConflict!

      if (errorStanze) throw errorStanze;
    }
	
	
	
	

	
    mostraMessaggio("Aggiornamento effettuato!", false);
    await caricaDatiResidenzaSelezionata();

  } catch (err) {
    mostraMessaggio("Errore durante il salvataggio: " + err.message, true);
    console.error("Dettaglio Errore:", err);
  }
}

	
	
























	// --------------------------------------------------
// NON ASYNC FUNCTIONSSSSS
// --------------------------------------------------



    function mostraMessaggio(testo, isErrore) {
      const box = document.getElementById('status-box');
      box.innerText = testo;
      box.style.display = "block";
      box.style.backgroundColor = isErrore ? "#fee2e2" : "#dcfce7";
      box.style.color = isErrore ? "#991b1b" : "#166534";
      window.scrollTo(0, 0);
    }
	
	
	
	
	
	
	
	
	// Funzione generica per aprire/chiudere qualsiasi livello dell'albero
	function toggleLivello(headerEl) {
	  const bodyEl = headerEl.nextElementSibling;
	  const icona = headerEl.querySelector('.icona');
	  
	  if (bodyEl.style.display === 'block') {
		bodyEl.style.display = 'none';
		if (icona) icona.textContent = '➕';
	  } else {
		bodyEl.style.display = 'block';
		if (icona) icona.textContent = '➖';
	  }
	}
	
	
	
	
	
	
	
	
	
	
	
	
	
	
		// Helper per aggiornare il dataset quando l'utente rinomina la stanza
		function aggiornaDatasetStanza(inputEl) {
		  const nuovoNome = inputEl.value.trim();
		  const cardStanza = inputEl.closest('.nodo-stanza');
		  if (!cardStanza) return;

		  const selects = cardStanza.querySelectorAll('.input-valore-stanza');
		  selects.forEach(sel => {
			sel.dataset.nomeStanza = nuovoNome;
		  });
		}
		
		
		
		
		
		








// 1. Mostra/Nasconde l'intera sezione in base alla spunta del Padre
function toggleSpaziEsterni() {
  const padre = document.getElementById('check-spazi-esterni');
  const sezione = document.getElementById('sezione-spazi-esterni');
  
  if (padre.checked) {
    sezione.style.display = 'block';
  } else {
    // 1. Nasconde la sezione
    sezione.style.display = 'none';

    // 2. Deseleziona tutte le checkbox figlie
    const figli = sezione.querySelectorAll('.chk-servizio-esterno');
    figli.forEach(chk => chk.checked = false);

    // 3. Chiude il menu <details> se era rimasto aperto
    const details = sezione.querySelector('details');
    if (details) details.removeAttribute('open');

    // 4. Ripristina il testo originale dell'intestazione
    aggiornaTestoSummary();
  }
}








// 2. Aggiorna il testo dell'intestazione per mostrare cosa è stato selezionato
function aggiornaTestoSummary() {
  const selezionati = Array.from(document.querySelectorAll('.chk-servizio-esterno:checked'))
                           .map(cb => cb.value);
  
  const summary = document.getElementById('summary-spazi-esterni');
  
  if (selezionati.length === 0) {
    summary.textContent = "Seleziona Caratteristiche Spazi Esterni...";
  } else if (selezionati.length <= 2) {
    summary.textContent = selezionati.join(', ');
  } else {
    summary.textContent = `${selezionati.length} caratteristiche selezionate`;
  }
}







// 1. Mostra/Nasconde l'intera sezione in base alla spunta del Padre
function toggleSpaziComuni() {
  const padre = document.getElementById('check-spazi-comuni');
  const sezione = document.getElementById('sezione-spazi-comuni');
  
  if (padre.checked) {
    sezione.style.display = 'block';
  } else {
    // 1. Nasconde la sezione
    sezione.style.display = 'none';

    // 2. Deseleziona tutte le checkbox figlie
    const figli = sezione.querySelectorAll('.chk-servizio-comune');
    figli.forEach(chk => chk.checked = false);

    // 3. Chiude il menu <details> se era rimasto aperto
    const details = sezione.querySelector('details');
    if (details) details.removeAttribute('open');

    // 4. Ripristina il testo originale dell'intestazione
    aggiornaTestoComuniSummary();
  }
}






// 2. Aggiorna il testo dell'intestazione per mostrare cosa è stato selezionato
function aggiornaTestoComuniSummary() {
  const selezionati = Array.from(document.querySelectorAll('.chk-servizio-comune:checked'))
                           .map(cb => cb.value);
  
  const summary = document.getElementById('summary-spazi-comuni');
  
  if (selezionati.length === 0) {
    summary.textContent = "Spazi Comuni...";
  } else if (selezionati.length <= 2) {
    summary.textContent = selezionati.join(', ');
  } else {
    summary.textContent = `${selezionati.length} caratteristiche selezionate`;
  }
}

























		
		
		
		
		
		
		
		
	

// --------------------------------------------------
// 3. GENERAZIONE ALBERO CARD STANZA CON ICONE
// --------------------------------------------------

function generaCardStanza(idPiano, idStanza, nomeStanza, pianoNum, mappaValori = {}) {
	
	
	// Palette di colori pastello per piano (Sfondo Card / Colore Header)
	const palettePiani = [
	  { bgCard: '#fffde7', bgHeader: '#fff59d', border: '#fbc02d', testo: '#5d4037' }, // Piano 1: Giallo
	  { bgCard: '#f1f8e9', bgHeader: '#c5e1a5', border: '#7cb342', testo: '#1b5e20' }, // Piano 2: Verde
	  { bgCard: '#e1f5fe', bgHeader: '#90caf9', border: '#0288d1', testo: '#01579b' }, // Piano 3: Azzurro
	  { bgCard: '#f3e5f5', bgHeader: '#ce93d8', border: '#ab47bc', testo: '#4a148c' }, // Piano 4: Lilla/Viola
	  { bgCard: '#fff3e0', bgHeader: '#ffcc80', border: '#fb8c00', testo: '#e65100' }, // Piano 5: Arancio
	  { bgCard: '#fbe9e7', bgHeader: '#ffab91', border: '#f4511e', testo: '#bf360c' }  // Piano 6: Rosa/Pescato
	];
	
	
  const stanzaCard = document.createElement('div');
  stanzaCard.className = 'nodo-stanza stanza-card';
  stanzaCard.dataset.piano = pianoNum;
  stanzaCard.style.cssText = 'border:1px solid #cbd5e1; border-radius:8px; margin-bottom:12px; background:#fff; overflow:hidden;';





// 1. Calcola il colore in base al numero del piano
	// Calcola l'indice del colore (es. piano 1 -> colore 0, piano 2 -> colore 1, etc.)
	const pianoIdx = (parseInt(pianoNum, 10) - 1) % palettePiani.length;
const tema = palettePiani[pianoIdx];
  //const pianoIdx = parseInt(pianoNum, 10) - 1;
  const numColoriDisponibili = 6;
  const classeColore = `card-piano-colore-${pianoIdx % numColoriDisponibili}`;
  
    

  
  
  

  

  // Aggiunge la classe del colore pastello alla card
  stanzaCard.classList.add(classeColore);


  // Impostiamo l'attributo data-piano e data-id-stanza sulla card principale
  stanzaCard.setAttribute('data-piano', pianoNum);
  if (idStanza) stanzaCard.setAttribute('data-id-stanza', idStanza);

  const haNomeValido = nomeStanza && nomeStanza.trim() !== '' && !nomeStanza.startsWith('Stanza_');
  const valoreNomeInput = haNomeValido ? nomeStanza : '';

  // HEADER STANZA
  const stanzaHeader = document.createElement('div');
  stanzaHeader.className = 'header-livello-0';
  stanzaHeader.style.cssText = 'cursor:pointer; background:#0284c7; color:#fff; padding:12px; font-weight:bold; display:flex; justify-content:space-between; align-items:center;';
  /*
  stanzaHeader.innerHTML = `
    <div style="display:flex; align-items:center; gap:8px; flex:1;" onclick="event.stopPropagation();">
      <span>🛏️ Piano ${pianoNum} - Stanza Accessibile:</span>
      <input type="text" 
             class="input-nome-stanza" 
             data-id-stanza="${idStanza || ''}"
             data-id-piano="${idPiano || ''}"
             value="${valoreNomeInput}" 
             placeholder="Digita identificativo stanza"
             style="padding:4px 8px; border-radius:4px; border:1px solid #93c5fd; background:#ffffff; color:#1e293b; font-weight:600; width:220px;"
             onchange="aggiornaDatasetStanza(this)" />
    </div>
    <span class="icona" style="margin-left:12px;">➕</span>
  `;
  */
  
  
  
  
  
  


// 2. Applica lo sfondo pastello all'intera card della stanza
stanzaCard.style.backgroundColor = tema.bgCard;
stanzaCard.style.borderLeft = `6px solid ${tema.border}`;
stanzaCard.style.marginBottom = '12px';
stanzaCard.style.borderRadius = '6px';
stanzaCard.style.overflow = 'hidden';

// 3. Applica il colore dell'header (dove c'è il titolo e l'input)
stanzaHeader.style.backgroundColor = tema.bgHeader;
stanzaHeader.style.color = tema.testo;
stanzaHeader.style.padding = '10px 14px';

// 4. Il tuo HTML esistente dell'header
stanzaHeader.innerHTML = `
  <div style="display:flex; align-items:center; gap:8px; flex:1;" onclick="event.stopPropagation();">
    <span style="font-weight:600; color:${tema.testo};">🛏️ Piano ${pianoNum} - Stanza Accessibile:</span>
    <input type="text" 
           class="input-nome-stanza" 
           data-id-stanza="${idStanza || ''}"
           data-id-piano="${idPiano || ''}"
           value="${valoreNomeInput}" 
           placeholder="Digita identificativo stanza"
           style="padding:4px 8px; border-radius:4px; border:1px solid ${tema.border}; background:#ffffff; color:#1e293b; font-weight:600; width:220px;"
           onchange="aggiornaDatasetStanza(this)" />
  </div>
  <span class="icona" style="margin-left:12px; color:${tema.testo};">➕</span>
`;






  
  
  

  // APERTURA / CHIUSURA ALBERO STANZA
  stanzaHeader.onclick = (e) => {
    if (e.target.tagName !== 'INPUT') {
      toggleLivello(stanzaHeader);
    }
  };

  const stanzaBody = document.createElement('div');
  stanzaBody.className = 'body-livello';
  stanzaBody.style.cssText = 'display:none; padding:10px; background:#f8fafc;';

  // CONTROLLO SICUREZZA
  const areeDisponibili = Object.keys(alberoIndicatori || {});
  if (areeDisponibili.length === 0) {
    stanzaBody.innerHTML = `<div style="padding:10px; color:#ef4444; font-style:italic;">Nessun indicatore caricato dal database. Verifica la tabella 'indicatori_facilitazioni'.</div>`;
    stanzaCard.appendChild(stanzaHeader);
    stanzaCard.appendChild(stanzaBody);
    return stanzaCard;
  }

  // COSTRUZIONE ALBERO (AREA -> AMBITO -> REQUISITI)
  areeDisponibili.forEach(nomeArea => {
    const areaCard = document.createElement('div');
    areaCard.className = 'nodo-area';
    areaCard.style.cssText = 'margin-bottom:8px; border:1px solid #e2e8f0; border-radius:6px; background:#fff;';

    const areaHeader = document.createElement('div');
    areaHeader.className = 'header-livello-1';
    areaHeader.style.cssText = 'cursor:pointer; background:#e2e8f0; color:#334155; padding:8px 12px; font-weight:600; display:flex; justify-content:space-between; align-items:center;';
    areaHeader.innerHTML = `<span>📐 AREA: ${nomeArea}</span> <span class="icona">➕</span>`;
    areaHeader.onclick = (e) => { e.stopPropagation(); toggleLivello(areaHeader); };

    const areaBody = document.createElement('div');
    areaBody.className = 'body-livello';
    areaBody.style.cssText = 'display:none; padding:8px;';

    const ambiti = alberoIndicatori[nomeArea] || {};
    Object.keys(ambiti).forEach(nomeAmbito => {
      const ambitoCard = document.createElement('div');
      ambitoCard.className = 'nodo-ambito';
      ambitoCard.style.cssText = 'margin-bottom:6px; border-left:4px solid #0284c7; background:#fff; border-top:1px solid #f1f5f9; border-right:1px solid #f1f5f9; border-bottom:1px solid #f1f5f9; border-radius:4px;';

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
        const identificativoStanzaEffettivo = valoreNomeInput || nomeStanza;
        
        // RECUPERO VALORE E NOTA SALVATI DALLA MAPPA
        let valoreSalvato = '';
        let notaSalvata = '';

        if (idPiano && mappaValori[idPiano] && mappaValori[idPiano][identificativoStanzaEffettivo]) {
          const datiIndicatore = mappaValori[idPiano][identificativoStanzaEffettivo][req.id];
          
          if (datiIndicatore) {
            if (typeof datiIndicatore === 'object') {
              valoreSalvato = datiIndicatore.value || '';
              notaSalvata = datiIndicatore.nota || '';
            } else {
              valoreSalvato = datiIndicatore;
            }
          }
        }

        const reqUniqueId = `info_${idPiano || 'new'}_${req.id}_${Math.random().toString(36).substr(2, 4)}`;

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
                      data-id-piano="${idPiano || ''}" 
                      data-nome-stanza="${identificativoStanzaEffettivo}" 
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
















// --------------------------------------------------
// 2. DYNAMIC UI: GENERAZIONE PIANI E STANZE
// --------------------------------------------------
function generaRighePiani(pianiSalvati = []) {
  const numPiani = parseInt(document.getElementById('input-piani').value) || 1;
  const tbody = document.getElementById('corpo-tabella-piani');
  tbody.innerHTML = '';

  for (let i = 1; i <= numPiani; i++) {
    const datiPiano = pianiSalvati.find(p => p.piano === i) || {};

    const tr = document.createElement('tr');
    tr.dataset.piano = i;
    if (datiPiano.id) tr.dataset.idPianoDb = datiPiano.id;

    tr.innerHTML = `
      <td><strong>Piano ${i}</strong></td>
      <td><input type="checkbox" class="piano-rampa" ${datiPiano.rampa ? 'checked' : ''}></td>
      <td>
        <select class="piano-accessibile">
          <option value="Sì" ${datiPiano.accessibile === 'Sì' ? 'selected' : ''}>Sì</option>
          <option value="No" ${datiPiano.accessibile === 'No' ? 'selected' : ''}>No</option>
          <option value="Parzialmente" ${datiPiano.accessibile === 'Parzialmente' ? 'selected' : ''}>Parzialmente</option>
        </select>
      </td>
      <td><input type="number" class="piano-stanze" min="0" value="${datiPiano.num_camere ?? 0}"></td>
      <td><input type="number" class="piano-stanze-acc" min="0" value="${datiPiano.num_camere_accessibili ?? 0}" onchange="rigeneraDettagliStanze()"></td>
      <td><input type="text" class="piano-nota" value="${datiPiano.nota || ''}" placeholder="Eventuali note..."></td>
    `;
    tbody.appendChild(tr);
  }

  rigeneraDettagliStanze();
}







// --------------------------------------------------
// 1. RIGENERA DETTAGLI STANZE (CORRETTA)
// --------------------------------------------------
async function rigeneraDettagliStanze() {
  const containerStanze = document.getElementById('contenitore-stanze');
  const sezioneStanze = document.getElementById('sezione-dettaglio-stanze');
  if (!containerStanze || !sezioneStanze) return;

  containerStanze.innerHTML = '';

  // Sicurezza: Se alberoIndicatori è vuoto, proviamo a ricaricarlo al volo
  if (!alberoIndicatori || Object.keys(alberoIndicatori).length === 0) {
    console.warn("Albero indicatori non ancora pronto. Ricarico...");
    await caricaIndicatori();
  }

  const righeTR = document.querySelectorAll('#corpo-tabella-piani tr');
  const idPianiPresenti = [];

  righeTR.forEach(tr => {
    if (tr.dataset.idPianoDb) idPianiPresenti.push(parseInt(tr.dataset.idPianoDb));
  });

  // Carica la mappa dei valori salvati (se ci sono piani salvati)
  let mappaValori = {};
  if (idPianiPresenti.length > 0) {
    mappaValori = await caricaDatiStanzeConValori(idPianiPresenti);
  }

  let totaleStanzeAcc = 0;

  righeTR.forEach(tr => {
    const numeroPiano = tr.dataset.piano;
    const idPianoDb = tr.dataset.idPianoDb || null;
	const idStanza = tr.dataset.id || null;
    const numStanzeAcc = parseInt(tr.querySelector('.piano-stanze-acc').value) || 0;

    if (numStanzeAcc > 0) {
      totaleStanzeAcc += numStanzeAcc;

      for (let s = 1; s <= numStanzeAcc; s++) {
        let nomeStanzaDefault = `Stanza_${numeroPiano}_${s}`;
        
        // Se c'è un nome salvato su DB lo usa
        if (idPianoDb && mappaValori[idPianoDb]) {
          const chiaviStanze = Object.keys(mappaValori[idPianoDb]);
          if (chiaviStanze[s - 1]) nomeStanzaDefault = chiaviStanze[s - 1];
        }

        const card = generaCardStanza(idPianoDb, idStanza, nomeStanzaDefault, numeroPiano, mappaValori);
        containerStanze.appendChild(card);
      }
    }
  });

  sezioneStanze.style.display = totaleStanzeAcc > 0 ? 'block' : 'none';
}













// Funzione per aprire/chiudere l'accordion
function toggleAccordionOLD(headerEl) {
  const bodyEl = headerEl.nextElementSibling;
  const icona = headerEl.querySelector('.icona-espandi');
  
  if (bodyEl.style.display === 'block') {
    bodyEl.style.display = 'none';
    icona.textContent = '➕';
  } else {
    bodyEl.style.display = 'block';
    icona.textContent = '➖';
  }
}
	
	function spaziEsterniOLD() {

	  // Recuperiamo lo stato del checkbox principale
	  const spazi_esterni = document.getElementById('check-spazi-esterni').checked;
	  
	  // Usiamo l'ID corretto del contenitore principale
	  const divContenitore = document.getElementById('sezione-spazi-esterni');
	  
	  
	  // Logica per mostrare o nascondere in base al click
	  if (spazi_esterni) {
		divContenitore.style.display = "block"; // Mostra se selezionato
	  } else {
		divContenitore.style.display = "none";  // Nasconde se deselezionato
	  }
	}
	

	function spaziComuniOLD() {

	  // Recuperiamo lo stato del checkbox principale
	  const spazi_comuni = document.getElementById('check-spazi-comuni').checked;
	  
	  // Usiamo l'ID corretto del contenitore principale
	  const divContenitore = document.getElementById('sezione-spazi-comuni');
	  
	  
	  // Logica per mostrare o nascondere in base al click
	  if (spazi_comuni) {
		divContenitore.style.display = "block"; // Mostra se selezionato
	  } else {
		divContenitore.style.display = "none";  // Nasconde se deselezionato
	  }
	}



    function rigeneraPianiVuotiOLD() {
      generaRighePiani(pianosCaricatiInMemoria);
    }
	
	
// ==================================================
// 1. STATO GLOBALE E INIZIALIZZAZIONE
// ==================================================
let alberoIndicatori = {};

/**
 * Carica la struttura gerarchica degli indicatori da Supabase
 */
async function caricaIndicatori() {
  console.log("Tentativo di recupero indicatori da Supabase...");

  try {
    const { data, error } = await clientSupabase
      .from('indicatori_facilitazioni')
      .select('id, area, ambito, requisito, caratteristiche, disabilita, note')
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
// 2. GESTIONE GENERAZIONE CARD E ALBERO STANZE
// ==================================================

/**
 * Rigenera il blocco contenitore dei dettagli di ciascuna stanza
 */
async function rigeneraDettagliStanze() {
  const containerStanze = document.getElementById('contenitore-stanze');
  const sezioneStanze = document.getElementById('sezione-dettaglio-stanze');
  if (!containerStanze || !sezioneStanze) return;

  containerStanze.innerHTML = '';

  // Controllo di sicurezza: Ricarica gli indicatori se non sono in memoria
  if (!alberoIndicatori || Object.keys(alberoIndicatori).length === 0) {
    console.warn("Albero indicatori non ancora pronto. Ricarico...");
    await caricaIndicatori();
  }

  const righeTR = document.querySelectorAll('#corpo-tabella-piani tr');
  const idPianiPresenti = [];

  righeTR.forEach(tr => {
    if (tr.dataset.idPianoDb) {
      idPianiPresenti.push(parseInt(tr.dataset.idPianoDb, 10));
    }
  });

  // Carica la mappa dei valori salvati da DB per i piani esistenti
  let mappaValori = {};
  if (idPianiPresenti.length > 0 && typeof caricaDatiStanzeConValori === 'function') {
    mappaValori = await caricaDatiStanzeConValori(idPianiPresenti);
  }

  let totaleStanzeAcc = 0;

  righeTR.forEach(tr => {
    const numeroPiano = tr.dataset.piano;
    const idPianoDb = tr.dataset.idPianoDb || null;
    const idStanza = tr.dataset.id || null;
    const inputStanzeAcc = tr.querySelector('.piano-stanze-acc');
    const numStanzeAcc = inputStanzeAcc ? (parseInt(inputStanzeAcc.value, 10) || 0) : 0;

    if (numStanzeAcc > 0) {
      totaleStanzeAcc += numStanzeAcc;

      for (let s = 1; s <= numStanzeAcc; s++) {
        let nomeStanzaDefault = `Stanza_${numeroPiano}_${s}`;
        
        // Assegna il nome registrato a DB se disponibile
        if (idPianoDb && mappaValori[idPianoDb]) {
          const chiaviStanze = Object.keys(mappaValori[idPianoDb]);
          if (chiaviStanze[s - 1]) {
            nomeStanzaDefault = chiaviStanze[s - 1];
          }
        }

        if (typeof generaCardStanza === 'function') {
          const card = generaCardStanza(idPianoDb, idStanza, nomeStanzaDefault, numeroPiano, mappaValori);
          containerStanze.appendChild(card);
        }
      }
    }
  });

  sezioneStanze.style.display = totaleStanzeAcc > 0 ? 'block' : 'none';
}

/**
 * Genera l'albero HTML navigabile degli indicatori per una stanza
 */
function generaContenutoStanza(pianoNum, stanzaNum) {
  const containerStanza = document.createElement('div');
  containerStanza.className = 'stanza-body-albero';

  // 1° LIVELLO: AREE
  Object.keys(alberoIndicatori).forEach(nomeArea => {
    const areaCard = document.createElement('div');
    areaCard.className = 'nodo-area';

    const areaHeader = document.createElement('div');
    areaHeader.className = 'header-livello-1';
    areaHeader.innerHTML = `<span>📐 Area: <strong>${nomeArea}</strong></span> <span class="icona">➕</span>`;
    areaHeader.onclick = () => toggleLivello(areaHeader);

    const areaBody = document.createElement('div');
    areaBody.className = 'body-livello';
    areaBody.style.display = 'none';

    // 2° LIVELLO: AMBITI
    const ambiti = alberoIndicatori[nomeArea];
    Object.keys(ambiti).forEach(nomeAmbito => {
      const ambitoCard = document.createElement('div');
      ambitoCard.className = 'nodo-ambito';

      const ambitoHeader = document.createElement('div');
      ambitoHeader.className = 'header-livello-2';
      ambitoHeader.innerHTML = `<span>📂 Ambito: <strong>${nomeAmbito}</strong></span> <span class="icona">➕</span>`;
      ambitoHeader.onclick = () => toggleLivello(ambitoHeader);

      const ambitoBody = document.createElement('div');
      ambitoBody.className = 'body-livello';
      ambitoBody.style.display = 'none';

      // 3° LIVELLO: REQUISITI
      const requisiti = ambiti[nomeAmbito];
      requisiti.forEach(req => {
        const reqBox = document.createElement('div');
        reqBox.className = 'nodo-requisito';
        
        reqBox.innerHTML = `
          <div class="requisito-titolo">📄 <strong>${req.requisito}</strong></div>
          <div class="requisito-dettagli">
            ${req.caratteristiche ? `<p><strong>Caratteristiche:</strong> ${req.caratteristiche}</p>` : ''}
            ${req.disabilita ? `<p><strong>Disabilità target:</strong> ${req.disabilita}</p>` : ''}
            ${req.note ? `<p class="testo-mute"><em>Note guida: ${req.note}</em></p>` : ''}
          </div>
          <div class="requisito-input">
            <label>Stato:</label>
            <select class="input-valore-stanza" data-id-indicatore="${req.id}">
              <option value="">-- Seleziona Stato --</option>
              <option value="Conforme">Conforme</option>
              <option value="Non Conforme">Non Conforme</option>
              <option value="Parzialmente Conforme">Parzialmente Conforme</option>
              <option value="Non Applicabile">Non Applicabile</option>
            </select>
            <textarea class="input-nota-valore-stanza" placeholder="Note o osservazioni specifiche per questo requisito..." rows="2"></textarea>
          </div>
        `;
        ambitoBody.appendChild(reqBox);
      });

      ambitoCard.appendChild(ambitoHeader);
      ambitoCard.appendChild(ambitoBody);
      areaBody.appendChild(ambitoCard);
    });

    areaCard.appendChild(areaHeader);
    areaCard.appendChild(areaBody);
    containerStanza.appendChild(areaCard);
  });

  return containerStanza;
}

// ==================================================
// 3. ESTRAZIONE DATI PER SUPABASE
// ==================================================

/**
 * Legge dal DOM l'input inserito nelle card stanza e prepara il payload per Supabase
 */
function raccogliDatiStanzePerDB(mappaPianiId) {
  const listaRecord = [];

  const cardStanze = document.querySelectorAll('.nodo-stanza.stanza-card');

  cardStanze.forEach(stanzaCard => {
    const inputNome = stanzaCard.querySelector('.input-nome-stanza');
    if (!inputNome) return;

    const nomeStanza = inputNome.value.trim();
    if (!nomeStanza) return;

    const pianoNum = stanzaCard.getAttribute('data-piano');
    if (pianoNum === null || pianoNum === undefined) {
      console.warn(`⚠️ Attenzione: Impossibile trovare data-piano per la stanza "${nomeStanza}"`);
      return;
    }

    const idDatabasePiano = mappaPianiId[parseInt(pianoNum, 10)];
    if (!idDatabasePiano) {
      console.warn(`⚠️ Nessun ID database trovato per il piano numero: ${pianoNum}`);
      return;
    }

    // Seleziona sia select che eventuali checkbox o input
    const selectsIndicatore = stanzaCard.querySelectorAll('.input-valore-stanza');

    selectsIndicatore.forEach(selectEl => {
      const idIndicatoreRaw = selectEl.dataset.idIndicatore;
      if (!idIndicatoreRaw) return;

      const idIndicatore = parseInt(idIndicatoreRaw, 10);
      const valoreSelezionato = selectEl.value;

      const reqBox = selectEl.closest('.nodo-requisito');
      const inputNota = reqBox ? reqBox.querySelector('.input-nota-valore-stanza') : null;
      const notaTesto = inputNota ? inputNota.value.trim() : '';

      // Include il record solo se ha un valore selezionato o una nota compilata
      if ((valoreSelezionato && valoreSelezionato !== '') || notaTesto !== '') {
        listaRecord.push({
          id_piano: idDatabasePiano,
          nome_stanza: nomeStanza,
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
// 4. UTILITIES ED EVENT HANDLERS
// ==================================================

/**
 * Toggle visibilità per gli accordion (generico)
 */
function toggleAccordion(headerEl) {
  const bodyEl = headerEl.nextElementSibling;
  const icona = headerEl.querySelector('.icona-espandi');
  
  if (!bodyEl) return;

  if (bodyEl.style.display === 'block') {
    bodyEl.style.display = 'none';
    if (icona) icona.textContent = '➕';
  } else {
    bodyEl.style.display = 'block';
    if (icona) icona.textContent = '➖';
  }
}

/**
 * Toggle visibilità per i livelli dell'albero (Aree/Ambito)
 */
function toggleLivello(headerEl) {
  const bodyEl = headerEl.nextElementSibling;
  const icona = headerEl.querySelector('.icona');
  
  if (!bodyEl) return;

  const isNascosto = bodyEl.style.display === 'none' || bodyEl.style.display === '';
  bodyEl.style.display = isNascosto ? 'block' : 'none';
  if (icona) icona.textContent = isNascosto ? '➖' : '➕';
}

function spaziEsterni() {
  const check = document.getElementById('check-spazi-esterni');
  const divContenitore = document.getElementById('sezione-spazi-esterni');
  if (check && divContenitore) {
    divContenitore.style.display = check.checked ? "block" : "none";
  }
}

function spaziComuni() {
  const check = document.getElementById('check-spazi-comuni');
  const divContenitore = document.getElementById('sezione-spazi-comuni');
  if (check && divContenitore) {
    divContenitore.style.display = check.checked ? "block" : "none";
  }
}

function rigeneraPianiVuoti() {
  if (typeof generaRighePiani === 'function' && typeof pianosCaricatiInMemoria !== 'undefined') {
    generaRighePiani(pianosCaricatiInMemoria);
  }
}

function toggleInfoPopup(idBox) {
  const box = document.getElementById(idBox);
  if (!box) return;
  const isVisibile = box.style.display === 'block';
  document.querySelectorAll('.info-popup-box').forEach(el => el.style.display = 'none');
  box.style.display = isVisibile ? 'none' : 'block';
}
























function raccogliDatiStanzePerDB(mappaPianiId) {
  const listaRecord = [];

  // 1. Selezioniamo tutte le card stanza presenti nella pagina
  const cardStanze = document.querySelectorAll('.nodo-stanza.stanza-card');

  cardStanze.forEach(stanzaCard => {
    // 2. Recuperiamo il nome della stanza dall'input text nell'header
    const inputNome = stanzaCard.querySelector('.input-nome-stanza');
    if (!inputNome) return;

    const nomeStanza = inputNome.value.trim();
    if (!nomeStanza) return; // Se non ha digitato il nome della stanza, la saltiamo

    // 3. Recuperiamo il numero del piano impostato sul data-piano dell'elemento stanzaCard
    const pianoNum = stanzaCard.getAttribute('data-piano');
    if (pianoNum === null || pianoNum === undefined) {
      console.warn(`⚠️ Attenzione: Impossibile trovare data-piano per la stanza "${nomeStanza}"`);
      return;
    }

    // 4. Mappiamo il numero del piano all'ID REALE del database generato da Supabase
    const idDatabasePiano = mappaPianiId[parseInt(pianoNum)];
    if (!idDatabasePiano) {
      console.warn(`⚠️ Nessun ID di database trovato per il piano numero: ${pianoNum}`);
      return;
    }

    // 5. Scansioniamo tutte le select degli indicatori presenti dentro QUESTA stanza
    const selectsIndicatore = stanzaCard.querySelectorAll('.input-valore-stanza');

    selectsIndicatore.forEach(selectEl => {
      const idIndicatoreRaw = selectEl.dataset.idIndicatore;
      if (!idIndicatoreRaw) return;
console.log("mucci idIndicatoreRaw: ", idIndicatoreRaw);
      const idIndicatore = parseInt(idIndicatoreRaw);
      const valoreSelezionato = selectEl.value; // Es. "Conforme", "Non Conforme", ""

      // Troviamo il campo nota associato nello stesso blocco (.nodo-requisito)
      const reqBox = selectEl.closest('.nodo-requisito');
      const inputNota = reqBox ? reqBox.querySelector('.input-nota-valore-stanza') : null;
      const notaTesto = inputNota ? inputNota.value.trim() : '';

      // Salviamo il record se è stato selezionato un valore OPPURE se è stata scritta una nota
      if ((valoreSelezionato && valoreSelezionato !== '') || notaTesto !== '') {
        listaRecord.push({
          id_piano: idDatabasePiano,
          nome_stanza: nomeStanza,
          id_indicatore_facilitazioni: idIndicatore,
          value: valoreSelezionato || null,
          nota: notaTesto || null
        });
      }
    });
  });

  console.log("✅ Record Stanze scritti con successo per Supabase:", listaRecord);
  return listaRecord;
}
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	function generaContenutoStanza(pianoNum, stanzaNum) {
	  const containerStanza = document.createElement('div');
	  containerStanza.className = 'stanza-body-albero';

	  // 1° LIVELLO: AREE (es. Comfort acustico)
	  Object.keys(alberoIndicatori).forEach(nomeArea => {
		const areaCard = document.createElement('div');
		areaCard.className = 'nodo-area';

		const areaHeader = document.createElement('div');
		areaHeader.className = 'header-livello-1';
		areaHeader.innerHTML = `<span>📐 Area: <strong>${nomeArea}</strong></span> <span class="icona">➕</span>`;
		areaHeader.onclick = () => toggleLivello(areaHeader);

		const areaBody = document.createElement('div');
		areaBody.className = 'body-livello';
		areaBody.style.display = 'none'; // Nascosto di default

		// 2° LIVELLO: AMBITI
		const ambiti = alberoIndicatori[nomeArea];
		Object.keys(ambiti).forEach(nomeAmbito => {
		  const ambitoCard = document.createElement('div');
		  ambitoCard.className = 'nodo-ambito';

		  const ambitoHeader = document.createElement('div');
		  ambitoHeader.className = 'header-livello-2';
		  ambitoHeader.innerHTML = `<span>📂 Ambito: <strong>${nomeAmbito}</strong></span> <span class="icona">➕</span>`;
		  ambitoHeader.onclick = () => toggleLivello(ambitoHeader);

		  const ambitoBody = document.createElement('div');
		  ambitoBody.className = 'body-livello';
		  ambitoBody.style.display = 'none';

		  // 3° LIVELLO: REQUISITI
		  const requisiti = ambiti[nomeAmbito];
		  requisiti.forEach(req => {
			const reqBox = document.createElement('div');
			reqBox.className = 'nodo-requisito';
			
			reqBox.innerHTML = `
			  <div class="requisito-titolo">📄 <strong>${req.requisito}</strong></div>
			  <div class="requisito-dettagli">
				${req.caratteristiche ? `<p><strong>Caratteristiche:</strong> ${req.caratteristiche}</p>` : ''}
				${req.disabilita ? `<p><strong>Disabilità target:</strong> ${req.disabilita}</p>` : ''}
				${req.note ? `<p class="testo-mute"><em>Note guidera: ${req.note}</em></p>` : ''}
			  </div>
			  <div class="requisito-input">
				<label>
				  <input type="checkbox" class="chk-requisito" data-indicatore-id="${req.id}">
				  Presente / Conforme
				</label>
				<textarea class="note-requisito" data-indicatore-id="${req.id}" placeholder="Note o osservazioni specifiche per questo requisito..." rows="2"></textarea>
			  </div>
			`;
			ambitoBody.appendChild(reqBox);
		  });

		  ambitoCard.appendChild(ambitoHeader);
		  ambitoCard.appendChild(ambitoBody);
		  areaBody.appendChild(ambitoCard);
		});

		areaCard.appendChild(areaHeader);
		areaCard.appendChild(areaBody);
		containerStanza.appendChild(areaCard);
	  });

	  return containerStanza;
	}
	
	
	// Helper per mostrare/nascondere i popup delle icone ⚙️ ♿ 💡
	function toggleInfoPopupOLD(idBox) {
	  const box = document.getElementById(idBox);
	  if (!box) return;
	  const isVisibile = box.style.display === 'block';
	  document.querySelectorAll('.info-popup-box').forEach(el => el.style.display = 'none');
	  box.style.display = isVisibile ? 'none' : 'block';
	}


	
		
	
	
	
	






	
	
	
	
	
	
	
	
