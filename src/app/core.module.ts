import { HTTP_INTERCEPTORS } from "@angular/common/http";
import { NgModule } from "@angular/core";
import { AuthIntercepterService } from "./auth/auth-intercepter.service";

@NgModule({
    providers: [
        { provide: HTTP_INTERCEPTORS, useClass: AuthIntercepterService, multi: true }
    ]
})
export class CoreModule { }