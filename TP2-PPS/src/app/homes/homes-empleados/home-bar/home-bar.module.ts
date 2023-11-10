import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { HomeBarPageRoutingModule } from './home-bar-routing.module';

import { HomeBarPage } from './home-bar.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    HomeBarPageRoutingModule
  ],
  declarations: [HomeBarPage],
  exports: [HomeBarPage]
})
export class HomeBarPageModule {}
