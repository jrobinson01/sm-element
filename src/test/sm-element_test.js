import {SMElement} from '../sm-element.js';
import {html, render} from '../../node_modules/lit-html/lit-html.js';
import {BasicElement} from 'basic-element.js';

const assert = chai.assert;

suite('SMElement', () => {
  let container = HTMLElement;
  setup(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  teardown(() => {
    if(container && container.parentNode) {
      container.parentNode.removeChild(container);
    }
  });

  test ('renders initial content into shadowRoot', async () => {
    const element = document.createElement('my-element');
    container.appendChild(element);
    await new Promise((resolve) => {
      assert.ok(el.shadowRoot);
      assert.equal(el.shadowRoot.innerText),'hello');
      resolve();
    });
  });
});
