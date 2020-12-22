import { HTTP_INTERCEPTORS } from "@angular/common/http";
import { NgModule } from "@angular/core";
import { AuthIntercepterService } from "./auth/auth-intercepter.service";
import { RecipeService } from "./recipes/recipe.service";

@NgModule({
    providers: [
        RecipeService,
        { provide: HTTP_INTERCEPTORS, useClass: AuthIntercepterService, multi: true }
    ]
})
export class CoreModule { }