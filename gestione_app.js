// ==================================================
// 1. STATO GLOBALE
// ==================================================
let alberoIndicatori = {};

// Palette di colori pastello per livello
const paletteLivelli = [
  { bgCard: '#fffde7', bgHeader: '#fff59d', border: '#fbc02d', testo: '#5d4037' }, // Livello 1: Giallo
  { bgCard: '#f1f8e9', bgHeader: '#c5e1a5', border: '#7cb342', testo: '#1b5e20' }, // Livello 2: Verde
  { bgCard: '#e1f5fe', bgHeader: '#90caf9', border: '#0288d1', testo: '#01579b' }, // Livello 3: Azzurro
  { bgCard: '#f3e5f5', bgHeader: '#ce93d8', border: '#ab47bc', testo: '#4a148c' }, // Livello 4: Lilla/Viola
  { bgCard: '#fff3e0', bgHeader: '#ffcc80', border: '#fb8c00', testo: '#e65100' }, // Livello 5: Arancio
  { bgCard: '#fbe9e7', bgHeader: '#ffab91', border: '#f4511e', testo: '#bf360c' }  // Livello 6: Rosa
];



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

      const { data, error } = await clientSupabase.from('residenze').select('id, struttura, telefono, indirizzo, cap, localita').eq('id_citta', idCitta).order('struttura');
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


// Variabile globale per salvare i piani letti dal DB
let listaPianiOpzioni = [];

async function caricaOpzioniPiani() {
  const { data, error } = await clientSupabase
    .from('indicatori_piani')
    .select('id, piano')
    .order('id', { ascending: true });

  if (error) {
    console.error('Errore durante il caricamento dei piani:', error);
    return;
  }

  listaPianiOpzioni = data || [];
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
      livelliCaricatiInMemoria = [];
	  document.getElementById('check-mensa').checked = false;
      document.getElementById('check-ascensore').checked = false;
	  document.getElementById('check-montascale').checked = false;
	  document.getElementById('check-montapersone').checked = false;
      document.getElementById('check-rampa').checked = false;
	  document.getElementById('input-num-ospiti').value = 1;
	  document.getElementById('input-num-stanze').value = 1;
	  document.getElementById('input-num-stanze-disabili').value = 0;
	  document.getElementById('input-num-spazi-comuni').value = 0;
      document.getElementById('input-livelli').value = 1;

      const { data: schedaData, error: schedaError } = await clientSupabase
        .from('scheda_residenze')
        .select('id, id_residenza, last_update, mensa, ascensore, montascale, montapersone, rampa, num_ospiti,num_stanze, num_stanze_disabili, num_spazi_comuni, num_livelli, portineria')
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
        document.getElementById('input-livelli').value = scheda.num_livelli || 1;

        const { data: livelliData, error: livelliError } = await clientSupabase
          .from('livelli')
          .select('*')
          .eq('id_residenza', idResidenza)
          .order('id_piano');

        if (livelliError) console.warn("Errore caricamento livelli correlati:", livelliError.message);

        livelliCaricatiInMemoria = livelliData || [];
        generaRigheLivelli(livelliCaricatiInMemoria);
		calcolaTotaliLivelli(); 
      } else {
        generaRigheLivelli([]);
		calcolaTotaliLivelli(); 
      }
	  
	  
	  
	  // 1. Prendi gli ID reali dei livelli caricati
		const arrayIdLivelli = livelliCaricatiInMemoria.map(p => p.id);

		// 2. Carichi i dati delle stanze
		const mappaStanzePerLivello = await caricaDatiStanzeConValori(arrayIdLivelli);
		// 3. Cicli i livelli e le relative stanze per ricostruire le card HTML
		livelliCaricatiInMemoria.forEach(livelloObj => {
		  const idLivelloDB = livelloObj.id;
		  const numeroLivello = livelloObj.livello; // es. 0, 1, 2...
  // Cerca la descrizione del piano nell'array listaPianiOpzioni usando id_piano
  const objPiano = listaPianiOpzioni.find(p => p.id === livelloObj.id_piano);
  // Se trovato prende la descrizione (es. "Piano Terra"), altrimenti gestisce il fallback con la relazione Supabase o una stringa di default
  const nomePiano = objPiano ? objPiano.piano : (livelloObj.piani?.piano || 'Piano non specificato');

		  const stanzeDelLivello = mappaStanzePerLivello[idLivelloDB] || [];
		  /*stanzeDelLivello.forEach(stanza => {
		  });*/
	  });
	  
	  
	  
		// 2. Carichi i dati delle stanze
		const mappaSpaziComuniPerLivello = await caricaDatiSpaziComuniConValori(arrayIdLivelli);
		// 3. Cicli i livelli e le relative stanze per ricostruire le card HTML
		livelliCaricatiInMemoria.forEach(livelloObj => {
		  const idLivelloDB = livelloObj.id;
		  const numeroLivello = livelloObj.livello; // es. 0, 1, 2...
  // Cerca la descrizione del piano nell'array listaPianiOpzioni usando id_piano
  const objPiano = listaPianiOpzioni.find(p => p.id === livelloObj.id_piano);
  // Se trovato prende la descrizione (es. "Piano Terra"), altrimenti gestisce il fallback con la relazione Supabase o una stringa di default
  const nomePiano = objPiano ? objPiano.piano : (livelloObj.piani?.piano || 'Piano non specificato');
		  const spazicomuniDelLivello = mappaSpaziComuniPerLivello[idLivelloDB] || [];
		  /*stanzeDelLivello.forEach(stanza => {
		  });*/
	  });	  
	  
	  
	  aggiornaOpzioniPianiDisponibili();

}
	
	
	
	

