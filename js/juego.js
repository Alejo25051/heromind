/*
 * JS para el juego HeroMind (juego.html)
 * Memoria de parejas héroe ↔ archienemigo, con artefactos y cartas trampa (bombas)
 *
 * Basado en la estructura de MasterDots / Dotmind (curso Frontend de mastermind.ac)
 */

//VARIABLES GLOBALES
var cartas=[];              //cartas del tablero en orden: {tipo, nombre, pareja, bando, rival, imagen, estado}
var seleccionadas=[];       //índices de las cartas destapadas en la tirada actual
var bloqueado=false;        //true mientras se resuelve una tirada o actúa un artefacto
var juegoTerminado=false;
var config;                 //configuración de la dificultad elegida (sale de DIFICULTADES)
var totalParejas=0;
var parejasEncontradas=0;
var tiradasRestantes=0;
var tiradasUsadas=0;
var puntos=0;
var racha=0;                //parejas seguidas sin fallar
var artefactosJuego=[];     //artefactos del jugador: {id, usado}
var escudoActivo=false;
var artefactoArrastrado=null;

//Elementos del DOM
var tablero;
var mensajeTxt;

//Puntuación
const PUNTOS_PAREJA=100;
const PUNTOS_RACHA=50;
const PUNTOS_TIRADA_SOBRANTE=20;

//Tiempos de las animaciones (ms)
const TIEMPO_VOLTEO=450;
const TIEMPO_ESPIAR=1500;
const TIEMPO_BARAJAR=600;
const TIEMPO_FIN=800;

//Ancho de carta (px) desde el que solo se muestra el nombre (5x5 en el celular)
const ANCHO_CARTA_PEQUENA=76;

/* INICIALIZACIÓN DEL PANEL */

/**
 * Rellena la cabecera con los datos del jugador
 */
function rellenarFormularioUsuario(){
    document.getElementById("nick").innerText=nick;
    let avatar=document.getElementById("avatarImg");
    avatar.src=avatarImg;
    avatar.alt="Avatar: "+nombreAvatar;
    document.getElementById("dificultadTxt").innerText=`Dificultad ${config.nombre.toLowerCase()} · ${tamano} cartas`;
}

/**
 * Crea el mazo con las parejas y las cartas trampa, y lo baraja
 * @return {Array} cartas barajadas, todas boca abajo
 */
function crearMazo(){
    let composicion=COMPOSICION[tamano];
    let mazo=[];

    //Elegimos al azar las parejas que entran en esta partida
    let parejasPartida=barajar(PAREJAS.slice()).slice(0,composicion.parejas);
    for(let pareja of parejasPartida){
        mazo.push({tipo:"personaje", pareja:pareja.id, bando:"heroe", nombre:pareja.heroe.nombre, rival:pareja.villano.nombre, imagen:pareja.heroe.imagen});
        mazo.push({tipo:"personaje", pareja:pareja.id, bando:"villano", nombre:pareja.villano.nombre, rival:pareja.heroe.nombre, imagen:pareja.villano.imagen});
    }

    //Añadimos las cartas trampa que tocan según el tamaño
    for(let tipo in BOMBAS){
        for(let i=0;i<composicion[tipo];i++){
            mazo.push({tipo:tipo, nombre:BOMBAS[tipo].nombre});
        }
    }

    //Todas empiezan boca abajo
    for(let carta of mazo){
        carta.estado="oculta";
    }
    totalParejas=composicion.parejas;
    return barajar(mazo);
}

/**
 * Calcula las tiradas de la partida según la dificultad y las cartas trampa
 * @return {Number}
 */
function calcularTiradas(){
    let composicion=COMPOSICION[tamano];
    let trampas=composicion.muerte+composicion.teseracto+composicion.guante;
    return Math.ceil(composicion.parejas*config.multiplicadorTiradas)+trampas;
}

/**
 * Pinta de forma automática el panel de juego (todas las cartas boca abajo)
 */
