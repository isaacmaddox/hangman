class ElementManager {
    private eles: Map<string, HTMLElement>;

    constructor() {
        this.eles = new Map();
    }

    public addElement(key: string, selector: HTMLSelector = null): HTMLElement {
        const ele: HTMLElement = selector ? document.querySelector(selector) : document.querySelector(`#${key}`);
        this.eles.set(
            key,
            ele,
        );
        return ele;
    }

    public getElement(key: string): HTMLElement {
        return this.eles.get(key);
    }
}

function $(selector: HTMLSelector): HTMLElement {
    return document.querySelector(selector);
}