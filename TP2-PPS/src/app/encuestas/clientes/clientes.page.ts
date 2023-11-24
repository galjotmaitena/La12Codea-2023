import { Component, OnInit } from '@angular/core';
import { AngularFireStorage, GetDownloadURLPipe } from '@angular/fire/compat/storage';
import { Firestore } from '@angular/fire/firestore';
import { getStorage, ref, uploadString, getDownloadURL } from 'firebase/storage';
import { FirestoreService } from 'src/app/services/firestore.service';
import { QrService } from 'src/app/services/qr.service';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { AuthService } from 'src/app/services/auth.service';
import { FormBuilder, FormGroup, Validators, AbstractControl, ValidatorFn } from '@angular/forms';
import { PushService } from 'src/app/services/push.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-clientes',
  templateUrl: './clientes.page.html',
  styleUrls: ['./clientes.page.scss'],
})
export class ClientesPage implements OnInit {

  fotoCapturadas:any[] = [];
  fotosSubidas : any[] = [];
  urlQr:any;
  fotosRestantes = 3;
  nombreQr = '';
  nombrePr = '';

  nombre = '';
  descripcion = '';
  tiempo = '';
  precio = '';
  tipo = '';

  cliente : any;

  facilidad = 0;
  atencion = '';
  opciones : string[] = [];
  experiencia = '';
  recomendaria: boolean = false;

  foto = false;

  constructor(private router: Router, private auth: AuthService, private qr: QrService, private firestore: Firestore, private angularFirestorage: AngularFireStorage, private formBuilder: FormBuilder) 
  { 
    let observable = FirestoreService.traerFs('clientes', firestore).subscribe((data)=>{
      data.forEach(c => {
        if(c.email === this.auth.get_user()?.email)
        {
          this.cliente = c;
        }
      });
    })

    /////////////deberia traer las encuestas viejas y ver  las fechas y el nombre del cliente? y asi verificar que no la haya llenado otra vez
  }

  ngOnInit() {
  }

  async sacarFotos()
  {

    try
    {
      if(this.fotosRestantes > 0)
      {
        this.foto = true;
        
        let fotoCapturada = await Camera.getPhoto({
          resultType: CameraResultType.DataUrl,
          source: CameraSource.Camera,
          quality: 100,
          webUseInput: true,
        });
  
        this.fotoCapturadas.push(fotoCapturada.dataUrl);
        this.fotosRestantes--;
        console.log(this.fotoCapturadas);
        this.auth.mostrarToastExito(`¡Foto cargada con éxito! Le queda/n ${this.fotosRestantes} disponible/s`)
      }
      else
      {
        this.auth.mostrarToastError('¡Ya tomó las tres fotos!');
      }
    }
    catch(error)
    {
      console.error('error: ' + error);
    }
  }

  async subirFotos()
  {
    try
    {
      const storage = getStorage();
      let options : any = { timeZone: 'America/Argentina/Buenos_Aires'};
      const fecha = new Date().toLocaleString('es-AR', options);

      for(let i = 0; i < this.fotoCapturadas.length; i++)
      {
        let numero = i + 1;
        const storageRef = ref(storage, `eClientes/${this.cliente.email}/${fecha}/${numero}`);
        await uploadString(storageRef as any, this.fotoCapturadas[i] as any, 'data_url');
        let url = await getDownloadURL(storageRef);
        this.fotosSubidas.push(url);
      }
      

    }
    catch(error)
    {
      console.log("error" + error);
      return;
    }
  }

  onRangeChange(event: CustomEvent) 
  {
    this.facilidad = event.detail.value;
    console.log('Valor seleccionado:', this.facilidad);
  }

  onRadioChange(event: CustomEvent) 
  {
    this.atencion = event.detail.value;
    console.log('Valor seleccionado:', this.atencion);
  }

  async enviar()
  {
    await this.subirFotos();
    const fecha = new Date().getTime();
    let encuesta = {cliente : this.cliente.nombre, fecha : fecha, facilidad : this.facilidad, atencion : this.atencion, experiencia : this.experiencia, servicios : this.opciones, recomendacion : this.recomendaria, fotos : this.fotosSubidas};

    FirestoreService.guardarFs('encuestaClientes', encuesta, this.firestore);
    this.auth.mostrarToastExito("¡Encuesta enviada con éxito!");
    this.cliente.encuesta = true;
    FirestoreService.actualizarFs('clientes', this.cliente, this.firestore);
    this.router.navigateByUrl('homeClientes');
  }
}
