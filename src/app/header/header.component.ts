import { Component, OnDestroy, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { Subscription } from 'rxjs';
import { map } from 'rxjs/operators';
import { AuthService } from '../auth/auth.service';
import { DataStorageService } from '../shared/data-storage.service';
import * as fromApp from '../store/app.reducer';
import * as AuthActions from '../auth/store/auth.actions';
import * as RecipesActions from '../recipes/store/recipes.actions';

@Component({
    selector: 'app-header',
    templateUrl: './header.component.html'
})
export class HeaderComponent implements OnInit, OnDestroy {
    private userSub: Subscription;
    isAuthenticated: boolean = false;
    constructor(private dataStorageService: DataStorageService, private authService: AuthService, private store: Store<fromApp.AppState>) { }

    ngOnInit() {
        this.userSub = this.store.select('auth').pipe(map(authState => authState.user)).subscribe(user => {
            this.isAuthenticated = !!user;
        });
    }
    onSaveData() {
        // this.dataStorageService.storeRecipes();
        this.store.dispatch(new RecipesActions.StoreRecipes());
    }
    onFetchData() {
        // this.dataStorageService.fetchRecipes().subscribe();
        this.store.dispatch(new RecipesActions.FetchRecipes());
    }
    onLogout() {
        // this.authService.logout();
        this.store.dispatch(new AuthActions.Logout());
    }
    ngOnDestroy() {
        this.userSub.unsubscribe();
    }
}