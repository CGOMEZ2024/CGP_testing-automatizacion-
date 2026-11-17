// Prueba del flujo de reserva (M02-09)
describe('Reserva de sala', () => {
  // Fecha al azar para no chocar con las reservas de ejecuciones anteriores (el servidor las recuerda)
  const fecha = `2027-0${1 + Math.floor(Math.random() * 9)}-1${Math.floor(Math.random() * 9)}`;

  it('reserva una sala libre', () => {
    cy.visit('/');
    cy.get('#sala').select('Sala Norte');
    cy.get('#fecha').type(fecha);
    cy.get('#hora').select('10:00');
    cy.get('#nombre').type('Ana');
    cy.contains('button', 'Reservar').click();
    cy.wait(2000);                                   // «lo que tarda el servidor»
    cy.get('#resultado').should('contain', 'confirmada');
  });
});
