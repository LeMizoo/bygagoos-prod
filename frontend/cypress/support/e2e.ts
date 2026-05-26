// Déclaration des types pour les commandes Cypress
export type LoginCredentials = {
  email: string;
  password: string;
};

// Commande de login
Cypress.Commands.add('login', (email: string, password: string) => {
  cy.session([email, password], () => {
    cy.visit('/auth/login');
    cy.get('input[type="email"]').type(email);
    cy.get('input[type="password"]').type(password);
    cy.get('button[type="submit"]').click();
    cy.url().should('include', '/admin/dashboard');
  });
});

// Commande de logout
Cypress.Commands.add('logout', () => {
  cy.get('button').contains('Déconnexion').click();
  cy.url().should('include', '/auth/login');
});

// Commande pour sélectionner par data-cy
Cypress.Commands.add('getByDataCy', (selector: string) => {
  return cy.get(`[data-cy="${selector}"]`);
});

declare global {
  namespace Cypress {
    interface Chainable {
      login(email: string, password: string): Chainable<void>;
      logout(): Chainable<void>;
      getByDataCy(selector: string): Chainable<JQuery<HTMLElement>>;
    }
  }
}

export {};