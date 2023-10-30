import { Component, OnInit } from '@angular/core';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import {Camera, CameraResultType, CameraSource} from '@capacitor/camera';
import { getStorage, ref, uploadString } from '@firebase/storage';
import { FormBuilder, FormGroup, Validators, AbstractControl, ValidatorFn, MinLengthValidator } from '@angular/forms';


@Component({
  selector: 'app-mesa',
  templateUrl: './mesa.page.html',
  styleUrls: ['./mesa.page.scss'],
})
export class MesaPage implements OnInit {

  form : FormGroup;

  numero : any = '';
  cantidad : any = '';
  foto = 'assets/mesa-redonda.png';
  tipoMesa = '';

  constructor(private aFirestorage : AngularFireStorage, private formBuilder: FormBuilder) 
  { 
    this.form = this.formBuilder.group({
      numero: ['', [Validators.required, Validators.pattern('^[0-9]+$')]],
      cantidad: ['', [Validators.required,  Validators.pattern('^[0-9]+$')]],
    });
  }

  ngOnInit() {
  }

  async sacarFoto()
  {
    const fotoCapturada = await Camera.getPhoto({
      resultType: CameraResultType.DataUrl,
      source: CameraSource.Camera,
      quality: 100,
      webUseInput: true,
    });
  
    let storage = getStorage();
    let fecha = new Date().getTime();
    let nombre = `mesas/${this.numero} ${fecha}`;
    let storageRef = ref(storage, nombre);
  
    uploadString(storageRef as any, fotoCapturada.dataUrl as any, 'data_url').then(()=>{
      let promesa = this.aFirestorage.ref(nombre).getDownloadURL().toPromise();
  
      promesa.then((url : any)=>{
        this.foto = url;
      });
    });
  }


  darAlta()
  {
    // if(!this.form.valid  || this.tipoEmpleado === '')
    // {
    //   this.authService.mostrarToastError('Quedan campos por completar!');
    // }
    // else
    // {
    //   if(this.password === this.password2)
    //   {
    //     this.authService.mostrarToastExito('Alta exitosa');
    //     let empleado = {nombre : this.nombre, apellido : this.apellido, dni : this.dni, cuil : this.cuil, correo : this.correo, foto : ''};

    //     if(this.foto !== "assets/user.png")
    //     {
    //       empleado = {nombre : this.nombre, apellido : this.apellido, dni : this.dni, cuil : this.cuil, correo : this.correo, foto : this.foto};
    //     }

    //     this.authService.signup(this.correo, this.password).catch((error)=>{
    //       if(error === 'auth/email-already-in-use')
    //       {
    //         this.authService.mostrarToastError('El correo electrónico ya se encuentra en uso.');
    //       }
    //     }).then(()=>{
    //       FirestoreService.guardarFs('empleados', empleado, this.firestore);

    //       this.nombre = '';
    //       this.apellido = '';
    //       this.dni = '';
    //       this.cuil = null;
    //       this.correo = '';
    //       this.password = '';
    //       this.password2 = '';
    //       this.tipoEmpleado = '';
    //       this.foto = "assets/user.png";

    //     });
    //   }
    //   else
    //   {
    //     this.authService.mostrarToastError('Las contraseñas no coinciden!');
    //   }
    // }
  }
}
