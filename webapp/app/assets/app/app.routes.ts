import DashboardComponent  from "./components/dashboard"
import LoginComponent  from "./components/login"

export const routes = [
    { path: "ui", component: LoginComponent },
    { path: "ui/login", component: LoginComponent},
    { path: "ui/dashboard", component: DashboardComponent }
]