import { Component, OnInit } from '@angular/core';
import { Firestore } from '@angular/fire/firestore';
import { AuthService } from 'src/app/services/auth.service';
import { FirestoreService } from 'src/app/services/firestore.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
})
export class HomePage implements OnInit {

  tipo =  '';
  lista : any[] = [];

  constructor(private authService : AuthService, private firestore : Firestore) 
  { 
    
  }

  ngOnInit() 
  {
    let empleado = this.authService.get_user();

    let observable = FirestoreService.traerFs('empleados', this.firestore).subscribe((data)=>{
      //this.lista = data;

      data.forEach(e => {
        if(e.email === empleado?.email)
        {
          this.tipo = e.tipoEmpleado;
  
        }
        console.log(this.tipo);
        console.log(e);
        console.log(empleado?.email);
      });
      console.log(data);
    });


  }


  
}
