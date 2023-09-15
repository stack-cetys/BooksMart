console.log('oh hi')

const defaultImage = 'img/orange.png'

const form = document.querySelector('#searchForm')
const form2 = document.querySelector('#searchForm2')

let container = false; //Esta determina a cual cointenedor va a ir la tarjeta generada

const maxTitleLength = 8; // Define el máximo número de caracteres
const maxAuthorLength = 10; // Define el máximo número de caracteres para el nombre de autor

const alertDiv = document.createElement('div');
alertDiv.classList.add('alert', 'alert-primary');
alertDiv.setAttribute('role', 'alert');
alertDiv.textContent = "Libro Agregado!";


function clearCards() {
    
    const haveBody = document.getElementById('haveBody');
    const cardElements = haveBody.querySelectorAll('.card');
    
    cardElements.forEach(card => {
        haveBody.removeChild(card);
    });
}


function createCard(title, author, year, image) {

    const truncatedTitle = title.length > maxTitleLength ? title.substring(0, maxTitleLength) + '...' : title;
    const truncatedAuthors = author.length > maxAuthorLength ? author.substring(0, maxAuthorLength) + '...' : author; 
    console.log(truncatedAuthors)

    const cardDiv = document.createElement('div');
    cardDiv.classList.add('card', 'mb-3', 'bg-transparent', 'border-light');
    cardDiv.style.maxWidth = '340px';

    const rowDiv = document.createElement('div');
    rowDiv.classList.add('row', 'g-0');

    const colDiv1 = document.createElement('div');
    colDiv1.classList.add('col-md-6');

    const img = document.createElement('img');
    img.src = image; // Agrega la fuente real de la imagen
    img.classList.add('img-fluid', 'rounded-start');
    img.alt = '...';

    const colDiv2 = document.createElement('div');
    colDiv2.classList.add('col-md-6');

    const cardBodyDiv = document.createElement('div');
    cardBodyDiv.classList.add('card-body');

    const cardTitle = document.createElement('h5');
    cardTitle.classList.add('card-title');
    cardTitle.textContent = truncatedTitle; // Agrega el título real de la tarjeta

    const cardText1 = document.createElement('p');
    cardText1.classList.add('card-text');
    cardText1.textContent = truncatedAuthors;

    const cardText2 = document.createElement('p');
    cardText2.classList.add('card-text');

    const smallText = document.createElement('p');
    smallText.classList.add('text-body-secondary');
    smallText.textContent = year; // Agrega la marca de tiempo real

    cardDiv.appendChild(rowDiv);
    rowDiv.appendChild(colDiv1);
    colDiv1.appendChild(img);
    rowDiv.appendChild(colDiv2);
    colDiv2.appendChild(cardBodyDiv);
    cardBodyDiv.appendChild(cardTitle);
    cardBodyDiv.appendChild(cardText1);
    cardText2.appendChild(smallText);
    cardBodyDiv.appendChild(cardText2);

    // Agregar los botones 
    const button1 = document.createElement('button');
    button1.classList.add('btn', 'btn-primary', 'me-2');
    button1.textContent = 'Agregar';


    cardBodyDiv.appendChild(button1);
    
    let body = returnBody()
    console.log("body", body)
    
    body.appendChild(cardDiv); // Append the new card to the offcanvas body
    
    button1.addEventListener('click', () => {
        console.log("HIIIIIIIIIIIIIII"); // Add the card to the main body when Button 1 is clicked
        // document.body.append(cardDiv)
        createFullCard(title, author, year, image);
        const firstChild = body.firstChild;

    // Insertar el elemento de alerta antes del primer hijo
    body.insertBefore(alertDiv, firstChild);

    // Establecer un temporizador para quitar la alerta después de 2 segundos
    setTimeout(() => {
        alertDiv.remove(); // Quitar la alerta del DOM
    }, 1000);
    });
}

function returnBody() {
    let body;
    if (!container) {
        body = document.getElementById('haveBody'); // Retrieve the offcanvas body with ID 'haveBody'
    } else {
        body = document.getElementById('wantBody'); // Retrieve the offcanvas body with ID 'wantBody'
    }
    return body;
}

function returnContainer() {
    let body;
    if (!container) {
        body = document.getElementById('haveContainer'); // Retrieve the offcanvas body with ID 'haveBody'
    } else {
        body = document.getElementById('wantContainer'); // Retrieve the offcanvas body with ID 'wantBody'
    }
    return body;
}

