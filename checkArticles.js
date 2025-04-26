 const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

const EXPO_PUSH_ENDPOINT = 'https://exp.host/--/api/v2/push/send';
const WORDPRESS_API = 'https://www.f1world.it/wp-json/wp/v2/posts?categories=1482';
const EXPO_PUSH_TOKEN = 'RNc8brG7YRF1UmvI5Ebbgb';

let lastArticleId = null;

async function checkNewArticles() {
    try {
        const response = await fetch(WORDPRESS_API);
        const articles = await response.json();
        if (!Array.isArray(articles) || articles.length === 0) {
            console.log('Nessun articolo trovato.');
            return;
        }
        
        const latestArticle = articles[0];
        
        if (lastArticleId && latestArticle.id !== lastArticleId) {
            console.log('Nuovo articolo trovato:', latestArticle.title.rendered);
            await sendNotification(latestArticle.title.rendered);
        } else if (!lastArticleId) {
            console.log('Inizializzazione... ID articolo:', latestArticle.id);
        }
        
        lastArticleId = latestArticle.id;
    } catch (error) {
        console.error("Errore nel controllare gli articoli:", error);
    }
}

async function sendNotification(title) {
    try {
        const message = {
            to: EXPO_PUSH_TOKEN,
            sound: 'default',
            title: `Nuovo articolo: ${title}`,
            body: 'Leggi ora su F1World!',
            data: { withSome: 'data' },
        };
        
        await fetch(EXPO_PUSH_ENDPOINT, {
            method: 'POST',
            headers: {
                Accept: 'application/json',
                'Accept-Encoding': 'gzip, deflate',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(message),
        });
        
        console.log('Notifica inviata!');
    } catch (error) {
        console.error("Errore nell'invio della notifica:", error);
    }
}

// Esegui SOLO UNA VOLTA
await sendNotification("TEST - Notifica manuale")
