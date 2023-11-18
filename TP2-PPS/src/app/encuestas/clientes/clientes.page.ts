import { Component, OnInit } from '@angular/core';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { Firestore } from '@angular/fire/firestore';
import { getStorage, ref, uploadString } from 'firebase/storage';
import { FirestoreService } from 'src/app/services/firestore.service';
import { QrService } from 'src/app/services/qr.service';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { AuthService } from 'src/app/services/auth.service';
import { FormBuilder, FormGroup, Validators, AbstractControl, ValidatorFn } from '@angular/forms';
import { PushService } from 'src/app/services/push.service';

@Component({
  selector: 'app-clientes',
  templateUrl: './clientes.page.html',
  styleUrls: ['./clientes.page.scss'],
})
export class ClientesPage implements OnInit {

  fotoCapturadas:any[] = [];
  fotosSubidas:any[] = [];
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

  constructor(private push: PushService, private auth: AuthService, private qr: QrService, private firestore: Firestore, private angularFirestorage: AngularFireStorage, private formBuilder: FormBuilder) 
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
        this.auth.mostrarToastExito(`¡Foto cargada con éxito! Falta/n ${this.fotosRestantes}`)
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

  subirFotos(url:any)
  {
    try
    {
      const storage = getStorage();
      const storageRef = ref(storage, this.nombrePr);
      return uploadString(storageRef as any, url as any, 'data_url');
    }
    catch(error)
    {
      console.log("error" + error);
      return;
    }
  }

  subirTodo()
  {
    try
    {
      const fecha = new Date().getTime();
      let encuesta = {cliente : this.cliente.nombre, fecha : fecha, facilidad : this.facilidad, atencion : this.atencion, experiencia : this.experiencia, servicios : this.opciones, recomendacion : this.recomendaria};
      this.nombrePr = `eClientes/${this.cliente.nombre.replace(" ", "_")}/1`;

      this.subirFotos(this.fotoCapturadas[0])?.
      then(()=>
      {
        const promesa = this.angularFirestorage.ref(this.nombrePr).getDownloadURL().toPromise();
        promesa.then((url1: any)=>
        {
          this.fotosSubidas.push(url1);
          this.nombrePr = `eClientes/${this.cliente.nombre.replace(" ", "_")}/2`
          this.subirFotos(this.fotoCapturadas[1])?.then(()=>
          {
            const promesa = this.angularFirestorage.ref(this.nombrePr).getDownloadURL().toPromise();
            promesa.then((url2: any)=>
            {
              this.fotosSubidas.push(url2);
              this.nombrePr = `eClientes/${this.cliente.nombre.replace(" ", "_")}/3`
              this.subirFotos(this.fotoCapturadas[2])?.then(()=>
              {
                const promesa = this.angularFirestorage.ref(this.nombrePr).getDownloadURL().toPromise();
                promesa.then((url3: any)=>
                {
                  this.fotosSubidas.push(url3);
                  ///////////////////////////////////////////////////////////////////////////
                  FirestoreService.guardarFs('encuestaClientes', {...encuesta, fotos: this.fotosSubidas}, this.firestore);
                  this.auth.mostrarToastExito("¡Encuesta enviada con éxito!");
                  this.cliente.encuesta = true;
                  FirestoreService.actualizarFs('clientes', this.cliente, this.firestore);
                });
              });
            });
          });
        });
      });
    }
    catch
    {
      this.auth.mostrarToastError("Error al subir la foto...");
    }
  }

  onRangeChange(event: CustomEvent) 
  {
    // Obtiene el valor seleccionado del ion-range
    this.facilidad = event.detail.value;
    console.log('Valor seleccionado:', this.facilidad);
  }

  onRadioChange(event: CustomEvent) {
    // Obtiene el valor seleccionado del ion-radio-group
    this.atencion = event.detail.value;
    console.log('Valor seleccionado:', this.atencion);
  }

  enviar()
  {
    alert(this.recomendaria);
  }
}
