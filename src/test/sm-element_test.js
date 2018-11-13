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
      expect(el.shadowRoot.textContent).to.equal('hello basic!');
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
