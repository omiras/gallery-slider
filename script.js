"use strict"; // Previene algunos fallos https://developer.mozilla.org/es/docs/Web/JavaScript/Referencia/Modo_estricto

const pictures = ["casa1.jpg", "casa2.jpg", "casa3.jpg", "casa4.jpg", "casa5.jpg", "casa6.jpg", "casa7.jpg", "casa8.jpg"];
var picturesGaleria = []; // Las fotos que 
const pathToImages = "img/"; // Es practica habitual tener el directorio donde van las fotos en una variable, y en general, cualquier ruta. ¿Qué pasa si el dia de mañana quiero cambiar la ruta donde están mis fotos? ¿Tengo que ir a CADA linea de código y cambiarlo ahí?
const closeAxisFileName = "borrar.png"; // Como se llama el fichero que contiene la foto con la  cruz de borrar ?
const localStorageVariable = "loadedPhotos"; // La variable del LocalStorage en la que voy a guardar el array de fotos

function loadGallery() {


    // La idea es siempre cargar TODAS las fotos en la FOTOTECA. 
    pictures.forEach(filename => {
        let newImg = createImgFototeca(filename);
        fototeca.appendChild(newImg);
    });


    let storedInFototeca = loadFromLocalStorage();

    // Luego, veremos si tenemos fotos guardadas en el LocalStorage, y subiremos esas mismas a la Galeria. Es más costoso que poner unas en la Fototeca y otras en la Galeria? Sí; pero también simplifica el código. Como siempre, esto es un compromiso enre facilidad de código y eficacia. Si tuvieramos 100000 fotos, esta aproximación no seria viable. 
    if (storedInFototeca) {
        storedInFototeca.forEach(filename => {
            moveToFototeca(filename);
        });
    }

}


// Esta función, dado un nombre de fichero, crea una nueva foto en la fototeca
function createImgFototeca(filename) {
    let newImg = document.createElement('IMG');
    newImg.src = pathToImages + filename; // Esto seria como hacer 'img/casa1', por ejemplo.
    newImg.setAttribute("filename", filename); // Esto es un punto clave. Creamos una nueva propeidad llamada 'filename', que va a ser el nombre del fichero que identifica esa foto. Es único, puesto que como solo operamos en un directorio, todos los ficheros dicho directorio deben tener un nombre diferenbte.
    newImg.addEventListener('dblclick', eventMoveToFototeca);

    return newImg;
}

// Esta función se encarga de mover la foto identificada por 'filename' a la fototeca.
function moveToFototeca(filename) {
    let divContainer = createContainerImg();
    galeria.appendChild(divContainer);

    let newImg = document.createElement('IMG');
    newImg.src = pathToImages + filename;

    newImg.setAttribute("filename", filename);
    divContainer.appendChild(newImg);

    divContainer.addEventListener("click", showModal);

    let closeAxis = createCloseAxis();
    divContainer.appendChild(closeAxis);

    // La foto que teniamos en la Fototeca la eliminamos. Así, ya no podrás ser seleccionada.
    let movedImage = document.querySelector(`#fototeca img[filename="${filename}"]`);
    movedImage.remove();

    // Añadimos e
    storeInLocalStorage(filename, "add");
}

// Función auxiliar para quitar un elemento de un array
function arrayRemove(arr, value) { return arr.filter(function (ele) { return ele != value; }); }

// función que enlaza el objeto tipo evento con la función genñerica para mover una foto a la fototeca. La idea es que la función 'moveToFototeca' tan solo reciba un parámetro simle, esto es, un nombre de archivo. De esta manera, 'moveToFototeca' puede ser reutilizada en varios contextos. 

function eventMoveToFototeca(event) {
    moveToFototeca(event.target.getAttribute("filename"));
}

function createContainerImg() {
    let divImg = document.createElement('DIV');
    divImg.classList.add("imgContainer");
    return divImg;
}

function createCloseAxis() {
    let closeAxis = document.createElement('IMG');
    closeAxis.classList.add("closeAxis");
    closeAxis.src = pathToImages + closeAxisFileName;
    closeAxis.onclick = function (event) {

        // Eliminamos la foto de la galeria y evitamos que el evento click 'burbujee' hacia arriba en el árbol DOM. Si no lo hicieramos, la foto de la galeria capturaría el evento click; y entonces abriría el lightbox
        this.parentNode.remove();
        event.stopPropagation();

        // Devolvemos la foto a la fototeca. Sabemos que el nodo que contiene el nombre del fichero que queremos devolver a la fototeca, es justametne su hermano  anterior, es decir, su 'previousSibling'
        fototeca.appendChild(createImgFototeca(this.previousSibling.getAttribute("filename")));
        // Borramos la foto del localStorage y del array de fotos en fototeca
        storeInLocalStorage(this.previousSibling.getAttribute("filename"));
    };

    return closeAxis;
}

// recuperar las fotos del localStorage
function loadFromLocalStorage() {
    return JSON.parse(localStorage.getItem(localStorageVariable));
}

// Guardamos la foto identificada por 'filename' en el localStorage. Si operation=='add', la añadimos, en caso contrario, la eliminamos
function storeInLocalStorage(filename, operation) {

    if (operation == "add") {
        picturesGaleria.push(filename);
    }

    else {
        let i = picturesGaleria.indexOf(filename);
        picturesGaleria = arrayRemove(picturesGaleria, filename);
    }

    localStorage.setItem(localStorageVariable, JSON.stringify(picturesGaleria));
}

// Mostramos la ventana modal
function showModal(event) {
    imagen_lightbox.src = event.target.src;
    imagen_lightbox.setAttribute('filename', event.target.getAttribute('filename'));
    lightbox.classList.add("show");
    document.querySelector('body').onclick = closeModal;
    event.stopPropagation();
}

// Cerramos la ventana modal
function closeModal(event) {
    if (event.target != imagen_lightbox) {
        document.querySelector('body').onclick = undefined;
        lightbox.classList.remove("show");
    }

}

// Función que selecciona la siguiente foto de la ventana modal
function selectNextModalPhoto(direction, event) {

    event.stopPropagation();
    var currentModalPhotoPosition = picturesGaleria.indexOf(imagen_lightbox.getAttribute('filename'));
    var nextPhotoPosition;

    if (direction == "forward") {
        nextPhotoPosition = (currentModalPhotoPosition + 1 == picturesGaleria.length) ? 0 : currentModalPhotoPosition + 1;
    }

    else {
        nextPhotoPosition = (currentModalPhotoPosition - 1 == -1) ? picturesGaleria.length - 1 : currentModalPhotoPosition - 1;
    }

    imagen_lightbox.src = pathToImages + picturesGaleria[nextPhotoPosition];
    imagen_lightbox.setAttribute('filename', picturesGaleria[nextPhotoPosition]);
}

loadGallery();