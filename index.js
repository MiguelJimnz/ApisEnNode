const express= require('express')
const client =require('./db')
const path=require('path')
const cors = require('cors')

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

const PORT = 3000;

app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});

// Primera API
app.get('/api/prueba', (req, res) => {
    res.send('API funcionando');
});

// Segunda API con JSON
app.get('/api/prueba1', (req, res) => {
    res.status(200).json({
        message: 'La API RESPONDE CORRECTAMENTE',
        port: PORT,
        status: 'success'
    });
});


// API para registrar persona
app.post('/api/registro', async (req, res) => {
    const { cedula, nombre, edad, profesion } = req.body;

    const query = 'INSERT INTO persona (cedula, nombre, edad, profesion) VALUES ($1, $2, $3, $4)';

    try {
        await client.query(query, [cedula, nombre, edad, profesion]);
        res.status(201).json({
            message: 'Usuario creado exitosamente',
            data: { cedula, nombre, edad, profesion }
        });
    } catch (error) {
        console.error('Error al registrar persona:', error.message);
        res.status(500).json({
            message: 'Error creando el usuario',
            error: error.message
        });
    }
});

// API para mostrar personas
app.get('/api/mostrar', async (req, res) => {
    const query = 'SELECT * FROM persona';

    try {
        const result = await client.query(query);
        res.status(200).json({
            connection: true,
            message: "Registros obtenidos correctamente",
            data: result.rows
        });
    } catch (error) {
        res.status(500).json({
            connection: false,
            message: "Error al recorrer",
            details: error.message
        });
    }
});

// API para eliminar por cédula
app.delete('/aou/eliminar/cedula', async (req, res) => {
    const { cedula } = req.query;

    const query = 'DELETE FROM persona WHERE cedula = $1';

    try {
        const result = await client.query(query, [cedula]);

        if (result.rowCount === 0) {
            res.status(404).json({
                success: false,
                message: `No existe el registro ${cedula}`
            });
        } else {
            res.status(200).json({
                success: true,
                message: `Registro con cédula ${cedula} eliminado exitosamente`
            });
        }
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error al eliminar el registro",
            details: error.message
        });
    }
});
//agregar api actualizar
app.put('/api/actualizar', async (req, res) => {
    const { cedula, nombre, edad, profesion } = req.body;

    if (!cedula) {
        return res.status(400).json({ 
            success: false, 
            message: 'La cédula es obligatoria para actualizar el registro' 
        });
    }

    const query = `
        UPDATE persona 
        SET nombre = $1, edad = $2, profesion = $3 
        WHERE cedula = $4
    `;

    try {
        const result = await client.query(query, [nombre, edad, profesion, cedula]);

        if (result.rowCount === 0) {
            res.status(404).json({
                success: false,
                message: `No se encontró ningún registro con cédula ${cedula}`
            });
        } else {
            res.status(200).json({
                success: true,
                message: `Registro con cédula ${cedula} actualizado correctamente`,
                updated: { cedula, nombre, edad, profesion }
            });
        }
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al actualizar el registro',
            error: error.message
        });
    }
});