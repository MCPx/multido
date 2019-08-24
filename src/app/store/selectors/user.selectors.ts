import {createSelector} from "@ngrx/store";
import {AppState} from "../reducers";
import {UserState} from "../reducers/user.reducers";

export const getUserState = (state: AppState) => state.user;

export const getUser = createSelector(getUserState, (state: UserState) => state.data);