function pintarPanelJuego(){
    let lado=Math.sqrt(tamano);
    tablero.style.gridTemplateColumns=`repeat(${lado}, 1fr)`;

    let items="";
    for(let indice=0;indice<cartas.length;indice++){
        items+=`<button type="button" class="carta" data-indice="${indice}">
                    <span class="carta-interior">
                        <span class="cara cara-trasera"></span>
                        <span class="cara cara-frontal"></span>
                    </span>
                </button>`;
    }
    tablero.innerHTML=items;

    //Rellenamos la cara de cada carta
    for(let indice=0;indice<cartas.length;indice++){
        pintarCara(indice);
    }
    ajustarMedidasCartas();
}

/**
 * Calcula --u (el 1 % del ancho de una carta), que usa stylesjuego.css para las medidas
 * de dentro de las cartas, y marca el tablero con cartas-pequenas si las cartas son muy estrechas
 */
function ajustarMedidasCartas(){
    let primeraCarta=tablero.children[0];
    if(primeraCarta==undefined) return;
    //Ancho real de la carta en píxeles (con decimales)
    let anchoCarta=parseFloat(getComputedStyle(primeraCarta).width);
    tablero.style.setProperty("--u",(anchoCarta/100)+"px");
    tablero.classList.toggle("cartas-pequenas",anchoCarta<=ANCHO_CARTA_PEQUENA);
}

/**
 * Devuelve el HTML del retrato de un personaje: su imagen o, si no hay, sus iniciales
 * @param  {Object} carta
 * @return {String}
 */
function retratoPersonaje(carta){
    return imagenConRespaldo(CARPETA_PERSONAJES,carta.imagen,"carta-imagen","carta-iniciales",iniciales(carta.nombre));
}

/**
 * Devuelve el HTML de la cara visible de una carta
 * @param  {Object} carta
 * @return {String}
 */
function caraFrontal(carta){
    let arte, etiqueta, pie;
    if(carta.tipo=="personaje"){
        arte=retratoPersonaje(carta);
        etiqueta=carta.bando=="heroe" ? "Héroe" : "Villano";
        pie=`<span class="carta-vs">VS</span> ${carta.rival}`;
    }else{
        let bomba=BOMBAS[carta.tipo];
        arte=imagenConRespaldo(CARPETA_TRAMPAS,bomba.imagen,"carta-imagen","carta-iniciales",iniciales(bomba.nombre));
        etiqueta="Trampa";
        pie=bomba.efectoCorto;
    }
    //Marco del color del bando (la propia cara) > ventana con el arte a carta completa,
    //el nombre arriba y el rival abajo
    return `<span class="carta-ventana">
                <span class="carta-retrato">${arte}</span>
                <span class="carta-cabecera">
                    <span class="carta-bando">${etiqueta}</span>
                    <span class="carta-nombre">${carta.nombre}</span>
                </span>
                <span class="carta-pie"><span class="carta-rival">${pie}</span></span>
            </span>`;
}

/**
 * Pinta la cara de la carta indicada y actualiza su estado
 * @param {Number} indice posición de la carta en el tablero
 */
function pintarCara(indice){
    let carta=cartas[indice];
    let cara=tablero.children[indice].querySelector(".cara-frontal");
    cara.className="cara cara-frontal "+(carta.tipo=="personaje" ? carta.bando : "trampa trampa-"+carta.tipo);
    cara.innerHTML=caraFrontal(carta);
    //Si el personaje tiene imagen, la carta usa el diseño a carta completa
    cara.classList.toggle("con-imagen",cara.querySelector(".carta-imagen")!=null);
    actualizarCarta(indice);
}

/**
 * Sincroniza las clases de una carta del DOM con su estado
 * (oculta, visible, emparejada o usada)
 * @param {Number} indice
 */
function actualizarCarta(indice){
    let carta=cartas[indice];
    let boton=tablero.children[indice];
    boton.classList.toggle("volteada",carta.estado!="oculta");
    boton.classList.toggle("emparejada",carta.estado=="emparejada");
    boton.classList.toggle("usada",carta.estado=="usada");
    boton.disabled=carta.estado!="oculta";
    boton.setAttribute("aria-label",carta.estado=="oculta" ? `Carta ${indice+1} boca abajo` : descripcionCarta(carta));
}