function calcolaTotaliLivelli() {
  let sommaStanzeTotali = 0;
  let sommaStanzeAccessibili = 0;
  let sommaSpaziComuni = 0;
  let erroreRilevato = false;

  // Seleziona tutte le righe generatrici dei livelli dentro il corpo tabella
  const righeLivelli = document.querySelectorAll("#corpo-tabella-livelli tr");

  righeLivelli.forEach((riga, index) => {
    const inputStanzeTot = riga.querySelector(".input-livello-stanze-tot") || riga.cells[4]?.querySelector("input");
    const inputStanzeAcc = riga.querySelector(".input-livello-stanze-acc") || riga.cells[5]?.querySelector("input");
    const inputSpaziComuni = riga.querySelector(".input-livello-spazi-comuni") || riga.cells[6]?.querySelector("input");

    const valTot = inputStanzeTot ? (parseInt(inputStanzeTot.value, 10) || 0) : 0;
    const valAcc = inputStanzeAcc ? (parseInt(inputStanzeAcc.value, 10) || 0) : 0;
    const valComuni = inputSpaziComuni ? (parseInt(inputSpaziComuni.value, 10) || 0) : 0;

    // Controllo puntuale per singola riga/livello
    if (valTot < valAcc) {
      erroreRilevato = true;
      if (inputStanzeAcc) inputStanzeAcc.style.borderColor = "#ef4444"; // Evidenzia l'input in rosso
    } else {
      if (inputStanzeAcc) inputStanzeAcc.style.borderColor = ""; // Ripristina bordo
    }

    sommaStanzeTotali += valTot;
    sommaStanzeAccessibili += valAcc;
    sommaSpaziComuni += valComuni;
  });

  // CONTROLLO FINALE SUI TOTALI
  if (sommaStanzeTotali < sommaStanzeAccessibili || erroreRilevato) {
    alert("Attenzione: numero stanze accessibili maggiore di stanze totali!");
  }

  // Aggiorna i tre campi generali in sola lettura
  const elNumStanze = document.getElementById("input-num-stanze");
  const elNumStanzeDis = document.getElementById("input-num-stanze-disabili");
  const elNumSpaziCom = document.getElementById("input-num-spazi-comuni");

  if (elNumStanze) elNumStanze.value = sommaStanzeTotali;
  if (elNumStanzeDis) elNumStanzeDis.value = sommaStanzeAccessibili;
  if (elNumSpaziCom) elNumSpaziCom.value = sommaSpaziComuni;
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
  const num_livelli = parseInt(document.getElementById('input-livelli').value) || 0;
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
    num_spazi_comuni: num_spazi_comuni,
    num_livelli: num_livelli 
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
    // 2. SALVATAGGIO LIVELLI (E creazione mappaLivelliId)
    // --------------------------------------------------
    const righeTR = document.querySelectorAll('#corpo-tabella-livelli tr');
    
    // Mappa temporanea per associare il numero del livello all'ID del database generato
    const mappaLivelliId = {};

    for (const tr of righeTR) {
      const numeroLivelloCorrente = parseInt(tr.dataset.livello);
      const idLivello = parseInt(tr.dataset.idLivelloDb);
      const livelloEsistenteNelDB = livelliCaricatiInMemoria.find(p => p.id === idLivello);

      // RECUPERO ID_PIANO SELEZIONATO DAL SELECT
      const selectPianoElem = tr.querySelector('.livello-piano');
      const valPianoSelect = selectPianoElem ? selectPianoElem.value : null;
      const idPianoScelto = valPianoSelect ? parseInt(valPianoSelect, 10) : null;

      const datiLivello = {
        id_residenza: idResidenzaId,
        id_piano: idPianoScelto, // <--- SALVA L'ID PIANO SELEZIONATO
        accessibile: tr.querySelector('.livello-accessibile').value,
        rampa: tr.querySelector('.livello-rampa').checked,
        num_camere: parseInt(tr.querySelector('.livello-stanze').value) || 0,
        num_camere_accessibili: parseInt(tr.querySelector('.livello-stanze-acc').value) || 0,
        num_spazi_comuni: parseInt(tr.querySelector('.livello-spazi-comuni').value) || 0,
        nota: tr.querySelector('.livello-nota').value
      };

      console.log("Inserimento datiLivello per idresidenza...", idResidenzaId, "id_piano:", idPianoScelto);

      if (livelloEsistenteNelDB && livelloEsistenteNelDB.id) {
        console.log(`Aggiorno livello ${numeroLivelloCorrente} sulla riga ID: ${livelloEsistenteNelDB.id}`);
        
        const { error: errorUpdateLivello } = await clientSupabase
          .from('livelli')
          .update(datiLivello)
          .eq('id', livelloEsistenteNelDB.id);

        if (errorUpdateLivello) throw errorUpdateLivello;
        
        mappaLivelliId[numeroLivelloCorrente] = livelloEsistenteNelDB.id;

      } else {
        console.log(`Inserisco nuovo livello ${numeroLivelloCorrente} per la scheda: ${idResidenzaId}`);
        
        const { data: nuovoLivelloInserito, error: errorInsertLivello } = await clientSupabase
          .from('livelli')
          .insert(datiLivello)
          .select();

        if (errorInsertLivello) throw errorInsertLivello;
        
        mappaLivelliId[numeroLivelloCorrente] = nuovoLivelloInserito[0].id;
      }
    }

    // --------------------------------------------------
    // 3. SALVATAGGIO STANZE E SCHEDA_STANZE
    // --------------------------------------------------
    console.log("Mappa Livelli generata per stanze:", mappaLivelliId);

    const okStanze = await salvaStanzeESchede(mappaLivelliId);
    if (!okStanze) {
      throw new Error("Si è verificato un errore durante il salvataggio delle stanze o delle relative schede.");
    }

    // --------------------------------------------------
    // 4. SALVATAGGIO SPAZI COMUNI E SCHEDA_SPAZICOMUNI
    // --------------------------------------------------
    console.log("Mappa Livelli generata per spazi comuni:", mappaLivelliId);

    const okSpaziComuni = await salvaSpaziComuniESchede(mappaLivelliId);

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
// 4. RENDERING E GESTIONE PIANI / STANZE
// ==================================================

async function generaRigheLivelli(livelliSalvati = []) {
  // Se non abbiamo ancora scaricato i piani dal DB, li scarichiamo ora
  if (!listaPianiOpzioni || listaPianiOpzioni.length === 0) {
    await caricaOpzioniPiani();
  }

  const inputLivelli = document.getElementById('input-livelli');
  const numLivelli = inputLivelli ? (parseInt(inputLivelli.value, 10) || 1) : 1;
  const tbody = document.getElementById('corpo-tabella-livelli');
  if (!tbody) return;

  tbody.innerHTML = '';

  for (let i = 1; i <= numLivelli; i++) {
    // FIX INDICE ARRAY: ricerca per livello o posizione i - 1
    const datiLivello = livelliSalvati.find(p => p.livello === i) || livelliSalvati[i - 1] || {};

    const tr = document.createElement('tr');
    tr.dataset.livello = i;
    if (datiLivello.id) tr.dataset.idLivelloDb = datiLivello.id;

    // Generiamo le opzioni con value = id_piano
    let opzioniPianiHTML = `<option value=""  onchange="rigeneraDettagliStanze()">-- Seleziona Piano --</option>`;
    listaPianiOpzioni.forEach(item => {
      // Confrontiamo sia con l'id che con l'eventuale stringa per retrocompatibilità
      const isSelected = (
        datiLivello.piano === item.id || 
        datiLivello.id_piano === item.id || 
        datiLivello.piano === item.piano
      ) ? 'selected' : '';

      // MODIFICA: value="${item.id}"
      opzioniPianiHTML += `<option     value="${item.id}" ${isSelected}>${item.piano}</option>`;
    });

    tr.innerHTML = `
      <td><strong>Livello ${i}</strong></td>
      
      <!-- Select popolato con value = id_piano -->
      <td>
        <select class="livello-piano"  onchange="aggiornaOpzioniPianiDisponibili();rigeneraDettagliStanze();rigeneraDettagliSpaziComuni()">
          ${opzioniPianiHTML}
        </select>
      </td>

      <td><input type="checkbox" class="livello-rampa" ${datiLivello.rampa ? 'checked' : ''}></td>
      
      <td>
        <select class="livello-accessibile">
          <option value="Sì" ${datiLivello.accessibile === 'Sì' ? 'selected' : ''}>Sì</option>
          <option value="No" ${datiLivello.accessibile === 'No' ? 'selected' : ''}>No</option>
          <option value="Parzialmente" ${datiLivello.accessibile === 'Parzialmente' ? 'selected' : ''}>Parzialmente</option>
        </select>
      </td>
      
      <td><input type="number" class="livello-stanze" min="0" value="${datiLivello.num_camere ?? 0}" oninput="calcolaTotaliLivelli()"></td>
      <td><input type="number" class="livello-stanze-acc" min="0" value="${datiLivello.num_camere_accessibili ?? 0}" oninput="calcolaTotaliLivelli()" onchange="rigeneraDettagliStanze()"></td>
      <td><input type="number" class="livello-spazi-comuni" min="0" value="${datiLivello.num_spazi_comuni ?? 0}" oninput="calcolaTotaliLivelli()" onchange="rigeneraDettagliSpaziComuni()"></td>
      <td><input type="text" class="livello-nota" value="${datiLivello.nota || ''}" placeholder="Eventuali note..."></td>
    `;

    tbody.appendChild(tr);
  }

  // Rigenera schede e aggiorna i 3 totali in alto
  rigeneraDettagliStanze();
  rigeneraDettagliSpaziComuni();
  calcolaTotaliLivelli();
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





function rigeneraLivelliVuoti() {
  if (typeof generaRigheLivelli === 'function' && typeof livelliCaricatiInMemoria !== 'undefined') {
    generaRigheLivelli(livelliCaricatiInMemoria);
  }
}


// --------------------------------------------------
// GESTIONE SELEZIONE UNICA PIANI SULLE TABELLE LIVELLI
// --------------------------------------------------
function aggiornaOpzioniPianiDisponibili() {
  // 1. Selezioniamo tutte le select dei piani presenti nella tabella
  const tutteLeSelect = document.querySelectorAll('.livello-piano');

  // 2. Raccogliamo i valori attualmente selezionati (escludendo quelli vuoti/non validi)
  const valoriSelezionati = Array.from(tutteLeSelect)
    .map(select => select.value)
    .filter(valore => valore && valore !== '' && valore !== '0');

  // 3. Cicliamo su ogni select per disabilitare/abilitare le opzioni
  tutteLeSelect.forEach(selectCorrente => {
    const valoreAttuale = selectCorrente.value;
    const opzioni = selectCorrente.querySelectorAll('option');

    opzioni.forEach(option => {
      // Ignoriamo l'opzione di default (es. "-- Seleziona Piano --")
      if (!option.value || option.value === '' || option.value === '0') return;

      // Se il valore dell'opzione è già stato scelto in UN'ALTRA select
      if (valoriSelezionati.includes(option.value) && option.value !== valoreAttuale) {
        option.disabled = true;
        // Oltre a disabilitarla, possiamo anche renderla visivamente grigia/trasparente
        option.style.color = '#94a3b8'; 
      } else {
        option.disabled = false;
        option.style.color = ''; 
      }
    });
  });
}