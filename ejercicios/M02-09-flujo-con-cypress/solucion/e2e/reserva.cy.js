// Pruebas del flujo de reserva (M02-09) — solución con cy.intercept
describe('Reserva de sala', () => {
  // Cada prueba usa una fecha distinta para no chocar con reservas de ejecuciones anteriores
  const fecha = `2027-0${1 + Math.floor(Math.random() * 9)}-1${Math.floor(Math.random() * 9)}`;

  beforeEach(() => {
    cy.intercept('POST', '/api/reservas').as('reserva');      // espía la petición, sin cambiarla
    cy.visit('/');
    cy.get('#sala').select('Sala Norte');
    cy.get('#fecha').type(fecha);
    cy.get('#nombre').type('Ana');
  });

  it('reserva una sala libre', () => {
    cy.get('#hora').select('10:00');
    cy.contains('button', 'Reservar').click();
    cy.wait('@reserva').its('response.statusCode').should('eq', 201);   // espera a la respuesta real
    cy.get('#resultado').should('contain', 'confirmada').and('contain', 'Sala Norte');
  });

  it('avisa si la sala está ocupada (respuesta simulada)', () => {
    // Stub: el servidor no llega a recibir la petición; Cypress responde un 409
    cy.intercept('POST', '/api/reservas', {
      statusCode: 409,
      body: { error: 'La sala ya está reservada a esa hora' },
    }).as('ocupada');
    cy.get('#hora').select('11:00');
    cy.contains('button', 'Reservar').click();
    cy.wait('@ocupada');
    cy.get('#resultado').should('have.class', 'error').and('have.text', 'La sala ya está reservada a esa hora');
  });
});
