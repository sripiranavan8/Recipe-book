import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Actions, Effect, ofType } from "@ngrx/effects";
import { Store } from "@ngrx/store";
import { map, switchMap, withLatestFrom } from "rxjs/operators";
import { Recipe } from "../recipe.model";
import * as formApp from '../../store/app.reducer';
import * as RecipesActions from './recipes.actions';

@Injectable()
export class RecipesEffects {
    @Effect()
    fetchRecipes = this.actions$.pipe(ofType(RecipesActions.FETCH_RECIPES),
        switchMap(() => {
            return this.http.get<Recipe[]>('https://recepie-book-344ca-default-rtdb.firebaseio.com/recipes.json')
        }),
        map(recipes => {
            return recipes.map(recipe => {
                return {
                    ...recipe,
                    ingredients: recipe.ingredients ? recipe.ingredients : []
                }
            })
        }),
        map(recipes => {
            return new RecipesActions.SetRecipes(recipes);
        })
    );

    @Effect({ dispatch: false })
    storeRecipes = this.actions$.pipe(ofType(RecipesActions.STORE_RECIPE),
        withLatestFrom(this.store.select('recipes')),
        switchMap(
            ([actionData, recipesState]) => {
                return this.http.put('https://recepie-book-344ca-default-rtdb.firebaseio.com/recipes.json', recipesState.recipes)
            }
        ))

    constructor(private actions$: Actions, private http: HttpClient, private store: Store<formApp.AppState>) { }
}