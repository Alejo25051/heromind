/*
 * Datos del juego HeroMind
 * Personajes, avatares, dificultades, composición del tablero, artefactos y cartas trampa.
 * Se carga en index.html y en juego.html, por eso aquí también van
 * las funciones de ayuda que usan las dos páginas.
 */

/* IMÁGENES (CARTAS, AVATARES, ARTEFACTOS Y TRAMPAS) */

/**
 * Carpetas de las imágenes. Cada archivo se llama como el valor "imagen"
 * de PAREJAS, AVATARES, ARTEFACTOS o BOMBAS (por ejemplo img/personajes/spider-man.webp).
 * Las extensiones se prueban en este orden; si no aparece ningún archivo,
 * se muestran las iniciales del nombre (o el avatar con iniciales).
 * Con USAR_IMAGENES en false el juego usa solo las iniciales.
 */
const USAR_IMAGENES=true;
const CARPETA_PERSONAJES="img/personajes/";
const CARPETA_AVATARES="img/avatares/";
const CARPETA_ARTEFACTOS="img/artefactos/";
const CARPETA_TRAMPAS="img/trampas/";
const EXTENSIONES_IMAGEN=[".webp",".png",".jpg",".jpeg"];

/* PERSONAJES DE LAS CARTAS */

/**
 * Parejas héroe ↔ archienemigo. En cada partida se eligen al azar las que hagan falta (hasta 10).
 * "imagen" es el nombre del archivo SIN extensión (en minúsculas y sin espacios).
 */
const PAREJAS=[
    {id:"spider-man",       heroe:{nombre:"Spider-Man",       imagen:"spider-man"},       villano:{nombre:"Green Goblin",    imagen:"green-goblin"}},
    {id:"iron-man",         heroe:{nombre:"Iron Man",         imagen:"iron-man"},         villano:{nombre:"Ultron",          imagen:"ultron"}},
    {id:"captain-america",  heroe:{nombre:"Captain America",  imagen:"captain-america"},  villano:{nombre:"Red Skull",       imagen:"red-skull"}},
    {id:"thor",             heroe:{nombre:"Thor",             imagen:"thor"},             villano:{nombre:"Loki",            imagen:"loki"}},
    {id:"hulk",             heroe:{nombre:"Hulk",             imagen:"hulk"},             villano:{nombre:"Abomination",     imagen:"abomination"}},
    {id:"doctor-strange",   heroe:{nombre:"Doctor Strange",   imagen:"doctor-strange"},   villano:{nombre:"Dormammu",        imagen:"dormammu"}},
    {id:"black-panther",    heroe:{nombre:"Black Panther",    imagen:"black-panther"},    villano:{nombre:"Killmonger",      imagen:"killmonger"}},
    {id:"professor-x",      heroe:{nombre:"Professor X",      imagen:"professor-x"},      villano:{nombre:"Magneto",         imagen:"magneto"}},
    {id:"mister-fantastic", heroe:{nombre:"Mister Fantastic", imagen:"mister-fantastic"}, villano:{nombre:"Doctor Doom",     imagen:"doctor-doom"}},
    {id:"daredevil",        heroe:{nombre:"Daredevil",        imagen:"daredevil"},        villano:{nombre:"Kingpin",         imagen:"kingpin"}},
    {id:"wolverine",        heroe:{nombre:"Wolverine",        imagen:"wolverine"},        villano:{nombre:"Sabretooth",      imagen:"sabretooth"}},
    {id:"rogue",            heroe:{nombre:"Rogue",            imagen:"rogue"},            villano:{nombre:"Mystique",        imagen:"mystique"}},
    {id:"gambit",           heroe:{nombre:"Gambit",           imagen:"gambit"},           villano:{nombre:"Mister Sinister", imagen:"mister-sinister"}},
    {id:"gamora",           heroe:{nombre:"Gamora",           imagen:"gamora"},           villano:{nombre:"Thanos",          imagen:"thanos"}},
    {id:"venom",            heroe:{nombre:"Venom",            imagen:"venom"},            villano:{nombre:"Carnage",         imagen:"carnage"}},
    {id:"silver-surfer",    heroe:{nombre:"Silver Surfer",    imagen:"silver-surfer"},    villano:{nombre:"Galactus",        imagen:"galactus"}}
];

