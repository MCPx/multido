import * as userActions from "../actions/user.actions"
import {User} from "../../models/user";

export interface UserState {
    data: User;
}

export const initialState: UserState = {
    data: null
};

export function reducer(state = initialState, action: userActions.AnyAction): UserState {
    switch (action.type) {
        case userActions.ActionTypes.SetUser: {
            return {
                ...state,
                data: action.payload.user
            };
        }
        case userActions.ActionTypes.ClearUser: {
            return {
                ...state,
                data: null
            };
        }

        default:
            return state;
    }
}
