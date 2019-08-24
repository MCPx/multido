import { Action } from "@ngrx/store";
import {User} from "../../models/user";

export enum ActionTypes {
    SetUser = "[User Service] Set User",
    ClearUser = "[User Service] Clear User"
}

export class SetUser implements Action {
    readonly type = ActionTypes.SetUser;

    constructor(public payload: { user: User }){}
}

export class ClearUser implements Action {
    readonly type = ActionTypes.ClearUser;
}

export type AnyAction = SetUser | ClearUser;
