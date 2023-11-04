//import { Component, OnInit } from '@angular/core';
import { FirestoreService } from '../services/firestore.service';
import { Firestore } from '@angular/fire/firestore';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-home-duenio',
  templateUrl: './home-duenio.page.html',
  styleUrls: ['./home-duenio.page.scss'],
})
export class HomeDuenioPage implements OnInit {
  items: any[] = [];
  observable:any;

  constructor(private firestore: Firestore) { }

  ngOnInit() 
  {
    // FirestoreService.traerFs('clientes', this.firestore).then((data)=>{
    //   data.forEach((u) => {
    //     if(u.aprobado === 'espera')
    //     {
    //       this.items.push(u);
    //     }
    //   });
    // });

    this.observable = FirestoreService.traerFs('clientes', this.firestore).subscribe((data)=>{
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
}
