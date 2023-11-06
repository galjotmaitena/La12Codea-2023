import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { Firestore, doc, docData, updateDoc } from '@angular/fire/firestore';
import { LocalNotifications } from '@capacitor/local-notifications';

import {
  ActionPerformed,
  PushNotificationSchema,
  PushNotifications,
  Token,
} from '@capacitor/push-notifications';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { PushService } from '../services/push.service';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage implements OnInit {
  token:any;
  user:any;

  constructor(private firestore: Firestore, private http: HttpClient, private push: PushService)
  {
    
  }
  
  ngOnInit(): void {

  } 

  sendPush()
  {
    //this.push.sendPush('Probando', 'desde Servicio')
  }
}