import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { PreguntadosPageRoutingModule } from './preguntados-routing.module';

import { PreguntadosPage } from './preguntados.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    PreguntadosPageRoutingModule
  ],
  declarations: [PreguntadosPage]
})
export class PreguntadosPageModule {}
