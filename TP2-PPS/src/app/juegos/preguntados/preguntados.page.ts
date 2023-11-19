import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/services/auth.service';
import { PaisesService } from 'src/app/services/paises.service';

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

  mostrarToast = false;
  mensaje = "";

  constructor(private paisesService : PaisesService, private authService : AuthService){}

  ngOnInit()
  {
    this.paisesService.traerPaises().then((paises : any) => {
      paises.forEach((pais : any) => {
        let paisJSON = {nombre : pais.name.common, foto : pais.flags.png};
        this.arrayPaises.push(paisJSON);
      });

      console.log(this.arrayPaises);
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
        if(this.puntaje > 7)
        {
          this.authService.mostrarToastExito('GANASTE');
        }
        else
        {
          this.authService.mostrarToastError('PERDISTE');
        }

        this.jugando = false;
      }
    }
  }

  reiniciar()
  {
    this.opcionesPaises = [];
    this.paisCorrecto = {};
    this.intentos = 10;
    this.puntaje = 0;
    this.iniciar();
  }

}
