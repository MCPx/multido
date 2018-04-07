interface State {
    checked: boolean;
}

export class Item {
    id: string;
    text: string;
    state: State;

    constructor({ id, text, state }: { id: string, text: string, state?: { checked?: boolean } }) {
        this.id = id;
        this.text = text;
        this.state = { checked: state ? state.checked : false };
    }
}