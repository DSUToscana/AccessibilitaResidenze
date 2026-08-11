

// --------------------------------------------------
// 1. CARICAMENTO DATI STANZE DAL DB (LEFT JOIN)
// --------------------------------------------------
async function caricaDatiStanzeConValori(pianiIds) {
  if (!pianiIds || pianiIds.length === 0) return {};

  const { data, error } = await clientSupabase
    .from('indicatori_facilitazioni')
    .select(`
      id, area, ambito, requisito, caratteristiche, disabilita, note,
      scheda_stanze (
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
        console.log('mucci 1');
		console.log(scheda.last_update);
		console.log('mucci 2');

		
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
          .eq('id_scheda_residenze', schedaEsistenteId)
          .order('piano');

        if (pianiError) console.warn("Errore caricamento piani correlati:", pianiError.message);

        pianosCaricatiInMemoria = pianiData || [];
        generaRighePiani(pianosCaricatiInMemoria);
      } else {
        generaRighePiani([]);
      }
    }
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	





