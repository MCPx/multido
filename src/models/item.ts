interface State {
    checked: boolean;
}

export interface Item {
    id: string;
    text: string;
    state: State;
}