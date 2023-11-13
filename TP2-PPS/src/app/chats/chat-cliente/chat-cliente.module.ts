import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ChatClientePageRoutingModule } from './chat-cliente-routing.module';

import { ChatClientePage } from './chat-cliente.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ChatClientePageRoutingModule
  ],
  declarations: [ChatClientePage]
})
export class ChatClientePageModule {}
