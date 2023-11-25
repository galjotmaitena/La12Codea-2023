import { Component, OnInit } from '@angular/core';
import { Firestore } from '@angular/fire/firestore';
import { Router } from '@angular/router';
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
  mostrarSpinner = false;

  constructor(private auth : AuthService, private firestore : Firestore, private router: Router) { }

  ngOnInit() 
  {
    this.observable = FirestoreService.traerFs('clientes', this.firestore).subscribe((data)=>{
      console.log(data);

      switch(this.user?.email){
        case null:
          data.forEach(c => {
            if(c.uid === this.user?.uid)
            {
              this.cliente = c;
            }
          });
          break;
        default:
          data.forEach(c => {
            if(c.email === this.user?.email)
            {
              this.cliente = c;
            }
          });
          break;
      }

    });
  }

  irA(path: string)
  {
    this.mostrarSpinner = true;
    setTimeout(()=>{
      this.router.navigateByUrl(path);
      this.mostrarSpinner = false;
    }, 2500)
  }
}
