import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { HomeDuenioPage } from './home-duenio.page';

const routes: Routes = [
  {
    path: '',
    component: HomeDuenioPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class HomeDuenioPageRoutingModule {}
