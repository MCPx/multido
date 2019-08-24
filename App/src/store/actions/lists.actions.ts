import { Action } from "@ngrx/store";
import { List } from "models/list";

export enum ActionTypes {
    UpdateLists = "[List Service] Update lists",
    AddList = "[List Service] Add list",
    RemoveList = "[List Service] Remove list",
}

export class UpdateLists implements Action {
    readonly type = ActionTypes.UpdateLists;

    constructor(public payload: { lists: List[] }){}
}

export class AddList implements Action {
    readonly type = ActionTypes.AddList;

    constructor(public payload: { list: List }){}
}

export class RemoveList implements Action {
    readonly type = ActionTypes.RemoveList;

    constructor(public payload: { id: string }){}
}

export type ActionsUnion = UpdateLists | AddList | RemoveList;
