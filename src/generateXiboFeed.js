const fs = require('fs');
const fetch = require('node-fetch');
const xml2js = require('xml2js');

// Função para obter e converter o RSS de uma URL
const convertRssToXibo = async (rssUrl) => {
  try {
    // Fetch RSS data from URL
    const response = await fetch(rssUrl);
    const rssData = await response.text();

    // Converter o RSS para JSON
    const parser = new xml2js.Parser();
    parser.parseString(rssData, (err, result) => {
      if (err) {
        console.error('Erro ao converter RSS para JSON:', err);
        return;
      }

      // Criar um novo XML no formato adequado para o Xibo
      const builder = new xml2js.Builder();
      const xml = builder.buildObject({
        rss: {
          $: { version: '2.0' },
          channel: {
            title: 'Tribuna Online',
            link: 'https://www.tribunaonline.net/',
            description: 'Últimas notícias do Tribuna Online',
            item: result.rss.channel[0].item.map(item => ({
              title: item.title[0],
              link: item.link[0],
              description: item.description[0],
              pubDate: item.pubDate[0]
            }))
          }
        }
      });

      // Salvar o XML gerado para o Xibo
      fs.writeFile('xibo_feed.xml', xml, (err) => {
        if (err) {
          console.error('Erro ao salvar o XML:', err);
        } else {
          console.log('XML gerado com sucesso!');
        }
      });
    });
  } catch (error) {
    console.error('Erro ao buscar RSS:', error);
  }
};

// URL do feed RSS
const rssUrl = 'https://www.tribunaonline.net/feed/';
convertRssToXibo(rssUrl);
