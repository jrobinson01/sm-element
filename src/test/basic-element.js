import SMElement from '../sm-element.js';
import {html} from 'lit-html/lit-html';

export default class BasicElement extends SMElement {
  static get machine() {
    return {
      initial:'on',
      states: {
        on: {
          name:'on',
          transitions: [
            {
              event: 'toggle',
              target: 'off'
            }
          ]
        },
        off: {
          name: 'off',
          transitions: [
            {
              event: 'toggle',
              target: 'on'
            },
          ],
        },
      },
    };
  }

  static get properties() {
    return {};
  }

  render() {
    return html`hello basic!`;
  }
}

customElements.define('basic-element', BasicElement);
