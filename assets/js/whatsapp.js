// whatsapp.js - Configuracion central de WhatsApp para CONQUI
// ─────────────────────────────────────────────────────────────
// Para cambiar el numero de WhatsApp en TODO el sitio,
// edita UNICAMENTE la variable NUMBER de abajo.
// Formato: codigo_pais + numero, sin + ni espacios.
// Ejemplo Mexico: 521 + 10 digitos = '5215512345678'
// ─────────────────────────────────────────────────────────────
window.WA = (function () {

  var NUMBER = '523330345836';

  function open(text) {
    window.open('https://wa.me/' + NUMBER + '?text=' + encodeURIComponent(text), '_blank');
  }

  // Boton generico "Agendar Cita" (hero, header, etc.)
  function agendarGeneral() {
    open('Hola CONQUI, me gustaria agendar una cita. ¿Me pueden indicar disponibilidad y horarios?');
  }

  // Detalle de estudio
  function agendarEstudio(title, category, price) {
    var lines = [
      'Hola CONQUI, me gustaria agendar una cita para el siguiente estudio:',
      '- *' + (title || 'Estudio') + '*' + (category ? ' (' + category + ')' : ''),
      price ? '- Precio: ' + price : '',
      '¿Me pueden indicar disponibilidad y horarios?'
    ].filter(Boolean).join('\n');
    open(lines);
  }

  // Detalle de paquete
  function agendarPaquete(title, category, price) {
    var lines = [
      'Hola CONQUI, me gustaria agendar una cita para el siguiente paquete:',
      '- *' + (title || 'Paquete') + '*' + (category ? ' (' + category + ')' : ''),
      price ? '- Precio: ' + price : '',
      '¿Me pueden indicar disponibilidad y horarios?'
    ].filter(Boolean).join('\n');
    open(lines);
  }

  // Formulario de contacto
  function enviarFormulario(nombre, email, telefono, asunto, mensaje) {
    var asuntoMap = {
      info: 'Información General',
      citas: 'Agendar Cita',
      resultados: 'Resultados',
      quejas: 'Sugerencias'
    };
    var lines = [
      'Hola CONQUI, me llamo *' + nombre + '*.',
      telefono ? 'Tel: ' + telefono : '',
      'Email: ' + email,
      asunto ? 'Asunto: ' + (asuntoMap[asunto] || asunto) : '',
      'Mensaje: ' + mensaje
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