/**
 * Texto accesible de una carta destapada
 * @param  {Object} carta
 * @return {String}
 */
function descripcionCarta(carta){
    if(carta.tipo=="personaje"){
        let bando=carta.bando=="heroe" ? "héroe" : "villano";
        return `${carta.nombre}, ${bando}, archienemigo de ${carta.rival}`;
    }
    return `Carta trampa: ${carta.nombre}`;
}

/* MARCADORES Y MENSAJES */

/**
 * Actualiza puntos, tiradas y parejas en la cabecera
 */
function actualizarMarcadores(){
    document.getElementById("puntos").innerText=puntos;
    document.getElementById("tiradas").innerText=tiradasRestantes;
    document.getElementById("parejas").innerText=parejasEncontradas+"/"+totalParejas;
    //Si quedan pocas tiradas el marcador se pone en rojo
    document.getElementById("marcadorTiradas").classList.toggle("critico",tiradasRestantes<=3 && !juegoTerminado);
}

/**
 * Muestra un mensaje encima del tablero
 * @param {String} texto
 * @param {String} tipo info, exito, alerta o peligro (cambia el color)
 */
function mostrarMensaje(texto,tipo="info"){
    mensajeTxt.innerText=texto;
    mensajeTxt.className="mensaje-juego "+tipo;
}

/* LÓGICA DE LAS TIRADAS */

/**
 * Destapa la carta pulsada; con la segunda carta se gasta una tirada
 * @param {EventObject} event Evento click en el tablero
 */
function voltearCarta(event){
    let boton=event.target.closest(".carta");
    if(boton==null || bloqueado || juegoTerminado) return;
    let indice=parseInt(boton.dataset.indice);
    if(cartas[indice].estado!="oculta") return;

    cartas[indice].estado="visible";
    actualizarCarta(indice);
    seleccionadas.push(indice);

    if(seleccionadas.length==2){
        bloqueado=true;
        tiradasRestantes--;
        tiradasUsadas++;
        actualizarMarcadores();
        //Esperamos a que termine el giro antes de comprobar
        setTimeout(resolverTirada,TIEMPO_VOLTEO);
    }
}

/**
 * Comprueba si dos personajes son pareja (un héroe y su archienemigo)
 * @param  {Object} cartaA
 * @param  {Object} cartaB
 * @return {Boolean}
 */
function esPareja(cartaA,cartaB){
    return cartaA.tipo=="personaje" && cartaB.tipo=="personaje" && cartaA.pareja==cartaB.pareja;
}

/**
 * Resuelve la tirada con las dos cartas destapadas
 */
function resolverTirada(){
    let primera=cartas[seleccionadas[0]];
    let segunda=cartas[seleccionadas[1]];
    let tipos=[primera.tipo,segunda.tipo];

    //1. Las dos Lady Death en la misma tirada: se pierde (salvo que tengas el escudo)
    if(primera.tipo=="muerte" && segunda.tipo=="muerte"){
        encuentroMuerte();
        return;
    }

    //2. Un héroe con su archienemigo: ¡pareja!
    if(esPareja(primera,segunda)){
        emparejar(seleccionadas[0],seleccionadas[1],true);
        finTirada();
        return;
    }

    //3. No son pareja: se dejan ver según la dificultad y después se aplican las trampas
    racha=0;
    marcarFallo();
    if(tipos.includes("muerte")){
        mostrarMensaje("Lady Death… ¡que no te salga la otra en la misma tirada!","alerta");
    }else if(tipos.includes("teseracto") || tipos.includes("guante")){
        mostrarMensaje("¡Cuidado, carta trampa!","alerta");
    }else if(primera.bando==segunda.bando){
        let bando=primera.bando=="heroe" ? "Dos héroes" : "Dos villanos";
        mostrarMensaje(`${bando} no hacen pareja: busca a su archienemigo`,"info");
    }else{
        mostrarMensaje("No son archienemigos. ¡Memoriza dónde están!","info");
    }
    setTimeout(taparYAplicarTrampas,config.tiempoVisible);
}