// version sin reducciones que va en el body
function createFullCard(title, author, year, image) {
    const cardDiv = document.createElement('div');
    cardDiv.classList.add('card', 'mb-3', 'my-0', 'border-light', 'custom-card'); // Add 'custom-card' class
    cardDiv.style.maxWidth = '240px';
    cardDiv.style.minWidth = '240px';   

    const rowDiv = document.createElement('div');
    rowDiv.classList.add('row', 'g-0');

    const colDiv1 = document.createElement('div');
    colDiv1.classList.add('col-md-6');

    const img = document.createElement('img');
    img.src = image;
    img.classList.add('img-fluid', 'rounded-start');
    img.alt = '...';

    const colDiv2 = document.createElement('div');
    colDiv2.classList.add('col-md-6');

    const cardBodyDiv = document.createElement('div');
    cardBodyDiv.classList.add('card-body');

    const cardTitle = document.createElement('h5');
    cardTitle.classList.add('card-title', 'text-danger-emphasis');
    cardTitle.textContent = title;

    const cardText1 = document.createElement('p');
    cardText1.classList.add('card-text', 'text-black-50');
    cardText1.textContent = author;

    const cardText2 = document.createElement('p');
    cardText2.classList.add('card-text');

    const smallText = document.createElement('p');
    smallText.classList.add('card-text', 'text-black-50');
    smallText.textContent = year;

    cardDiv.appendChild(rowDiv);
    rowDiv.appendChild(colDiv1);
    colDiv1.appendChild(img);
    rowDiv.appendChild(colDiv2);
    colDiv2.appendChild(cardBodyDiv);
    cardBodyDiv.appendChild(cardTitle);
    cardBodyDiv.appendChild(cardText1);
    cardText2.appendChild(smallText);
    cardBodyDiv.appendChild(cardText2);

    let cont = returnContainer();
    // haveBody.appendChild(cardDiv);

    cont.appendChild(cardDiv)
    
    

}


document.addEventListener('DOMContentLoaded', function() {
    const crearCardBtn = document.getElementById('crearCardBtn');

    crearCardBtn.addEventListener('click', function() {
        const titulo = document.getElementById('tituloInput').value;
        const autor = document.getElementById('autorInput').value;
        const ano = document.getElementById('anoInput').value;
        const inputArchivo = document.getElementById('inputGroupFile03');
        const archivo = inputArchivo.files[0]; // Obtener el archivo del input
        const imagen = archivo ? URL.createObjectURL(archivo) : defaultImage; // Si hay archivo, usarlo; de lo contrario, usar defaultImage
        container = false
        createFullCard(titulo, autor, ano, imagen);
    });
});




// // Llamar a la función para crear la tarjeta
// // createCard('One Piece', 'Goda', 1999);
createFullCard('Ejemplo ', 'Autor ', '2023', defaultImage);
createFullCard('Ejemplo ', 'Autor ', '2023', defaultImage);
// createFullCard('Título de ejemplo', 'Autor super mega largo muy largo que se recortará', '2023', defaultImage);
// createFullCard('Título de ejemplo', 'Autor super mega largo muy largo que se recortará', '2023', defaultImage);

async function fetchAndDisplaySearchResults(query) {
    const resp = await axios.get(`https://openlibrary.org/search.json?q=${query}`);
    displaySearch(resp.data.docs);
}

form.addEventListener('submit', async function(e){
    e.preventDefault();
    container = false; //Have
    const search = form.elements.query.value;
    clearCards();
    await fetchAndDisplaySearchResults(search);
    form.elements.query.value = '';
});

form2.addEventListener('submit', async function(e){
    e.preventDefault();
    container = true; //Want
    const search = form2.elements.query.value;
    clearCards();
    await fetchAndDisplaySearchResults(search);
    form2.elements.query.value = '';
});


const displaySearch = async function (books){
    for (let i=0; i<5; i++){
        const book = books[i]
            let years = book.publish_year
            let lastYear = years[years.length - 1]
            // Fetch the image URL using axios
            try {
                // Fetch the image URL using axios
                const imageResponse = await axios.get(`https://covers.openlibrary.org/b/isbn/${book.isbn[0]}-M.jpg?default=false`);
                
                console.log(i, book.title)
                // Call createCard function with all the necessary arguments including the image URL
                createCard(book.title, book.author_name[0], lastYear, imageResponse.config.url);
            } catch (error) {
                // Handle errors when fetching images
                console.log("Error fetching image:");
    
                // Use a local placeholder image when the remote image is not available
                createCard(book.title, book.author_name[0], lastYear, defaultImage);
            }
    }
}



