import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { HomeBarPage } from './home-bar.page';

const routes: Routes = [
  {
    path: '',
    component: HomeBarPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class HomeBarPageRoutingModule {}
