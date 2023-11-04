import { Component } from '@angular/core';
import { PushService } from './services/push.service';
import  firebase  from 'firebase/compat/app';
import { Router } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent {
  constructor(private router:Router) {}

  ngOnInit(){
    firebase.initializeApp({"projectId":"tp-pps-dbd3e","appId":"1:723280552401:web:65a9966e11bf7a4bd400f0","storageBucket":"tp-pps-dbd3e.appspot.com","apiKey":"AIzaSyAyq_JiKgxj58yx8mBub51PXFFKyXqWado","authDomain":"tp-pps-dbd3e.firebaseapp.com","messagingSenderId":"723280552401"});
    this.router.navigateByUrl('login');
  }
}
