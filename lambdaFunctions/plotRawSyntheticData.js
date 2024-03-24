import axios from "axios";
import Plotly from "plotly";

const STUDENT_ID = "M00963934";
const URL = `https://y2gtfx0jg3.execute-api.us-east-1.amazonaws.com/prod/${STUDENT_ID}`;

const PLOTLY_USERNAME = 'ikxcrxz';
const PLOTLY_KEY = "";

const plotly = Plotly(PLOTLY_USERNAME, PLOTLY_KEY);

export const handler = async () => {

    try {
        
        // Fetch synthetic data
        let yValues = (await axios.get(URL)).data.target;
        let xValues = [];

        for (let i = 0; i < yValues.length; i++) {
            xValues.push(i);
        }
       
        console.log(xValues);

        // Plot data and display result url
        let plotResult = await plotData(STUDENT_ID, xValues, yValues);
        console.log(`Plot for student Onyeka Ikedinobi (${STUDENT_ID}) is available at ${plotResult.url}`)

        return {
            statusCode: 200,
            body: "Ok"
        }

    } catch (error) {
        console.log("ERROR: " + JSON.stringify(error));
        return {
            statusCode: 500,
            body: "Error plotting data"
        }
    }

}

// Method to plot data and return result url
async function plotData(id, xValues, yValues) {
    
    let myData = {
        x: xValues,
        y: yValues,
        type: "scatter",
        mode: "line",
        name: id,
        marker: {
            color: 'rgb(219, 64, 82)',
            size: 12
        }
    };

    let data = [myData];

    let layout = {
        title: `Synthetic Data for Student Onyeka Ikedinobi (${id})`,
        font: {size: 25},
        xaxis: { title: "Time (hours)" },
        yaxis: { title: "Value" }
    }

    let graphOptions = {
        layout,
        filename: "data-axes",
        fileopt: "overwrite"
    }

    return new Promise ( (resolve, reject) => {
        plotly.plot(data, graphOptions, function (err, msg) {
            if (err) {
                reject(err);
            }

            resolve(msg);
        })
    })

}