/**
 * Deja dos cartas emparejadas y suma los puntos
 * @param {Number} indiceA
 * @param {Number} indiceB
 * @param {Boolean} conTirada true si la encontró el jugador (cuenta para la racha)
 * @param {String} prefijo texto opcional al inicio del mensaje
 */
function emparejar(indiceA,indiceB,conTirada,prefijo="¡Pareja!"){
    cartas[indiceA].estado="emparejada";
    cartas[indiceB].estado="emparejada";
    actualizarCarta(indiceA);
    actualizarCarta(indiceB);
    parejasEncontradas++;

    let ganados=Math.round(PUNTOS_PAREJA*config.multiplicadorPuntos);
    if(conTirada){
        racha++;
        ganados+=PUNTOS_RACHA*(racha-1);
    }
    puntos+=ganados;

    let heroe=cartas[indiceA].bando=="heroe" ? cartas[indiceA] : cartas[indiceB];
    let textoRacha=conTirada && racha>1 ? ` · racha x${racha}` : "";
    mostrarMensaje(`${prefijo} ${heroe.nombre} vs ${heroe.rival} (+${ganados})${textoRacha}`,"exito");
    actualizarMarcadores();
}

/**
 * Sacude las cartas de una tirada fallida
 */
function marcarFallo(){
    for(let indice of seleccionadas){
        let boton=tablero.children[indice];
        boton.classList.add("fallo");
        setTimeout(()=>boton.classList.remove("fallo"),450);
    }
}

/**
 * Vuelve a tapar las cartas de la tirada y aplica el efecto de las cartas trampa
 * (el Tesseract baraja el tablero y el Infinity Gauntlet quita tiradas)
 */
function taparYAplicarTrampas(){
    let hayTeseracto=false;
    let mensajes=[];

    for(let indice of seleccionadas){
        let carta=cartas[indice];
        if(carta.tipo=="teseracto"){
            carta.estado="usada";
            hayTeseracto=true;
        }else if(carta.tipo=="guante"){
            carta.estado="usada";
            tiradasRestantes=Math.max(0,tiradasRestantes-BOMBAS.guante.valor);
            mensajes.push(`¡Thanos chasqueó los dedos! Pierdes ${BOMBAS.guante.valor} tiradas`);
        }else{
            carta.estado="oculta";
        }
        actualizarCarta(indice);
    }

    if(hayTeseracto){
        mensajes.push("¡El Tesseract teletransporta las cartas!");
    }
    if(mensajes.length>0){
        mostrarMensaje(mensajes.join(" · "),"peligro");
    }

    if(hayTeseracto){
        //Esperamos a que las cartas terminen de taparse antes de barajar
        setTimeout(barajarOcultas,TIEMPO_VOLTEO);
        setTimeout(finTirada,TIEMPO_VOLTEO+TIEMPO_BARAJAR);
    }else{
        finTirada();
    }
}

/**
 * Baraja todas las cartas que siguen boca abajo (efecto del Tesseract)
 */
function barajarOcultas(){
    let indicesOcultos=[];
    for(let indice=0;indice<cartas.length;indice++){
        if(cartas[indice].estado=="oculta") indicesOcultos.push(indice);
    }
    let cartasOcultas=barajar(indicesOcultos.map(indice=>cartas[indice]));
    indicesOcultos.forEach((indice,posicion)=>{
        cartas[indice]=cartasOcultas[posicion];
        pintarCara(indice);
    });
    tablero.classList.add("barajando");
    setTimeout(()=>tablero.classList.remove("barajando"),TIEMPO_BARAJAR);
}

/**
 * Las dos Lady Death en la misma tirada: pierdes, salvo que tengas el Vibranium Shield
 */
