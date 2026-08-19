

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
      document.getElementById('check-ascensore').checked = false;
	  document.getElementById('check-montascale').checked = false;
	  document.getElementById('check-montapersone').checked = false;
      document.getElementById('check-rampa').checked = false;
	  document.getElementById('input-num-ospiti').value = 1;
	  document.getElementById('input-num-stanze').value = 1;
	  document.getElementById('input-num-stanze-disabili').value = 0;
	  document.getElementById('input-num-spazi-comuni').value = 0;
      document.getElementById('input-piani').value = 1;

      const { data: schedaData, error: schedaError } = await clientSupabase
        .from('scheda_residenze')
        .select('id, id_residenza, last_update, mensa, ascensore, montascale, montapersone, rampa, num_ospiti,num_stanze, num_stanze_disabili, num_spazi_comuni , piani, portineria')
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
        document.getElementById('check-ascensore').checked = scheda.ascensore;
		document.getElementById('check-montascale').checked = scheda.montascale;
		document.getElementById('check-montapersone').checked = scheda.montapersone;
        document.getElementById('check-rampa').checked = scheda.rampa;
		document.getElementById('input-num-ospiti').value = scheda.num_ospiti || 1;
		document.getElementById('input-num-stanze').value = scheda.num_stanze || 1;
		document.getElementById('input-num-stanze-disabili').value = scheda.num_stanze_disabili || 0;
		document.getElementById('input-num-spazi-comuni').value = scheda.num_spazi_comuni || 0;
        document.getElementById('input-piani').value = scheda.piani || 1;

        const { data: pianiData, error: pianiError } = await clientSupabase
          .from('piani')
          .select('*')
          .eq('id_residenza', idResidenza)
          .order('piano');

        if (pianiError) console.warn("Errore caricamento piani correlati:", pianiError.message);

        pianosCaricatiInMemoria = pianiData || [];
		  
        generaRighePiani(pianosCaricatiInMemoria);
      } else {
        generaRighePiani([]);
      }
	  
	  
	  
	  
	  
	  
	  
	  // 1. Prendi gli ID reali dei piani caricati
		const arrayIdPiani = pianosCaricatiInMemoria.map(p => p.id);

		// 2. Carichi i dati delle stanze
		const mappaStanzePerPiano = await caricaDatiStanzeConValori(arrayIdPiani);

		// 3. Cicli i piani e le relative stanze per ricostruire le card HTML
		pianosCaricatiInMemoria.forEach(pianoObj => {
		  const idPianoDB = pianoObj.id;
		  const numeroPiano = pianoObj.piano; // es. 0, 1, 2...
		  
		  const stanzeDelPiano = mappaStanzePerPiano[idPianoDB] || [];

		  stanzeDelPiano.forEach(stanza => {
			// Qui chiami la tua funzione che crea la card HTML della stanza
			// Passando: 
			// - stanza.idStanza      -> va messo nel dataset (dataset.idStanza)
			// - stanza.nomeStanza    -> va nell'input del nome
			// - stanza.indicatori    -> oggetto con i valori delle select e delle note
			// - numeroPiano          -> va nel data-piano della card
			
			generaCardStanza(numeroPiano, stanza);
		  });
	  
	  
	  
	  });
	  
	  
    }
	
	
	
	





















// --------------------------------------------------
// UTILITY: RACCOLTA DATI STANZE E SCHEDA_STANZE DAL DOM
// --------------------------------------------------
function raccogliDatiStanzeESchede(mappaPianiId) {
  const listaStanze = [];
  const listaSchedaStanze = [];

  // Cerchiamo tutte le card stanza generate nel DOM
  const cardsStanza = document.querySelectorAll('.nodo-stanza');

  cardsStanza.forEach((card) => {
    const numeroPiano = card.dataset.piano;
    const idPianoDb = mappaPianiId[numeroPiano];

    if (!idPianoDb) return;

    const inputNome = card.querySelector('.input-nome-stanza');
    const nomeStanza = inputNome ? inputNome.value.trim() : '';

    if (!nomeStanza) return; // Se la stanza non ha un nome, la saltiamo

    // 1. Oggetto per la tabella 'stanze'
    const idStanzaEsistente = card.dataset.idStanza ? parseInt(card.dataset.idStanza) : null;
    
    listaStanze.push({
      id_piano: idPianoDb,
      nome: stanza,
      nota: ''
    });

    // 2. Oggetti per la tabella 'scheda_stanze'
    const selectValori = card.querySelectorAll('.input-valore-stanza');
    
    selectValori.forEach((select) => {
      const idIndicatore = parseInt(select.dataset.idIndicatore);
      const valore = select.value;

      // Trova l'input della nota adiacente
      const reqBox = select.closest('.nodo-requisito');
      const inputNota = reqBox ? reqBox.querySelector('.input-nota-valore-stanza') : null;
      const nota = inputNota ? inputNota.value.trim() : '';

      // Salviamo solo se l'utente ha compilato il campo o inserito una nota
      if (valore !== '' || nota !== '') {
        listaSchedaStanze.push({
          id_piano: idPianoDb,         // Utile per filtri rapidi
          stanza: stanza,     // Riferimento al nome
          id_indicatore: idIndicatore, // FK su indicatori_facilitazioni
          value: valore,
          nota: nota
        });
      }
    });
  });

  return { listaStanze, listaSchedaStanze };
}





