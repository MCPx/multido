import {ListState} from "../reducers/lists.reducers";
import {createSelector} from "@ngrx/store";
import {AppState} from "../reducers";

const getListByIdFunc = (state: ListState, props: { id: string }) => state.data.find(list => list.id == props.id);
export const getListState = (state: AppState) => state.lists;

export const getAllLists = createSelector(getListState, (state: ListState) => state.data);
export const getListById = createSelector(getListState, getListByIdFunc);
export const getSelectedList = createSelector(getListState, (state: ListState) => getListByIdFunc(state, { id: state.selectedListId }));
