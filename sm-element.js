import { html, render } from 'lit-html/lit-html';
/**
 * @description serializes property to a valid attribute
 */
function serializeAttribute(prop) {
    if (typeof prop === 'boolean' || prop === undefined) {
        return (prop === true) ? '' : null;
    }
    else if (typeof prop === 'object') {
        throw new Error('cannot serialize object to attribute');
    }
    return String(prop);
}
class SMElement extends HTMLElement {
    constructor() {
        super();
        this.__data = {};
        this.currentState = null;
        this.__state = '';
        this.states = Object.getPrototypeOf(this).constructor.machine.states;
        // setup render target
        this.createRenderRoot();
        // setup property getter/setters
        this.initializeProps_(Object.getPrototypeOf(this).constructor.properties);
        // initialze data
        this.initializeData_(Object.getPrototypeOf(this).constructor.properties);
    }
    static get machine() {
        // return a basic, single-state machine by default
        return {
            initial: 'initial',
            states: {
                initial: {
                    name: 'initial',
                    transitions: []
                }
            }
        };
    }
    static get properties() {
        return {};
    }
    static get observedAttributes() {
        const attributes = [];
        if (!this.__propNamesAndAttributeNames) {
            this.__propNamesAndAttributeNames = new Map();
        }
        for (let key in this.properties) {
            // every String, Number or Boolean property is observed
            const type = this.properties[key].type;
            if (type === String || type === Number || type === Boolean) {
                const aName = key.toLowerCase();
                this.__propNamesAndAttributeNames.set(aName, key);
                attributes.push(aName);
            }
        }
        return attributes;
    }
    get state() {
        return this.__state;
    }
    set state(state) {
        this.__state = state;
        // cannot set attributes unless connected
        if (this.isConnected) {
            this.setAttribute('state', this.__state);
        }
        // dispatch state-changed event
        this.dispatchEvent(new CustomEvent('state-changed', {
            detail: {
                state: this.state
            }
        }));
    }
    get data() {
        return this.__data;
    }
    set data(newData) {
        const props = Object.getPrototypeOf(this).constructor.properties;
        // only set props that are defined in 'properties'
        const keys = Object.keys(newData);
        const update = keys.reduce((acc, k) => {
            if (props[k]) {
                acc[k] = newData[k];
            }
            return acc;
        }, {});
        // hold onto old values for a minute
        const oldData = Object.assign({}, this.__data);
        // update internal data allowing for partial updates
        this.__data = Object.assign({}, this.__data, update);
        // reflect any attributes that need to be reflected (reflect === true)
        // and dispatch any events (notify === true)
        for (let key in update) {
            const cprop = props[key];
            if (cprop.reflect) {
                const attribute = serializeAttribute(update[key]);
                if (attribute === null) {
                    this.removeAttribute(key);
                }
                else {
                    this.setAttribute(key.toLowerCase(), attribute);
                }
            }
            if (cprop.notify) {
                this.dispatchEvent(new CustomEvent(`${key}-changed`, {
                    detail: {
                        value: newData[key],
                        oldValue: oldData[key]
                    }
                }));
            }
            // if prop provides an event, send it along with the new value
            if (cprop.event && this.currentState) {
                this.send(cprop.event, {
                    value: newData[key],
                    oldValue: oldData[key]
                });
            }
            // if prop provides an observer, call it
            if (cprop.observer && typeof cprop.observer === 'function') {
                cprop.observer.call(this, newData[key], oldData[key]);
            }
        }
        this.requestRender();
    }
    connectedCallback() {
        // ensure state attribute is in sync
        if (this.getAttribute('state') !== this.__state) {
            this.setAttribute('state', this.__state);
        }
        // set initial state
        this.transitionTo_(this.getStateByName_(Object.getPrototypeOf(this).constructor.machine.initial));
        // render immediately the first time, so that elements
        // can be accessed in connectedCallback()
        this.render(this.data);
    }
    disconnectedCallback() {
        // nothing to do here. provided for subclasses calling super.disconnectedCallback
    }
    createRenderRoot() {
        this.root = this.attachShadow({ mode: 'open' });
    }
    attributeChangedCallback(name, oldVal, newVal) {
        const propName = Object.getPrototypeOf(this).constructor.__propNamesAndAttributeNames.get(name);
        const type = Object.getPrototypeOf(this).constructor.properties[propName].type || String;
        let value;
        if (type === Boolean) {
            if (newVal === '') {
                value = true;
            }
            else if (newVal === 'false') {
                value = false;
            }
            else {
                value = Boolean(newVal);
            }
        }
        else {
            value = type(newVal);
        }
        // only update property if it's changed to prevent infinite loops
        // with reflected properties.
        const self = this;
        if (value !== oldVal && propName && value !== self[propName]) {
            self[propName] = value;
        }
    }
    isState(current, desired) {
        return Boolean(current && desired && current.name === desired.name);
    }
    /**
     * @description return true if the current state is one of the supplied states
     */
    oneOfState(current, ...states) {
        return Boolean(states && states.includes(current));
    }
    /**
     * @description reflects the render(data) function of the current state.
     */
    currentStateRender(_data) {
        return html ``;
    }
    /**
     * @description override in sub classes, defaults to calling the currentStateRender
     */
    render(data) {
        return this.currentStateRender(data);
    }
    /**
     * @param {!string} eventName
     * @param {object=} detail
     */
    send(eventName, detail = {}) {
        if (!eventName) {
            throw new Error('an event name is required to send!');
        }
        if (!this.currentState) {
            throw new Error(`cannot send with no state: ${eventName}`);
        }
        // find the appropriate transitions in the current state
        const transitions = this.currentState.transitions.filter((t) => t.event === eventName);
        // no matching transitions in this state
        if (transitions.length === 0) {
            console.warn(`no transitions found in current state: "${this.state}" for event: "${eventName}"`);
            return;
        }
        // with multiple transitions handling the same event,
        // check each transition for conditions and throw an error,
        // for now, if any transition does not have a condition.
        if (transitions.length > 1 && transitions.filter((t) => !t.condition).length > 0) {
            throw new Error(`multiple transitions found without a condition for event: ${eventName} in state: ${this.state}`);
        }
        // if multiple transitions, run the first one that has a condition that returns true.
        if (transitions.length > 1) {
            transitions.some((t) => {
                const passed = t.condition.call(this, detail);
                if (passed) {
                    const nextState = this.getStateByName_(t.target);
                    // before running the transition, run it's effect
                    if (t.effect) {
                        // update data with return from effect
                        const newData = t.effect.call(this, detail);
                        this.data = newData ? newData : this.data;
                    }
                    // if there is a nextState, transition to it.
                    if (nextState) {
                        // run the first passing transition
                        this.transitionTo_(nextState);
                    }
                }
                return passed; // break out of loop if true, before testing more conditions
            });
        }
        else {
            // only one transition, check for condition first
            const transition = transitions[0];
            const targetState = this.getStateByName_(transition.target);
            // no condition, or condition returns true
            if (!transition.condition || (transition.condition && transition.condition.call(this, detail))) {
                if (transition.effect) {
                    // update data with return from effect
                    const newData = transition.effect.call(this, detail);
                    this.data = newData ? newData : this.data;
                }
                // if there is a targetState, transition to it.
                if (targetState) {
                    this.transitionTo_(targetState);
                }
            }
        }
    }
    /**
     * @description convenience for setting event listeners that call send
     */
    listenAndSend(eventName, detail = {}) {
        return () => this.send(eventName, detail);
    }
    transitionTo_(newState) {
        if (!newState) {
            throw new Error('transitionTo_ called without a State');
        }
        // call onExit if exists
        if (this.currentState && this.currentState.onExit) {
            this.currentState.onExit.call(this, this.data);
        }
        this.currentState = newState;
        this.currentStateRender = newState.render || function () { return html ``; };
        // udpate state property
        this.state = newState.name;
        // call onEntry if it exists
        if (newState.onEntry) {
            newState.onEntry.call(this, this.data);
        }
        this.requestRender();
    }
    getStateByName_(name) {
        // using Object.keys.map instead of Object.values, because not every browser
        // supports Object.values
        return Object.keys(this.states).map((k) => this.states[k]).find(s => s.name === name) || null;
    }
    initializeData_(properties) {
        // flatten properties and assign
        this.data = Object.keys(properties).reduce((acc, k) => {
            // this happens AFTER props MAY have been set, so use local prop if exists
            const self = this;
            const local = self[k];
            const def = typeof properties[k].value === 'function' ? properties[k].value() : properties[k].value;
            acc[k] = local !== undefined ? local : def;
            return acc;
        }, {});
    }
    initializeProps_(properties) {
        // create getter/setter pairs for each property
        const init = (key) => {
            Object.defineProperty(this, key, {
                get() {
                    return this.data[key];
                },
                set(newVal) {
                    const update = {};
                    update[key] = newVal;
                    this.data = update;
                },
                enumerable: true,
            });
        };
        for (let key in properties) {
            init(key);
        }
    }
    /**
     * @description request a render on the next animation frame
     */
    requestRender() {
        if (this.__renderRequest) {
            cancelAnimationFrame(this.__renderRequest);
        }
        this.__renderRequest = requestAnimationFrame(() => {
            if (this.root) {
                render(this.render(this.data), this.root);
                // should send 'rendered'. how would this work if someone wanted to override requestRender?
                // can it be a requirement that requestRender return a promise that resolves
                // after render is called? probably not, since multiple things call requestRender..?
                // ...
            }
            else {
                throw new Error('attempted to render while "this.root" is undefined');
            }
        });
    }
}
;
export default SMElement;
export { html };
