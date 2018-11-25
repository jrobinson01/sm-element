import { html, TemplateResult } from 'lit-html/lit-html';
/**
 * @extends {HTMLElement}
 */
declare class SMElement extends HTMLElement {
    constructor();
    /** @return {!Machine} */
    static readonly machine: {};
    /** @return {object} */
    static readonly properties: {};
    /** @return {Array<string>} */
    static readonly observedAttributes: any[];
    /** @return {string} */
    /** @param {!string} state */
    state: any;
    /** @return {Object<string, any>} */
    /** @param {Object<string, any>} newData */
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
     * @description reflects the render(data) function of the current state.
     * @param {Object<string, any>} data
     * @return {TemplateResult}
     * @private
     */
    currentStateRender(data: any): TemplateResult;
    /**
     * @description override in sub classes, defaults to calling the currentStateRender
     * @param {!object} data
     * @return {TemplateResult}
     */
    render(data: any): TemplateResult;
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
    /**
     * @param {!State} newState
     * @private
    */
    transitionTo_(newState: any): void;
    /**
     * @param {!string} name
     * @return {?State}
     * @private
     */
    getStateByName_(name: any): any;
    /**
     * @param {!object} properties
     * @private
     */
    initializeData_(properties: any): void;
    /**
     * @param {!object} properties
     * @private
     */
    initializeProps_(properties: any): void;
    /**
     * @description request a render on the next animation frame
     * @protected
     */
    requestRender_(): void;
    /**
     * @description force an immediate render
     */
    renderNow(): void;
}
export default SMElement;
export { html };
