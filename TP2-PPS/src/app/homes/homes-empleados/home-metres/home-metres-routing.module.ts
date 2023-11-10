import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { HomeMetresPage } from './home-metres.page';

const routes: Routes = [
  {
    path: '',
    component: HomeMetresPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class HomeMetresPageRoutingModule {}
