
//import fs from "fs";// Importa el módulo fs de Node.js 
//..sirve para leer y escribir archivos en el servidor. En mi caso,
//..para manejar profesores.json como si fuera mi "base de datos".

import connection from "../database.js";

const filepath = "./alumnos.json"; //ruta del archivo json, donde está ubicado.

export const getAlumnos = (req, res) => { //Creamos y exportamos una función, llamada getAlumnos.
    //req, es el objeto request. Contiene la petición del cliente.
    //res, es el objeto response. Sirve para responderle al cliente.
    //primero tenía que traer los datos en JSON, del archivo alumnos.json
    const data = fs.readFileSync(filepath , "utf-8");
    //convertimos la data de alumnos en json, en objetos java script
    const alumnos = JSON.parse(data); //ahora es un arrat de JS
    //ahora, en vez de mostrarlo manualmente como haciamos antes,
    //lo va a mostrar express:
    res.json(alumnos); //express, le responde al cliente y le manda el array alumnos,
    //pero como JSON, automaticamente convierte el array de JS, a JSON.
    //es el stringify, que hacía antes manualmente.
}

export const getUnAlumno = (req, res) => {
    //leer el archivo alumnos.json
    const data = fs.readFileSync(filepath , "utf-8");
    //Convertirlo a array js
    const alumnos = JSON.parse(data);
    //Obtenemos el id a buscar desde la url:
    const idBuscar = parseInt(req.params.id);
    //Buscamos el alumno
    const alumnoBuscado = alumnos.find(
        alumno => alumno.id === idBuscar
    );

    //Verificamos si es que el alumno existe:
    if(!alumnoBuscado){
        return res.status(404).json({
            mensaje: "alumno no encontrado"
        });
    }

    //Si el alumno es encontrado:
    res.status(200).json({
        mensaje: "alumno encontrado",
        alumno: alumnoBuscado
    });

}

export const postAlumnos = async (req,res) => {
    
    const {nombre, edad} = req.body; //sacamos nombre y edad del req.body
    //en vez de armar un json con los datos, los enviamos a la bd
    //mediante una consulta sql, mediante la connection importada de
    //el archivo databas.js

    await connection.query(
        "INSERT INTO alumnos(nombre,edad) VALUES (?,?)",
        [nombre,edad]
    );

    res.status(201).json({
        mensaje:"alumno creado",
        alumno: req.body
});
}

export const deleteAlumno = (req,res) => {
    //leemos el archivo
    const data = fs.readFileSync(filepath , "utf-8");
    //lo convertimos a js
    const alumnos = JSON.parse(data);
    //obtenemos el id con el que vamos a buscar al alumno
    const idEliminar = parseInt(req.params.id);
    //Creamos el array con el alumno eliminado
    const alumnosNuevo = alumnos.filter( alumno => {
    return alumno.id !== idEliminar
    });
    //Verificamos si realmente se eliminó
    if(alumnos.length === alumnosNuevo.length){
        return res.status(404).json({
            mensaje: "Alumno no encontrado"
        });
    }

    //Guardamos el nuevo array en el json
    fs.writeFileSync( 
        filepath,
        JSON.stringify(alumnosNuevo , null , 2)
    );

    //Respondemos al cliente:
    res.json({
        mensaje:"Alumno eliminado correctamente"
    });

}

export const updateAlumno = (req,res) => {
    //Leemos el archivo
    const data = fs.readFileSync( filepath , "utf-8");
    //Convertimos a js
    const alumnos = JSON.parse(data);
    //Obtenemos el id desde la URL
    const idActualizar = parseInt(req.params.id);
    //Variable para saber si existe:
    let encontrado = false;

    //Creamos nuevo array actualizado
    const alumnosActualizados = alumnos.map( alumno => {
        //si encontramos el alumno
        if(alumno.id === idActualizar){
            encontrado = true;
            //devolvemos el alumno actualizado
            return {
                ...alumno, //spread, copia todo lo que tiene el objeto
                ...req.body
            };
        }

        //si no coincide, queda igual
        return alumno;
    });

    //Verificamos si existía
    if(!encontrado){
        return res.status(404).json({
            mensaje: "Alumno no encontrado"
        });
    }

    //Guardamos el nuevo array
    fs.writeFileSync(
        filepath,
        JSON.stringify(alumnosActualizados, null, 2)
    );

    //Respondemos al cliente
    res.json({
        mensaje: "Alumno actualizado correctamente"
    });

}