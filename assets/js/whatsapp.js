// whatsapp.js - Configuracion central de WhatsApp para CONQUI
// ─────────────────────────────────────────────────────────────
// Para cambiar el numero de WhatsApp en TODO el sitio,
// edita UNICAMENTE la variable NUMBER de abajo.
// Formato: codigo_pais + numero, sin + ni espacios.
// Ejemplo Mexico: 521 + 10 digitos = '5215512345678'
// ─────────────────────────────────────────────────────────────
window.WA = (function () {

  var NUMBER = '5215512345678';

  function open(text) {
    window.open('https://wa.me/' + NUMBER + '?text=' + encodeURIComponent(text), '_blank');
  }

  // Boton generico "Agendar Cita" (hero, header, etc.)
  function agendarGeneral() {
    open('Hola CONQUI, me gustaria agendar una cita. \u00bfMe pueden indicar disponibilidad y horarios?');
  }

  // Detalle de estudio
  function agendarEstudio(title, category, price) {
    var lines = [
      'Hola CONQUI, me gustaria agendar una cita para el siguiente estudio:',
      '\ud83d\udccb *' + (title || 'Estudio') + '*' + (category ? ' (' + category + ')' : ''),
      price ? '\ud83d\udcb0 Precio: ' + price : '',
      '\u00bfMe pueden indicar disponibilidad y horarios?'
    ].filter(Boolean).join('\n');
    open(lines);
  }

  // Detalle de paquete
  function agendarPaquete(title, category, price) {
    var lines = [
      'Hola CONQUI, me gustaria agendar una cita para el siguiente paquete:',
      '\ud83d\udccb *' + (title || 'Paquete') + '*' + (category ? ' (' + category + ')' : ''),
      price ? '\ud83d\udcb0 Precio: ' + price : '',
      '\u00bfMe pueden indicar disponibilidad y horarios?'
    ].filter(Boolean).join('\n');
    open(lines);
  }

  // Formulario de contacto
  function enviarFormulario(nombre, email, telefono, asunto, mensaje) {
    var asuntoMap = {
      info: 'Informaci\u00f3n General',
      citas: 'Agendar Cita',
      resultados: 'Resultados',
      quejas: 'Sugerencias'
    };
    var lines = [
      'Hola CONQUI, me llamo *' + nombre + '*.',
      telefono ? '\ud83d\udcde Tel\u00e9fono: ' + telefono : '',
      '\ud83d\udce7 Email: ' + email,
      asunto ? '\ud83d\udccb Asunto: ' + (asuntoMap[asunto] || asunto) : '',
      '\ud83d\udcac ' + mensaje
    ].filter(Boolean).join('\n');
    open(lines);
  }

  return {
    NUMBER: NUMBER,
    open: open,
    agendarGeneral: agendarGeneral,
    agendarEstudio: agendarEstudio,
    agendarPaquete: agendarPaquete,
    enviarFormulario: enviarFormulario
  };

})();
