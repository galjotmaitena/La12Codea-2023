import { Injectable, OnDestroy } from '@angular/core';
import {
  ActionPerformed,
  PushNotifications,
  PushNotificationSchema,
  Token,
} from '@capacitor/push-notifications';
import { Firestore, doc, docData, updateDoc } from '@angular/fire/firestore';
import { LocalNotifications } from '@capacitor/local-notifications';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { Observable } from 'rxjs';
import { AngularFireMessaging } from '@angular/fire/compat/messaging';
import { AngularFireFunctions } from '@angular/fire/compat/functions';
import { FirestoreService } from './firestore.service';


@Injectable({
  providedIn: 'root'
})
export class PushService implements OnDestroy{
  private token:any;
  private user:any;
  private tokens:any[]=[];
  tokensPusheados:any[] = [];
  private observable:any;

  constructor(private firestore: Firestore, private http: HttpClient, private angularFireMessaging: AngularFireMessaging, private functions: AngularFireFunctions)
  {
    this.getUser();

    this.observable = FirestoreService.traerFs('tokensPush', this.firestore).subscribe((data)=>{
      this.tokens = data;
      console.log(JSON.stringify(data))
    });

    console.log('Initializing HomePage');
    PushNotifications.requestPermissions().then(result => {
      if (result.receive === 'granted') {
        PushNotifications.register();
      } else {
        alert("error");
      }
    });

    PushNotifications.addListener('registration', (token: Token) => {
      alert('Push registration success, token: ' + token.value);
      this.token = token;
      this.guardarToken(this.token);
    });

    PushNotifications.addListener('registrationError', (error: any) => {
      alert('Error on registration: ' + JSON.stringify(error));
    });

    PushNotifications.addListener(
      'pushNotificationReceived',
      (notification: PushNotificationSchema) => {
        //Este evento solo se activa cuando tenemos la app en primer plano
        alert('Push notification received: '+ JSON.stringify(notification));
        alert('data: ' + notification.data);
        //Esto se hace en el caso de que querramos que nos aparezca la notificacion en la task bar del celular ya que por
        //defecto las push en primer plano no lo hacen, de no ser necesario esto se puede sacar.
        LocalNotifications.schedule({
          notifications: [
            {
              title: notification.title || '',
              body: notification.body || '',
              id: new Date().getMilliseconds(),
              extra: {
                data: notification.data,
              },
            },
          ],
        });
      }
    );

    PushNotifications.addListener(
      'pushNotificationActionPerformed',
      (notification: ActionPerformed) => {
        alert('Push action performed: ' + JSON.stringify(notification));
      },
    );
  }

  ngOnDestroy()
  {
    this.observable.unsubscribe();
  }
  private guardarToken(token:Token)
  {
    FirestoreService.guardarFs('tokensPush', token, this.firestore);
  }

  private getUser(): void {
    const aux = doc(this.firestore, 'aux/tOzYdo74J1YKRD7VsHvL');
    docData(aux, { idField: 'id' }).subscribe(async (user) => {
      this.user = user;
    });
  }

  private sendPushNotification(req:any): Observable<any> {
    return this.http.post<Observable<any>>(environment.fcmUrl, req, {
      headers: {
        Authorization: `key=${environment.fcmServerKey}`,
        'Content-Type': 'application/json',
      },
    });
  }

  sendPush(title:string, body:string) 
  {
    this.tokens.forEach(token => {
      const notificationData = {
        title: title,
        body: body,
      };
    
      const pushNotification = {
        to: token.value,
        notification: notificationData,
      };
      
      this.sendPushNotification(pushNotification).subscribe(
        (response: any) => {
          alert('Notificación enviada con éxito');
          console.log(response);
        },
        (error: any) => {
          alert('Error al enviar la notificación');
          console.error(error);
        }
      );
    });
  }
}
