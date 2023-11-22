import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { HomePageRoutingModule } from './home-routing.module';

import { HomePage } from './home.page';


import { HomeMetresPage } from '../home-metres/home-metres.page';
import { HomeMozoPage } from '../home-mozo/home-mozo.page';
import { HomeMetresPageModule } from '../home-metres/home-metres.module';
import { HomeMozoPageModule } from '../home-mozo/home-mozo.module';
import { HomeCocinaPageModule } from '../home-cocina/home-cocina.module';
import { HomeBarPageModule } from '../home-bar/home-bar.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    HomePageRoutingModule,
    HomeMetresPageModule,
    HomeMozoPageModule,
    HomeCocinaPageModule,
    HomeBarPageModule
  ],
  declarations: [HomePage]
})
export class HomePageModule {}
