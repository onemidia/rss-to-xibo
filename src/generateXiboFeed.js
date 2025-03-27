const fs = require('fs').promises;
const fetch = require('node-fetch');
const xml2js = require('xml2js');

// Função para validar URLs
const isValidUrl = (url) => {
  try {
    new URL(url);
    return true;
  } catch (e) {
    return false;
  }
};

// Função para obter e converter o RSS para o formato Xibo
const convertRssToXibo = async (rssUrl) => {
  try {
    // Verificar se a URL é válida
    if (!isValidUrl(rssUrl)) {
      throw new Error('URL inválida fornecida');
    }

    // Buscar os dados do RSS
    const response = await fetch(rssUrl);
    if (!response.ok) {
      throw new Error(`Erro ao buscar RSS: ${response.statusText}`);
    }
    const rssData = await response.text();

    // Converter o RSS para JSON de forma assíncrona
    const parser = new xml2js.Parser();
    const result = await parser.parseStringPromise(rssData);

    // Criar o novo XML no formato adequado para o Xibo
    const builder = new xml2js.Builder();
    const xml = builder.buildObject({
      rss: {
        $: { version: '2.0' },
        channel: {
          title: 'Tribuna Online',
          link: 'https://www.tribunaonline.net/feed/',
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

    // Validar o XML gerado
    if (!xml) {
      throw new Error('O XML gerado está vazio.');
    }

    // Salvar o XML de forma assíncrona
    await fs.writeFile('xibo_feed.xml', xml);
    console.log('XML gerado com sucesso!');

    // Retornar o XML para uso na API
    return xml;
  } catch (error) {
    console.error('Erro ao buscar ou converter RSS:', error);
    throw error; // Lança o erro para ser tratado em outro local
  }
};

// Exportar a função para ser usada em outros arquivos
module.exports = convertRssToXibo;
