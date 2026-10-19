/*
 * JS para la gestión de los datos del jugador de HeroMind (API localStorage)
 * Basado en datosUsuario.js de MasterDots / Dotmind (curso Frontend de mastermind.ac)
 */

//Prefijo de las claves: así no chocan con otros proyectos publicados en el mismo dominio (usuario.github.io)
const PREFIJO="heromind_";
//Máximo de partidas que se guardan en el histórico
const MAX_HISTORICO=50;

//Datos del jugador (se rellenan con getDatosUsuario)
var nick;
var dificultad;
var tamano;
var avatarImg;
var nombreAvatar;
var artefactosElegidos=[];

/* DATOS DEL JUGADOR */

/**
 * Almacena los datos del jugador en el localStorage
 * @param {HTMLElement} nickInput campo del nick
 * @param {HTMLElement} dificultadInput radio de dificultad marcado
 * @param {HTMLElement} tamanoInput radio del número de tarjetas marcado
 * @param {HTMLElement} avatarCont imagen del avatar elegido (su nombre va en data-nombre)
 * @param {Array} artefactos ids de los artefactos elegidos
 */
function datosUsuario(nickInput,dificultadInput,tamanoInput,avatarCont,artefactos){
    localStorage.setItem(PREFIJO+"nick",nickInput.value.trim());
    localStorage.setItem(PREFIJO+"dificultad",dificultadInput.value);
    localStorage.setItem(PREFIJO+"tamano",tamanoInput.value);
    localStorage.setItem(PREFIJO+"avatarImg",avatarCont.getAttribute("src"));
    localStorage.setItem(PREFIJO+"nombreAvatar",avatarCont.dataset.nombre);
    //El localStorage solo guarda texto: el array se convierte a JSON
    localStorage.setItem(PREFIJO+"artefactos",JSON.stringify(artefactos));
}

/**
 * Recoge los datos del jugador del localStorage
 */
function getDatosUsuario(){
    nick=localStorage.getItem(PREFIJO+"nick");
    dificultad=localStorage.getItem(PREFIJO+"dificultad");
    tamano=parseInt(localStorage.getItem(PREFIJO+"tamano"));
    avatarImg=localStorage.getItem(PREFIJO+"avatarImg");
    nombreAvatar=localStorage.getItem(PREFIJO+"nombreAvatar") || "";
    artefactosElegidos=leerJSON(PREFIJO+"artefactos",[]);
    if(!Array.isArray(artefactosElegidos)) artefactosElegidos=[];
}

/**
 * Comprueba que hay un jugador guardado
 * @return {Boolean}
 */
function comprobacionDatosUsuario(){
    return nick!=null && nick!="";
}

/**
 * Lee un valor guardado como JSON; si no existe o está dañado devuelve el valor por defecto
 * @param  {String} clave clave del localStorage
 * @param  {*} porDefecto valor que se devuelve si no hay nada
 * @return {*}
 */
function leerJSON(clave,porDefecto){
    try{
        let valor=JSON.parse(localStorage.getItem(clave));
        return valor ?? porDefecto;
    }catch(error){
        return porDefecto;
    }
}

/* HISTÓRICO DE PARTIDAS */

/**
 * Añade una partida terminada al histórico del localStorage
 * @param {Object} partida {nick, avatar, puntos, dificultad, tamano, resultado, parejas, fecha}
 */
function guardarPartida(partida){
    let historico=leerJSON(PREFIJO+"historico",[]);
    historico.push(partida);
    //Solo se guardan las últimas partidas para no llenar el almacenamiento
    if(historico.length>MAX_HISTORICO) historico=historico.slice(-MAX_HISTORICO);
    localStorage.setItem(PREFIJO+"historico",JSON.stringify(historico));
}

/**
 * Devuelve las partidas con más puntos (para el salón de la fama)
 * @param  {Number} cantidad cuántas partidas devolver
 * @return {Array}
 */
function getMejoresPartidas(cantidad){
    let historico=leerJSON(PREFIJO+"historico",[]);
    return historico.sort((a,b)=>b.puntos-a.puntos).slice(0,cantidad);
}

/**
 * Devuelve la mejor puntuación guardada de un jugador
 * @param  {String} nickJugador
 * @return {Number}
 */
function getRecordJugador(nickJugador){
    let record=0;
    for(let partida of leerJSON(PREFIJO+"historico",[])){
        if(partida.nick==nickJugador && partida.puntos>record) record=partida.puntos;
    }
    return record;
}
