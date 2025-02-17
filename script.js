const sortData = (list1=[], list2=[]) =>{
    const list = [...list1 , ...list2]
    return list.sort((a,b)=>{
        if(a.year === b.year) {
            return a.x - b.x;
        }
        return a.year - b.year;
    })
}
const data = [];
const data2 = [];
let prev = 200;
let prev2 = 300;
let yearInt = 2023;
function getRandomInt(max) {
    return Math.random() * max;
}
for (let i = 1; i <= 2000; i++) {
    prev += 1500-(Math.random() * 10);
    data.push({ x: prev, y: i , date:'12-01-2023',year: yearInt});
    prev2 +=  1200-(Math.random() * 10);
    data2.push({ x: prev2, y: i ,date:'12-01-2023',year: yearInt});
    if(i % 10 === 0){
        yearInt++
    }
}

const getListOfXData = (sortedData = []) => {
    const years = [];
    const valueList = [];
    sortedData.forEach(element => {
        if (years.length === 0 || !years.includes(element.year)) {
            valueList.push(element)
            years.push(element.year)
        }
    });
    return valueList;
}
const totalDuration = 10000;
const delayBetweenPoints = totalDuration / data.length;
const previousY = (ctx) => ctx.index === 0 ? ctx.chart.scales.y.getPixelForValue(100) : ctx.chart.getDatasetMeta(ctx.datasetIndex).data[ctx.index - 1].getProps(['y'], true).y;
const animation = {
    x: {
        type: 'number',
        easing: 'linear',
        duration: delayBetweenPoints,
        from: NaN, // the point is initially skipped
        delay(ctx) {
            if (ctx.type !== 'data' || ctx.xStarted) {
                return 0;
            }
            ctx.xStarted = true;
            return ctx.index * delayBetweenPoints;
        }
    },
    y: {
        type: 'number',
        easing: 'linear',
        duration: delayBetweenPoints,
        from: previousY,
        delay(ctx) {
            if (ctx.type !== 'data' || ctx.yStarted) {
                return 0;
            }
            ctx.yStarted = true;
            return ctx.index * delayBetweenPoints;
        }
    }
};
const crosshairConfig = {
        line: {
            color: 'gray',  // Line color
        },
        sync: {
            enabled: true,   // Sync across all charts
            group: 1, // Name of the sync group
            suppressTooltips: false // Show tooltips
        },
    }
// plugin
const lineMarker = {
    id: 'lineMarker',
    beforeDatasetsDraw: (chart, args, plugins) => {
        const { ctx, chartArea: { top, bottom, right, left }, scales: { x } } = chart;
        const sortList = sortData(data, data2);
        const verticalLines = getListOfXData(sortList);
        ctx.save();
        verticalLines.forEach(line => {
            const xPosition = x.getPixelForValue(line.x);
            if(xPosition < left || xPosition > right ) {
                return;
            }

            // Clip to chart area to prevent overflow
            ctx.save();
            ctx.beginPath();
            ctx.rect(left, top, right - left, bottom - top);
            ctx.clip();
            // Draw the vertical line
            ctx.beginPath();
            ctx.lineWidth = 1;
            ctx.strokeStyle = '#d0afe1';
            ctx.setLineDash([5, 5]);
            ctx.moveTo(xPosition, top);
            ctx.lineTo(xPosition, bottom);
            ctx.stroke();

            // Draw rounded pill for year label
            const pillWidth = 40;
            const pillHeight = 20;
            let pillX = xPosition - pillWidth / 2;
            const pillY = top + 3; // Inside the graph area

            // Draw pill background behind the gridlines
            ctx.beginPath();
            ctx.fillStyle = 'rgba(0,0,0,0.8)';
            ctx.strokeStyle = 'rgba(0,0,0,0.8)';
            ctx.setLineDash([0, 0]);
            ctx.lineWidth = 0;
            ctx.roundRect(pillX, pillY, pillWidth, pillHeight, 10);
            ctx.fill();
            ctx.stroke();

            // Render year text inside pill
            ctx.fillStyle = 'white';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(line.year, xPosition, pillY + pillHeight / 2);
        });
        ctx.restore();
    }
}

// my chart
const ctx1 = document.getElementById('myChart1');
const ctx2 = document.getElementById('myChart2');
const ctx3 = document.getElementById('myChart3');


