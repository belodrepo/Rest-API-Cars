const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const Joi = require('joi');

const app = express();
const port = 3000;

//Middleware
app.use(cors());
app.use(express.json());

//Adatbázis inicializálása
const db = new sqlite3.Database('carsdb.db');
db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS cars (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        factory TEXT NOT NULL,
        model TEXT NOT NULL,
        year INTEGER NOT NULL,
        owner TEXT NOT NULL,
        license TEXT NOT NULL
        )`);
});

//Validációs függvény - a végpontoknál meghívható.
function inputValidations(car) {
    const carDataValidation = Joi.object({
        factory: Joi.string().alphanum().min(3).max(10).required(),
        model: Joi.string().min(2).max(10).required(),
        year: Joi.number().min(1000).max(9999).required(),
        owner: Joi.string().min(3).max(30).required(),
        license: Joi.string().min(3).max(10).required(),
    });
    return carDataValidation.validate(car);
};

//Új gépkocsi felvitele
app.post('/api/v1/cars', (req, res) => {
    const { factory, model, year, owner, license } = req.body;

    /* Szerveroldali validáció
    Minta:
    const schema = Joi.object({
        email: Joi.string().email().required(),
        username: Joi.string().alphanum().min(3).max(30).required(),
        password: Joi.string().pattern(new RegExp('^[a-zA-Z0-9]{3,30}$')).required(),
    });*/
    const inputsValidationSchema = Joi.object({
        factory: Joi.string().alphanum().min(3).max(10).required(),
        model: Joi.string().min(2).max(10).required(),
        /*Csak négy digites egész számot és number típust fogad, stringet nem enged numberre konvertálni!
        Ha itt letiltjuk a konvertálást, kliens oldalon számmá kell konvertálni!*/
        //year: Joi.number().integer().positive().min(1000).max(9999).required().options({ convert: false }),
        year: Joi.number().min(1900).max(2025).required(),
        owner: Joi.string().min(3).max(30).required(),
        license: Joi.string().min(3).max(10).required(),
    });
    const { error } = inputsValidationSchema.validate(req.body);

    if (error) {
        //A szerver küldjön 400-as kódot, a hiba részleteinek az első sorát
        return res.status(400).json({ message: error.details[0].message });
    }

    db.run(`INSERT INTO cars (factory, model, year, owner, license) VALUES (?, ?, ?, ?, ?)`,
        [factory, model, year, owner, license],
        function (err) {
            if (err) {
                res.status(500).json({ error: err.message });
            } else {
                res.json({ message: 'Sikeres validáció', id: this.lastID, factory, model, year, owner, license });
            }
        });
});


//Teljes adatbázis lekéráse
app.get('/api/v1/cars', (req, res) => {
    db.all(`SELECT * FROM cars`, [], (err, rows) => {
        if (err) return res.status(500).send(err.message);
        res.send(rows)
    });
});

//PUT végpont az adatok frissítésére
app.put('/api/v1/cars/:id', (req, res) => {
    const { id } = req.params;
    const { factory, model, year, owner, license } = req.body;
    //Validációs függvény meghívása
    const { error } = inputValidations(req.body);

    if (error) {
        return res.status(400).json({ message: error.details[0].message });
    }

    db.run(`UPDATE cars SET factory = ?, model = ?, year = ?, owner = ?, license = ? WHERE id = ?`,
        [factory, model, year, owner, license, id],
        function (err) {
            if (err) {
                res.status(500).json({ error: err.message });
            } else {
                res.json({ message: 'Az adatok frissítése megtörtént!', id, factory, model, year, owner, license });
            }
        });

});

//DELETE végpont az adatok törlésére
app.delete('/api/v1/cars/:id', (req, res) => {
    const { id } = req.params;
    const { factory, license } = req.body;

    db.run(`DELETE FROM cars WHERE id = ?`, [id],
        function (err) {
            if (err) {
                res.status(500).json({ error: err.message });
            } else {
                res.json({ message: `A ${factory} gyártműnyú és ${license} rendszámú gépjármű adatainak a törlése megtörtént.` });
            }
        });
});

//Szerver elindítása a 3000-es porton
app.listen(port, () => {
    console.log(`A szerver fut a ${port}-es porton.`);
})