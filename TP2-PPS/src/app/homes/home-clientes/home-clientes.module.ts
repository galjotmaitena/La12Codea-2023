import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { register } from 'swiper/element/bundle';
register();

import { IonicModule } from '@ionic/angular';
import { HomeClientesPageRoutingModule } from './home-clientes-routing.module';
import { HomeClientesPage } from './home-clientes.page';
import { SweetAlert2Module } from '@sweetalert2/ngx-sweetalert2';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    HomeClientesPageRoutingModule,
    SweetAlert2Module.forRoot(),
  ],
  declarations: [HomeClientesPage],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class HomeClientesPageModule {}
