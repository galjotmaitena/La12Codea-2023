//import { Component, OnInit } from '@angular/core';
import { FirestoreService } from '../services/firestore.service';
import { Firestore } from '@angular/fire/firestore';
import { Component, OnInit } from '@angular/core';
import { PushService } from '../services/push.service';
import { EmailService } from '../services/email.service';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home-duenio',
  templateUrl: './home-duenio.page.html',
  styleUrls: ['./home-duenio.page.scss'],
})
export class HomeDuenioPage implements OnInit {
  items: any[] = [];
  observable:any;
  duenios: any[] = [];
  email = this.auth.get_user()?.email;
 
  constructor(private firestore: Firestore, private push: PushService, private emailService: EmailService, private auth:AuthService, private router: Router){}

  ngOnInit() 
  {
    this.observable = FirestoreService.traerFs('clientes', this.firestore).subscribe((data)=>{
      this.items = [];
      data.forEach((u) => {
        if(u.aprobado === 'espera')
        {
          this.items.push(u);
        }
      });
      console.log(this.items);
    });

    FirestoreService.traerFs('duenios', this.firestore).subscribe((data)=>{
      this.duenios = data;
    });
  }

  ngOnDestroy()
  {
    this.observable.unsubscribe();
  }

  send() 
  {
    let duenio;

    this.duenios.forEach((d:any) => {
      if(this.email === d.email)
      {
        duenio = d;
      }
    });

    alert(JSON.stringify(duenio));
    this.push.sendPush('Título de notificación', 'Cuerpo de notificación', duenio); ////por ahoraaaaaaaaa
  }

  decidir(decision:boolean, cliente: any)
  {
    let obj = {...cliente};
    obj.aprobado = decision;

    let data = {
      to_email: obj.email,
      to_name: obj.nombre,
      from_name: 'La12Codea',
      message: '',
    };

    FirestoreService.actualizarFs('clientes', obj, this.firestore).then(()=>{
      if(decision)
      {
        data.message = 'su usuario ha sido aprobado. ¡Lo esperamos!';
      }
      else
      {
        data.message = 'su usuario no ha sido aprobado. ¡Lo lamentamos!';
      }

      this.emailService.sendEmail(data).then((data2 : any)=>{
        console.log(JSON.stringify(data2));
      });
    });
  }

  salir()
  {
    let usuario:any;

    this.duenios.forEach((u:any) => {
      if(this.email === u.email)
      {
        usuario = u;
      }
    });

    this.auth.logout()?.then(()=>{
      this.push.cierreSesion(usuario, 'duenios');
      this.router.navigateByUrl('login');
    })
    .catch((err)=>{
      alert(JSON.stringify(err));
    });
  }
}
