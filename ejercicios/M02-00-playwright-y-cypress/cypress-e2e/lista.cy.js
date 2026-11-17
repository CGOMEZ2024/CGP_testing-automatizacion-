// La misma prueba de la lista de la compra, en Cypress
describe('Lista de la compra', () => {
  it('añade un producto a la lista', () => {
    cy.visit('/');
    cy.get('#producto').type('Leche');
    cy.contains('button', 'Añadir').click();
    cy.get('li').should('have.length', 1).and('have.text', 'Leche');
    cy.contains('1 producto').should('be.visible');
  });
});
