import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { InicioJuegosPage } from './inicio-juegos.page';

const routes: Routes = [
  {
    path: '',
    component: InicioJuegosPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class InicioJuegosPageRoutingModule {}
