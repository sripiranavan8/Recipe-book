import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Actions, ofType, Effect } from '@ngrx/effects';
import { of } from 'rxjs';
import { catchError, map, switchMap, tap } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { AuthService } from '../auth.service';
import { User } from '../user.model';

import * as AuthActions from './auth.actions';

export interface AuthResponseData {
    idToken: string;
    email: string;
    refreshToken: string;
    expiresIn: string;
    localId: string;
    registered?: boolean;
}

const handleAuthentication = (email: string, userId: string, token: string, expiresIn: string) => {
    const expirationDate = new Date(new Date().getTime() + +expiresIn * 1000);
    const user = new User(email, userId, token, expirationDate);
    localStorage.setItem('userData', JSON.stringify(user));
    return new AuthActions.AuthenticateSuccess({ email, userId, token, expirationDate: expirationDate, redirect: true });
}

const handleError = (errorRes: any) => {
    let errorMessage = 'An unknown error occurred!';
    if (!errorRes.error || !errorRes.error.error) {
        return of(new AuthActions.AuthenticateFail(errorMessage));
    }
    switch (errorRes.error.error.message) {
        case 'EMAIL_EXISTS':
            errorMessage = 'The email address is already in use by another account.';
            break;

        case 'OPERATION_NOT_ALLOWED':
            errorMessage = 'Password sign-in is disabled for this project.';
            break;

        case 'TOO_MANY_ATTEMPTS_TRY_LATER':
            errorMessage = 'We have blocked all requests from this device due to unusual activity. Try again later.';
            break;

        case 'INVALID_PASSWORD':
            errorMessage = 'This Password is invalid';
            break;

        case 'USER_DISABLED':
            errorMessage = 'This User is Blocked';
            break;

        default:
            break;
    }
    return of(new AuthActions.AuthenticateFail(errorMessage));
}
@Injectable()
export class AuthEffets {
    @Effect()
    authSignup = this.actions$.pipe(
        ofType(AuthActions.SIGNUP_START),
        switchMap((authData: AuthActions.SignupStart) => {
            return this.http.post<AuthResponseData>('https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=' + environment.firebaseAPIKey,
                { email: authData.payload.email, password: authData.payload.password, returnSecureToken: true }).pipe(
                    tap(resData => {
                        this.authService.setLogoutTimer(+resData.expiresIn * 1000)
                    }),
                    map(resData => { return handleAuthentication(resData.email, resData.localId, resData.idToken, resData.expiresIn) }),
                    catchError(errorRes => { return handleError(errorRes) })
                )
        })
    );

    @Effect()
    authLogin = this.actions$.pipe(
        ofType(AuthActions.LOGIN_START),
        switchMap((authData: AuthActions.LoginStart) => {
            return this.http.post<AuthResponseData>('https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=' + environment.firebaseAPIKey,
                { email: authData.payload.email, password: authData.payload.password, returnSecureToken: true }).pipe(
                    tap(resData => {
                        this.authService.setLogoutTimer(+resData.expiresIn * 1000)
                    }),
                    map(resData => { return handleAuthentication(resData.email, resData.localId, resData.idToken, resData.expiresIn) })
                    , catchError(errorRes => { return handleError(errorRes) }))
        })
    );

    @Effect()
    autoLogin = this.actions$.pipe(
        ofType(AuthActions.AUTO_LOGIN),
        map(() => {
            let userData: { email: string, id: string, _token: string, _tokenExpirationDate: string } = JSON.parse(localStorage.getItem('userData'));
            if (!userData) {
                return { type: 'DUMMY' };
            }
            const loadedUser = new User(userData.email, userData.id, userData._token, new Date(userData._tokenExpirationDate));
            if (loadedUser.token) {
                const expirationDuration = new Date(userData._tokenExpirationDate).getTime() - new Date().getTime();
                this.authService.setLogoutTimer(expirationDuration);
                return new AuthActions.AuthenticateSuccess({ email: userData.email, userId: userData.id, token: userData._token, expirationDate: new Date(userData._tokenExpirationDate), redirect: false });
            }
            return { type: 'DUMMY' };
        })
    )

    @Effect({ dispatch: false })
    authRedirect = this.actions$.pipe(
        ofType(AuthActions.AUTHENTICATE_SUCCESS),
        tap((authSuccessAction: AuthActions.AuthenticateSuccess) => {
            if (authSuccessAction.payload.redirect) {
                this.router.navigate(['/']);
            }
        })
    );

    @Effect({ dispatch: false })
    authLogout = this.actions$.pipe(
        ofType(AuthActions.LOGOUT),
        tap(() => {
            this.authService.clearLogoutTimer();
            localStorage.removeItem('userData');
            this.router.navigate(['/auth']);
        })
    );

    constructor(private actions$: Actions, private http: HttpClient, private router: Router, private authService: AuthService) { }
}