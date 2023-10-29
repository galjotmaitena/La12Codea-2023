import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { SplashScreenComponent } from './componentes/splash-screen/splash-screen.component';

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
    path: 'empleado',
    loadChildren: () => import('./altas/empleado/empleado.module').then( m => m.EmpleadoPageModule)
  },
  {
    path: 'duenio',
    loadChildren: () => import('./altas/duenio/duenio.module').then( m => m.DuenioPageModule)
  },
  {
    path: '',
    redirectTo: 'splash',
    pathMatch: 'full'
  },
  {
    path: 'mesa',
    loadChildren: () => import('./altas/mesa/mesa.module').then( m => m.MesaPageModule)
  },

];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
