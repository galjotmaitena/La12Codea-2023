import { Injectable } from '@angular/core';
import { Firestore, addDoc, collection, query, orderBy, getDocs, doc, updateDoc } from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root'
})
export class FirestoreService {

    static guardarFs(col: string, params:any, firestore: Firestore)
    {   
      let coleccion = collection(firestore, col);
      addDoc(coleccion, {...params});
      return params;
    }

    static async traerFs(col: string, firestore: Firestore, ordenar:boolean=false)
    {
        const colRef = collection(firestore, col);
        let q = query(colRef);
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
}