// --------------------------------------------------
// UTILITY: RACCOLTA DATI SPAZI COMUNI E SCHEDA_SPAZICOMUNI DAL DOM
// --------------------------------------------------
function raccogliDatiSpaziComuniESchede(mappaPianiId) {
  const listaSpaziComuni = [];
  const listaSchedaSpaziComuni = [];

  // Cerchiamo tutte le card spaziocomune generate nel DOM
  const cardsspaziocomune = document.querySelectorAll('.nodo-spaziocomune');

  cardsspaziocomune.forEach((card) => {
    const numeroPiano = card.dataset.piano;
    const idPianoDb = mappaPianiId[numeroPiano];

    if (!idPianoDb) return;

    const inputNome = card.querySelector('.input-nome-spaziocomune');
    const nomespaziocomune = inputNome ? inputNome.value.trim() : '';

    if (!nomespaziocomune) return; // Se la spaziocomune non ha un nome, la saltiamo

    // 1. Oggetto per la tabella 'SpaziComuni'
    const idspaziocomuneEsistente = card.dataset.idspaziocomune ? parseInt(card.dataset.idspaziocomune) : null;
    
    listaSpaziComuni.push({
      id_piano: idPianoDb,
      nome: spaziocomune,
      nota: ''
    });

    // 2. Oggetti per la tabella 'scheda_SpaziComuni'
    const selectValori = card.querySelectorAll('.input-valore-spaziocomune');
    
    selectValori.forEach((select) => {
      const idIndicatore = parseInt(select.dataset.idIndicatore);
      const valore = select.value;

      // Trova l'input della nota adiacente
      const reqBox = select.closest('.nodo-requisito');
      const inputNota = reqBox ? reqBox.querySelector('.input-nota-valore-spaziocomune') : null;
      const nota = inputNota ? inputNota.value.trim() : '';

      // Salviamo solo se l'utente ha compilato il campo o inserito una nota
      if (valore !== '' || nota !== '') {
        listaSchedaSpaziComuni.push({
          id_piano: idPianoDb,         // Utile per filtri rapidi
          spaziocomune: spaziocomune,     // Riferimento al nome
          id_indicatore: idIndicatore, // FK su indicatori_facilitazioni
          value: valore,
          nota: nota
        });
      }
    });
  });

  return { listaSpaziComuni, listaSchedaSpaziComuni };
}







