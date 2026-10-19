/*
 * JS para la página de entrada de HeroMind (index.html)
 * - Validación del formulario
 * - Drag&Drop del avatar y de los artefactos
 * - Guardado de los datos del jugador en el localStorage
 *
 * Basado en la estructura de MasterDots / Dotmind (curso Frontend de mastermind.ac)
 */

//VARIABLES GLOBALES (elementos del DOM)
var nickInput;
var formEntrada;
var error;
var avatarCont;
var avatarZona;
var avatarNombre;
var avatarItems;
var cinturon;

//Variables del Drag&Drop
var itemImg=null;               //avatar que se está arrastrando
var artefactoArrastrado=null;   //id del artefacto que se está arrastrando
var artefactosSeleccionados=[]; //ids de los artefactos que hay en el cinturón

//Máximo de artefactos que puede llevar el jugador
const MAX_ARTEFACTOS=2;

/* VALIDACIÓN DEL FORMULARIO */

/**
 * Comprueba los datos del formulario antes de entrar al juego.
 * Si algo falla cancela el envío y muestra el error.
 * @param  {EventObject} event Evento submit del formulario
 * @return {Boolean}
 */
function comprobarForm(event){
    let dificultadInput=document.querySelector('input[name="dificultad"]:checked');
    let tamanoInput=document.querySelector('input[name="tamano"]:checked');
    let nickTxt=nickInput.value.trim();
    let mensaje="";

    if(nickTxt.length==0){
        mensaje="Escribe tu nick de juego.";
        nickInput.focus();
    }else if(nickTxt.match(/^[0-9]/)){
        mensaje="El nick no puede empezar por un número.";
        nickInput.focus();
    }else if(nickTxt.length<3){
        mensaje="El nick debe tener al menos 3 caracteres.";
        nickInput.focus();
    }else if(dificultadInput==null){
        mensaje="Elige la dificultad del juego.";
    }else if(tamanoInput==null){
        mensaje="Elige el número de tarjetas.";
    }else if(artefactosSeleccionados.length==0){
        mensaje="Arrastra al menos un artefacto a tu cinturón.";
    }

    if(mensaje!=""){
        event.preventDefault();
        mostrarError(mensaje);
        return false;
    }

    //Todo correcto: guardamos en el localStorage y el formulario nos lleva a juego.html
    datosUsuario(nickInput,dificultadInput,tamanoInput,avatarCont,artefactosSeleccionados);
    return true;
}

/**
 * Muestra un mensaje de error con una pequeña sacudida
 * @param {String} mensaje
 */
function mostrarError(mensaje){
    error.innerText=mensaje;
    error.classList.remove("sacudir");
    void error.offsetWidth; //fuerza al navegador a reiniciar la animación
    error.classList.add("sacudir");
}

/* DRAG&DROP DEL AVATAR */

/**
 * Pinta los avatares disponibles (salen de AVATARES en datosJuego.js).
 * Si hay imagen se busca en img/avatares/; si no, se usa el avatar con iniciales (data-respaldo).
 */
function pintarAvatares(){
    let items="";
    for(let avatar of AVATARES){
        let respaldo=avatarIniciales(avatar.nombre,avatar.color);
        let src=srcImagen(CARPETA_AVATARES,avatar.imagen);
        let busqueda=src!=null ? `data-carpeta="${CARPETA_AVATARES}" data-archivo="${avatar.imagen}" data-intento="0"` : "";
        items+=`<img src="${src ?? respaldo}" alt="${avatar.nombre}" title="${avatar.nombre}" class="avatarImgItem"
                     draggable="true" tabindex="0" data-nombre="${avatar.nombre}" data-respaldo="${respaldo}" ${busqueda}>`;
    }
    document.getElementById("listaAvatares").innerHTML=items;
}

/**
 * Guarda el avatar que se empieza a arrastrar
 * @param {EventObject} event Evento dragstart
 */
function moviendoImg(event){
    itemImg=event.target;
    //Firefox necesita algún dato en el dataTransfer para empezar a arrastrar
    event.dataTransfer.setData("text/plain",itemImg.dataset.nombre);
}

/**
 * Cambia el avatar elegido por el que se soltó encima
 * @param {EventObject} event Evento drop
 */
function cambiarImg(event){
    event.preventDefault();
    avatarZona.classList.remove("sobre");
    if(itemImg!=null) elegirAvatar(itemImg);
}

/**
 * Pone como avatar del jugador la imagen recibida
 * (la usan el drop y el clic, así también funciona en el celular)
 * @param {HTMLElement} img imagen del avatar elegido
 */
