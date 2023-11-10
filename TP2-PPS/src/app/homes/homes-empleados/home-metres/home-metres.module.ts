import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { HomeMetresPageRoutingModule } from './home-metres-routing.module';

import { HomeMetresPage } from './home-metres.page';
import { HomePageModule } from '../home/home.module';
import { HomePage } from '../home/home.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    HomeMetresPageRoutingModule,
  ],
  declarations: [HomeMetresPage],
  exports: [HomeMetresPage]
})
export class HomeMetresPageModule {}
