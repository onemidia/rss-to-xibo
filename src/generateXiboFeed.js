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
            // Extrair a URL da imagem do description usando regex para pegar a URL da imagem
            const description = item.description[0];
            const imageUrl = description.match(/<img.*?src=["'](.*?)["']/);
            const linkfoto = imageUrl ? imageUrl[1] : ''; // Extrair a URL da imagem, caso exista

            // Criar a estrutura no formato que o Xibo espera
            return {
              title: `<![CDATA[ ${item.title[0]} ]]>`,
              description: `<![CDATA[ ${description.replace(/<img[^>]*>/g, '')} ]]>`, // Remover a tag <img> da descrição
              copyright: `<![CDATA[ ${item['dc:creator'] ? item['dc:creator'][0] : 'Fonte não informada'} ]]>`, // Usar dc:creator se disponível
              date: `<![CDATA[ ${item.pubDate[0]} ]]>`,
              linkfoto: `<![CDATA[ ${linkfoto} ]]>`, // Colocar a URL da imagem dentro de <linkfoto>
              qrcode: `<![CDATA[ http://rss.suatv.com.br/QRCode/view.php?link=${Buffer.from(item.link[0]).toString('base64')} ]]>`, // Gerar um QR Code para o link
              logo1: `<![CDATA[ http://rss.suatv.com.br/Uol/img/logo1.png ]]>`,
              logo2: `<![CDATA[ http://rss.suatv.com.br/Uol/img/logo2.png ]]>`
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

// Exemplo de uso
convertRssToXibo('https://www.tribunaonline.net/feed/')
  .then(xml => {
    // Aqui você pode enviar o XML gerado para o Xibo ou salvar em algum lugar
    console.log(xml);
  })
  .catch(error => {
    console.error('Erro:', error);
  });