function elegirAvatar(img){
    //Copiamos también los data-* por si su imagen todavía se está buscando
    for(let dato of ["nombre","respaldo","carpeta","archivo","intento"]){
        if(img.dataset[dato]!=undefined) avatarCont.dataset[dato]=img.dataset[dato];
        else delete avatarCont.dataset[dato];
    }
    avatarCont.src=img.getAttribute("src");
    avatarCont.alt="Avatar elegido: "+img.dataset.nombre;
    avatarNombre.innerText=img.dataset.nombre;
    for(let item of avatarItems){
        item.classList.toggle("elegido",item==img);
    }
}

/* DRAG&DROP DE LOS ARTEFACTOS */

/**
 * Pinta la lista de artefactos disponibles (salen de ARTEFACTOS en datosJuego.js)
 */
function pintarArtefactos(){
    let items="";
    for(let id in ARTEFACTOS){
        let artefacto=ARTEFACTOS[id];
        items+=`<div class="artefacto" data-id="${id}" draggable="true" tabindex="0" role="button" aria-pressed="false">
                    <span class="artefacto-dibujo" aria-hidden="true">${iconoArtefacto(id)}</span>
                    <span class="artefacto-texto">
                        <strong>${artefacto.nombre}</strong>
                        <small>${artefacto.descripcion}</small>
                    </span>
                </div>`;
    }
    document.getElementById("listaArtefactos").innerHTML=items;
}

/**
 * Guarda el artefacto que se empieza a arrastrar
 * @param {EventObject} event Evento dragstart
 */
function moviendoArtefacto(event){
    artefactoArrastrado=event.currentTarget.dataset.id;
    event.dataTransfer.setData("text/plain",artefactoArrastrado);
    event.dataTransfer.effectAllowed="move";
}

/**
 * Mete en el cinturón el artefacto que se soltó encima
 * @param {EventObject} event Evento drop
 */
function soltarArtefacto(event){
    event.preventDefault();
    cinturon.classList.remove("sobre");
    if(artefactoArrastrado!=null) anadirArtefacto(artefactoArrastrado);
}

/**
 * Añade un artefacto al cinturón si cabe
 * @param {String} id id del artefacto
 */
function anadirArtefacto(id){
    if(artefactosSeleccionados.includes(id)) return;
    if(artefactosSeleccionados.length>=MAX_ARTEFACTOS){
        mostrarError("Solo caben 2 artefactos. Toca uno del cinturón para quitarlo.");
        return;
    }
    artefactosSeleccionados.push(id);
    error.innerText="";
    pintarCinturon();
}

/**
 * Saca un artefacto del cinturón
 * @param {String} id id del artefacto
 */
function quitarArtefacto(id){
    artefactosSeleccionados=artefactosSeleccionados.filter(item=>item!=id);
    pintarCinturon();
}

/**
 * Con un clic: si el artefacto está en el cinturón lo quita y si no lo añade
 * @param {String} id id del artefacto
 */
function alternarArtefacto(id){
    if(artefactosSeleccionados.includes(id)) quitarArtefacto(id);
    else anadirArtefacto(id);
}

/**
 * Pinta las ranuras del cinturón y marca en la lista los artefactos ya elegidos
 */
function pintarCinturon(){
    let ranuras="";
    for(let i=0;i<MAX_ARTEFACTOS;i++){
        let id=artefactosSeleccionados[i];
        if(id){
            let artefacto=ARTEFACTOS[id];
            ranuras+=`<button type="button" class="ranura ranura-llena" data-id="${id}" title="Quitar ${artefacto.nombre}">
                          <span class="artefacto-dibujo" aria-hidden="true">${iconoArtefacto(id)}</span>
                          <span>${artefacto.nombre}</span>
                          <span class="quitar" aria-hidden="true">×</span>
                      </button>`;
        }else{
            ranuras+=`<div class="ranura">Ranura ${i+1}: suelta aquí</div>`;
        }
    }
    cinturon.innerHTML=ranuras;

    for(let item of document.querySelectorAll(".artefacto")){
        let elegido=artefactosSeleccionados.includes(item.dataset.id);
        item.classList.toggle("elegido",elegido);
        item.setAttribute("aria-pressed",elegido);
    }
}

/* DATOS GUARDADOS Y SALÓN DE LA FAMA */

/**
 * Si el jugador ya jugó antes, rellena el formulario con lo que hay en el localStorage
 */
function rellenarFormularioGuardado(){
    getDatosUsuario();
    if(!comprobacionDatosUsuario()) return;

    nickInput.value=nick;
    let radioDificultad=document.querySelector(`input[name="dificultad"][value="${dificultad}"]`);
    if(radioDificultad!=null) radioDificultad.checked=true;
    let radioTamano=document.querySelector(`input[name="tamano"][value="${tamano}"]`);
    if(radioTamano!=null) radioTamano.checked=true;
    for(let item of avatarItems){
        if(item.dataset.nombre==nombreAvatar) elegirAvatar(item);
    }
    artefactosSeleccionados=artefactosElegidos.filter(id=>ARTEFACTOS[id]!=undefined).slice(0,MAX_ARTEFACTOS);
}

