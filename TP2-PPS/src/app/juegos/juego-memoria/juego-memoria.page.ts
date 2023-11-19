import { Component, OnInit } from '@angular/core';
import { Firestore } from '@angular/fire/firestore';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';
import { FirestoreService } from 'src/app/services/firestore.service';

@Component({
  selector: 'app-juego-memoria',
  templateUrl: './juego-memoria.page.html',
  styleUrls: ['./juego-memoria.page.scss'],
})
export class JuegoMemoriaPage implements OnInit {

  isRunning = false;
  time = 0;
  interval: any;
  jugadores : any = [];

  imagenes = ['assets/rest/cerveza.png', 
              'assets/rest/churrasco.png', 
              'assets/rest/coca.png', 
              'assets/rest/ensalada.png', 
              'assets/rest/pizza.png',
              'assets/rest/cerveza.png', 
              'assets/rest/churrasco.png', 
              'assets/rest/coca.png', 
              'assets/rest/ensalada.png', 
              'assets/rest/pizza.png'];

  tarjeta = "assets/tarjeta.png";

  path1 = "";
  path2 = "";
  id1 = 0;
  id2 = 0;
  contador = 0;
  contadorEncontrados = 0;

  user = this.authService.get_user();
  cliente : any;

  mostrarModal = false;

  dadasVuelta : number[] = [];

  observable : any;

  constructor(private firestore : Firestore, private authService : AuthService, private router : Router) { }

  ngOnInit() 
  {
    this.startTimer();
    this.ordenarAleatoriamente();

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

      console.log(this.cliente);

    });
  }

  
  girarTarjeta(numero : number)
  {
    if(this.id1 != numero && !this.buscarImagen(numero))
    {
      let tarjeta : any = document.getElementById(`${numero}`);
      tarjeta.src = this.imagenes[numero-1];
      
      if(this.contador == 0)
      {
        this.path1 = tarjeta.src;
        this.id1 = numero;
  
        this.contador++;
      }
      else
      {
        if(this.contador == 1)
        {
          this.path2 = tarjeta.src;
          this.id2 = numero;
          this.verificarImagenes();
        }
      }
    }
    
  }

  startTimer() 
  {
    if (!this.isRunning) 
    {
      this.interval = setInterval(() => {
        this.time++;
      }, 1000);
      this.isRunning = true;
    }
  }

  stopTimer() 
  {
    if (this.isRunning) 
    {
      clearInterval(this.interval);
      this.isRunning = false;
    }
  }

  resetTimer() 
  {
    this.time = 0;
    this.stopTimer();
  }

  ordenarAleatoriamente()
  {
    for (let i = this.imagenes.length - 1; i > 0; i--) 
    {
      // Generar un índice aleatorio entre 0 y i
      const j = Math.floor(Math.random() * (i + 1));
      // Intercambiar los elementos en las posiciones i y j
      [this.imagenes[i], this.imagenes[j]] = [this.imagenes[j], this.imagenes[i]];
    }
  }

  verificarImagenes()
  {
    let tarjeta1 : any = document.getElementById(`${this.id1}`);
    let tarjeta2 : any = document.getElementById(`${this.id2}`);

    if(this.path1 != this.path2)
    {
      setTimeout(() => {
        tarjeta1.src = "assets/tarjeta.png";
        tarjeta2.src = "assets/tarjeta.png";
      }, 1500);
    }
    else
    {
      if(this.id1 != this.id2)
      {
        this.contadorEncontrados++;
        this.dadasVuelta.push(this.id1);
        this.dadasVuelta.push(this.id2);

        if(this.contadorEncontrados == 5)
        {
          this.stopTimer();
          
          this.cliente.juego1 = true;
          //FirestoreService.actualizarFs('clientes', this.cliente, this.firestore);

          console.log('termino');
        }
      }
    }

    this.path1 = "";
    this.path2 = "";
    this.id1 = 0;
    this.id2 = 0;
    this.contador = 0;
  }

  back()
  {
    setTimeout(() => {
      this.router.navigate(['/inicio']);
    }, 1500);
  }

  buscarImagen(id : number) : boolean
  {
    let retorno = false;

    this.dadasVuelta.forEach(imagen => {
      if(imagen == id)
      {
        retorno = true;
      }
    });

    return retorno;
  }

}
