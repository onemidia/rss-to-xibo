const express = require("express");
const generateXiboFeed = require('./src/generateXiboFeed');// Sem extensão .js

const app = express();
const PORT = process.env.PORT || 3000;

app.get("/generate-feed", async (req, res) => {
    try {
        const rssData = {}; // Aqui você pega os dados do RSS
        const xmlFeed = generateXiboFeed(rssData); // Chama a função corretamente
        res.set("Content-Type", "application/xml");
        res.send(xmlFeed);
    } catch (error) {
        console.error("Erro ao gerar o XML:", error);
        res.status(500).send("Erro interno no servidor");
    }
});

app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});
