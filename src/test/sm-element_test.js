import BasicElement from './basic-element.js';

describe('SMElement', () => {
  let container = HTMLElement;
  before(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  after(() => {
    if(container && container.parentNode) {
      container.parentNode.removeChild(container);
    }
  });

  it('renders initial content into shadowRoot', done => {
    const el = document.createElement('basic-element');
    container.appendChild(el);
    window.requestAnimationFrame(() => {
      // WTF. basic-element works fine in the browser,
      // but el.shadowRoot.textContent === [Object object] when running tests.
      // ...
      expect(el.shadowRoot.textContent).to.equal('hello!');
      done();
    });
  });

  it('should set the initial state', () => {
    const el = document.createElement('basic-element');
    container.appendChild(el);
    expect(el.currentState.name).to.equal(el.states.on.name);
  });

  it('send should transition to another state', () => {
    const el = document.createElement('basic-element');
    container.appendChild(el);
    el.send('toggle');
    expect(el.currentState.name).to.equal(el.states.off.name);
  });
});
