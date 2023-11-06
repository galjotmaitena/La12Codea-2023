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

    console.log('Initializing HomePage');
    PushNotifications.requestPermissions().then(result => {
      if (result.receive === 'granted') {
        PushNotifications.register();
      } else {
        alert("error");
      }
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
<<<<<<< HEAD

    PushNotifications.addListener('registration', (token: Token) => {
      alert('Push registration success, token: ' + token.value);

      let u:any;
      let e:any;
      let d:any;

      this.clientes.forEach((usuario:any) => {
        if(usuario.email === this.usuarioAuth?.email)
        {
          u = usuario;
        }
      });

      if(!u)
      {
        this.duenios.forEach((duenio:any) => {
          if(duenio.email === this.usuarioAuth?.email)
          {
            d = duenio;
          }
        });

        if(!d)
        {
          this.empleados.forEach((empleado:any) => {
            if(empleado.email === this.usuarioAuth?.email)
            {
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
=======
<<<<<<< HEAD
///////////////////////////////////////////////////////////////////////////////
    this.observable = FirestoreService.traerFs('tokensPush', this.firestore).subscribe((data)=>{
      /*       data.forEach(token => {
              this.tokens.push(token.value);
            }); */
            this.tokens = data;
            // alert(JSON.stringify(data))
          });
=======
>>>>>>> 53b4f742fb26397d02521e1216cdaf660b276c38
>>>>>>> 28998b25a2b66abca9b26187513bd27c0a0b0c68
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
    };
    
    const pushNotification = {
      to: usuario.token.value,
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
}
