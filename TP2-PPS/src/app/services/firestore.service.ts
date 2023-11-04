import { Injectable } from '@angular/core';
import { Firestore, addDoc, collection, query, orderBy, getDocs, doc, updateDoc, onSnapshot } from '@angular/fire/firestore';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FirestoreService {

  private dataSubject = new BehaviorSubject<any[]>([]);
  data$ = this.dataSubject.asObservable();

  static guardarFs(col: string, params:any, firestore: Firestore)
  {   
    let coleccion = collection(firestore, col);
    addDoc(coleccion, params);
    return params;
  }

  static async traerFs(col: string, firestore: Firestore)
  {
      const colRef = collection(firestore, col);
      const q = query(colRef);

      try 
      {
          const querySnapshot = await getDocs(q);
          const data: any[] = [];

          querySnapshot.forEach((doc) => {
              data.push({id: doc.id, ...doc.data()});
          });

          return data;
      } 
      catch (error) 
      {
          console.error('Error al obtener datos de Firestore:', error);
          throw error;
      }
  }



   static async actualizarFs(col: string, obj: any, firestore: Firestore) 
  {
      const docRef = doc(firestore, col, obj.id);
  
      try 
      {
        await updateDoc(docRef, obj);
        return 'Registro actualizado correctamente.';
      } 
      catch (error) 
      {
        console.error('Error al actualizar el registro en Firestore:', error);
        throw error;
      }
  } 

  static buscarFs(col : string, email : any, firestore : Firestore)
  {
    return new Promise((resolve, reject) => {
      FirestoreService.traerFs(col, firestore).then((data) => {
        let usuario = null;
  
        data.forEach((obj) => {
          if (obj.email === email) {
            usuario = obj;
          }
        });
  
        resolve(usuario);
      });
    });
  }


}
