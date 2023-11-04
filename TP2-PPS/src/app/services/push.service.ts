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

  constructor(private firestore: Firestore, private http: HttpClient, private angularFireMessaging: AngularFireMessaging, private functions: AngularFireFunctions)
  {
    this.getUser();
///////////////////////////////////
    this.angularFireMessaging.requestToken.subscribe(
      (token:any) => {
        // Token de dispositivo obtenido
        console.log('Device token:', token);
        // Registra el token en tu servidor
        this.registerDeviceToken(token);
      },
      (error) => {
        console.error('Error al solicitar token:', error);
      }
    );
////////////////////////////////////////////////////
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
    });

    PushNotifications.addListener('registrationError', (error: any) => {
      alert('Error on registration: ' + JSON.stringify(error));
    });

    PushNotifications.addListener(
      'pushNotificationReceived',
      (notification: PushNotificationSchema) => {
        //Este evento solo se activa cuando tenemos la app en primer plano
        console.log('Push notification received: ', notification);
        console.log('data: ', notification.data);
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

  private async addListeners(): Promise<void> {
    //Ocurre cuando el registro de las push notifications finaliza sin errores
    await PushNotifications.addListener(
      'registration',
      async (token: Token) => {
        //Acá deberiamos asociar el token a nuestro usario en nuestra bd
        console.log('Registration token: ', token.value);
        const aux = doc(this.firestore, `personas/${this.user.id}`);
        await updateDoc(aux, {
          token: token.value,
        });
      }
  )};

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

  sendPush(title:string, body:string) {
    if (this.token && this.user) {
      const notificationData = {
        // Aquí defines los datos de tu notificación
        // Por ejemplo, título, cuerpo, etc.
        // Puedes personalizar según tus necesidades
        title: title,
        body: body,
      };
  
      // Construye el objeto de notificación
      const pushNotification = {
        to: this.token.value,
        notification: notificationData,
      };
  
      // Envía la notificación al servicio de notificaciones push
      this.sendPushNotification(pushNotification).subscribe(
        (response: any) => {
          // Maneja la respuesta de la notificación enviada
          alert('Notificación enviada con éxito');
          console.log(response);
        },
        (error: any) => {
          // Maneja errores si la notificación no se envía correctamente
          alert('Error al enviar la notificación');
          console.error(error);
        }
      );
    } 
    else 
    {
      alert('El token aún no está disponible. Espera a que se registre el dispositivo.');
    }
  }

  /////////////////////////////////////////////

  // Registra el token del dispositivo en tu servidor
  private registerDeviceToken(token: string) {
    // Envía el token a tu backend para su almacenamiento
    const registerDeviceToken = this.functions.httpsCallable('registerDeviceToken');
    registerDeviceToken({ token }).subscribe((result) => {
      console.log('Token registrado en el servidor:', result);
    });
  }

  // Envia una notificación push a todos los dispositivos
  sendPushNotificationToAll(title: string, body: string) {
    // Envia la notificación al backend
    const sendPushNotificationToAll = this.functions.httpsCallable('sendPushNotificationToAll');
    sendPushNotificationToAll({ title, body }).subscribe((result) => {
      console.log('Notificación push enviada a todos los dispositivos:', result);
    });
  }
}
