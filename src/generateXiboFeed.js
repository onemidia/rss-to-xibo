const fs = require('fs');
const fetch = require('node-fetch');
const xml2js = require('xml2js');

// Função para obter e converter o RSS para o formato Xibo
const convertRssToXibo = async (rssUrl) => {
  try {
    // Buscar os dados do RSS
    const response = await fetch(rssUrl);
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
          item: result.rss.channel[0].item.map(item => {
            const description = item.description[0];
            let imageLink = ''; // Variável para armazenar o link da imagem

            // Lógica para identificar o link da imagem dentro da descrição (exemplo de regex ou método específico)
            const imageMatch = description.match(/<img.*?src="(.*?)"/);
            if (imageMatch && imageMatch[1]) {
              imageLink = imageMatch[1]; // Extrair o link da imagem da descrição
            }

            return {
              title: `<![CDATA[ ${item.title[0]} ]]>`, // Formatação para o título
              linkfoto: imageLink ? `<![CDATA[ ${imageLink} ]]>` : '', // Coloca o link da imagem na tag linkfoto
            };
          })
        }
      }
    });

    // Salvar o XML em um arquivo local
    fs.writeFileSync('xibo_feed.xml', xml);
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