async function salvaTutto() {
  // --------------------------------------------------
  // 1. SALVATAGGIO SCHEDA RESIDENZE
  // --------------------------------------------------
  const idResidenzaVal = document.getElementById('select-residenza').value;
  const mensa = document.getElementById('check-mensa').checked;
  const ascensore = document.getElementById('check-ascensore').checked;
  const montascale = document.getElementById('check-montascale').checked;
  const montapersone = document.getElementById('check-montapersone').checked;
  const rampa = document.getElementById('check-rampa').checked;
  const num_ospiti = parseInt(document.getElementById('input-num-ospiti').value) || 0;
  const num_stanze = parseInt(document.getElementById('input-num-stanze').value) || 0;
  const num_stanze_disabili = parseInt(document.getElementById('input-num-stanze-disabili').value) || 0;
  const num_spazi_comuni = parseInt(document.getElementById('input-num-spazi-comuni').value) || 0;
  const num_piani = parseInt(document.getElementById('input-piani').value) || 0;
  const portineria = document.getElementById('select-portineria').value;

  if (!idResidenzaVal) {
    return mostraMessaggio("Seleziona prima una residenza.", true);
  }

  const idResidenzaId = parseInt(idResidenzaVal);

  const datiSchedaResidenze = { 
    id_residenza: idResidenzaId, 
    portineria: portineria,
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

    // --------------------------------------------------
    // 2. SALVATAGGIO PIANI (E creazione mappaPianiId)
    // --------------------------------------------------
    const righeTR = document.querySelectorAll('#corpo-tabella-piani tr');
    
    // Mappa temporanea per associare il numero del piano all'ID del database generato
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
		num_spazi_comuni: parseInt(tr.querySelector('.piano-spazi-comuni').value) || 0,
        nota: tr.querySelector('.piano-nota').value
      };

      console.log("Inserimento datiPiano per idresidenza...", idResidenzaId);

      if (pianoEsistenteNelDB && pianoEsistenteNelDB.id) {
        console.log(`Aggiorno piano ${numeroPianoCorrente} sulla riga ID: ${pianoEsistenteNelDB.id}`);
        
        const { error: errorUpdatePiano } = await clientSupabase
          .from('piani')
          .update(datiPiano)
          .eq('id', pianoEsistenteNelDB.id);

        if (errorUpdatePiano) throw errorUpdatePiano;
        
        mappaPianiId[numeroPianoCorrente] = pianoEsistenteNelDB.id;

      } else {
        console.log(`Inserisco nuovo piano ${numeroPianoCorrente} per la scheda: ${idResidenzaId}`);
        
        const { data: nuovoPianoInserito, error: errorInsertPiano } = await clientSupabase
          .from('piani')
          .insert(datiPiano)
          .select();

        if (errorInsertPiano) throw errorInsertPiano;
        
        mappaPianiId[numeroPianoCorrente] = nuovoPianoInserito[0].id;
      }
    }

    // --------------------------------------------------
    // 3. SALVATAGGIO STANZE E SCHEDA_STANZE
    // --------------------------------------------------
    console.log("Mappa Piani generata per stanze:", mappaPianiId);

    // Richiamiamo la funzione per salvare Stanze e Schede
    const okStanze = await salvaStanzeESchede(mappaPianiId);
    if (!okStanze) {
      throw new Error("Si è verificato un errore durante il salvataggio delle stanze o delle relative schede.");
    }


    // --------------------------------------------------
    // 4. SALVATAGGIO SPAZI COMUNI E SCHEDA_SPAZICOMUNI
    // --------------------------------------------------
    console.log("Mappa Piani generata per spazi comuni:", mappaPianiId);

    // Richiamiamo la funzione per salvare SpaziComuni e Schede

    const okSpaziComuni = await salvaSPaziComuniESchede(mappaPianiId);

    if (!okSpaziComuni) {
      throw new Error("Si è verificato un errore durante il salvataggio degli spazi comuni o delle relative schede.");
    }




    mostraMessaggio("Aggiornamento effettuato con successo!", false);
    await caricaDatiResidenzaSelezionata();

  } catch (err) {
    mostraMessaggio("Errore durante il salvataggio: " + err.message, true);
    console.error("Dettaglio Errore:", err);
  }
}









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
		
		
		
		// Helper per aggiornare il dataset quando l'utente rinomina lo spazio comune
		function aggiornaDatasetspaziocomune(inputEl) {
		  const nuovoNome = inputEl.value.trim();
		  const cardspaziocomune = inputEl.closest('.nodo-spaziocomune');
		  if (!cardspaziocomune) return;

		  const selects = cardspaziocomune.querySelectorAll('.input-valore-spaziocomune');
		  selects.forEach(sel => {
			sel.dataset.nomespaziocomune = nuovoNome;
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






	


// ==================================================
// 3. GENERAZIONE UI CARD STANZA
// ==================================================
function generaCardStanza(idPiano, idStanza, nomeStanza, pianoNum, mappaValori = {}) {
  const stanzaCard = document.createElement('div');
  stanzaCard.className = 'nodo-stanza stanza-card';
  stanzaCard.dataset.piano = pianoNum;

  if (idStanza) stanzaCard.dataset.idStanza = idStanza;
  if (idPiano) stanzaCard.dataset.idPiano = idPiano;

  const pianoIdx = (parseInt(pianoNum, 10) - 1) % palettePiani.length;
  const tema = palettePiani[pianoIdx] || palettePiani[0];

  stanzaCard.style.backgroundColor = tema.bgCard;
  stanzaCard.style.borderLeft = `6px solid ${tema.border}`;
  stanzaCard.style.borderTop = '1px solid #cbd5e1';
  stanzaCard.style.borderRight = '1px solid #cbd5e1';
  stanzaCard.style.borderBottom = '1px solid #cbd5e1';
  stanzaCard.style.borderRadius = '6px';
  stanzaCard.style.marginBottom = '12px';
  stanzaCard.style.overflow = 'hidden';

  const valoreNomeInput = nomeStanza || '';








// HEADER STANZA
  const stanzaHeader = document.createElement('div');
  stanzaHeader.className = 'header-livello-0';
  stanzaHeader.style.cssText = 'cursor:pointer; padding:10px 14px; font-weight:bold; display:flex; justify-content:space-between; align-items:center;';
  stanzaHeader.style.backgroundColor = tema.bgHeader;
  stanzaHeader.style.color = tema.testo;

  stanzaHeader.innerHTML = `
    <div style="display:flex; align-items:center; gap:8px; flex:1; flex-wrap:wrap;" onclick="event.stopPropagation();">
      <span style="font-weight:600; color:${tema.testo};">🛏️ Piano ${pianoNum} - Stanza Accessibile:</span>
      <input type="text" 
             class="input-nome-stanza" 
             data-id-stanza="${idStanza || ''}" 
             data-id-piano="${idPiano || ''}"
             value="${valoreNomeInput}" 
             placeholder="Digita identificativo stanza"
             style="padding:4px 8px; border-radius:4px; border:1px solid ${tema.border}; background:#ffffff; color:#1e293b; font-weight:600; width:220px;"
             onchange="typeof aggiornaDatasetStanza === 'function' && aggiornaDatasetStanza(this)" />
      
      <button type="button"
              class="btn-copia-stanza"
              title="Copia valori dalla stanza precedente del piano"
              onclick="copiaDaStanzaPrecedente(this)"
              style="padding:4px 10px; font-size:0.85em; background:#ffffff; color:#0284c7; border:1px solid #0284c7; border-radius:4px; cursor:pointer; font-weight:600; transition:all 0.2s;">
        📋 Copia precedente
      </button>
    </div>
    <span class="icona" style="margin-left:12px; color:${tema.testo};">➕</span>
  `;













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

  if (idPiano && mappaValori[idPiano]) {
    const contenitorePiano = mappaValori[idPiano];
    
    if (Array.isArray(contenitorePiano)) {
      datiStanzaSalvati = contenitorePiano.find(s => 
        (idStanza && Number(s.idStanza || s.id_stanza || s.id) === Number(idStanza)) ||
        (valoreNomeInput && (s.nomeStanza || s.nome || s.nome_stanza) === valoreNomeInput)
      ) || {};
    } else if (typeof contenitorePiano === 'object') {
      datiStanzaSalvati = contenitorePiano[idStanza] || contenitorePiano[valoreNomeInput] || {};
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







function generaCardspaziocomune(idPiano, idspaziocomune, nomespaziocomune, pianoNum, mappaValori = {}) {
  const spaziocomuneCard = document.createElement('div');
  spaziocomuneCard.className = 'nodo-spaziocomune spaziocomune-card';
  spaziocomuneCard.dataset.piano = pianoNum;

  if (idspaziocomune) spaziocomuneCard.dataset.idspaziocomune = idspaziocomune;
  if (idPiano) spaziocomuneCard.dataset.idPiano = idPiano;

  const pianoIdx = (parseInt(pianoNum, 10) - 1) % palettePiani.length;
  const tema = palettePiani[pianoIdx] || palettePiani[0];

  spaziocomuneCard.style.backgroundColor = tema.bgCard;
  spaziocomuneCard.style.borderLeft = `6px solid ${tema.border}`;
  spaziocomuneCard.style.borderTop = '1px solid #cbd5e1';
  spaziocomuneCard.style.borderRight = '1px solid #cbd5e1';
  spaziocomuneCard.style.borderBottom = '1px solid #cbd5e1';
  spaziocomuneCard.style.borderRadius = '6px';
  spaziocomuneCard.style.marginBottom = '12px';
  spaziocomuneCard.style.overflow = 'hidden';

  const valoreNomeInput = nomespaziocomune || '';








// HEADER spaziocomune
  const spaziocomuneHeader = document.createElement('div');
  spaziocomuneHeader.className = 'header-livello-0';
  spaziocomuneHeader.style.cssText = 'cursor:pointer; padding:10px 14px; font-weight:bold; display:flex; justify-content:space-between; align-items:center;';
  spaziocomuneHeader.style.backgroundColor = tema.bgHeader;
  spaziocomuneHeader.style.color = tema.testo;

  spaziocomuneHeader.innerHTML = `
    <div style="display:flex; align-items:center; gap:8px; flex:1; flex-wrap:wrap;" onclick="event.stopPropagation();">
      <span style="font-weight:600; color:${tema.testo};">🛏️ Piano ${pianoNum} - Spazio Comune:</span>
      <input type="text" 
             class="input-nome-spaziocomune" 
             data-id-spaziocomune="${idspaziocomune || ''}" 
             data-id-piano="${idPiano || ''}"
             value="${valoreNomeInput}" 
             placeholder="Digita identificativo spaziocomune"
             style="padding:4px 8px; border-radius:4px; border:1px solid ${tema.border}; background:#ffffff; color:#1e293b; font-weight:600; width:220px;"
             onchange="typeof aggiornaDatasetspaziocomune === 'function' && aggiornaDatasetspaziocomune(this)" />
      
      <button type="button"
              class="btn-copia-spaziocomune"
              title="Copia valori dalla spaziocomune precedente del piano"
              onclick="copiaDaspaziocomunePrecedente(this)"
              style="padding:4px 10px; font-size:0.85em; background:#ffffff; color:#0284c7; border:1px solid #0284c7; border-radius:4px; cursor:pointer; font-weight:600; transition:all 0.2s;">
        📋 Copia precedente
      </button>
    </div>
    <span class="icona" style="margin-left:12px; color:${tema.testo};">➕</span>
  `;













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
    spaziocomuneBody.innerHTML = `<div style="padding:10px; color:#ef4444; font-style:italic;">Nessun indicatore caricato dal database. Verifica la tabella 'indicatori_facilitazioni per gli spazi comuni'.</div>`;
    spaziocomuneCard.appendChild(spaziocomuneHeader);
    spaziocomuneCard.appendChild(spaziocomuneBody);
    return spaziocomuneCard;
  }

  // 3. RECUPERO SICURO DELLA spaziocomune
  let datispaziocomuneSalvati = {};

  if (idPiano && mappaValori[idPiano]) {
    const contenitorePiano = mappaValori[idPiano];
    
    if (Array.isArray(contenitorePiano)) {
      datispaziocomuneSalvati = contenitorePiano.find(s => 
        (idspaziocomune && Number(s.idspaziocomune || s.id_spaziocomune || s.id) === Number(idspaziocomune)) ||
        (valoreNomeInput && (s.nomespaziocomune || s.nome || s.nome_spaziocomune) === valoreNomeInput)
      ) || {};
    } else if (typeof contenitorePiano === 'object') {
      datispaziocomuneSalvati = contenitorePiano[idspaziocomune] || contenitorePiano[valoreNomeInput] || {};
    }
  } else if (idspaziocomune && mappaValori[idspaziocomune]) {
    datispaziocomuneSalvati = mappaValori[idspaziocomune];
  }

  // Estrazione sicura della lista/oggetto degli indicatori salvati
  const sorgenteIndicatori = datispaziocomuneSalvati.indicatori || 
                             datispaziocomuneSalvati.valori || 
                             datispaziocomuneSalvati.scheda_spazicomuni || 
                             datispaziocomuneSalvati;


  // Costruzione Struttura Albero
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
              <select class="input-valore-spaziocomune" 
                      data-id-spaziocomune="${idspaziocomune || ''}"
                      data-id-piano="${idPiano || ''}" 
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






function copiaDaStanzaPrecedente(btnEl) {
  // 1. Trova la card della stanza corrente
  const cardCorrente = btnEl.closest('.nodo-stanza');
  if (!cardCorrente) return;

  // 2. Trova la stanza precedente nello stesso contenitore/piano
  const stanzaPrecedente = cardCorrente.previousElementSibling;

  if (!stanzaPrecedente || !stanzaPrecedente.classList.contains('nodo-stanza')) {
    alert("Nessuna stanza precedente trovata in questo piano!");
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



function copiaDaspaziocomunePrecedente(btnEl) {
  // 1. Trova la card della spaziocomune corrente
  const cardCorrente = btnEl.closest('.nodo-spaziocomune');
  if (!cardCorrente) return;

  // 2. Trova la spaziocomune precedente nello stesso contenitore/piano
  const spaziocomunePrecedente = cardCorrente.previousElementSibling;

  if (!spaziocomunePrecedente || !spaziocomunePrecedente.classList.contains('nodo-spaziocomune')) {
    alert("Nessuna spaziocomune precedente trovata in questo piano!");
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










// ==================================================
// 4. RENDERING E GESTIONE PIANI / STANZE
// ==================================================

function generaRighePiani(pianiSalvati = []) {
  const inputPiani = document.getElementById('input-piani');
  const numPiani = inputPiani ? (parseInt(inputPiani.value, 10) || 1) : 1;
  const tbody = document.getElementById('corpo-tabella-piani');
  if (!tbody) return;

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
	  <td><input type="number" class="piano-spazi-comuni" min="0" value="${datiPiano.num_spazi_comuni ?? 0}" onchange="rigeneraDettagliSpaziComuni()"></td>
      <td><input type="text" class="piano-nota" value="${datiPiano.nota || ''}" placeholder="Eventuali note..."></td>
    `;
    tbody.appendChild(tr);
  }

  rigeneraDettagliStanze();
  rigeneraDettagliSpaziComuni();
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

    // Assicura che gli indicatori siano caricati
    if (!alberoIndicatori || Object.keys(alberoIndicatori).length === 0) {
      console.warn("⚠️ Albero indicatori non pronto, tentato ricaricamento...");
      if (typeof caricaIndicatoriStanze === 'function') {
        await caricaIndicatoriStanze();
      }
    }

    const righeTR = document.querySelectorAll('#corpo-tabella-piani tr');
    const idPianiPresenti = [];

    righeTR.forEach(tr => {
      if (tr.dataset && tr.dataset.idPianoDb) {
        idPianiPresenti.push(parseInt(tr.dataset.idPianoDb, 10));
      }
    });

    let mappaValori = {};
    if (idPianiPresenti.length > 0 && typeof caricaDatiStanzeConValori === 'function') {
      mappaValori = await caricaDatiStanzeConValori(idPianiPresenti) || {};
    }

    console.log("📦 Dati mappaValori ricevuti dal DB:", mappaValori);

    let totaleStanzeAcc = 0;

    righeTR.forEach(tr => {
      const numeroPiano = tr.dataset?.piano || "1";
      const idPianoDb = tr.dataset?.idPianoDb || null;
      const inputStanzeAcc = tr.querySelector('.piano-stanze-acc');
      const numStanzeAcc = inputStanzeAcc ? (parseInt(inputStanzeAcc.value, 10) || 0) : 0;

      if (numStanzeAcc > 0) {
        totaleStanzeAcc += numStanzeAcc;

        // Recuperiamo le stanze salvate per questo piano
        const stanzePiano = (idPianoDb && mappaValori[idPianoDb]) ? mappaValori[idPianoDb] : {};
        
        // Se stanzePiano è un oggetto/array, ne estraiamo i valori reali (escludendo gli indici "0", "1")
        const listaStanzeSalvate = Array.isArray(stanzePiano) 
          ? stanzePiano 
          : Object.values(stanzePiano);

        for (let s = 1; s <= numStanzeAcc; s++) {
          let idStanzaDb = null;
          let nomeStanzaEffettivo = `Stanza_p${numeroPiano}_s${s}`; // Fallback se la stanza è nuova

          // Cerca il dato reale salvato nel DB per la posizione corrente (s - 1)
          const stanzaSalvata = listaStanzeSalvate[s - 1];

          if (stanzaSalvata) {
            if (typeof stanzaSalvata === 'object' && stanzaSalvata !== null) {
              // Estrazione ID reale dal DB
              idStanzaDb = stanzaSalvata.id_stanza || stanzaSalvata.id || stanzaSalvata.idStanza || null;
              
              // Estrazione NOME reale dal DB (prova tutte le possibili chiavi)
              nomeStanzaEffettivo = stanzaSalvata.nome_stanza || 
                                    stanzaSalvata.nomeStanza || 
                                    stanzaSalvata.nome || 
                                    stanzaSalvata.identificativo || 
                                    `_Piano_${numeroPiano}_Stanza_${s}`;
            } else if (typeof stanzaSalvata === 'string' && isNaN(stanzaSalvata)) {
              // Se la stanza salvata è semplicemente una stringa col nome
              nomeStanzaEffettivo = stanzaSalvata;
            }
          }

          console.log(`➡️ Creo Stanza ${s} per Piano ${numeroPiano}:`, { idPianoDb, idStanzaDb, nomeStanzaEffettivo });

          if (typeof generaCardStanza === 'function') {
            const card = generaCardStanza(idPianoDb, idStanzaDb, nomeStanzaEffettivo, numeroPiano, mappaValori);
            if (card) containerStanze.appendChild(card);
          }
        }
      }
    });

    sezioneStanze.style.display = totaleStanzeAcc > 0 ? 'block' : 'none';

  } catch (err) {
    console.error("💥 ERRORE IN rigeneraDettagliStanze:", err);
  }
}




// --------------------------------------------------
// 2. RIGENERA DETTAGLI SPAZI COMUNI 
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

    // Assicura che gli indicatori siano caricati
    if (!alberoIndicatori || Object.keys(alberoIndicatori).length === 0) {
      console.warn("⚠️ Albero indicatori non pronto, tentato ricaricamento...");
      if (typeof caricaIndicatoriSpaziComuni === 'function') {
        await caricaIndicatoriSpaziComuni();
      }
    }

    const righeTR = document.querySelectorAll('#corpo-tabella-piani tr');
    const idPianiPresenti = [];

    righeTR.forEach(tr => {
      if (tr.dataset && tr.dataset.idPianoDb) {
        idPianiPresenti.push(parseInt(tr.dataset.idPianoDb, 10));
      }
    });

    let mappaValori = {};
    if (idPianiPresenti.length > 0 && typeof caricaDatiSpaziComuniConValori === 'function') {
      mappaValori = await caricaDatiSpaziComuniConValori(idPianiPresenti) || {};
    }

    console.log("📦 Dati mappaValori SpaziComuni ricevuti dal DB:", mappaValori);

    let totaleSpaziComuniAcc = 0;

    righeTR.forEach(tr => {
      const numeroPiano = tr.dataset?.piano || "1";
      const idPianoDb = tr.dataset?.idPianoDb || null;
      const inputSpaziComuniAcc = tr.querySelector('.piano-spazi-comuni');
      const numSpaziComuniAcc = inputSpaziComuniAcc ? (parseInt(inputSpaziComuniAcc.value, 10) || 0) : 0;
      if (numSpaziComuniAcc > 0) {
        totaleSpaziComuniAcc += numSpaziComuniAcc;
        // Recuperiamo gli spazi comuni salvate per questo piano
        const spazicomuniPiano = (idPianoDb && mappaValori[idPianoDb]) ? mappaValori[idPianoDb] : {};
        
        // Se spazicomuniPiano è un oggetto/array, ne estraiamo i valori reali (escludendo gli indici "0", "1")
        const listaSpaziComuniSalvati = Array.isArray(spazicomuniPiano) 
          ? spazicomuniPiano 
          : Object.values(spazicomuniPiano);

        for (let s = 1; s <= numSpaziComuniAcc; s++) {
          let idspaziocomuneDb = null;
          let nomespaziocomuneEffettivo = `Comune_p${numeroPiano}_s${s}`; // Fallback se la stanza è nuova

          // Cerca il dato reale salvato nel DB per la posizione corrente (s - 1)
          const spaziocomuneSalvato = listaSpaziComuniSalvati[s - 1];

          if (spaziocomuneSalvato) {
            if (typeof spaziocomuneSalvato === 'object' && spaziocomuneSalvato !== null) {
              // Estrazione ID reale dal DB
              idspaziocomuneDb = spaziocomuneSalvato.id_spaziocomune || spaziocomuneSalvato.id || spaziocomuneSalvato.idspaziocomune || null;
              
              // Estrazione NOME reale dal DB (prova tutte le possibili chiavi)
              nomespaziocomuneEffettivo = spaziocomuneSalvato.nome_spaziocomune || 
                                    spaziocomuneSalvato.nomespaziocomune || 
                                    spaziocomuneSalvato.nome || 
                                    spaziocomuneSalvato.identificativo || 
                                    `_P${numeroPiano}_S.Comune_${s}`;
            } else if (typeof spaziocomuneSalvato === 'string' && isNaN(spaziocomuneSalvato)) {
              // Se la stanza salvata è semplicemente una stringa col nome
              nomespaziocomuneEffettivo = spaziocomuneSalvato;
            }
          }

          console.log(`➡️ Creo spaziocomune ${s} per Piano ${numeroPiano}:`, { idPianoDb, idspaziocomuneDb, nomespaziocomuneEffettivo });
          if (typeof generaCardspaziocomune === 'function') {
            const card = generaCardspaziocomune(idPianoDb, idspaziocomuneDb, nomespaziocomuneEffettivo, numeroPiano, mappaValori);	
            if (card) containerSpaziComuni.appendChild(card);
          }
        }
      }
    });

    sezioneSpaziComuni.style.display = totaleSpaziComuniAcc > 0 ? 'block' : 'none';

  } catch (err) {
    console.error("💥 ERRORE IN rigeneraDettagliSpaziComuni:", err);
  }
}



	
	
// ==================================================
// 1. STATO GLOBALE
// ==================================================
let alberoIndicatori = {};

// Palette di colori pastello per piano
const palettePiani = [
  { bgCard: '#fffde7', bgHeader: '#fff59d', border: '#fbc02d', testo: '#5d4037' }, // Piano 1: Giallo
  { bgCard: '#f1f8e9', bgHeader: '#c5e1a5', border: '#7cb342', testo: '#1b5e20' }, // Piano 2: Verde
  { bgCard: '#e1f5fe', bgHeader: '#90caf9', border: '#0288d1', testo: '#01579b' }, // Piano 3: Azzurro
  { bgCard: '#f3e5f5', bgHeader: '#ce93d8', border: '#ab47bc', testo: '#4a148c' }, // Piano 4: Lilla/Viola
  { bgCard: '#fff3e0', bgHeader: '#ffcc80', border: '#fb8c00', testo: '#e65100' }, // Piano 5: Arancio
  { bgCard: '#fbe9e7', bgHeader: '#ffab91', border: '#f4511e', testo: '#bf360c' }  // Piano 6: Rosa
];




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









async function caricaIndicatoriSpaziComuni() {
  console.log("Tentativo di recupero indicatori da Supabase...");

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
// 2. GESTIONE GENERAZIONE CARD E ALBERO STANZE
// ==================================================

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
// 2. GESTIONE GENERAZIONE CARD E ALBERO SPAZI COMUNI
// ==================================================

/**
 * Genera l'albero HTML navigabile degli indicatori per uno spazio comune
 */
function generaContenutospaziocomune(pianoNum, spaziocomuneNum) {
  const containerspaziocomune = document.createElement('div');
  containerspaziocomune.className = 'spaziocomune-body-albero';

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
            <select class="input-valore-spaziocomune" data-id-indicatore="${req.id}">
              <option value="">-- Seleziona Stato --</option>
              <option value="Conforme">Conforme</option>
              <option value="Non Conforme">Non Conforme</option>
              <option value="Parzialmente Conforme">Parzialmente Conforme</option>
              <option value="Non Applicabile">Non Applicabile</option>
            </select>
            <textarea class="input-nota-valore-spaziocomune" placeholder="Note o osservazioni specifiche per questo requisito..." rows="2"></textarea>
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
    containerspaziocomune.appendChild(areaCard);
  });

  return containerspaziocomune;
}





// ==================================================
// 5. ESTRAZIONE DATI PER SUPABASE
// ==================================================

/**
 * Legge dal DOM le info delle card stanza e prepara il payload per Supabase
 */
function raccogliDatiStanzePerDB(mappaPianiId) {

  const listaRecord = [];

  // 1. Selezioniamo tutte le card stanza presenti nella pagina
  const cardStanze = document.querySelectorAll('.nodo-stanza.stanza-card');

  cardStanze.forEach(stanzaCard => {
    // 2. Recuperiamo il nome della stanza dall'input text nell'header
    const inputNome = stanzaCard.querySelector('.input-nome-stanza');
    if (!inputNome) return;

    const nomeStanza = inputNome.value.trim();
    if (!nomeStanza) return;

    // 3. Recuperiamo il numero del piano impostato sul data-piano dell'elemento stanzaCard
    const pianoNum = stanzaCard.getAttribute('data-piano');
    if (pianoNum === null || pianoNum === undefined) {
      console.warn(`⚠️ Attenzione: Impossibile trovare data-piano per la stanza "${nomeStanza}"`);
      return;
    }

    // 4. Mappiamo il numero del piano all'ID REALE del database generato da Supabase
    const idDatabasePiano = mappaPianiId[parseInt(pianoNum,10)];
    if (!idDatabasePiano) {
      console.warn(`⚠️ Nessun ID database trovato per il piano numero: ${pianoNum}`);
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
		  id_piano: idDatabasePiano,
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


/**
 * Legge dal DOM le info delle card spaziocomune e prepara il payload per Supabase
 */
function raccogliDatispazicomuniPerDB(mappaPianiId) {

  const listaRecord = [];

  // 1. Selezioniamo tutte le card spaziocomune presenti nella pagina
  const cardspazicomuni = document.querySelectorAll('.nodo-spaziocomune.spaziocomune-card');

  cardspazicomuni.forEach(spaziocomuneCard => {
    // 2. Recuperiamo il nome della spaziocomune dall'input text nell'header
    const inputNome = spaziocomuneCard.querySelector('.input-nome-spaziocomune');
    if (!inputNome) return;

    const nomespaziocomune = inputNome.value.trim();
    if (!nomespaziocomune) return;

    // 3. Recuperiamo il numero del piano impostato sul data-piano dell'elemento spaziocomuneCard
    const pianoNum = spaziocomuneCard.getAttribute('data-piano');
    if (pianoNum === null || pianoNum === undefined) {
      console.warn(`⚠️ Attenzione: Impossibile trovare data-piano per la spaziocomune "${nomespaziocomune}"`);
      return;
    }

    // 4. Mappiamo il numero del piano all'ID REALE del database generato da Supabase
    const idDatabasePiano = mappaPianiId[parseInt(pianoNum,10)];
    if (!idDatabasePiano) {
      console.warn(`⚠️ Nessun ID database trovato per il piano numero: ${pianoNum}`);
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
		// All'interno di raccogliDatispazicomuniPerDB():
		listaRecord.push({
		  id_piano: idDatabasePiano,
		  id_spaziocomune: idspaziocomune, // 👈 Usa 'id_spaziocomune' come nome chiave per Supabase
		  id_indicatore_facilitazioni: idIndicatore,
		  value: valoreSelezionato || null,
		  nota: notaTesto || null
		});
		
		
		
      }
    });
  });

  console.log("✅ Record spazicomuni generati per il salvataggio:", listaRecord);
  return listaRecord;
}








/**
 * Salva prima le stanze nella tabella 'stanze', recupera gli ID generati 
 * e successivamente salva le schede indicatori in 'scheda_stanze'.
 * 
 * @param {Object} mappaPianiId - Oggetto che mappa numero_piano -> id_piano_db
 */
async function salvaStanzeESchede(mappaPianiId) {
  const cardStanze = document.querySelectorAll('.nodo-stanza.stanza-card');
  if (!cardStanze || cardStanze.length === 0) return true;

  try {
    for (const stanzaCard of cardStanze) {
      // 1. Nome stanza
      const inputNome = stanzaCard.querySelector('.input-nome-stanza');
      if (!inputNome) continue;

      const nomeStanza = inputNome.value.trim();
      if (!nomeStanza) continue;

      // 2. Numero piano e ID Piano DB
      const pianoNum = stanzaCard.getAttribute('data-piano');
      if (pianoNum === null || pianoNum === undefined) continue;

      const idDatabasePiano = mappaPianiId[parseInt(pianoNum, 10)];
      if (!idDatabasePiano) {
        console.warn(`⚠️ Nessun ID piano database trovato per piano: ${pianoNum}`);
        continue;
      }

      // Check se abbiamo già un id_stanza memorizzato sul DOM
      const idStanzaEsistente = inputNome.dataset.idStanza || stanzaCard.dataset.idStanza || null;

      // STEP 1: Salva o Aggiorna nella tabella 'stanze'
      const payloadStanza = {
        id_piano: idDatabasePiano,
        stanza: nomeStanza
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





/**
 * Salva prima gli spazicomuni nella tabella 'spazicomuni', recupera gli ID generati 
 * e successivamente salva le schede indicatori in 'scheda_spazicomuni'.
 * 
 * @param {Object} mappaPianiId - Oggetto che mappa numero_piano -> id_piano_db
 */
async function salvaSPaziComuniESchede(mappaPianiId) {

  const cardSpaziComuni = document.querySelectorAll('.nodo-spaziocomune.spaziocomune-card');
  if (!cardSpaziComuni || cardSpaziComuni.length === 0) return true;

  try {
    for (const spaziocomuneCard of cardSpaziComuni) {
      // 1. Nome spaziocomune
      const inputNome = spaziocomuneCard.querySelector('.input-nome-spaziocomune');
      if (!inputNome) continue;

      const nomespaziocomune = inputNome.value.trim();
      if (!nomespaziocomune) continue;

      // 2. Numero piano e ID Piano DB
      const pianoNum = spaziocomuneCard.getAttribute('data-piano');
      if (pianoNum === null || pianoNum === undefined) continue;

      const idDatabasePiano = mappaPianiId[parseInt(pianoNum, 10)];
      if (!idDatabasePiano) {
        console.warn(`⚠️ Nessun ID piano database trovato per piano: ${pianoNum}`);
        continue;
      }

      // Check se abbiamo già un id_spaziocomune memorizzato sul DOM
      const idspaziocomuneEsistente = inputNome.dataset.idspaziocomune || spaziocomuneCard.dataset.idspaziocomune || null;

      // STEP 1: Salva o Aggiorna nella tabella 'spazicomuni'
      const payloadspaziocomune = {
        id_piano: idDatabasePiano,
        spaziocomune: nomespaziocomune
      };

      if (idspaziocomuneEsistente && !isNaN(parseInt(idspaziocomuneEsistente, 10))) {
        payloadspaziocomune.id = parseInt(idspaziocomuneEsistente, 10);
      }

      const { data: spaziocomuneSalvata, error: errspaziocomune } = await clientSupabase
        .from('spazicomuni')
        .upsert(payloadspaziocomune)
        .select('id, spaziocomune')
        .single();

      if (errspaziocomune) {
        console.error(`❌ Errore salvataggio spaziocomune "${nomespaziocomune}":`, errspaziocomune);
        continue;
      }

      const idspaziocomuneGenerato = spaziocomuneSalvata.id;
      
      // Salva ID nel DOM per futuri salvataggi senza refresh
      inputNome.dataset.idspaziocomune = idspaziocomuneGenerato;
      spaziocomuneCard.dataset.idspaziocomune = idspaziocomuneGenerato;

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
            id_spaziocomune: idspaziocomuneGenerato, // FK verso spazicomuni.id
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
          .eq('id_spaziocomune', idspaziocomuneGenerato);

        const { error: errSchede } = await clientSupabase
          .from('scheda_spazicomuni')
          .insert(recordSchedeIndicatori);

        if (errSchede) {
          console.error(`❌ Errore inserimento scheda_spazicomuni per ID ${idspaziocomuneGenerato}:`, errSchede);
        }
      }
    }

    return true;
  } catch (err) {
    console.error("❌ Errore in salvaspazicomuniESchede:", err);
    return false;
  }
}




// ==================================================
// 6. UTILITIES ED EVENT HANDLERS
// ==================================================

function toggleLivello(headerEl) {
  const bodyEl = headerEl.nextElementSibling;
  const icona = headerEl.querySelector('.icona');
  
  if (!bodyEl) return;

  const isNascosto = bodyEl.style.display === 'none' || bodyEl.style.display === '';
  bodyEl.style.display = isNascosto ? 'block' : 'none';
  if (icona) icona.textContent = isNascosto ? '➖' : '➕';
}

function toggleInfoPopup(idBox) {
  const box = document.getElementById(idBox);
  if (!box) return;
  const isVisibile = box.style.display === 'block';
  document.querySelectorAll('.info-popup-box').forEach(el => el.style.display = 'none');
  box.style.display = isVisibile ? 'none' : 'block';
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





function rigeneraPianiVuoti() {
  if (typeof generaRighePiani === 'function' && typeof pianosCaricatiInMemoria !== 'undefined') {
    generaRighePiani(pianosCaricatiInMemoria);
  }
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
	
	


	
	function generaContenutospaziocomune(pianoNum, spaziocomuneNum) {

	  const containerspaziocomune = document.createElement('div');
	  containerspaziocomune.className = 'spaziocomune-body-albero';

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
		containerspaziocomune.appendChild(areaCard);
	  });

	  return containerspaziocomune;
	}
	
	




	
		
	
	
	
	
	
	
	


// --------------------------------------------------
// 1. CARICAMENTO DATI STANZE DAL DB (LEFT JOIN)
// --------------------------------------------------

/**
 * Recupera le stanze e le relative valutazioni degli indicatori per un insieme di piani.
 * 
 * @param {Array<number>} idPiani - Array contenente gli ID reali del DB dei piani
 * @returns {Promise<Object>} Mappa strutturata: { [id_piano]: { [id_stanza]: { nome: string, valori: { [id_indicatore]: { value, nota } } } } }
 */
async function caricaDatiStanzeConValori(idPiani) {
  if (!idPiani || idPiani.length === 0) return {};

  try {
    // -----------------------------------------------------------------
    // 1. Recuperiamo tutte le stanze legate ai piani specificati
    // -----------------------------------------------------------------
    const { data: stanzeData, error: errStanze } = await clientSupabase
      .from('stanze')
      .select('id, id_piano, stanza, nota')
      .in('id_piano', idPiani);

    if (errStanze) {
      console.error("❌ Errore durante il recupero della tabella 'stanze':", errStanze);
      return {};
    }

    if (!stanzeData || stanzeData.length === 0) {
      console.log("ℹ️ Nessuna stanza trovata per i piani selezionati." , idPiani);
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
    //   [id_piano]: [
    //     {
    //       idStanza: 10,
    //       nomeStanza: "Camera 101",
    //       indicatori: {
    //         [id_indicatore]: { value: "Conforme", nota: "..." }
    //       }
    //     }
    //   ]
    // }
    const mappaStanzePerPiano = {};

    // Inizializziamo le stanze nella mappa organizzate per id_piano
    const mappaStanzeById = {};

    stanzeData.forEach(stanzaObj => {
      const idPiano = stanzaObj.id_piano;

      if (!mappaStanzePerPiano[idPiano]) {
        mappaStanzePerPiano[idPiano] = [];
      }

      const nuovaStanza = {
        idStanza: stanzaObj.id,
        nomeStanza: stanzaObj.stanza,
        notaStanza: stanzaObj.nota || '',
        indicatori: {} // qui metteremo gli indicatori con la loro risposta
      };

      mappaStanzePerPiano[idPiano].push(nuovaStanza);
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

    console.log("✅ Dati stanze caricati e mappati con successo:", mappaStanzePerPiano);
    return mappaStanzePerPiano;

  } catch (err) {
    console.error("❌ Errore imprevisto in caricaDatiStanzeConValori:", err);
    return {};
  }
}




async function caricaDatiSpaziComuniConValori(idPiani) {
  if (!idPiani || idPiani.length === 0) return {};

  try {
    // -----------------------------------------------------------------
    // 1. Recuperiamo tutte le stanze legate ai piani specificati
    // -----------------------------------------------------------------
    const { data: spazicomuniData, error: errSpazicomuni } = await clientSupabase
      .from('spazicomuni')
      .select('id, id_piano, spaziocomune, nota')
      .in('id_piano', idPiani);

    if (errSpazicomuni) {
      console.error("❌ Errore durante il recupero della tabella 'spazicomuni':", errSpazicomuni);
      return {};
    }

    if (!spazicomuniData || spazicomuniData.length === 0) {
      console.log("ℹ️ Nessuno spazio comune trovato per i piani selezionati." , idPiani);
      return {};
    }

    // Estraiamo tutti gli ID primari delle stanze trovate
    const idsSpaziComuni = spazicomuniData.map(s => s.id);

    // -----------------------------------------------------------------
    // 2. Recuperiamo le valutazioni dalla tabella 'scheda_stanze'
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
    //   [id_piano]: [
    //     {
    //       idStanza: 10,
    //       nomeStanza: "Camera 101",
    //       indicatori: {
    //         [id_indicatore]: { value: "Conforme", nota: "..." }
    //       }
    //     }
    //   ]
    // }
    const mappaSpaziComuniPerPiano = {};

    // Inizializziamo gli spazi comuni nella mappa organizzate per id_piano
    const mappaSpaziComuniById = {};

    spazicomuniData.forEach(spaziocomuneObj => {
      const idPiano = spaziocomuneObj.id_piano;

      if (!mappaSpaziComuniPerPiano[idPiano]) {
        mappaSpaziComuniPerPiano[idPiano] = [];
      }

      const nuovospaziocomune = {
        idspaziocomune: spaziocomuneObj.id,
        nomespaziocomune: spaziocomuneObj.spaziocomune,
        notaspaziocomune: spaziocomuneObj.nota || '',
        indicatori: {} // qui metteremo gli indicatori con la loro risposta
      };

      mappaSpaziComuniPerPiano[idPiano].push(nuovospaziocomune);
      mappaSpaziComuniById[spaziocomuneObj.id] = nuovospaziocomune;
    });

    // Popoliamo gli indicatori per ogni stanza
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

    console.log("✅ Dati spazi comuni caricati e mappati con successo:", mappaSpaziComuniPerPiano);
    return mappaSpaziComuniPerPiano;

  } catch (err) {
    console.error("❌ Errore imprevisto in caricaDatiSpaziComuniConValori:", err);
    return {};
  }
}