/* AVATARES DEL JUGADOR */

/**
 * Avatares que se pueden elegir en index.html.
 * "color" es el fondo del avatar con iniciales que se usa si no se encuentra su imagen.
 */
const AVATARES=[
    {nombre:"Spider-Man",      imagen:"spider-man",      color:"#d62839"},
    {nombre:"Iron Man",        imagen:"iron-man",        color:"#b8860b"},
    {nombre:"Captain America", imagen:"captain-america", color:"#1f6feb"},
    {nombre:"Thor",            imagen:"thor",            color:"#5a6b7d"},
    {nombre:"Black Widow",     imagen:"black-widow",     color:"#26262e"},
    {nombre:"Wolverine",       imagen:"wolverine",       color:"#d99a00"},
    {nombre:"Deadpool",        imagen:"deadpool",        color:"#8b1a1a"},
    {nombre:"Thanos",          imagen:"thanos",          color:"#6a1b9a"}
];

/* DIFICULTADES */

/**
 * tiempoVisible: milisegundos que se ven dos cartas que no son pareja
 * multiplicadorTiradas: tiradas que tienes por cada pareja del tablero
 * multiplicadorPuntos: multiplica los puntos de cada pareja
 */
const DIFICULTADES={
    baja:  {nombre:"Baja",  tiempoVisible:1500, multiplicadorTiradas:3,   multiplicadorPuntos:1},
    media: {nombre:"Media", tiempoVisible:1000, multiplicadorTiradas:2.5, multiplicadorPuntos:1.5},
    alta:  {nombre:"Alta",  tiempoVisible:600,  multiplicadorTiradas:2,   multiplicadorPuntos:2}
};

/* COMPOSICIÓN DEL TABLERO */

/**
 * Cuántas parejas y cartas trampa hay según el número de tarjetas.
 * Como 9 y 25 son impares, las cartas trampa completan el tablero.
 * Las claves muerte, teseracto y guante coinciden con las de BOMBAS.
 */
const COMPOSICION={
    9:  {parejas:3,  muerte:2, teseracto:1, guante:0},
    16: {parejas:6,  muerte:2, teseracto:1, guante:1},
    25: {parejas:10, muerte:2, teseracto:2, guante:1}
};

/* ARTEFACTOS (el jugador elige 1 o 2 en la página de entrada) */

const ARTEFACTOS={
    ojo:    {nombre:"Eye of Agamotto",  imagen:"eye-of-agamotto",  tipo:"activo", descripcion:"Destapa todas las cartas un instante."},
    radar:  {nombre:"Cerebro",          imagen:"cerebro",          tipo:"activo", descripcion:"Encuentra y destapa una pareja."},
    gema:   {nombre:"Time Stone",       imagen:"time-stone",       tipo:"activo", valor:5, descripcion:"Suma 5 tiradas extra."},
    escudo: {nombre:"Vibranium Shield", imagen:"vibranium-shield", tipo:"pasivo", descripcion:"Te salva una vez de Lady Death."}
};

/* CARTAS TRAMPA (BOMBAS) */

/**
 * muerte: hay dos cartas; si salen en la misma tirada se pierde la partida
 * teseracto: el Tesseract baraja las cartas que siguen boca abajo
 * guante: el chasquido de Thanos con el Infinity Gauntlet quita tiradas (valor)
 */
const BOMBAS={
    muerte:    {nombre:"Lady Death",          imagen:"lady-death",          efectoCorto:"¡No juntes dos!",     descripcion:"hay dos; si destapas las dos en la misma tirada, pierdes la partida."},
    teseracto: {nombre:"Tesseract",           imagen:"tesseract",           efectoCorto:"Teletransporta",      descripcion:"al destaparlo, todas las cartas boca abajo cambian de sitio."},
    guante:    {nombre:"Infinity Gauntlet",   imagen:"infinity-gauntlet",   efectoCorto:"Chasquido: −3 tiradas", valor:3, descripcion:"Thanos chasquea los dedos y pierdes 3 tiradas."}
};

