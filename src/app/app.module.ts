import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';

import { IonicModule, IonicRouteStrategy } from '@ionic/angular';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getAuth, provideAuth } from '@angular/fire/auth';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';
import { HttpClientModule } from '@angular/common/http';
import { getMessaging, provideMessaging } from '@angular/fire/messaging';
import { AngularFireStorageModule } from '@angular/fire/compat/storage';
import { AngularFireModule } from '@angular/fire/compat';

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule, 
    IonicModule.forRoot(), 
    AppRoutingModule,
    HttpClientModule, 
    AngularFireStorageModule,
    AngularFireModule.initializeApp({"projectId":"tp-pps-dbd3e","appId":"1:723280552401:web:65a9966e11bf7a4bd400f0","storageBucket":"tp-pps-dbd3e.appspot.com","apiKey":"AIzaSyAyq_JiKgxj58yx8mBub51PXFFKyXqWado","authDomain":"tp-pps-dbd3e.firebaseapp.com","messagingSenderId":"723280552401"}),
    provideFirebaseApp(() => initializeApp({"projectId":"tp-pps-dbd3e","appId":"1:723280552401:web:65a9966e11bf7a4bd400f0","storageBucket":"tp-pps-dbd3e.appspot.com","apiKey":"AIzaSyAyq_JiKgxj58yx8mBub51PXFFKyXqWado","authDomain":"tp-pps-dbd3e.firebaseapp.com","messagingSenderId":"723280552401"})),
    provideAuth(() => getAuth()),
    provideFirestore(() => getFirestore()),
    provideMessaging(() => getMessaging()),
  ],
  providers: [{ provide: RouteReuseStrategy, useClass: IonicRouteStrategy }],
  bootstrap: [AppComponent],
})
export class AppModule {}
