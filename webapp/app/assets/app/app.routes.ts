import DashboardComponent  from "./components/dashboard"
import LoginComponent  from "./components/login"
import AddClusterComponent from "./components/add-cluster/add-cluster.component"

export const routes = [
    { path: "ui", component: LoginComponent },
    { path: "ui/login", component: LoginComponent},
    { path: "ui/dashboard", component: DashboardComponent },
    { path: "ui/add-cluster", component: AddClusterComponent }
]