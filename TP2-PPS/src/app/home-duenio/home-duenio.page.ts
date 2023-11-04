//import { Component, OnInit } from '@angular/core';
import { FirestoreService } from '../services/firestore.service';
import { Firestore } from '@angular/fire/firestore';
import { Component, OnInit } from '@angular/core';
import { PushService } from '../services/push.service';

@Component({
  selector: 'app-home-duenio',
  templateUrl: './home-duenio.page.html',
  styleUrls: ['./home-duenio.page.scss'],
})
export class HomeDuenioPage implements OnInit {
  items: any[] = [];
  observable:any;

  constructor(private firestore: Firestore, private push: PushService) { }

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
    // Obtén los tokens de dispositivos de los clientes en 'items'
    //const tokens = this.items.map((cliente) => cliente.id);
    //this.push.sendPushToMultipleDevices('Probando', 'andará?', tokens);
    this.push.sendPush('Título de notificación', 'Cuerpo de notificación');
  }
  
}
