import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { SimonDicePage } from './simon-dice.page';

const routes: Routes = [
  {
    path: '',
    component: SimonDicePage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SimonDicePageRoutingModule {}