function encuentroMuerte(){
    let [indiceA,indiceB]=seleccionadas;

    if(escudoActivo){
        //El Vibranium Shield absorbe el golpe y desactiva las dos cartas de Lady Death
        escudoActivo=false;
        gastarArtefacto("escudo");
        cartas[indiceA].estado="usada";
        cartas[indiceB].estado="usada";
        actualizarCarta(indiceA);
        actualizarCarta(indiceB);
        mostrarMensaje("¡El Vibranium Shield te salvó de Lady Death!","exito");
        finTirada();
        return;
    }

    tablero.children[indiceA].classList.add("explosion");
    tablero.children[indiceB].classList.add("explosion");
    mostrarMensaje("¡Lady Death te encontró!","peligro");
    terminarJuego(false,"Destapaste las dos cartas de Lady Death en la misma tirada.");
}

/**
 * Cierra la tirada: libera el tablero y comprueba si se acabó la partida
 */
function finTirada(){
    seleccionadas=[];
    bloqueado=false;
    actualizarMarcadores();
    comprobarFinJuego();
}

/**
 * La partida acaba al encontrar todas las parejas o al quedarse sin tiradas
 */
function comprobarFinJuego(){
    if(juegoTerminado) return;
    if(parejasEncontradas==totalParejas){
        terminarJuego(true,"Emparejaste a todos los héroes con sus archienemigos.");
    }else if(tiradasRestantes<=0){
        terminarJuego(false,"Te quedaste sin tiradas.");
    }
}

/* ARTEFACTOS */

/**
 * Prepara los artefactos que eligió el jugador en index.html
 */
function prepararArtefactos(){
    artefactosJuego=artefactosElegidos
        .filter(id=>ARTEFACTOS[id]!=undefined)
        .map(id=>({id:id, usado:false}));
    escudoActivo=artefactosElegidos.includes("escudo");
}

/**
 * Pinta los artefactos del jugador en el panel lateral
 */
function pintarArtefactos(){
    let items="";
    for(let artefacto of artefactosJuego){
        let datos=ARTEFACTOS[artefacto.id];
        let pasivo=datos.tipo=="pasivo";
        let arrastrable=!artefacto.usado && !pasivo;
        let estado=artefacto.usado ? "Gastado" : (pasivo ? "Activo: te protege solo" : "Listo para usar");
        let clases="artefacto-juego"+(artefacto.usado ? " gastado" : "")+(pasivo ? " pasivo" : "");
        let atributos=arrastrable ? 'tabindex="0" role="button"' : "";
        items+=`<div class="${clases}" data-id="${artefacto.id}" draggable="${arrastrable}" ${atributos} title="${datos.descripcion}">
                    <span class="artefacto-dibujo" aria-hidden="true">${iconoArtefacto(artefacto.id)}</span>
                    <span class="artefacto-texto">
                        <strong>${datos.nombre}</strong>
                        <small>${datos.descripcion}</small>
                        <em>${estado}</em>
                    </span>
                </div>`;
    }
    document.getElementById("artefactosJuego").innerHTML=items;
}

/**
 * Guarda el artefacto que se empieza a arrastrar
 * @param {EventObject} event Evento dragstart
 */
function moviendoArtefacto(event){
    let item=event.target.closest(".artefacto-juego");
    if(item==null) return;
    artefactoArrastrado=item.dataset.id;
    event.dataTransfer.setData("text/plain",artefactoArrastrado);
    event.dataTransfer.effectAllowed="move";
}

/**
 * Usa el artefacto que se soltó sobre el tablero
 * @param {EventObject} event Evento drop
 */
function soltarArtefacto(event){
    event.preventDefault();
    tablero.classList.remove("sobre");
    if(artefactoArrastrado!=null) usarArtefacto(artefactoArrastrado);
    artefactoArrastrado=null;
}

/**
 * Activa el efecto de un artefacto (solo entre tiradas)
 * @param {String} id id del artefacto
 */
function usarArtefacto(id){
    let artefacto=artefactosJuego.find(item=>item.id==id && !item.usado);
    if(artefacto==null || ARTEFACTOS[id].tipo=="pasivo" || juegoTerminado) return;
    if(bloqueado || seleccionadas.length>0){
        mostrarMensaje("Usa los artefactos antes de destapar cartas.","alerta");
        return;
    }

    gastarArtefacto(id);
    if(id=="ojo"){
        espiarTablero();
    }else if(id=="radar"){
        localizarPareja();
    }else if(id=="gema"){
        tiradasRestantes+=ARTEFACTOS.gema.valor;
        actualizarMarcadores();
        mostrarMensaje(`La Time Stone te da ${ARTEFACTOS.gema.valor} tiradas más`,"exito");
    }
}

/**
 * Marca un artefacto como gastado y lo repinta
 * @param {String} id
 */
function gastarArtefacto(id){
    let artefacto=artefactosJuego.find(item=>item.id==id);
    if(artefacto!=null) artefacto.usado=true;
    pintarArtefactos();
}

/**
 * Eye of Agamotto: destapa todas las cartas un instante
 */
function espiarTablero(){
    bloqueado=true;
    tablero.classList.add("espiando");
    mostrarMensaje("El Eye of Agamotto te deja ver todo el tablero…","info");
    setTimeout(()=>{
        tablero.classList.remove("espiando");
        bloqueado=false;
    },TIEMPO_ESPIAR);
}

/**
 * Cerebro: encuentra una pareja al azar y la destapa
 */
function localizarPareja(){
    let pendientes=[];
    for(let carta of cartas){
        if(carta.tipo=="personaje" && carta.estado=="oculta" && !pendientes.includes(carta.pareja)){
            pendientes.push(carta.pareja);
        }
    }
    if(pendientes.length==0) return;

    let elegida=pendientes[getRandomInt(pendientes.length)];
    let indices=[];
    cartas.forEach((carta,indice)=>{
        if(carta.pareja==elegida) indices.push(indice);
    });
    emparejar(indices[0],indices[1],false,"Cerebro encontró a");
    comprobarFinJuego();
}

/* FIN DE LA PARTIDA */

/**
 * Termina la partida, la guarda en el localStorage y muestra el resumen
 * @param {Boolean} victoria
 * @param {String} motivo
 */
function terminarJuego(victoria,motivo){
    if(juegoTerminado) return;
    juegoTerminado=true;
    bloqueado=true;

    //Bonus por las tiradas que sobraron
    let bonus=0;
    if(victoria){
        bonus=Math.round(tiradasRestantes*PUNTOS_TIRADA_SOBRANTE*config.multiplicadorPuntos);
        puntos+=bonus;
    }
    actualizarMarcadores();

    //Récord antes de guardar esta partida
    let recordAnterior=getRecordJugador(nick);
    guardarPartida({
        nick:nick,
        avatar:avatarImg,
        puntos:puntos,
        dificultad:dificultad,
        tamano:tamano,
        resultado:victoria ? "victoria" : "derrota",
        parejas:parejasEncontradas+"/"+totalParejas,
        fecha:new Date().toLocaleDateString("es-CO")
    });

    //Dejamos ver el tablero completo y abrimos el resumen
    setTimeout(()=>{
        tablero.classList.add("revelado");
        mostrarFinJuego(victoria,motivo,bonus,recordAnterior);
    },TIEMPO_FIN);
}

/**
 * Rellena y abre la ventana de fin de partida
 * @param {Boolean} victoria
 * @param {String} motivo
 * @param {Number} bonus puntos extra por tiradas sobrantes
 * @param {Number} recordAnterior mejor puntuación antes de esta partida
 */
function mostrarFinJuego(victoria,motivo,bonus,recordAnterior){
    let ventana=document.getElementById("finJuego");
    ventana.classList.toggle("derrota",!victoria);
    document.getElementById("finTitulo").innerText=victoria ? "¡Victoria!" : "Derrota";
    document.getElementById("finMotivo").innerText=motivo;
    document.getElementById("finPuntos").innerText=puntos;
    document.getElementById("finTiradas").innerText=tiradasUsadas;
    document.getElementById("finParejas").innerText=parejasEncontradas+"/"+totalParejas;
    document.getElementById("finRecord").innerText=Math.max(recordAnterior,puntos);
    document.getElementById("finRecordNuevo").hidden=!(puntos>recordAnterior && puntos>0);
    document.getElementById("finBonus").innerText=bonus>0 ? `Incluye +${bonus} por las tiradas que te sobraron` : "";
    ventana.showModal();
}

