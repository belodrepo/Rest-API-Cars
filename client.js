const apiUrl = 'http://localhost:3000/api/v1/cars';

//Autók adatainak a betöltése a táblázat soraiba
async function loadCars() {
    //debugger;
    try {
        const response = await fetch(apiUrl);
        const cars = await response.json();

        const table = document.getElementById('carTable');
        table.innerHTML = '';
        cars.forEach(car => {
            const row = document.createElement('tr');
            row.innerHTML = `
            <td>${car.id}</td>
            <td>${car.factory}</td>
            <td>${car.model}</td>
            <td>${car.year}</td>
            <td>${car.owner}</td>
            <td>${car.license}</td>
            <td>
            <div class="btn-group">
                <button class="btn btn-primary" onclick="editCar(${car.id}, '${car.factory}', '${car.model}', '${car.year}', '${car.owner}', '${car.license}')"><i class="fa fa-refresh"></i></button>
                <button class="btn btn-danger" onclick="deleteCar(${car.id})"><i class="fa fa-trash"></i></button>
            </div>
            </td>
            `;
            table.appendChild(row);
        });

    }
    catch (error) {
        console.error('Hiba történt az adatok betöltésekor!');
    }
}

//Új autó felvitele az adatbázisba
document.getElementById('carForm').addEventListener('submit', async function (e) {
    e.preventDefault();

    const factory = document.getElementById('factory').value;
    const model = document.getElementById('model').value;
    const year = document.getElementById('year').value;
    const owner = document.getElementById('owner').value;
    const license = document.getElementById('license').value;
    const inputError = document.getElementById('error');

    if ((!factory || !model || !year || !owner || !license)) {
        console.log('Hiányos adatok!');
        inputError.innerText = 'Hiányos adatok!';
    }
    else {
        try {
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ factory, model, year, owner, license })
            });

            if (response.ok) {
                alert(`Sikeres adatrögzítés: ${factory}, ${model}`);
                loadCars();
                e.target.reset();
            } else {
                console.error('Hiba történt a gépjármű hozzáadása során:', await response.json());
            }
        } catch (error) {
            console.error('Nem sikerült az adatokat rögzíteni:', error);
        }
        inputError.innerText = '';

    }
});


// Aszinkron függvény a gépjármű adatok módosítására
async function editCar(id, factory, model, year, owner, license) {
    const newFactory = prompt('Add meg az új gyártót:', factory);
    const newModel = prompt('Add meg az új modellt:', model);
    const newYear = prompt('Add meg az új évjáratot:', year);
    const newOwner = prompt('Add meg az új tulajdonos nevét:', owner);
    const newLicense = prompt('Add meg az új rendszámot:', license);

    if (newFactory && newModel && newYear && newOwner && newLicense) {
        try {
            const response = await fetch(`${apiUrl}/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ factory: newFactory, model: newModel, year: newYear, owner: newOwner, license: newLicense })
            });
            
            if (response.ok) {
                loadCars();
            } else {
                console.error('Hiba történt a gépjármű adatainak a frissítése során:', await response.json());
            }
        } catch (error) {
            console.error('Nem sikerült a gépjármű adatait frissíteni:', error);
        }
    }
}

// Aszinkron függvény a gépjármű adatok törlésére
async function deleteCar(id) {
    if (confirm('Valóban törölni akarod a gépjármű adatait?')) {
        try {
            const response = await fetch(`${apiUrl}/${id}`, {
                method: 'DELETE'
            });
            
            if (response.ok) {
                loadCars();
            } else {
                console.error('Hiba történt a gépjármű adatok törlése során:', await response.json());
            }
        } catch (error) {
            console.error('Az adatok törlése sikertelen volt:', error);
        }
    }

}


//Az oldal betöltődésekor töltse fel adatokkal a táblázatot.
document.addEventListener('DOMContentLoaded', loadCars);