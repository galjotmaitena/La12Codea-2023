import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { InicioJuegosPageRoutingModule } from './inicio-juegos-routing.module';

import { InicioJuegosPage } from './inicio-juegos.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    InicioJuegosPageRoutingModule
  ],
  declarations: [InicioJuegosPage]
})
export class InicioJuegosPageModule {}
