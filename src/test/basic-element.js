import SMElement from '/sm-element.js';
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
    const template = html`hello`;
    console.log('rendering ', template);
    return template;
  }
}

customElements.define('basic-element', BasicElement);
