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
import { AuthService } from './auth.service';
import { FirestoreService } from './firestore.service';


@Injectable({
  providedIn: 'root'
})
export class PushService{
  private user:any;
  private usuarioAuth = this.auth.get_user();
  tokensPusheados:any[] = [];
  clientes:any[] = [];
  empleados:any[] = [];
  duenios:any[] = [];


  constructor(private firestore: Firestore, private http: HttpClient, private auth: AuthService)
  {
    FirestoreService.traerFs('clientes', firestore).subscribe((data)=>{
      this.clientes = data;
    });

    FirestoreService.traerFs('duenios', firestore).subscribe((data)=>{
      this.duenios = data;
    });

    FirestoreService.traerFs('empleados', firestore).subscribe((data)=>{
      this.empleados = data;
    });

    this.getUser();

    PushNotifications.requestPermissions().then(result => {
      if (result.receive === 'granted') {
        PushNotifications.register();
      } else {
        console.log("error");
      }
    });

    PushNotifications.addListener('registrationError', (error: any) => {
      console.log('Error on registration: ' + JSON.stringify(error));
    });

    PushNotifications.addListener(
      'pushNotificationReceived',
      (notification: PushNotificationSchema) => {
        console.log('Push notification received: '+ JSON.stringify(notification));
        console.log('data: ' + notification.data);
        LocalNotifications.schedule({
          notifications: [
          {
            title: notification.title || '',
            body: notification.body || '',
            id: new Date().getMilliseconds(),
            extra: {data: notification.data,},
            },
          ],
        });
      } 
    );

    PushNotifications.addListener(
      'pushNotificationActionPerformed',
      (notification: ActionPerformed) => {
        console.log('Push action performed: ' + JSON.stringify(notification));
      },
    );

    PushNotifications.addListener('registration', (token: Token) => {
      console.log('Push registration success, token: ' + token.value);

      let u:any;
      let e:any;
      let d:any;

      console.log(JSON.stringify(this.clientes));
      console.log(JSON.stringify(this.empleados));
      console.log(JSON.stringify(this.duenios));

      this.clientes.forEach((usuario:any) => {
        console.log(usuario);
        if(usuario.email === this.usuarioAuth?.email)
        {
          console.log(usuario);
          u = usuario;
        }
      });

      if(!u)
      {
        this.duenios.forEach((duenio:any) => {
          if(duenio.email === this.usuarioAuth?.email)
          {
            console.log(duenio);
            d = duenio;
          }
        });

        if(!d)
        {
          this.empleados.forEach((empleado:any) => {
            console.log(empleado);
            if(empleado.email === this.usuarioAuth?.email)
            {
              console.log(empleado);
              e = empleado;
            }
          });

          if(e)
          {
            let obj = {...e};
            obj.token = token;
            FirestoreService.actualizarFs('empleados', obj, firestore);
          }
        }
        else
        {
          let obj = {...d};
          obj.token = token;
          FirestoreService.actualizarFs('duenios', obj, firestore);
        }
      }
      else
      {
        let obj = {...u};
        obj.token = token;
        FirestoreService.actualizarFs('clientes', obj, firestore);
      }
    });
  }

  private getUser(): void
  {
    const aux = doc(this.firestore, 'aux/tOzYdo74J1YKRD7VsHvL');
    docData(aux, { idField: 'id' }).subscribe(async (user) => 
    {
      this.user = user;
    });
  }

  cierreSesion(usuario:any, col:string)
  {
    let obj = {...usuario};
    obj.token = '';
    FirestoreService.actualizarFs(col, obj, this.firestore);
  }

  private sendPushNotification(req:any): Observable<any> {
    return this.http.post<Observable<any>>(environment.fcmUrl, req, {
      headers: {
        Authorization: `key=${environment.fcmServerKey}`,
        'Content-Type': 'application/json',
      },
    });
  }

  sendPush(title:string, body:string, usuario:any) 
  {
    const notificationData = {
      title: title,
      body: body,
      icon: "assets/logo.png",
      //sound: 'custom_sound',
      //url: ,
    };
    
    const pushNotification = {
      to: usuario.token.value,
      notification: notificationData,
    };

    this.sendPushNotification(pushNotification).subscribe(
      (response: any) => {
        console.log('Notificación enviada con éxito');
        console.log(response);
      },
      (error: any) => {
        console.log('Error al enviar la notificación');
        console.error(error);
      }
    );
  }
}
