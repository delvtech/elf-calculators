"use strict";
function calculateRow(speculated_interest=10,input_amount=10,
               days_maturity=90,days_matured=0,
               liquidity=50,time_stretch=11,
               target_interest=20, gas_fee=0.02888) {
    let t = (days_maturity-days_matured) / (365 * time_stretch)
    let T = (days_maturity-days_matured) / 365
    let g = .1
    let accumulated_interest = input_amount * days_matured/365 * speculated_interest/100
    let A = ((input_amount)*(speculated_interest/100)*T-(target_interest/1000)*input_amount*T-gas_fee)/input_amount
    let resulting_pt_apy = A/T*100
    let unit_price = 1-A
    let expenditure=input_amount-unit_price*input_amount+gas_fee+accumulated_interest
    let received = (input_amount * speculated_interest / 100) * (days_maturity) / 365
    let gain = received - expenditure
    let output_amount = (1-A)*input_amount
    let fee = (input_amount - output_amount) * g
    output_amount = output_amount+fee
    let apy = ((received / expenditure) - 1) * 365 / (days_maturity - days_matured) * 100
    //calculate pre-slippage
    let pt_apy = (1- output_amount/input_amount)/T * 100 
    let y_after=liquidity+input_amount
    let x_after=y_after*(-(2/((1-T*pt_apy/100)**(1/t)-1))-2)
    let total_supply = x_after+y_after
    let k = (y_after + total_supply)**(1-t) + x_after**(1-t)
    let fj = input_amount 
    let fi = y_after + total_supply - Math.pow(k-Math.pow(x_after + fj,1-t),1/(1-t))

    let y_before=liquidity
    let x_before=x_after+output_amount
    pt_apy = (1-(fj / fi))/T * 100 + (1-1/(Math.pow((y_before+x_before)/x_before,t)))/T

    let row = {Input:input_amount.toFixed(2), PT_APY:pt_apy.toFixed(2), Resulting_PT_APY:resulting_pt_apy.toFixed(2), Expenditure: expenditure.toFixed(4), Received:received.toFixed(4), Gain:gain.toFixed(4), APY:apy.toFixed(2) }
    return row
}

function generateTableHead(table, data) {
    let thead = table.createTHead();
    let row = thead.insertRow();
    for (let key of data) {
      let th = document.createElement("th");
      let text = document.createTextNode(key);
      th.appendChild(text);
      row.appendChild(th);
    }
  }

function generateTable(table, data) {
    for (let element of data) {
      let row = table.insertRow();
      for (let key in element) {
        let cell = row.insertCell();
        let text = document.createTextNode(element[key]);
        cell.appendChild(text);
      }
    }
}

// get elements
const calculate = document.getElementById('calculate');
const input = document.getElementById("input");
const output = document.getElementById("output");
const assetElement = document.getElementById("asset");
const speculatedApyElement = document.getElementById("speculated-apy");
const targetApyElement = document.getElementById("target-apy");
const termLengthElement = document.getElementById("term-length");
const daysMaturedElement = document.getElementById("days-matured");
const liquidityElement = document.getElementById("liquidity");
const gasPriceElement = document.getElementById("gas-price");
const tradeSizeIncrementElement = document.getElementById("trade-size-increment");
const tradeSizeLowerBoundElement = document.getElementById("trade-size-lb");
const tradeSizeUpperBoundElement = document.getElementById("trade-size-ub");

calculate.addEventListener('click', (event) => {
    let data = []
    let time_stretch = 3.09396 /( 0.02789 * parseFloat(speculatedApyElement.value))
    let start=parseFloat(tradeSizeLowerBoundElement.value)
    let end=parseFloat(tradeSizeUpperBoundElement.value)
    let increment=parseFloat(tradeSizeIncrementElement.value)
    let price = 0
    let eth_price = 2500
    if (assetElement.value == 'ETH') {
      price = eth_price
    } else if(assetElement.value == 'BTC') {
      price = 38000
    } else if(assetElement.value == 'USDC'){ 
      price=1
    }
    let gas_fee = eth_price * parseFloat(gasPriceElement.value)/price
    let base_liquidity = (parseFloat(liquidityElement.value)/2)/price
    for(let counter=start;counter<=end;counter+=increment){
        let results = calculateRow(parseFloat(speculatedApyElement.value),
                                counter,
                                parseFloat(termLengthElement.value),
                                parseFloat(daysMaturedElement.value),
                                base_liquidity,
                                time_stretch,
                                parseFloat(targetApyElement.value),
                                gas_fee)
        data.push(results)
    }

    input.style.visibility = "hidden"
    input.style.height = 0
    output.style.visibility = "visible"

    let table = document.querySelector("table");
    generateTable(table, data);
    generateTableHead(table, Object.keys(data[0]));

});

back.addEventListener('click', (event) => {
    window.location.reload();
});
