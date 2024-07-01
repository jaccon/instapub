const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

async function scrapeInstagramImages(username) {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();

    await page.goto(`https://www.instagram.com/${username}/`, { waitUntil: 'networkidle2' });

    await page.waitForSelector('article img', { timeout: 60000 });

    const scrollToEnd = async () => {
        let previousHeight;
        let currentHeight = await page.evaluate('document.body.scrollHeight');
        while (previousHeight !== currentHeight) {
            previousHeight = currentHeight;
            await page.evaluate('window.scrollTo(0, document.body.scrollHeight)');
            await new Promise(resolve => setTimeout(resolve, 2000)); // Espera 2 segundos para carregar mais imagens
            currentHeight = await page.evaluate('document.body.scrollHeight');
        }
    };

    await scrollToEnd();

    const imageUrls = await page.evaluate(() => {
        const imgs = Array.from(document.querySelectorAll('article img'));
        return imgs.map(img => img.src);
    });

    const downloadDir = path.join(__dirname,'downloads',username);
    if (!fs.existsSync(downloadDir)) {
        fs.mkdirSync(downloadDir);
    }

    // Baixa as imagens e salva os nomes dos arquivos em uma lista
    const downloadedImages = [];
    for (const [index, url] of imageUrls.entries()) {
        const viewSource = await page.goto(url);
        const imageName = `image${index}.jpg`;
        const imagePath = path.join(downloadDir, imageName);
        fs.writeFileSync(imagePath, await viewSource.buffer());
        console.log(`Downloaded image ${index + 1} from ${url}`);
        downloadedImages.push(imageName);
    }

    // Cria o objeto JSON
    const jsonData = {
        images: downloadedImages,
        updatedAt: new Date().toISOString()
    };

    // Salva o objeto JSON em um arquivo
    const jsonPath = path.join(downloadDir, 'instagram-images.json');
    fs.writeFileSync(jsonPath, JSON.stringify(jsonData, null, 2));
    console.log(`Saved image data to ${jsonPath}`);

    await browser.close();
}

// Lê o arquivo config.json
const config = JSON.parse(fs.readFileSync('config.json', 'utf8'));

// Itera sobre os nomes de usuário e executa a função para cada um
(async () => {
    for (const username of config.usernames) {
        console.log(`Scraping images for ${username}`);
        try {
            await scrapeInstagramImages(username);
        } catch (error) {
            console.error(`Error scraping images for ${username}:`, error);
        }
    }
})();
