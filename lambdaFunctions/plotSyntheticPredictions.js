import { InvokeEndpointCommand, SageMakerRuntimeClient } from "@aws-sdk/client-sagemaker-runtime";
import axios from "axios"
import Plotly from "plotly";

const client = new SageMakerRuntimeClient({region: "us-east-1"});

const STUDENT_ID = "M00963934";
const URL = `https://y2gtfx0jg3.execute-api.us-east-1.amazonaws.com/prod/${STUDENT_ID}`;

const PLOTLY_USERNAME = 'ikxcrxz';
const PLOTLY_KEY = "";

const plotly = Plotly(PLOTLY_USERNAME, PLOTLY_KEY);

export const handler = async (event) => {
    try {
        
        const results = await getPredictedData();

        let originalYValues = (await axios.get(URL)).data.target;

        let originalXValues = [];
        for(let i = 0; i < originalYValues.length; i++) {
            originalXValues.push(i);
        }

        let meanYValues = results.predictions[0].mean
        let meanXValues = [];
        for(let i=originalYValues.length; i<(originalYValues.length + meanYValues.length); i++){
            meanXValues.push(i);
        }
     
        let oneQuantileX = []
        let oneQuantileY = results.predictions[0].quantiles["0.1"];

        let nineQuantileX = []
        let nineQuantileY = results.predictions[0].quantiles["0.9"];

        for(let i=originalYValues.length; i<(originalYValues.length + oneQuantileY.length); i++){
            oneQuantileX.push(i);
        }

        for(let i=originalYValues.length; i<(originalYValues.length + nineQuantileY.length); i++){
            nineQuantileX.push(i);
        }

        let plotResult = await plotData({
            mean: {x: meanXValues, y: meanYValues},
            oneQuantile: {x: oneQuantileX, y: oneQuantileY},
            nineQuantile: {x: nineQuantileX, y: nineQuantileY},
            original: {x: originalXValues, y: originalYValues}
        });
        console.log("Plot for predicted synthetic data'" + "' available at: " + plotResult.url);

        return {
            statusCode: 200,
            body: "Ok"
        };

    } catch (error) {
        console.error("An error occurred: "+ error)
        return {
            statusCode: 500,
            body: "Error plotting predicted synthetic data"
        }
    }
}

// Method to plot data and return result url
async function plotData({
    mean: { x: meanX, y: meanY },
    original: { x: originalX, y: originalY },
    oneQuantile: { x: oneQuantileX, y: oneQuantileY },
    nineQuantile: { x: nineQuantileX, y: nineQuantileY }
}){

    let trace1 = {
        x: originalX,
        y: originalY,
        type: "scatter",
        mode: 'line',
        name: "Original",
        marker: {
            color: 'rgb(219, 64, 82)',
            size: 12
        }
    };
    
    let trace2 = {
        x: meanX,
        y: meanY,
        type: "scatter",
        mode: 'line',
        name: "Mean",
        marker: {
            color: 'rgba(39, 245, 39, 0.8)',
            size: 12
        }
    };
    
    let trace3 = {
        x: oneQuantileX,
        y: oneQuantileY,
        type: "scatter",
        mode: 'line',
        name: "Prediction 0.1 Quantile",
        marker: {
            color: 'rgba(223, 245, 39, 1)',
            size: 12
        }
    };
    
    let trace4 = {
        x: nineQuantileX,
        y: nineQuantileY,
        type: "scatter",
        mode: 'line',
        name: "Prediction 0.9 Quantile",
        marker: {
            color: 'rgba(39, 69, 245, 0.82)',
            size: 12
        }
    };
  
    
    let data = [trace1, trace2, trace3, trace4];

    //Layout of graph
    let layout = {
        title: "Predicted Synthetic Data",
        font: {
            size: 25
        },
        xaxis: {
            title: 'Time (hours)'
        },
        yaxis: {
            title: 'Value'
        }
    };
    let graphOptions = {
        layout: layout,
        filename: "predicted-synthetic-data",
        fileopt: "overwrite"
    };


    return new Promise ( (resolve, reject)=> {
        plotly.plot(data, graphOptions, function (err, msg) {
            if (err)
                reject(err);
            else {
                resolve(msg);
            }
        });
    });
}

const endpointData = {
    "instances": [
        { 
            "start": "2024-03-07 16:00:00", 
            "target": [321.9226507662036,318.1107814135188,320.19434866779915,324.77927336250116,339.73055438589427,348.9630037052006,355.9537746327331,333.4442970575864,346.54379928256986,372.12214397744754,348.94359776950034,385.5301153224433,379.92258071112576,370.3891362285332,364.9376283635422,397.0483105671679,369.4682776151338,372.0208389613609,380.8527603347779,364.5433932759735,378.78359576262795,370.3802365374456,344.49956315293997,335.9254378209275,354.9970337831666,349.4174513832501,336.04540703352995,327.5839860132539,356.02847160261314,359.01162068502543,353.24502254079545,364.20360817062175,383.5204811272339,361.1552526032372,398.7949069659497,402.0022225097182,403.5102693302977,390.8240985267455,403.34452249823016,393.7998764160901,376.40355349932673,389.9503072692935,392.3901522501639,375.59745623281884,363.76875989843717,385.7118114209537,353.691402566604,359.3198843687861,349.4944456640885,364.66891448781905,340.565879547905,362.40949592298443,376.9481843854741,365.5394066869875,377.79704544930587,380.86981061527433,378.73601575904763,371.53928472239244,388.86234799110457,383.04128344475515,396.5021938287885,406.17759239724256,413.6926026805447,423.3064103980408,424.6764832579092,387.34251457226253,384.95488362756265,397.5160618673212,385.3669753817212,385.0721931576866,383.4251064750097,383.6774230656333,362.4223186116679,364.9240227890634,373.9989369851309,355.490286383592,378.2771862338593,395.48397930740674,396.13888231034997,407.23862367548577,380.2808442790104,413.3348665181142,405.6734590230683,415.137550635056,410.6133247906657,427.4634680672068,410.6714321782026,404.3716829908248,434.3006356800481,414.78654631810105,421.9876621418336,413.29868940744535,416.05916018112276,402.0587261777177,407.26221575933084,407.46618894010743,402.671574807011,382.91950231816736,376.24385760050706,400.7313016458669]
        }
    ],
    "configuration": {
        "num_samples": 50,
        "output_types": ["mean","quantiles","samples"],
        "quantiles": ["0.1", "0.9"]
    }
};

async function getPredictedData () {
    const command = new InvokeEndpointCommand({
        EndpointName: "MyEndpoint",
        Body: JSON.stringify(endpointData),
        ContentType: "application/json",
        Accept: "application/json"
    });
    
   
    const response = await client.send(command);

    // Parse the response body from binary format to a string, then to a JavaScript object
    let predictions = JSON.parse(Buffer.from(response.Body).toString('utf8'));
   
    return predictions;
}

handler({})