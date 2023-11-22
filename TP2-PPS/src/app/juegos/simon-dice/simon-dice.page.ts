import { Component, OnInit } from '@angular/core';
import { Firestore } from '@angular/fire/firestore';
import { Router } from '@angular/router';
import { AppRoutingModule } from 'src/app/app-routing.module';
import { AuthService } from 'src/app/services/auth.service';
import { FirestoreService } from 'src/app/services/firestore.service';

@Component({
  selector: 'app-simon-dice',
  templateUrl: './simon-dice.page.html',
  styleUrls: ['./simon-dice.page.scss'],
})
export class SimonDicePage implements OnInit {

  colors = ['red', 'blue', 'green', 'yellow'];
  jugando = false;
  message = '';
  messageClass = '';
  puntuacion: number = 0;
  victoria:boolean = false;

  sequence: string[] = [];
  playerSequence: string[] = [];
  sequenceIndex = 0;

  cliente : any;
  observable : any;
  user = this.auth.get_user();

  constructor(private firestore:FirestoreService, private auth : AuthService, private fir : Firestore, private router : Router){}

  ngOnInit(): void 
  {
    this.auth.login('mai@mai.com', '111111');
    
    this.observable = FirestoreService.traerFs('clientes', this.fir).subscribe((data)=>{
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

  iniciar() 
  {
    this.jugando = true;
    this.victoria = false;
    this.sequence = [];
    this.message = "";
    this.playerSequence = [];
    this.sequenceIndex = 0;
    this.puntuacion = 0;

    this.messageClass = '';

    this.auth.mostrarToastExito('Mira la secuencia...');

    this.generateNextSequence();
    setTimeout(() => {
      this.playSequence();
    }, 1000);
  }

  generateNextSequence()
  {
    const randomColor = this.colors[Math.floor(Math.random() * this.colors.length)];
    this.sequence.push(randomColor);
  }

  playSequence() 
  {
    this.sequenceIndex = 0;
    this.playNextColor();
  }

  playNextColor() 
  {
    const color = this.sequence[this.sequenceIndex];
    console.log(color);
    this.highlightColor(color);
    this.sequenceIndex++;

    if (this.sequenceIndex === this.sequence.length) 
    {
      setTimeout(() => {
        this.auth.mostrarToastExito('Tu turno');
      }, 1000);
    } 
    else 
    {
      setTimeout(() => {
        this.playNextColor();
      }, 1000);
    }
  }

  highlightColor(color: string) {
    // Agrega la lógica para resaltar el color cuando se hace clic en el botón
    const buttonElement = document.querySelector(`.${color}`);
    let audio:any;
    if(buttonElement != null){
      
      // console.log(buttonElement);
      switch(color)
      {
        case "red":
          audio= new Audio("assets/sonidos/1.mp3");
          audio.play();
          buttonElement.classList.add(`active-${color}`);
          break;
        case "blue":
          audio= new Audio("assets/sonidos/2.mp3");
          audio.play();
          buttonElement.classList.add(`active-${color}`);
          break;
        case "green":
          audio= new Audio("assets/sonidos/3.mp3");
          audio.play();
          buttonElement.classList.add(`active-${color}`);
          break;
        case "yellow":
          audio= new Audio("assets/sonidos/4.mp3");
          audio.play();
          buttonElement.classList.add(`active-${color}`);
          break;
      }
    
      setTimeout(() => {
        buttonElement.classList.remove(`active-${color}`);
      }, 800);
    }
    
  }

  handleButtonClick(color: string) 
  {
    this.highlightColor(color);
    this.playerSequence.push(color);
  
    if (color !== this.sequence[this.playerSequence.length - 1]) 
    {
      if(this.puntuacion === 10)
      {
        this.cliente.descuento = 15;
        FirestoreService.actualizarFs('clientes', this.cliente, this.fir);

        

        this.auth.mostrarToastExito('Ganaste! Tenes un 15% de desvuento!');

        this.router.navigateByUrl('inicio-juegos');
      }
      else
      {
        this.auth.mostrarToastError('PERDISTE');

        this.router.navigateByUrl('inicio-juegos');
      }

      this.jugando = false;
    }
    else if (this.playerSequence.length === this.sequence.length) 
    {
      if (this.playerSequence.join('') === this.sequence.join('')) 
      {
        this.auth.mostrarToastExito('Muy bien');

        this.puntuacion += 1;
        this.playerSequence = [];
  
        setTimeout(() => {
          this.generateNextSequence();
          setTimeout(() => {
            this.playSequence();
          }, 1000);
        }, 1000);
      } 
      else 
      {
        this.auth.mostrarToastError('Mmmm no');

        this.jugando = false;
      }
    }
  }

}
