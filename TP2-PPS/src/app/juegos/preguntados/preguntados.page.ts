import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/services/auth.service';
import { PaisesService } from 'src/app/services/paises.service';
import { Firestore } from '@angular/fire/firestore';
import { FirestoreService } from 'src/app/services/firestore.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-preguntados',
  templateUrl: './preguntados.page.html',
  styleUrls: ['./preguntados.page.scss'],
})
export class PreguntadosPage implements OnInit {

  arrayPaises : any[] = [];
  opcionesPaises : any[] = [];
  paisCorrecto : any;
  jugando = false;
  sePuede = false;
  puntaje = 0;
  intentos = 10;
  ganaste = false;
  mostrarSpinner = false;

  cliente : any;
  observable : any;
  user = this.authService.get_user();

  constructor(private paisesService : PaisesService, private authService : AuthService, private firestore : Firestore, private router : Router){}

  ngOnInit()
  {
    this.paisesService.traerPaises().then((paises : any) => {
      paises.forEach((pais : any) => {
        let paisJSON = {nombre : pais.name.common, foto : pais.flags.png};
        this.arrayPaises.push(paisJSON);
      });

      console.log(this.arrayPaises);
    });

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

  iniciar()
  {
    this.opcionesPaises = this.arrayPaises.sort(()=> Math.random() - 0.5);
    this.opcionesPaises = this.opcionesPaises.slice(0,5);
    this.paisCorrecto = this.opcionesPaises.slice().sort(() => 0.5 - Math.random())[0];
    this.jugando = true;
    this.sePuede = true;
  }

  elegirPais(p:any)
  {
    if(this.sePuede)
    {
      if(this.paisCorrecto.nombre === p.nombre)
      {
        //alert
        this.puntaje++;
      }
      else
      {
        this.authService.mostrarToastError('Mmmm no');
      }

      this.intentos--;
      
      if(this.intentos > 0)
      {
        this.iniciar();
      }
      else
      {
        this.mostrarSpinner = true;
        if(this.puntaje === 7)
        {
          this.cliente.descuento = 20;
          FirestoreService.actualizarFs('clientes', this.cliente, this.firestore).then(()=>{
            this.mostrarSpinner = false;
            this.authService.mostrarToastExito('Ganaste! Tenes un 20% de descuento!');
            this.router.navigateByUrl('inicio-juegos');
          });
        }
        else
        {
          setTimeout(()=>{
            this.mostrarSpinner = false;
            this.authService.mostrarToastError('PERDISTE');
            this.router.navigateByUrl('inicio-juegos');
          }, 2000);
        }

        this.jugando = false;
      }
    }
  }
}
