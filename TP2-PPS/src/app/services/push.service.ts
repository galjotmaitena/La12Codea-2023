import { Injectable } from '@angular/core';
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


@Injectable({
  providedIn: 'root'
})
export class PushService{
  token:any;
  user:any;
  tokens:any[]=[];

  constructor(private firestore: Firestore, private http: HttpClient, private angularFireMessaging: AngularFireMessaging, private functions: AngularFireFunctions)
  {
    this.getUser();

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
      this.tokens.push(this.token);
    });

    PushNotifications.addListener('registrationError', (error: any) => {
      alert('Error on registration: ' + JSON.stringify(error));
    });

    PushNotifications.addListener(
      'pushNotificationReceived',
      (notification: PushNotificationSchema) => {
        //Este evento solo se activa cuando tenemos la app en primer plano
        alert('Push notification received: '+ notification);
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

  getUser(): void {
    const aux = doc(this.firestore, 'aux/tOzYdo74J1YKRD7VsHvL');
    docData(aux, { idField: 'id' }).subscribe(async (user) => {
      this.user = user;
    });
  }

  private sendPushNotification(req:any): Observable<any> {
    return this.http.post<Observable<any>>(environment.fcmUrl, req, {
      headers: {
        // eslint-disable-next-line @typescript-eslint/naming-convention
        Authorization: `key=${environment.fcmServerKey}`,
        // eslint-disable-next-line @typescript-eslint/naming-convention
        'Content-Type': 'application/json',
      },
    });
  }

/*   sendPush(title:string, body:string) 
  {
    if (this.token && this.user) {
      const notificationData = {
        title: title,
        body: body,
      };
  
      const pushNotification = {
        to: this.token.value,
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
    } 
    else 
    {
      alert('El token aún no está disponible. Espera a que se registre el dispositivo.');
    }
  } */

  sendPush(title:string, body:string) 
  {
    if (this.token && this.user) {
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
    else 
    {
      alert('El token aún no está disponible. Espera a que se registre el dispositivo.');
    }
  }
}