/**
 * Pinta las 5 mejores partidas guardadas en el localStorage
 */
function pintarSalonFama(){
    let lista=document.getElementById("salonFama");
    let mejores=getMejoresPartidas(5);
    if(mejores.length==0){
        lista.innerHTML=`<li class="vacio">Aún no hay partidas. ¡Sé el primero en entrar!</li>`;
        return;
    }
    let items="";
    for(let partida of mejores){
        let nombreDificultad=DIFICULTADES[partida.dificultad] ? DIFICULTADES[partida.dificultad].nombre : "";
        let resultado=partida.resultado=="victoria" ? "victoria" : "derrota";
        items+=`<li>
                    <img src="${escaparHTML(partida.avatar)}" alt="" width="40" height="40">
                    <span>
                        <span class="fama-nick">${escaparHTML(partida.nick)}</span>
                        <span class="fama-detalle">${nombreDificultad} · ${partida.tamano} cartas · ${resultado}</span>
                    </span>
                    <strong class="fama-puntos">${partida.puntos}</strong>
                </li>`;
    }
    lista.innerHTML=items;
}

/* CARGA DEL DOM Y EVENTOS */

/**
 * Carga de objetos del DOM, comprobaciones y eventos del formulario
 */
function domCargado(){
    //Captura de todos los Elements
    nickInput=document.getElementById("nick");
    formEntrada=document.getElementById("formEntrada");
    error=document.getElementById("error");
    avatarCont=document.getElementById("avatarImg");
    avatarZona=document.getElementById("avatarZona");
    avatarNombre=document.getElementById("avatarNombre");
    avatarItems=document.getElementsByClassName("avatarImgItem");
    cinturon=document.getElementById("cinturon");

    //Comprobar si hay algún error que venga de juego.html
    if(sessionStorage.getItem("error")!=null){
        error.innerText=sessionStorage.getItem("error");
        sessionStorage.removeItem("error");
    }

    //Partes de la página que se generan con JS
    pintarAvatares();
    elegirAvatar(avatarItems[0]);
    pintarArtefactos();
    pintarLeyendaBombas("leyendaBombas");
    pintarSalonFama();
    rellenarFormularioGuardado();
    pintarCinturon();

    //Eventos del formulario
    formEntrada.addEventListener("submit",comprobarForm);
    nickInput.addEventListener("input",()=>error.innerText="");

    //Eventos del D&D del avatar
    for(let item of avatarItems){
        item.addEventListener("dragstart",moviendoImg);
        item.addEventListener("dragend",()=>{
            itemImg=null;
            avatarZona.classList.remove("sobre");
        });
        item.addEventListener("click",()=>elegirAvatar(item));
        item.addEventListener("keydown",event=>{
            if(event.key=="Enter" || event.key==" "){
                event.preventDefault();
                elegirAvatar(item);
            }
        });
    }
    avatarZona.addEventListener("dragover",event=>{
        //Sin preventDefault en dragover el navegador no deja soltar (no salta el drop)
        if(itemImg==null) return;
        event.preventDefault();
        avatarZona.classList.add("sobre");
    });
    avatarZona.addEventListener("dragleave",()=>avatarZona.classList.remove("sobre"));
    avatarZona.addEventListener("drop",cambiarImg);

    //Eventos del D&D de los artefactos
    for(let item of document.querySelectorAll(".artefacto")){
        item.addEventListener("dragstart",moviendoArtefacto);
        item.addEventListener("dragend",()=>{
            artefactoArrastrado=null;
            cinturon.classList.remove("sobre");
        });
        item.addEventListener("click",()=>alternarArtefacto(item.dataset.id));
        item.addEventListener("keydown",event=>{
            if(event.key=="Enter" || event.key==" "){
                event.preventDefault();
                alternarArtefacto(item.dataset.id);
            }
        });
    }
    cinturon.addEventListener("dragover",event=>{
        if(artefactoArrastrado==null) return;
        event.preventDefault();
        cinturon.classList.add("sobre");
    });
    cinturon.addEventListener("dragleave",event=>{
        if(!cinturon.contains(event.relatedTarget)) cinturon.classList.remove("sobre");
    });
    cinturon.addEventListener("drop",soltarArtefacto);
    //Clic en un artefacto del cinturón para quitarlo (delegación de eventos)
    cinturon.addEventListener("click",event=>{
        let boton=event.target.closest(".ranura-llena");
        if(boton!=null) quitarArtefacto(boton.dataset.id);
    });
}

//Inicio de carga de eventos
document.addEventListener("DOMContentLoaded",domCargado);
