import { html, TemplateResult } from 'lit-html/lit-html';
export interface Transition {
    event: string;
    target: string;
    effect?(detail: object): object;
    condition?(detail: object): boolean;
}
export interface State {
    name: string;
    transitions: Array<Transition>;
    render?(data: object): TemplateResult;
    onEntry?(): void;
    onExit?(): void;
}
export interface Machine {
    initial: string;
    states: {
        [key: string]: State;
    };
}
declare class SMElement extends HTMLElement {
    private __data;
    private __state;
    private __renderRequest;
    currentState: State;
    root: Element | DocumentFragment;
    states: {
        [key: string]: State;
    };
    private static __propNamesAndAttributeNames;
    constructor();
    static readonly machine: Machine;
    static readonly properties: {
        [key: string]: any;
    };
    static readonly observedAttributes: Array<string>;
    state: string;
    data: {
        [s: string]: any;
    };
    protected connectedCallback(): void;
    protected createRenderRoot(): void;
    protected attributeChangedCallback(name: string, oldVal: string, newVal: string | undefined): void;
    isState(current: State, desired: State): boolean;
    /**
     * @description return true if the current state is one of the supplied states
     */
    oneOfState(current: State, ...states: Array<State>): boolean;
    /**
     * @description reflects the render(data) function of the current state.
     */
    currentStateRender(_data: {
        [key: string]: any;
    }): TemplateResult;
    /**
     * @description override in sub classes, defaults to calling the currentStateRender
     */
    render(data: {
        [key: string]: any;
    }): TemplateResult;
    /**
     * @param {!string} eventName
     * @param {object=} detail
     */
    send(eventName: string, detail?: {
        [key: string]: any;
    }): void;
    /**
     * @description convenience for setting event listeners that call send
     */
    listenAndSend(eventName: string, detail?: {
        [key: string]: any;
    }): () => void;
    private transitionTo_;
    private getStateByName_;
    private initializeData_;
    private initializeProps_;
    /**
     * @description request a render on the next animation frame
     */
    protected requestRender(): void;
}
export default SMElement;
export { html };
