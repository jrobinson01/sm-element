import BasicElement from './basic-element.js';
import {html} from 'lit-html/lit-html';

describe('SMElement', () => {
  let container = HTMLElement;
  let el;

  before(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  after(() => {
    if(container && container.parentNode) {
      container.parentNode.removeChild(container);
    }
  });

  beforeEach(() => {
    el = document.createElement('basic-element');
    container.appendChild(el);
  });

  afterEach(() => {
    if (el && el.parentNode) {
      el.parentNode.removeChild(el);
    }
  });

  describe('rendering', () => {

    it('renders initial content into shadowRoot', done => {
      window.requestAnimationFrame(() => {
        expect(el.shadowRoot.textContent).to.equal('hello basic!');
        done();
      });
    });

    it('should call render with the current data on initial render', done => {
      let d;
      el.render = function(data) {
        d = data;
      }
      window.requestAnimationFrame(() => {
        expect(d).to.equal(el.data);
        done();
      });
    });

    it('should call render with the current data when state changes', done => {
      let d;
      el.render =function(data){
        d = data;
      }
      el.send('toggle');
      window.requestAnimationFrame(() => {
        expect(d).to.equal(el.data);
        done();
      });
    });

    it('should call render with the current data when any property changes', done => {
      let d;
      el.render =function(data){
        d = data;
      }
      el.foo = 'test';
      window.requestAnimationFrame(() => {
        expect(d).to.equal(el.data);
        done();
      });
    });

    it('should only render once if multiple properties change', done => {
      let count = 0;
      el.render = function(data) {
        count++;
        return '';
      }
      el.foo = 'foo';
      el.bar = 'bar';
      window.requestAnimationFrame(() => {
        expect(count).to.equal(1);
        done();
      });
    });

    it('should only render once if properties change and state changes', done => {
      let count = 0;
      el.render = function(data) {
        count++;
        return '';
      }
      el.foo = 'foo';
      el.bar = 'bar';
      el.send('toggle');
      window.requestAnimationFrame(() => {
        expect(count).to.equal(1);
        done();
      });
    });

    it('should render after properties and state are up to date', done => {
      el.render = function(data) {
        return html`${this.state}`;
      };
      el.send('toggle');
      window.requestAnimationFrame(() => {
        expect(el.shadowRoot.textContent).to.equal('off');
        done();
      });
    });

    it('should render immediately if renderNow is called', () => {
      el.render = function(data) {
        return html`immediate`;
      }
      el.renderNow();
      expect(el.shadowRoot.textContent).to.equal('immediate');
    })
  });

  describe('state management', () => {

    it('should set the initial state', () => {
      expect(el.currentState.name).to.equal(el.states.on.name);
    });

    it('send should transition to another state', () => {
      el.send('toggle');
      expect(el.currentState.name).to.equal(el.states.off.name);
    });

    it('should not transition if the current state doesn\'t recognize the event', () => {
      const currentName = el.currentState.name;
      el.send('foo');
      expect(el.currentState.name).to.equal(currentName);
    });

    it('should call conditions with the detail object if provided', () => {
      const sentDetail = {};
      el.currentState.transitions[0].condition = function(detail) {
        expect(detail).to.equal(sentDetail);
      };
      el.send('toggle', sentDetail);
    });

    it('should call effects with the detail object if provided', () => {
      const sentDetail = {};
      el.currentState.transitions[0].effect = function(detail) {
        expect(detail).to.equal(sentDetail);
      };
      el.send('toggle', sentDetail);
    });

  });

  describe('isState', () => {
    it('should return true if the current state matches the desired state', () => {
      expect(el.isState(el.currentState, el.states.on)).to.equal(true);
    });
    it('should return false if the current state does not match the desired state', () => {
      expect(el.isState(el.currentState, el.states.off)).to.equal(false);
    });
    it('should return false if either arg is undefined', () => {
      expect(el.isState()).to.equal(false);
      expect(el.isState(el.currentState)).to.equal(false);
    });
  });

  describe('oneOfstate', () => {
    it('should return true if the currentState is one of the desired states', () => {
      expect(el.oneOfState(el.currentState, el.states.on, el.states.off));
      expect(el.oneOfState(el.currentState, el.states.on, el.states.other));
      expect(el.oneOfState(el.currentState, el.states.on));
    });
    it('should return false if the currentState is not one of the desired states', () => {
      expect(el.oneOfState(el.currentState, el.states.off, el.states.other));
      expect(el.oneOfState(el.currentState, el.states.off));
      expect(el.oneOfState(el.currentState, el.states.other));
      expect(el.oneOfState(el.currentState));
    });
  });

  describe('setting values via attributes', () => {
    it('should set a property when an attribute is set', () => {
      el.setAttribute('foo', 'test');
      expect(el.foo).to.equal('test');
    });
    it('should set boolean properties', () => {
      el.setAttribute('baz','');
      expect(el.baz).to.equal(true);
      el.removeAttribute('baz');
      expect(el.baz).to.equal(false);
      el.setAttribute('baz', 'true');
      expect(el.baz).to.equal(true);
      el.setAttribute('baz', 'false');
      expect(el.baz).to.equal(false);
    });
    it('should handle case insensitive attribute names', () => {
      el.setAttribute('foobar', 'foo!');
      expect(el.fooBar).to.equal('foo!');
    });
  });

  describe('reflected attributes', () => {
    it('should set string attributes', () => {
      el.foo = 'foo';
      expect(el.getAttribute('foo')).to.equal('foo');
    });
    it('should handle case insensitive attribute names', () => {
      el.fooBar = 'foo';
      expect(el.getAttribute('foobar')).to.equal('foo');
    });
    it('should set boolean attributes', () => {
      el.baz = true;
      expect(el.hasAttribute('baz')).to.equal(true);
    });
    it('should not set attributes if property is undefined', () => {
      el.foo = undefined;
      expect(el.hasAttribute('foo')).to.equal(false);
    });
    // TODO: property with {type:Object, reflect:true}
    // currently, an error is thrown. Error should
    // probably be thrown earlier, when props are
    // initialized.
    // ...
  });

  describe('property change events', () => {

  });

  describe('property setters', () => {

  });

});