/* FUNCIONES DE AYUDA */

/**
 * Devuelve un número entero aleatorio entre 0 y max (sin incluir max)
 * https://developer.mozilla.org/es/docs/Web/JavaScript/Reference/Global_Objects/Math/random
 * @param  {Number} max
 * @return {Number}
 */
function getRandomInt(max){
    return Math.floor(Math.random()*max);
}

/**
 * Baraja un array con el algoritmo de Fisher-Yates (modifica y devuelve el mismo array)
 * @param  {Array} array
 * @return {Array}
 */
function barajar(array){
    for(let i=array.length-1;i>0;i--){
        let j=getRandomInt(i+1);
        [array[i],array[j]]=[array[j],array[i]];
    }
    return array;
}

/**
 * Devuelve las iniciales de un nombre ("Doctor Strange" → "DS", "Spider-Man" → "SM")
 * @param  {String} nombre
 * @return {String}
 */
function iniciales(nombre){
    let palabras=nombre.split(/[\s-]+/).filter(palabra=>palabra.length>0 && palabra[0]==palabra[0].toUpperCase());
    return palabras.slice(0,2).map(palabra=>palabra[0]).join("");
}

/**
 * Escapa un texto para pintarlo con innerHTML sin riesgo (el nick lo escribe el jugador)
 * @param  {String} texto
 * @return {String}
 */
function escaparHTML(texto){
    let div=document.createElement("div");
    div.textContent=texto;
    return div.innerHTML;
}

/**
 * Dibujo de un artefacto: su imagen de img/artefactos/ o, si no hay, sus iniciales
 * @param  {String} id id del artefacto (clave de ARTEFACTOS)
 * @return {String}
 */
function iconoArtefacto(id){
    let artefacto=ARTEFACTOS[id];
    return imagenConRespaldo(CARPETA_ARTEFACTOS,artefacto.imagen,"artefacto-img","artefacto-icono",iniciales(artefacto.nombre));
}

/**
 * Pinta la leyenda de cartas trampa dentro de la lista indicada
 * @param {String} idLista id del <ul> donde se pinta
 */
function pintarLeyendaBombas(idLista){
    let items="";
    for(let id in BOMBAS){
        let bomba=BOMBAS[id];
        items+=`<li>
                    <span class="leyenda-dibujo" aria-hidden="true">${imagenConRespaldo(CARPETA_TRAMPAS,bomba.imagen,"leyenda-img","leyenda-icono",iniciales(bomba.nombre))}</span>
                    <span><strong>${bomba.nombre}:</strong> ${bomba.descripcion}</span>
                </li>`;
    }
    document.getElementById(idLista).innerHTML=items;
}

/* BÚSQUEDA DE IMÁGENES CON VARIAS EXTENSIONES */

//Imágenes ya buscadas: ruta sin extensión → ruta encontrada ("" si no existe)
var rutasImagen={};

/**
 * Devuelve la ruta con la que empezar a buscar una imagen,
 * o null si no se usan imágenes o ya se sabe que no existe
 * @param  {String} carpeta carpeta de la imagen (con / al final)
 * @param  {String} archivo nombre del archivo sin extensión
 * @return {String|null}
 */
function srcImagen(carpeta,archivo){
    if(!USAR_IMAGENES || !archivo) return null;
    let base=carpeta+archivo;
    if(rutasImagen[base]==="") return null;
    //Si ya se encontró antes usamos esa ruta; si no, empezamos por la primera extensión
    return rutasImagen[base] ?? base+EXTENSIONES_IMAGEN[0];
}

/**
 * HTML de una imagen que, si su archivo no existe, se cambia por un texto
 * (las iniciales del personaje, artefacto o trampa)
 * @param  {String} carpeta carpeta de la imagen (con / al final)
 * @param  {String} archivo nombre del archivo sin extensión
 * @param  {String} claseImg clase CSS de la imagen
 * @param  {String} claseRespaldo clase CSS del texto que la reemplaza
 * @param  {String} textoRespaldo texto que la reemplaza
 * @return {String}
 */
