export interface OEmbedLinks {
  xml: string;
  json: string;
}

export function getOEmbedLinks(requestURL: string | URL): OEmbedLinks {
  const oEmbedURLBase = new URL("/oembed", requestURL);
  oEmbedURLBase.searchParams.set("url", String(requestURL));

  const oEmbedURLJSON = new URL(oEmbedURLBase);
  oEmbedURLJSON.searchParams.set("format", "json");

  const oEmbedURLXML = new URL(oEmbedURLBase);
  oEmbedURLXML.searchParams.set("format", "xml");

  return {
    json: oEmbedURLJSON.toString(),
    xml: oEmbedURLXML.toString(),
  };
}
