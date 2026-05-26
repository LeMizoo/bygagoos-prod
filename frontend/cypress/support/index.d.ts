/// <reference types="cypress" />

declare namespace Cypress {
  interface Chainable {
    /**
     * Custom command to login
     * @example cy.login('admin@bygagoos.com', 'password123')
     */
    login(email: string, password: string): Chainable<void>;
    
    /**
     * Custom command to logout
     * @example cy.logout()
     */
    logout(): Chainable<void>;
    
    /**
     * Custom command to select element by data-cy attribute
     * @example cy.getByDataCy('submit-button')
     */
    getByDataCy(selector: string): Chainable<JQuery<HTMLElement>>;
  }
}