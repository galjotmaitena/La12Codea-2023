import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { PreguntadosPage } from './preguntados.page';

const routes: Routes = [
  {
    path: '',
    component: PreguntadosPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PreguntadosPageRoutingModule {}
