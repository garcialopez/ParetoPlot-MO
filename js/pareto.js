//agrega que al cargar por primera vez la pagina se cree un grafico
//vacío con el id "pareto-plot"

document.addEventListener("DOMContentLoaded", function () {
    let ctx = document.getElementById("pareto-plot").getContext("2d");
    let scatterChart = new Chart(ctx, {
        type: 'scatter',
        data: {
            datasets: []
        },
        options: {
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'f1'
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: 'f2'
                    }
                }
            }
        }
    });
});




document.getElementById("config-form").addEventListener("submit", function (event) {
    event.preventDefault();
    let f1 = document.getElementById("solutions-f1").value.split("\n").filter(Boolean);
    let f2 = document.getElementById("solutions-f2").value.split("\n").filter(Boolean);

    //se verifica que f1 y f2 tengan al menos 2 elementos
    if (f1.length < 2) {

        //usa el Swal.fire para mostrar un mensaje de error en inglés
        
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'f1 must have at least 2 elements'
        });
        
        return;
    }

    //se verifica que f1 y f2 tengan la misma longitud
    if (f1.length !== f2.length) {

        //usa el Swal.fire para mostrar un mensaje de error en inglés
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'f1 and f2 must have the same length'
        });

        return;
    }

    //se crea un array de objetos llamado "data" con los datos de f1 y f2
    let data = [];
    for (let i = 0; i < f1.length; i++) {
        data.push({ f1: parseFloat(f1[i]), f2: parseFloat(f2[i]) });
    }

    //se cuenta el numero de soluciones de f1 y f2
    let n = data.length;

    //se muestra en el input con id "nsolution' el numero de soluciones
    document.getElementById("nsolution").value = n;

    //se calcula el hypervolumen usando la funcion calculateHypervolume
    let hypervolume = calculateHypervolume(data, 0.7);
    //se muestra el hypervolumen en el input con id "hypervolume"
    document.getElementById("hypervolume").value = hypervolume;

    // se calcula el Generational Distance con la funcion calculateGenerationalDistance
    let spread = calculateSpread(data);
    //se muestra el Generational Distance en el input con id "generational-distance"
    document.getElementById("spread").value = spread;

    //se crea un grafico de dispersion con los datos de f1 y f2
    data = f1.map((value, index) => ({
        x: value,
        y: f2[index],
        pointStyle: 'triangle',
        backgroundColor: `hsl(${Math.random() * 360}, 100%, 50%)` // Color aleatorio
    }));

    //se crea un grafico de dispersion con los datos de f1 y f2
    // Asegúrate de que los datos estén ordenados por 'x' en orden ascendente
    data.sort((a, b) => a.x - b.x);

    //antes de crear el grafico en pareto-plot se borra el grafico anterior
    document.getElementById("pareto-plot").remove();

    //se crea un nuevo canvas con el id "pareto-plot"
    let canvas = document.createElement("canvas");
    canvas.id = "pareto-plot";
    document.getElementById("container-canva").appendChild(canvas);

    let ctx = document.getElementById("pareto-plot").getContext("2d");
    let scatterChart = new Chart(ctx, {
        type: 'scatter',
        data: {
            datasets: [{
                label: 'Pareto Front Points',
                data: data,
                borderColor: 'rgba(255,0,0, 0.8)',
                pointRadius: 4
            },
            {
                label: 'Pareto Front Line',
                data: data,
                borderColor: 'rgba(128,128, 100, 0.4)', // Color de la línea
                fill: false, // No rellena el área bajo la línea
                showLine: true, // Muestra la línea
                pointRadius: 0, // Oculta los puntos
                borderWidth: 1.5 // Grosor de la línea
            }]
        },
        options: {
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'f1'
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: 'f2'
                    }
                }
            }
        }
    });


});


function calculateHypervolume(data, puntoRef) {
    let hypervolume = 0;
    if (data.length > 0) {

        for (let i = 0; i < data.length - 1; i++) {
            let actual = data[i];
            let siguiente = data[i + 1];
            hypervolume += (actual.f1 - siguiente.f1) * (puntoRef - actual.f2);
        }

        let ultimo = data[data.length - 1];
        hypervolume += ultimo.f1 * (puntoRef - ultimo.f2);
    }

    return hypervolume;
}

function calculateSpread(data) {
    let dBar = 0.0;
    let dSum = 0.0;
    let spread;

    for (let i = 0; i < data.length - 1; i++) {
        let d = euclideanDistance([data[i].f1, data[i].f2], [data[i + 1].f1, data[i + 1].f2]);
        dBar += d;
    }
    dBar /= (data.length - 1);

    for (let i = 0; i < data.length - 1; i++) {
        let d = euclideanDistance([data[i].f1, data[i].f2], [data[i + 1].f1, data[i + 1].f2]);
        dSum += Math.abs(d - dBar);
    }

    spread = dSum / ((data.length - 1) * dBar);

    return spread;
}


function euclideanDistance(a, b) {
    let sum = 0.0;
    for (let i = 0; i < a.length; i++) {
        sum += Math.pow(a[i] - b[i], 2);
    }
    return Math.sqrt(sum);
}
