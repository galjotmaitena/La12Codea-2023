import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { SimonDicePageRoutingModule } from './simon-dice-routing.module';

import { SimonDicePage } from './simon-dice.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    SimonDicePageRoutingModule
  ],
  declarations: [SimonDicePage]
})
export class SimonDicePageModule {}
