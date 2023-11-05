//import { Component, OnInit } from '@angular/core';
import { FirestoreService } from '../services/firestore.service';
import { Firestore } from '@angular/fire/firestore';
import { Component, OnInit } from '@angular/core';
import { PushService } from '../services/push.service';
import { EmailService } from '../services/email.service';

@Component({
  selector: 'app-home-duenio',
  templateUrl: './home-duenio.page.html',
  styleUrls: ['./home-duenio.page.scss'],
})
export class HomeDuenioPage implements OnInit {
  items: any[] = [];
  observable:any;

  constructor(private firestore: Firestore, private push: PushService, private emailService: EmailService){}

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
  }

  ngOnDestroy()
  {
    this.observable.unsubscribe();
  }

  send() {
    this.push.sendPush('Título de notificación', 'Cuerpo de notificación');
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

      this.emailService.sendEmail(data).then((data2)=>{
        console.log(JSON.stringify(data2));
      });
    });
  }
}