function imagenConRespaldo(carpeta,archivo,claseImg,claseRespaldo,textoRespaldo){
    let src=srcImagen(carpeta,archivo);
    if(src==null){
        return `<span class="${claseRespaldo}">${textoRespaldo}</span>`;
    }
    //Si el archivo no existe, imagenNoEncontrada prueba otras extensiones o pone el texto
    return `<img src="${src}" alt="" class="${claseImg}" draggable="false"
                 data-carpeta="${carpeta}" data-archivo="${archivo}" data-intento="0"
                 data-clase-respaldo="${claseRespaldo}" data-texto-respaldo="${textoRespaldo}">`;
}

/**
 * Avatar con las iniciales del personaje, generado como imagen SVG.
 * Se usa si no se encuentra la imagen de ese avatar.
 * @param  {String} nombre nombre del personaje
 * @param  {String} color color de fondo
 * @return {String} imagen en formato data URI (sirve como src de un <img>)
 */
function avatarIniciales(nombre,color){
    let svg=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120">
                <circle cx="60" cy="60" r="56" fill="${color}" stroke="#0b0b12" stroke-width="6"/>
                <circle cx="60" cy="60" r="44" fill="none" stroke="#ffffff" stroke-opacity="0.35" stroke-width="3"/>
                <text x="60" y="62" text-anchor="middle" dominant-baseline="middle" font-family="Impact, Arial Black, sans-serif"
                      font-size="42" fill="#ffffff" stroke="#0b0b12" stroke-width="3" paint-order="stroke">${iniciales(nombre)}</text>
             </svg>`;
    //Quitamos los espacios de sobra para que ocupe menos en el localStorage
    return "data:image/svg+xml,"+encodeURIComponent(svg.replace(/\s+/g," "));
}

/**
 * Si una imagen no existe prueba la siguiente extensión. Cuando no queda ninguna:
 *  - si tiene texto de respaldo (cartas, artefactos, trampas) la cambia por ese texto
 *  - si no (avatares) pone la imagen de respaldo (data-respaldo, el avatar con iniciales)
 * @param {EventObject} event Evento error de una imagen
 */
function imagenNoEncontrada(event){
    let img=event.target;
    if(!(img instanceof HTMLImageElement) || img.dataset.archivo==undefined) return;

    let base=img.dataset.carpeta+img.dataset.archivo;
    let intento=parseInt(img.dataset.intento || "0")+1;
    if(intento<EXTENSIONES_IMAGEN.length){
        img.dataset.intento=intento;
        img.src=base+EXTENSIONES_IMAGEN[intento];
        return;
    }

    //Ninguna extensión funcionó: lo apuntamos para no volver a buscarlo
    rutasImagen[base]="";
    if(img.dataset.textoRespaldo!=undefined){
        let cara=img.closest(".cara-frontal");
        let span=document.createElement("span");
        span.className=img.dataset.claseRespaldo;
        span.textContent=img.dataset.textoRespaldo;
        img.replaceWith(span);
        if(cara!=null) cara.classList.remove("con-imagen");
    }else{
        delete img.dataset.archivo;
        img.src=img.dataset.respaldo;
    }
}

/**
 * Apunta la ruta de una imagen que cargó bien, para no repetir la búsqueda
 * @param {EventObject} event Evento load de una imagen
 */
function imagenCargada(event){
    let img=event.target;
    if(img instanceof HTMLImageElement && img.dataset.archivo!=undefined){
        rutasImagen[img.dataset.carpeta+img.dataset.archivo]=img.getAttribute("src");
    }
}

//Los eventos load y error de las imágenes no suben (no burbujean),
//por eso se escuchan en el documento en fase de captura (tercer parámetro true)
document.addEventListener("error",imagenNoEncontrada,true);
document.addEventListener("load",imagenCargada,true);
