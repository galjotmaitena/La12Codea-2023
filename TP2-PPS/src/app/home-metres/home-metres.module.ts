import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { HomeMetresPageRoutingModule } from './home-metres-routing.module';

import { HomeMetresPage } from './home-metres.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    HomeMetresPageRoutingModule
  ],
  declarations: [HomeMetresPage]
})
export class HomeMetresPageModule {}
