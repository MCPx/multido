import { Action } from "@ngrx/store";
import { List } from "models/list";

export enum ActionTypes {
    UpdateLists = "[List Service] Update lists",
    AddList = "[List Service] Add lists"
}

export class UpdateLists implements Action {
    readonly type = ActionTypes.UpdateLists;

    constructor(public payload: { lists: List[] }){}
}

export type ActionsUnion = UpdateLists;