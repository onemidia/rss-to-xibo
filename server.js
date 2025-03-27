const express = require('express');
const generateXiboFeed = require('./src/generateXiboFeed');

const app = express();
const PORT = process.env.PORT || 3000;

app.get('/feed', async (req, res) => {
    try {
        const xmlFeed = await generateXiboFeed();
        res.set('Content-Type', 'application/xml');
        res.send(xmlFeed);
    } catch (error) {
        console.error("Erro ao gerar o XML:", error);
        res.status(500).send('Erro ao gerar o feed XML');
    }
});

app.listen(PORT, () => {
    console.log(`✅ Servidor rodando em http://localhost:${PORT}`);
});
