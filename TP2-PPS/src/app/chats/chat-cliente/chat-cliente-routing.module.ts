import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ChatClientePage } from './chat-cliente.page';

const routes: Routes = [
  {
    path: '',
    component: ChatClientePage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ChatClientePageRoutingModule {}
