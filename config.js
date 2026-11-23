/* ============================================================
   CONFIGURACIÓN DE LA RIFA
   Cambia aquí los datos. No necesitas tocar el resto del código.
   ============================================================ */
const CONFIG = {
  name: "Gran Rifa de Navidad",
  prize: 500000,            // Premio en pesos
  price: 10000,             // Precio de cada boleta
  currency: "COP",
  total: 100,               // Cantidad de boletas (00 a 99)
  minSales: 50,             // Mínimo de boletas vendidas para hacer el sorteo
  drawDate: "2026-12-23",   // Fecha del sorteo (AAAA-MM-DD)
  drawTime: "00:00",        // Hora usada para la cuenta regresiva (HH:MM)
  timezone: "-05:00",       // Colombia

  // WhatsApp: solo números, con indicativo del país y sin "+", espacios ni guiones
  whatsapp: "573222713786",
  whatsappDisplay: "322 271 3786",

  // Instagram
  instagram: "jfelipem9",
  instagramUrl: "https://www.instagram.com/jfelipem9/",
  instagramDm: "https://ig.me/m/jfelipem9",

  // Mensaje que se envía al organizador. {numero} y {rifa} se reemplazan solos.
  messageTemplate: "Hola, estoy interesado en comprar la boleta número {numero} de la {rifa}. ¿Me puedes indicar cómo realizar el pago?",

  // Método de sorteo. Déjalo vacío ("") mientras no esté definido:
  // la página mostrará "Método de sorteo pendiente de publicación".
  // Cuando lo definas, escribe aquí la explicación completa y verificable.
  drawMethod: ""
};
