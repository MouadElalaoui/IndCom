


// la yonsa7o bih li a9al mn 100 sana 




// Données des philosophes
const philosopherData = {
socrate: {
    name: "Socrate",
    period: "470-399 av. J.-C.",
    image: "/api/placeholder/400/300"
},
platon: {
    name: "Platon",
    period: "428-348 av. J.-C.",
    image: "/api/placeholder/400/300"
},
// ... Je dois ajouter les autres philosophes
};

// Données des citations de secours (si Firebase échoue)
const fallbackQuotes = [
{
    id: "1",
    text: "Je sais que je ne sais rien.",
    author: "Socrate",
    philosopher: "socrate",
    tags: ["connaissance", "sagesse"],
    period: "Antiquité"
},
// ... ajoutez d'autres citations de secours pour montrer des citations en cas de panne de Firebase
];

// Etat global
let app = {
db: null,
allQuotes: [],//hadi katstocki ga3 les donnes li jayin mn firebase
loading: false,//mli kaykon le chargement des donnes katkon True , si non katkon False
currentFilter: null//katstocki lfiltre li kaykon actif 
};        

// Gestion du chargement
function setLoading(isLoading) {
const loadingOverlay = document.querySelector('.loading-overlay');
if (isLoading) {
    loadingOverlay.classList.add('active');
} else {
    loadingOverlay.classList.remove('active');
}
app.loading = isLoading;// updates l'etat global dial l'app
}

// Chargement des citations
async function loadQuotes() {
setLoading(true);
try {
    if (app.db) {//kanverifiw wach firebase est initialise 
        const snapshot = await app.db.collection('quotes').get();//kana5do ga3 dok les citations li kaynin f la collection quotes
        app.allQuotes = snapshot.docs.map(doc => ({//kan7wlo les documents mn firebase l js 
            id: doc.id,//ajouter le id 
            ...doc.data()
        }));
    }
    
    if (!app.allQuotes.length) {//lamal9a ta chi citation ---> bruh ---> 5dm bles citations dial secours ;)
        app.allQuotes = fallbackQuotes;
    }
    
    displayQuotes();//triviale
} catch (error) {
    console.error("Erreur de chargement des citations: contactez Mouad ^^ ", error);
    app.allQuotes = fallbackQuotes;// la kant chi error i5dm bdial secours
    displayQuotes();
} finally {
    setLoading(false);// cacher le loading screen
}
}

// Création d'une carte de citation
function createQuoteCard(quote) {
const philosopher = philosopherData[quote.philosopher] || {};
return `
    <div class="quote-card" data-id="${quote.id}">
        <div class="quote-image-container">
            <img src="${quote.imageUrl || philosopher.image || '/api/placeholder/400/300'}" 
                    alt="${quote.author}"
                    class="quote-image"
                    onerror="this.src='/api/placeholder/400/300'">
            <div class="quote-overlay"></div>
            <div class="philosopher-info">
                <div class="philosopher-name">${quote.author}</div>
                <div class="philosopher-period">${philosopher.period || quote.period}</div>
            </div>
        </div>
        <div class="quote-content">
            <p class="quote-text">"${quote.text}"</p>
            <div class="quote-meta">
                <div class="quote-tags">
                    ${(quote.tags || []).map(tag => `
                        <span class="tag">${tag}</span>
                    `).join('')}
                </div>
                <div class="quote-actions">
                    <button class="action-button share-quote" 
                            onclick="shareQuote('${quote.id}')"
                            title="Partager">
                        <i class="fas fa-share-alt"></i>
                    </button>
                    <button class="action-button favorite-quote" 
                            onclick="toggleFavorite('${quote.id}')"
                            title="Favoris">
                        <i class="far fa-heart"></i>
                    </button>
                </div>
            </div>
        </div>
    </div>
`;
}

// Affichage des citations
function displayQuotes(filterFn = null) {
const container = document.getElementById('quotesContainer');// kanrecuperiw lcontainer li ghan7to fih les citations
let quotes = app.allQuotes;//kana5do les citations

//kanapplikiw le filtre lakan chi filtre
if (filterFn) {
    quotes = quotes.filter(filterFn);
}

//kancreyiw les cartes dial les citations
container.innerHTML = quotes.map(createQuoteCard).join('');
}

// Fonctions de partage et favoris
async function shareQuote(id) {//kana5do la citation 3la 7sab l id dialha
const quote = app.allQuotes.find(q => q.id === id);
if (quote) {
    try {//Web share API
        await navigator.share({
            title: 'Citation Philosophique',
            text: `"${quote.text}" - ${quote.author}`,
            url: window.location.href
        });
    } catch (err) {
        console.log('Partage non supporté T_T', err);
    }
}
}

function toggleFavorite(id) {
const button = document.querySelector(`.quote-card[data-id="${id}"] .favorite-quote i`);
button.classList.toggle('far');// ICONE 5AWYA 
button.classList.toggle('fas');// ICONE 3AMRA
// TODO: Ajouter la logique de sauvegarde des favoris WAAAAAAAAAAAAAAAA CH7AL BA9I BRUUUH 
}

// Gestionnaires d'événements
function setupEventListeners() {
// Recherche
const searchInput = document.querySelector('.search-input');
searchInput.addEventListener('input', (e) => {
    const term = e.target.value.toLowerCase();
    displayQuotes(quote => 
        quote.text.toLowerCase().includes(term) ||
        quote.author.toLowerCase().includes(term) ||
        (quote.tags || []).some(tag => tag.toLowerCase().includes(term))
    );
});
// Preuve : Facile 

// Filtres de période
document.querySelectorAll('.filter-tag').forEach(tag => {
    tag.addEventListener('click', (e) => {
        document.querySelectorAll('.filter-tag').forEach(t => 
            t.classList.remove('active'));
        e.target.classList.add('active');
        
        const period = e.target.textContent;
        if (period === 'Tous') {//lakan lfitre hwa tous , ya3ni bla filtre ahahah
            displayQuotes();
        } else {
            displayQuotes(quote => quote.period === period);// ana samaka
        }
    });
});

// Menu items ( hadi ez gha kanfiltriw o sf 3la 7sab ach wrk l user )
document.querySelectorAll('.menu-item').forEach(item => {
    item.addEventListener('click', (e) => {
        const menuItem = e.target.closest('.menu-item');
        
        document.querySelectorAll('.menu-item').forEach(i => 
            i.classList.remove('active'));//7ayd active lkolchi
        menuItem.classList.add('active');// ila hadakchi li wrk 3lih l user

        //data dial dak l item
        const philosopher = menuItem.dataset.philosopher;
        const theme = menuItem.dataset.theme;
        
        //filtres ...
        if (philosopher) {
            displayQuotes(quote => quote.philosopher === philosopher);
        } else if (theme) {
            displayQuotes(quote => (quote.tags || []).includes(theme));
        }
    });
});

// Toggle menu mobile
const menuToggle = document.querySelector('.menu-toggle');
const sidebar = document.querySelector('.sidebar');
menuToggle.addEventListener('click', () => {
    sidebar.classList.toggle('active');
});

// Scroll top
const scrollTop = document.querySelector('.scroll-top');
window.addEventListener('scroll', () => {
    scrollTop.classList.toggle('visible', window.pageYOffset > 100);
});

scrollTop.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
});
}