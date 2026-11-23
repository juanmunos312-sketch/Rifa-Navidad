# Gran Rifa de Navidad

**Página hecha por [@jfelipem9](https://www.instagram.com/jfelipem9/).**

Sitio web para consultar las boletas disponibles de la rifa, elegir un número y comunicarse con el organizador para coordinar el pago. La página muestra el premio, el precio de cada boleta, la fecha del sorteo, el avance de ventas y las reglas de participación.

## ¿Cómo funciona?

- El visitante puede consultar el tablero y filtrar las boletas disponibles o vendidas.
- Se pueden seleccionar varias boletas disponibles a la vez y continuar por WhatsApp o Instagram con todos los números incluidos en un solo mensaje.
- La sección **Medios de pago** muestra las opciones Nequi, Bre-B y efectivo, con sus respectivos datos para realizar o coordinar el pago.
- Una boleta solo se considera vendida cuando el organizador confirma el pago y actualiza su estado en `tickets.js`.
- Las estadísticas, los filtros y la barra de progreso se actualizan a partir de los datos de ese archivo.

La página es estática y está desarrollada con HTML, CSS y JavaScript. No procesa pagos ni reserva números automáticamente. El visitante puede marcar y desmarcar varios números antes de iniciar el contacto.

## Archivos del proyecto

- `index.html`: estructura y contenido de la página.
- `style.css`: estilos y diseño adaptable a dispositivos móviles.
- `script.js`: interacción, tablero, filtros, ventanas de pago y cuenta regresiva.
- `tickets.js`: estado y comprador de cada boleta.
- `config.js`: información general de la rifa y datos de contacto.
- `assets/`: logos y códigos QR de los medios de pago.

## Configuración

Edita `config.js` para actualizar el nombre de la rifa, el premio, el precio, la fecha, los datos de WhatsApp e Instagram y el método del sorteo.

## Registrar una venta

Abre `tickets.js` y cambia el registro de la boleta correspondiente. Por ejemplo:

```js
{ number: "20", status: "sold", buyer: "María Rodríguez" },
```

Registra la venta únicamente después de confirmar el pago. Para volver a habilitar una boleta, utiliza:

```js
{ number: "20", status: "available", buyer: null },
```

La página valida la lista de boletas antes de mostrar el tablero. Los números repetidos, los estados no válidos o los datos inconsistentes generan un aviso de error.

## Abrir el sitio localmente

Abre `index.html` en un navegador. No necesitas instalar dependencias ni ejecutar un servidor para consultar la página.

## Publicar con GitHub Pages

1. Crea un repositorio en GitHub y carga los archivos del proyecto.
2. Entra a **Settings → Pages**.
3. En **Build and deployment**, selecciona **Deploy from a branch**.
4. Selecciona la rama `main` y la carpeta `/ (root)`, y guarda los cambios.
5. Cuando termine la publicación, GitHub mostrará el enlace del sitio en esa misma sección.

Para publicar cambios posteriores, actualiza los archivos en el repositorio y guarda los cambios. GitHub Pages actualizará el sitio automáticamente.

## Importante

El tablero depende de la información de `tickets.js`. Mantén ese archivo actualizado después de confirmar cada pago. Si el repositorio es público, cualquier persona podrá consultar su contenido; evita incluir datos personales innecesarios de los compradores.