// config Graphs
const configScatterGraph = {
    type: 'scatter',
    data: {
        datasets: [
            {
                label: 'Gas',
                data: data,
                backgroundColor: 'rgb(0, 0, 10, 0.2)'
            },
            {
                label: 'Test',
                data: data2,
                backgroundColor: 'rgb(165,143,236,0.5)'
            }
        ],
    },
    options: {
        responsive: false,
        aspectRatio: 2,
        maintainAspectRatio:false,
        devicePixelRatio: 4,
        interaction: {
            mode: 'nearest',
            axis: 'xy', // ✅ ให้ sync ทั้ง X และ Y
            intersect: false
        },
        scales: {
            x: {
                min: 0,
                max: 61650,
                ticks: {
                    stepSize: 12330
                },
                title: {
                    display: true,
                    text: 'Gp (MMscf)',
                    padding: {
                        top: 10,
                        bottom: 30
                    }
                }
            },
            y: {
                min: 0,
                max: 100,
                ticks: {
                    stepSize: 20
                },
                title: {
                    display: true,
                    text: 'Qg_n (MMscfd)',
                    padding: {
                        top: 10,
                        bottom: 30
                    }
                }
            },
            y2: {
                min: 0,
                max: 100,
                position: 'right',
                ticks: {
                    stepSize: 20
                },
                title: {
                    display: true,
                    text: 'Qg_n (MMscfd)',
                    padding: {
                        top: 10,
                        bottom: 30
                    }
                }
            }
        },
        plugins: {
            tooltip: {
                mode: 'interpolate',
                intersect: false,
                callbacks: {
                    title: function async(context) {
                        const item = context?.length ? context[0] : {}
                        return Object.keys(item)?.length ? `${item.dataset?.label}\nQg_n: ${item.raw?.y}\nGp: ${item.raw?.x}\nDate: ${item.raw?.date || '-'}` : ''
                    },
                    label: function (context) {
                        return false;
                    }
                }
            },
            legend: {
                display: false
            },
            lineMarker: {
                borderColor: 'grey',
                borderWidth: 1,
                borderDash: [6, 10]
            },
            crosshair: crosshairConfig
        },
        events: ['mousemove', 'mouseout'],
    },
    plugins: [
        lineMarker,
    ]
}
const configLineProgressiveGraph = {
    type: 'line',
    data: {
        datasets: [{
            borderColor: 'orange',
            borderWidth: 1,
            radius: 0,
            data: data,
            label:'Choke Size (%)',
            fill: true,
            backgroundColor: 'rgba(251, 192, 147,0.2)'
        },
        {
            borderColor: 'grey',
            borderWidth: 1,
            radius: 0,
            data: data2,
            label:'WHFP',
            fill: false,
            backgroundColor: 'grey'
        }]
    },
    options: {
        responsive: false,
        aspectRatio:2,
        maintainAspectRatio:false,
        devicePixelRatio: 4,
        animation,
        interaction: {
            mode: 'nearest',
            axis: 'xy', // ✅ ให้ sync ทั้ง X และ Y
            intersect: false
        },
        plugins: {
            legend: true,
            tooltip: {
                mode: 'interpolate',
                intersect: false,
                callbacks: {
                    title: function async(context) {
                        const item = context?.length ? context[0] : {}
                        return Object.keys(item)?.length ? `${item.dataset?.label}\nWHFP: ${item.raw?.y}\nWGR: ${item.raw?.x}\nDate: ${item.raw?.date || '-'}` : ''
                    },
                    label: function (context) {
                        return false;
                    }
                }
            },
            crosshair: crosshairConfig
        },
        events: ['mousemove', 'mouseout'],
        scales: {
            x: {
                type: 'linear',
                min: 0,
                max: 61650,
                ticks: {
                    stepSize: 12330
                },
                title: {
                    display: true,
                    text: 'WGR',
                    padding: {
                        top: 10,
                        bottom: 30
                    }
                }
            },
            y: {
                min: 0,
                max: 100,
                ticks: {
                    stepSize: 20
                },
                title: {
                    display: true,
                    text: 'WHFP (barg)',
                    padding: {
                        top: 10,
                        bottom: 30
                    }
                }
            },
            y2: {
                position: 'right',
                min: 0,
                max: 100,
                ticks: {
                        stepSize: 20
                    },
                title: {
                    display: true,
                    text: 'WHFP (barg)',
                    padding: {
                        top: 10,
                        bottom: 30
                    }
                }
            }
        }
    },
    plugins:[
    ]
};
const configLineProgressiveGraph2 = {
    type: 'line',
    data: {
        datasets: [
            {
                borderColor: 'blue',
                borderWidth: 1,
                radius: 0,
                data: data,
                label:'WGR',
                fill: false,
                backgroundColor: 'blue'
            },
            {
                borderColor: 'grey',
                borderWidth: 1,
                radius: 0,
                data: data2,
                label:'WGR2',
                fill: false,
                backgroundColor: 'grey',
                display:false,
            }
        ]
    },
    options: {
        responsive: false,
        aspectRatio:2,
        maintainAspectRatio:false,
        devicePixelRatio: 4,
        animation,
        interaction: {
            mode: 'nearest',
            axis: 'xy', // ✅ ให้ sync ทั้ง X และ Y
            intersect: false
        },
        plugins: {
            legend: true,
            tooltip: {
                mode: 'interpolate',
                intersect: false,
                callbacks: {
                    title: function async(context) {
                        const item = context?.length ? context[0] : {}
                        return Object.keys(item)?.length ? `${item.dataset?.label}\nWHFP: ${item.raw?.y}\nWGR: ${item.raw?.x}\nDate: ${item.raw?.date || '-'}` : ''
                    },
                    label: function (context) {
                        return false;
                    }
                }
            },
            crosshair: crosshairConfig
        },
        events: ['mousemove', 'mouseout'],
        scales: {
            x: {
                type: 'linear',
                min: 0,
                max: 61650,
                ticks: {
                    stepSize: 12330
                },
                title: {
                    display: true,
                    text: 'WGR',
                    padding: {
                        top: 10,
                        bottom: 30
                    }
                }
            },
            y: {
                min: 0,
                max: 100,
                ticks: {
                    stepSize: 20
                },
                title: {
                    display: true,
                    text: 'WHFP (barg)',
                    padding: {
                        top: 10,
                        bottom: 30
                    }
                }
            },
            y2: {
                position: 'right',
                min: 0,
                max: 100,
                ticks: {
                        stepSize: 20
                    },
                title: {
                    display: true,
                    text: 'WHFP (barg)',
                    padding: {
                        top: 10,
                        bottom: 30
                    }
                }
            },
        }
    },
    plugins:[]
};

const myChart1 = new Chart(ctx1, configScatterGraph);
const myChart2 = new Chart(ctx2, configLineProgressiveGraph);
const myChart3 = new Chart(ctx3, configLineProgressiveGraph2);