/* EVENTOS */

/**
 * Programa los eventos del tablero, de los artefactos y de la ventana final
 */
function programarEventosJuego(){
    //Clic en las cartas: un solo listener para todo el tablero (delegación de eventos)
    tablero.addEventListener("click",voltearCarta);


    //Drag&Drop: los artefactos se arrastran desde el panel y se sueltan en el tablero
    let contenedorArtefactos=document.getElementById("artefactosJuego");
    contenedorArtefactos.addEventListener("dragstart",moviendoArtefacto);
    contenedorArtefactos.addEventListener("dragend",()=>{
        artefactoArrastrado=null;
        tablero.classList.remove("sobre");
    });
    tablero.addEventListener("dragover",event=>{
        //Sin preventDefault en dragover el navegador no deja soltar (no salta el drop)
        if(artefactoArrastrado==null) return;
        event.preventDefault();
        tablero.classList.add("sobre");
    });
    tablero.addEventListener("dragleave",event=>{
        //Solo quitamos el resaltado si el puntero sale del tablero (no al pasar de una carta a otra)
        if(!tablero.contains(event.relatedTarget)) tablero.classList.remove("sobre");
    });
    tablero.addEventListener("drop",soltarArtefacto);

    //Clic o teclado sobre un artefacto: también lo usa (útil en el celular, donde no hay arrastre)
    contenedorArtefactos.addEventListener("click",event=>{
        let item=event.target.closest('.artefacto-juego[draggable="true"]');
        if(item!=null) usarArtefacto(item.dataset.id);
    });
    contenedorArtefactos.addEventListener("keydown",event=>{
        let item=event.target.closest('.artefacto-juego[draggable="true"]');
        if(item!=null && (event.key=="Enter" || event.key==" ")){
            event.preventDefault();
            usarArtefacto(item.dataset.id);
        }
    });

    //Botón de la ventana final
    document.getElementById("botonRepetir").addEventListener("click",()=>location.reload());

    //Si cambia el tamaño de la ventana (o se gira el celular) cambian las cartas: recalculamos sus medidas.
    //En load también, por si al terminar de cargar las imágenes aparece la barra de desplazamiento
    window.addEventListener("resize",ajustarMedidasCartas);
    window.addEventListener("load",ajustarMedidasCartas);
}

/**
 * Arranque del juego cuando el DOM está cargado
 */
function iniciarJuego(){
    tablero=document.getElementById("tablero");
    mensajeTxt=document.getElementById("mensaje");

    //Capturamos los datos del jugador del localStorage
    getDatosUsuario();
    //Si no hay datos válidos volvemos a la ficha del jugador con un aviso
    if(!comprobacionDatosUsuario() || DIFICULTADES[dificultad]==undefined || COMPOSICION[tamano]==undefined){
        sessionStorage.setItem("error","Rellena la ficha del jugador antes de jugar.");
        location="index.html";
        return;
    }

    config=DIFICULTADES[dificultad];
    cartas=crearMazo();
    tiradasRestantes=calcularTiradas();
    prepararArtefactos();

    //Programamos los eventos (con delegación, así sirven para las cartas que se pintan después)
    programarEventosJuego();
    //Rellenamos la cabecera y el panel
    rellenarFormularioUsuario();
    pintarPanelJuego();
    pintarArtefactos();
    pintarLeyendaBombas("leyendaBombas");
    actualizarMarcadores();
    //Con todo el panel pintado, volvemos a medir las cartas por si cambió el ancho disponible
    ajustarMedidasCartas();
}

//Inicio de carga de eventos
document.addEventListener("DOMContentLoaded",iniciarJuego);
