import { html } from 'lit-html/lit-html';
declare class Transition {
}
declare class State {
}
declare class Machine {
}
/**
 * @extends {HTMLElement}
 */
declare class SMElement extends HTMLElement {
    constructor();
    /** @return {!Machine} */
    static readonly machine: {
        initial: string;
        states: {
            initial: {
                name: string;
                transitions: any[];
            };
        };
    };
    /** @return {object} */
    static readonly properties: {};
    static readonly observedAttributes: any[];
    /** @return {string} */
    /** @param {!string} state */
    state: any;
    /** @return {object} */
    /** @param {object} newData */
    data: any;
    connectedCallback(): void;
    /**
     * @description creates a shadowRoot by default. override to use a different render target
     * @protected
     */
    createRenderRoot(): void;
    /**
     * @param {!string} name
     * @param {string} oldVal
     * @param {string} newVal
     */
    attributeChangedCallback(name: any, oldVal: any, newVal: any): void;
    /**
     * @param {!State} current
     * @param {!State} desired
     * @return {boolean}
     */
    isState(current: any, desired: any): boolean;
    /**
     * @param {!State} current
     * @param {...State} states
     * @return {boolean}
     */
    oneOfState(current: any, ...states: any[]): boolean;
    /**
     * @description override in sub classes, defaults to calling the currentStateRender
     * @param {!object} data
     * @return {TemplateResult}
     */
    render(data: any): any;
    /**
     * @param {!string} eventName
     * @param {object=} detail
     */
    send(eventName: any, detail?: {}): void;
    /**
     * @description convenience for setting event listeners that call send
     * @param {!string} eventName
     * @param {object=} detail
     * @return {function()}
     */
    listenAndSend(eventName: any, detail: any): () => void;
    /** @param {!State} newState */
    transitionTo_(newState: any): void;
    /**
     * @param {!string} name
     * @return {?State}
     */
    getStateByName_(name: any): any;
    /** @param {!object} properties */
    initializeData_(properties: any): void;
    /** @param {!object} properties */
    initializeProps_(properties: any): void;
    /** @description request a render on the next animation frame */
    requestRender__(): void;
    /** @description force a render immediately */
    renderNow(): void;
}
export default SMElement;
export { Machine, State, Transition, html };
