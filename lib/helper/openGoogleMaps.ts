import { Linking, Platform } from 'react-native';

/**
 * Abre o Google Maps nas coordenadas especificadas
 * @param latitude - Valor da latitude (ex: -8.8383)
 * @param longitude - Valor da longitude (ex: 13.2344)
 * @param label - Nome opcional para marcar o local (ex: "Meu Local")
 */
export const openGoogleMaps = (latitude: number, longitude: number, label?: string) => {
  // Formata as coordenadas para o padrão exigido pelo Google Maps
  const coordinates = `${latitude},${longitude}`;
  
  const url = Platform.select({
    ios: label 
      ? `comgooglemaps://?center=${coordinates}&q=${coordinates}(${encodeURIComponent(label)})`
      : `comgooglemaps://?center=${coordinates}&q=${coordinates}`,
    android: label
      ? `geo:${coordinates}?q=${coordinates}(${encodeURIComponent(label)})`
      : `geo:${coordinates}?q=${coordinates}`,
  });

  // Tenta abrir no Google Maps nativo
  Linking.openURL(url as string).catch(() => {
    // Fallback para versão web se o app não estiver instalado
    const webUrl = label
      ? `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}&query_place_id=${encodeURIComponent(label)}`
      : `https://www.google.com/maps/@${latitude},${longitude},15z`;

    Linking.openURL(webUrl);
  });
};