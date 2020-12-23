import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { map, tap } from 'rxjs/operators';

import { Recipe } from '../recipes/recipe.model';
import * as fromApp from '../store/app.reducer';
import * as RecipesActions from '../recipes/store/recipes.actions';

@Injectable({ providedIn: 'root' })
export class DataStorageService {
    constructor(private http: HttpClient, private store: Store<fromApp.AppState>) { }

    fetchRecipes() {
        return this.http.get<Recipe[]>('https://recepie-book-344ca-default-rtdb.firebaseio.com/recipes.json')
            .pipe(map(recipes => {
                return recipes.map(recipe => {
                    return { ...recipe, ingredients: recipe.ingredients ? recipe.ingredients : [] }
                })
            }), tap(recipes => {
                this.store.dispatch(new RecipesActions.SetRecipes(recipes));
            }));
    }

}