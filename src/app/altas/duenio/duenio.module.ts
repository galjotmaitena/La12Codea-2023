import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { DuenioPageRoutingModule } from './duenio-routing.module';

import { DuenioPage } from './duenio.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    DuenioPageRoutingModule
  ],
  declarations: [DuenioPage]
})
export class DuenioPageModule {}
