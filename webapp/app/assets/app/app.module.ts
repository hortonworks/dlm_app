import {NgModule}      from "@angular/core"
import {BrowserModule} from "@angular/platform-browser"
import {RouterModule} from "@angular/router"
import { HttpModule } from "@angular/http"
import {FormsModule}   from "@angular/forms"
import {routes} from "./app.routes"
import AppComponent from "./app"
import DashboardComponent from "./components/dashboard"
import LoginComponent  from "./components/login"
import {AuthService} from "./services/authservice"

@NgModule({
    imports: [
        BrowserModule
        , FormsModule,
        HttpModule,
        RouterModule.forRoot(routes)
    ],
    declarations: [AppComponent, DashboardComponent, LoginComponent],
    bootstrap: [AppComponent],
    providers: [AuthService]
})

export class AppModule {
}

