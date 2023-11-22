import { Component, OnInit } from '@angular/core';
import { Firestore } from '@angular/fire/firestore';
import { AuthService } from 'src/app/services/auth.service';
import { FirestoreService } from 'src/app/services/firestore.service';

@Component({
  selector: 'app-inicio-juegos',
  templateUrl: './inicio-juegos.page.html',
  styleUrls: ['./inicio-juegos.page.scss'],
})
export class InicioJuegosPage implements OnInit {

  cliente : any;
  observable : any;
  user = this.auth.get_user();

  btnMemoria = false;
  btnPreguntados = false;
  btnSimon = false;

  constructor(private auth : AuthService, private firestore : Firestore) { }

  ngOnInit() 
  {
    this.auth.login('mai@mai.com', '111111');
    this.observable = FirestoreService.traerFs('clientes', this.firestore).subscribe((data)=>{
      console.log(data);

      data.forEach(c => {
        if(c.email === 'mai@mai.com')
        {
          this.cliente = c;
        }
      });

      // switch(this.user?.email){
      //   case null:
      //     data.forEach(c => {
      //       if(c.uid === this.user?.uid)
      //       {
      //         this.cliente = c;
      //       }
      //     });
      //     break;
      //   default:
      //     data.forEach(c => {
      //       if(c.email === this.user?.email)
      //       {
      //         this.cliente = c;
      //       }
      //     });
      //     break;
      //}

    });
  }
}
