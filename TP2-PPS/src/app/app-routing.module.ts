import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { SplashScreenComponent } from './components/splash-screen/splash-screen.component';

const routes: Routes = [
  {
    path: 'splash', component: SplashScreenComponent
  },
  {
    path: 'home',
    loadChildren: () => import('./home/home.module').then( m => m.HomePageModule)
  },
  {
    path: 'login',
    loadChildren: () => import('./login/login.module').then( m => m.LoginPageModule)
  },
  {
    path: 'ingreso',
    loadChildren: () => import('./ingreso/ingreso.module').then( m => m.IngresoPageModule)
  },
  {
    path: 'duenio',
    loadChildren: () => import('./altas/duenio/duenio.module').then( m => m.DuenioPageModule)
  },
  {
    path: 'cliente',
    loadChildren: () => import('./altas/cliente/cliente.module').then( m => m.ClientePageModule)
  },
  {
    path: 'producto',
    loadChildren: () => import('./altas/producto/producto.module').then( m => m.ProductoPageModule)
  },
  {
    path: 'mesa',
    loadChildren: () => import('./altas/mesa/mesa.module').then( m => m.MesaPageModule)
  },
  {
    path: 'empleado',
    loadChildren: () => import('./altas/empleado/empleado.module').then( m => m.EmpleadoPageModule)
  },
  {
    path: '',
    redirectTo: 'splash',
    pathMatch: 'full'
  },
  {
    path: 'homeClientes',
    loadChildren: () => import('./home-clientes/home-clientes.module').then( m => m.HomeClientesPageModule)
  },
  {
    path: 'home-metres',
    loadChildren: () => import('./home-metres/home-metres.module').then( m => m.HomeMetresPageModule)
  },
  {
    path: 'home-duenio',
    loadChildren: () => import('./home-duenio/home-duenio.module').then( m => m.HomeDuenioPageModule)
  },

];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
