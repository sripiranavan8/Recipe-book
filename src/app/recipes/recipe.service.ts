import { EventEmitter, Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { Ingredient } from '../shared/ingredient.model';
import { ShoppingListService } from '../shopping-list/shopping-list.service';
import { Recipe } from './recipe.model';

@Injectable()
export class RecipeService {

    recipesChanged = new Subject<Recipe[]>();

    recipeSelected = new EventEmitter<Recipe>();

    // private recipes: Recipe[] = [
    //     new Recipe('A Test Recipe', 'This is simple a test', 'https://addapinch.com/wp-content/uploads/2018/06/blueberry-strawberry-trifle-recipe-0529.jpg', [new Ingredient('Meat', 1), new Ingredient('French Fries', 20)]),
    //     new Recipe('Another Test Recipe', 'This is another simple a test', 'https://addapinch.com/wp-content/uploads/2018/06/blueberry-strawberry-trifle-recipe-0529.jpg', [new Ingredient('Buns', 2), new Ingredient('Meat', 1)])
    // ];
    private recipes: Recipe[] = [];

    constructor(private slService: ShoppingListService) { }
    getRecipes() {
        return this.recipes.slice();
    }

    getRecipe(id: number) {
        return this.recipes.slice()[id];
    }

    setRecipes(recipes: Recipe[]) {
        this.recipes = recipes;
        this.recipesChanged.next(this.recipes.slice());
    }

    addIngredientsToShoppingList(ingredients: Ingredient[]) {
        this.slService.addIngredients(ingredients);
    }

    addRecipe(recipe: Recipe) {
        this.recipes.push(recipe);
        this.recipesChanged.next(this.recipes.slice());
    }

    updateRecipe(index: number, recipe: Recipe) {
        this.recipes[index] = recipe;
        this.recipesChanged.next(this.recipes.slice());
    }

    deleteRecipe(index: number) {
        this.recipes.splice(index, 1);
        this.recipesChanged.next(this.recipes.slice());
    }
}